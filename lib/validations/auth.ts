import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100),

  workspaceName: z
    .string()
    .trim()
    .min(2, "Workspace name is required.")
    .max(100),
});

export type SignupInput = z.infer<typeof signupSchema>;