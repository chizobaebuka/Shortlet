import { z } from 'zod';

export const signUpUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'user']).optional(), // 'admin' is default in the model
});

export const updateUserProfileSchema = z.object({
  username: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export type SignUpUserRequest = z.infer<typeof signUpUserSchema>;
export type UpdateUserProfileRequest = z.infer<typeof updateUserProfileSchema>;
