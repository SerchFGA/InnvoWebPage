import { z } from 'zod';
import type { TranslationKey } from './i18n';

export const doctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.string(),
  image: z.string(),
});

type Translator = (key: TranslationKey) => string;

export const patientDetailsSchema = (t?: Translator) => z.object({
  fullName: z.string().min(3, { message: t ? t('fullNameMin') : "Full name must be at least 3 characters." }),
  phone: z.string().regex(/^\+52\d{10}$/, {
    message: t ? t('phoneRegex') : "Phone number must be 10 digits and start with +52.",
  }),
  reason: z.string().min(1, { message: t ? t('reasonRequired') : "Reason for appointment is required." }),
  notes: z.string().optional(),
});
