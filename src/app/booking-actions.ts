'use server';

import { z } from 'zod';
import { getSession } from '@/lib/session';
import { format } from 'date-fns';

// Simple in-memory rate limiting since we don't have a shared cache yet
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

export async function getAvailableTimes(data: {
    doctor_name?: string;
    doctor_id: number;
    date: string; // yyyy-MM-dd
}) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return { success: false, error: 'Unauthorized' };
    }

    const isAllowed = await checkRateLimit(`times:${session.username}`, 20, 60 * 1000);
    if (!isAllowed) {
        return { success: false, error: 'Rate limit exceeded' };
    }

    // Use the NEXT_PUBLIC_ var if that's what is in .env, or the server-side one. 
    // Next.js server actions can access both.
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_AVAILABLE_TIMES_WEBHOOK_URL;

    if (!WEBHOOK_URL) {
        console.error("Missing NEXT_PUBLIC_N8N_AVAILABLE_TIMES_WEBHOOK_URL");
        return { success: false, error: 'Configuration error' };
    }

    const payload = {
        doctor: data.doctor_name || '',
        doctor_id: data.doctor_id,
        Fecha: data.date,
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`Webhook failed with status ${response.status}`);
            return { success: false, error: 'Server error' };
        }

        const responseData = await response.json();
        return { success: true, data: responseData };
    } catch (error) {
        console.error("Error fetching available times:", error);
        return { success: false, error: 'Connection error' };
    }
}

export async function scheduleAppointment(data: {
    doctor_id?: number;
    doctor_name?: string;
    date_formatted?: string;
    time?: string;
    duration?: string;
    full_name: string;
    phone: string;
    country_code?: string;
    phone_number?: string;
    reason: string;
    notes?: string;
}) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return { success: false, error: 'Unauthorized' };
    }

    const isAllowed = await checkRateLimit(`schedule:${session.username}`, 5, 60 * 1000);
    if (!isAllowed) {
        return { success: false, error: 'Rate limit exceeded' };
    }

    const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_SCHEDULE_APPOINTMENT_WEBHOOK_URL;

    if (!WEBHOOK_URL) {
        console.error("Missing NEXT_PUBLIC_N8N_SCHEDULE_APPOINTMENT_WEBHOOK_URL");
        return { success: false, error: 'Configuration error' };
    }

    // Helper to ensure time is formatted correctly if passed as "13:00"
    let timeString = data.time || '';

    const payload = {
        doctor_id: data.doctor_id,
        doctor: data.doctor_name,
        Fecha: data.date_formatted,
        Hora: timeString,
        duration: data.duration,
        full_name: data.full_name,
        phone: data.phone,
        country_code: data.country_code,
        phone_number: data.phone_number,
        reason: data.reason,
        notes: data.notes,
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to schedule appointment.' }));
            return { success: false, error: errorData.message || 'Server error' };
        }

        return { success: true };
    } catch (error) {
        console.error("Error scheduling appointment:", error);
        return { success: false, error: 'Connection error' };
    }
}
