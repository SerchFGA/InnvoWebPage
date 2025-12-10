
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
  TelefonoUsuario: z.string().min(1),
  ID_Doctor: z.number(),
});

const rescheduleAppointmentSchema = z.object({
  CalendarID: z.string().min(1, "CalendarID is required"),
  FechaCitaCancelar: z.string().min(1, "FechaCitaCancelar is required"),
  TelefonoUsuario: z.string().min(1, "Invalid phone number format"),
  ID_Doctor: z.number({ required_error: "ID_Doctor is required" }),
  NombrePaciente: z.string().min(1, "NombrePaciente is required"),
  MotivoCita: z.string().nullable(),
  FechaCitaNueva: z.string().min(1, "FechaCitaNueva is required"),
});


const SEARCH_WEBHOOK_URL = process.env.N8N_PATIENT_SEARCH_WEBHOOK_URL;
const CANCEL_WEBHOOK_URL = process.env.N8N_CANCEL_APPOINTMENT_WEBHOOK_URL;
const RESCHEDULE_WEBHOOK_URL = process.env.N8N_RESCHEDULE_APPOINTMENT_WEBHOOK_URL;


export type PatientData = {
  phone: string;
  appointments: {
    appointmentId: number;
    patientName: string;
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

export type RescheduleResult = {
  success: true;
  data?: { newCalendarId?: string };
} | {
  success: false;
  message?: string;
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

  if (!SEARCH_WEBHOOK_URL) {
    return { success: false, error: 'server-error' };
  }

  const isSearchAllowed = await checkRateLimit(`search:${session.username}`, 10, 60 * 1000); // 10 per minute
  if (!isSearchAllowed) {
    return { success: false, error: 'server-error' };
  }

  const rawData = {
    countryCode: formData.get('countryCode'),
    phoneNumber: formData.get('phoneNumber'),
  };

  const validation = patientSearchSchema.safeParse(rawData);

  if (!validation.success) {
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

    if (!response.ok) {
        return { success: false, error: 'server-error' };
    }

    const responseData = await response.json();
    
    // The response is an array of objects, we take the first one.
    const data = Array.isArray(responseData) ? responseData[0] : responseData;

    if (!data || !data.Citas || data.Citas.length === 0) {
      return { success: true, data: null };
    }

    const normalizedData: PatientData = {
      phone: data.Telefono || fullPhone,
      appointments: data.Citas.map((cita: any) => ({
        appointmentId: cita.Id,
        patientName: cita.Nombre || 'N/A',
        doctorId: cita.Doctor_Id,
        service: cita['Doctor/Servicio'],
        status: cita.EstadoCita,
        motive: cita.MotivoCita || cita['Motivo Cita'],
        calendarId: cita.CalendarID,
        start: cita['Fecha Cita'],
      })),
    };

    return { success: true, data: normalizedData };
  } catch (e) {
    return { success: false, error: 'server-error' };
  }
}

export async function cancelAppointment(
  appointmentData: z.infer<typeof cancelAppointmentSchema>
): Promise<CancelResult> {
  const session = await getSession();
  const requestId = randomUUID();

  if (!session.isLoggedIn || !session.username) {
    return { success: false, error: 'server-error' };
  }

  if (!CANCEL_WEBHOOK_URL) {
    return { success: false, error: 'server-error' };
  }

  const isCancelAllowed = await checkRateLimit(`cancel:${session.username}`, 5, 60 * 1000); // 5 per minute
  if (!isCancelAllowed) {
    return { success: false, error: 'rate-limited' };
  }

  const validation = cancelAppointmentSchema.safeParse(appointmentData);

  if (!validation.success) {
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

    if (!response.ok) {
        return { success: false, error: 'server-error' };
    }
    
    return { success: true };

  } catch (e) {
    return { success: false, error: 'server-error' };
  }
}

export async function rescheduleAppointment(
  appointmentData: z.infer<typeof rescheduleAppointmentSchema>
): Promise<RescheduleResult> {
  const session = await getSession();
  const requestId = randomUUID();
  
  if (!session.isLoggedIn || !session.username) {
    return { success: false, message: 'Authentication required' };
  }

  if (!RESCHEDULE_WEBHOOK_URL) {
    return { success: false, message: 'Server configuration error' };
  }

  const isRescheduleAllowed = await checkRateLimit(`reschedule:${session.username}`, 5, 60 * 1000); // 5 per minute
  if (!isRescheduleAllowed) {
    return { success: false, message: 'Too many requests. Please try again later.' };
  }
  
  const validation = rescheduleAppointmentSchema.safeParse(appointmentData);

  if (!validation.success) {
    const errorMessage = "Invalid input data.";
    return { success: false, message: `${errorMessage} Details: ${JSON.stringify(validation.error.flatten())}` };
  }
  
  try {
    const payload = {
        requestId,
        ...validation.data
    };
    
    const response = await fetch(RESCHEDULE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    if (!response.ok) {
        let errorBody = await response.text();
        try {
            const jsonError = JSON.parse(errorBody);
            errorBody = jsonError.message || errorBody;
        } catch (e) {
            // Not a JSON response
        }
        return { success: false, message: `Error ${response.status}: ${errorBody}` };
    }

    // Handle 204 No Content or empty bodies as success
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true, data: {} };
    }

    const result = await response.json().catch(() => ({}));
    
    return { success: true, data: { newCalendarId: result?.CalendarID } };

  } catch (e) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
    
