import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  city: z.string().min(2, 'Enter your city'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const reportStep1Schema = z.object({
  category: z.enum(['pothole', 'street_light', 'water_leak', 'garbage', 'graffiti', 'park', 'traffic', 'other']).optional().refine((v) => !!v, { message: 'Please select a category' }),
  description: z.string().min(20, 'Please provide at least 20 characters of description'),
  address: z.string().min(5, 'Please enter a location address'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ReportStep1FormValues = z.infer<typeof reportStep1Schema>;
