import { z } from 'zod';
import type { TranslationKey } from './i18n';

export const doctorSchema = z.object({
  id: z.number(),
  name: z.string(),
  services: z.string(),
  duration: z.string(),
  image: z.object({
    src: z.string(),
    width: z.number(),
    height: z.number(),
    aiHint: z.string(),
  }),
});

type Translator = (key: TranslationKey, data?: any) => string;

export const patientDetailsSchema = (t?: Translator) => z.object({
  fullName: z.string().min(3, { message: t ? t('fullNameMin') : "Full name must be at least 3 characters." }),
  phone: z.string().regex(/^\d{10}$/, {
    message: t ? t('phoneRegex') : "Please enter a valid 10-digit phone number.",
  }),
  reason: z.string().min(1, { message: t ? t('reasonRequired') : "Reason for appointment is required." }),
  notes: z.string().optional(),
});

export type PatientDetails = z.infer<ReturnType<typeof patientDetailsSchema>>;
