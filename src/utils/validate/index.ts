import z from 'zod';

export const verify = {
  name: z.string().trim().min(6, { message: 'at least 6 characters' }).regex(/^[a-zA-Z0-9]+$/, { message: 'name made up of alphanumeric' }),
  email: z.string().trim().email(),
  password: z.string().trim().min(6, { message: 'at least 6 characters' }).regex(/^(?=.*[A-Z])[a-zA-Z0-9]+$/, { message: 'password at least one uppercase character' })
}

export const SignupSchema = z.object({
  name: verify.name,
  email: verify.email,
  password: verify.password
})