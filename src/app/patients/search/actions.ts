
'use server';

import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/session';

const patientSearchSchema = z.object({
  countryCode: z.string().min(1).max(3).regex(/^\d+$/),
  phoneNumber: z.string().length(10).regex(/^\d+$/),
});

const cancelAppointmentSchema = z.object({
  CalendarID: z.string().min(1),
  FechaCita: z.string().min(1),
  TelefonoUsuario: z.string().regex(/^\d{11,14}$/),
  ID_Doctor: z.number(),
});

const SEARCH_WEBHOOK_URL = 'https://devn8n.pixanai.com/webhook/GetUsersDatesInnvo';
const CANCEL_WEBHOOK_URL = 'https://devn8n.pixanai.com/webhook/CancelAppointmentInnvo';

export type PatientData = {
  patientName: string;
  phone: string;
  appointments: {
    appointmentId: number;
    doctorId: string;
    service: string;
    status: string;
    motive: string;
    calendarId: string;
    start: string;
  }[];
};

export type SearchResult = {
  success: true;
  data: PatientData | null;
} | {
  success: false;
  error: 'invalid-input' | 'server-error';
};

export type CancelResult = {
  success: true;
} | {
  success: false;
  error: 'invalid-input' | 'server-error' | 'rate-limited';
};

// Simple in-memory store for rate limiting
const requestCounts = new Map<string, { count: number, start: number }>();

async function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();

  if (!requestCounts.has(key) || (now - requestCounts.get(key)!.start > windowMs)) {
    requestCounts.set(key, { count: 1, start: now });
    return true;
  }

  const sessionData = requestCounts.get(key)!;
  if (sessionData.count < maxRequests) {
    sessionData.count++;
    return true;
  }

  return false;
}

export async function searchPatientByPhone(
  prevState: SearchResult | null,
  formData: FormData
): Promise<SearchResult> {
  const session = await getSession();
  const requestId = randomUUID();
  const startTime = Date.now();
  
  if (!session.isLoggedIn || !session.username) {
    return { success: false, error: 'server-error' };
  }

  const isSearchAllowed = await checkRateLimit(`search:${session.username}`, 10, 60 * 1000); // 10 per minute
  if (!isSearchAllowed) {
    console.warn({
      event: 'patient_search_rate_limited',
      requestId,
      user: session.username,
    });
    return { success: false, error: 'server-error' };
  }

  const rawData = {
    countryCode: formData.get('countryCode'),
    phoneNumber: formData.get('phoneNumber'),
  };

  const validation = patientSearchSchema.safeParse(rawData);

  const logPayload = {
    event: 'patient_search_request',
    requestId,
    user: session.username,
    cc: validation.success ? validation.data.countryCode : null,
    last4: validation.success ? validation.data.phoneNumber.slice(-4) : null,
  };
  console.log(JSON.stringify(logPayload));


  if (!validation.success) {
    console.error({ ...logPayload, event: 'patient_search_response', ok: false, errorCode: 'invalid-input', durationMs: Date.now() - startTime });
    return { success: false, error: 'invalid-input' };
  }

  const fullPhone = `${validation.data.countryCode}1${validation.data.phoneNumber}`;
  
  try {
    const response = await fetch(SEARCH_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: requestId,
        phone: fullPhone,
      }),
      cache: 'no-store'
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
        console.error({ ...logPayload, event: 'patient_search_response', ok: false, errorCode: 'webhook-error', status: response.status, durationMs });
        return { success: false, error: 'server-error' };
    }

    const data = await response.json();
    console.log({ ...logPayload, event: 'patient_search_response', ok: true, durationMs });

    if (!data.NombrePaciente || !data.Citas) {
      return { success: true, data: null };
    }

    const normalizedData: PatientData = {
      patientName: data.NombrePaciente,
      phone: data.Telefono,
      appointments: data.Citas.map((cita: any) => ({
        appointmentId: cita.Id,
        doctorId: cita.Doctor_Id,
        service: cita['Doctor/Servicio'],
        status: cita.EstadoCita,
        motive: cita.MotivoCita,
        calendarId: cita.CalendarID,
        start: cita['Fecha Cita'],
      })),
    };

    return { success: true, data: normalizedData };
  } catch (e) {
    const durationMs = Date.now() - startTime;
    console.error({ ...logPayload, event: 'patient_search_response', ok: false, errorCode: 'exception', durationMs, message: (e instanceof Error) ? e.message : 'Unknown error' });
    return { success: false, error: 'server-error' };
  }
}

export async function cancelAppointment(
  appointmentData: z.infer<typeof cancelAppointmentSchema>
): Promise<CancelResult> {
  const session = await getSession();
  const requestId = randomUUID();
  const startTime = Date.now();

  const logPayload = {
      event: 'cancel_request',
      requestId,
      user: session.username,
      calendarId: appointmentData.CalendarID,
      doctorId: appointmentData.ID_Doctor,
      phoneLast4: appointmentData.TelefonoUsuario.slice(-4),
  };
  console.log(JSON.stringify(logPayload));

  if (!session.isLoggedIn || !session.username) {
    console.error({ ...logPayload, event: 'cancel_response', ok: false, errorCode: 'unauthenticated', durationMs: Date.now() - startTime });
    return { success: false, error: 'server-error' };
  }

  const isCancelAllowed = await checkRateLimit(`cancel:${session.username}`, 5, 60 * 1000); // 5 per minute
  if (!isCancelAllowed) {
    console.warn({ ...logPayload, event: 'cancel_response', ok: false, errorCode: 'rate-limited', durationMs: Date.now() - startTime });
    return { success: false, error: 'rate-limited' };
  }

  const validation = cancelAppointmentSchema.safeParse(appointmentData);

  if (!validation.success) {
    console.error({ ...logPayload, event: 'cancel_response', ok: false, errorCode: 'invalid-input', errors: validation.error.flatten(), durationMs: Date.now() - startTime });
    return { success: false, error: 'invalid-input' };
  }

  try {
    const response = await fetch(CANCEL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        ...validation.data
      }),
      cache: 'no-store'
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
        console.error({ ...logPayload, event: 'cancel_response', ok: false, errorCode: 'webhook-error', status: response.status, durationMs });
        return { success: false, error: 'server-error' };
    }

    console.log({ ...logPayload, event: 'cancel_response', ok: true, durationMs });

    return { success: true };
  } catch (e) {
    const durationMs = Date.now() - startTime;
    console.error({ ...logPayload, event: 'cancel_response', ok: false, errorCode: 'exception', durationMs, message: (e instanceof Error) ? e.message : 'Unknown error' });
    return { success: false, error: 'server-error' };
  }
}
