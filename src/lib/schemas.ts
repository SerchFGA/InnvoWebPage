import { z } from 'zod';

export const doctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.string(),
  image: z.string(),
});

export const patientDetailsSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  phone: z.string().regex(/^\+52\d{10}$/, {
    message: "Phone number must be 10 digits and start with +52.",
  }),
  reason: z.string().min(1, { message: "Reason for appointment is required." }),
  notes: z.string().optional(),
});
