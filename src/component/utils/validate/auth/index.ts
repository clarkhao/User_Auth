/**
 * sign up input data verify
 */
import z from "zod";

type TSignupData = {
  email: string;
  name: string;
  password: string;
  rePwd: string;
};

export const signupSchema = z
  .object({
    email: z.string().email({ message: "email" }).trim(),
    name: z
      .string()
      .min(5, { message: "min" })
      .max(25, { message: "max" })
      .regex(/^[a-zA-Z0-9]+$/, { message: "regex" })
      .trim(),
    password: z
      .string()
      .min(6, {
        message: "min",
      })
      .regex(/^(?=.*[A-Z])[a-zA-Z0-9]+$/, {
        message: "regex",
      }),
    rePwd: z.string(),
  })
  .refine((data) => data.password === data.rePwd, {
    message: "rePwd",
    path: ['rePwd']
  });

export const verifySignup = async (data: TSignupData) =>
  signupSchema.safeParseAsync(data);
