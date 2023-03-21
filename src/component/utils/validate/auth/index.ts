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
type TSigninData = Omit<TSignupData, 'email' | 'rePwd'>

export const SignupSchema = z
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
      .max(25, { message: "max" })
      .regex(/^(?=.*[A-Z])[a-zA-Z0-9]+$/, {
        message: "regex",
      }),
    rePwd: z.string(),
  })
  .refine((data) => data.password === data.rePwd, {
    message: "rePwd",
    path: ["rePwd"],
  });
export const SigninSchema = z.object({
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
    .max(25, { message: "max" })
    .regex(/^(?=.*[A-Z])[a-zA-Z0-9]+$/, {
      message: "regex",
    })
});
export const verifySignup = async (data: TSignupData) =>
  SignupSchema.safeParseAsync(data);
