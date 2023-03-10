import z from 'zod';

const pwdMsg = 'password at least 6 characters with at least one uppercase character';

export const verify = {
  name: z.string().min(5, { message: 'name at least 5 characters' }).regex(/^[a-zA-Z0-9]+$/, { message: 'name made up of alphanumeric' }).trim(),
  email: z.string().trim().email(),
  password: z.string().min(6, { message: pwdMsg }).regex(/^(?=.*[A-Z])[a-zA-Z0-9]+$/, { message: pwdMsg })
}

export const SignupSchema = z.object({
  name: verify.name,
  email: verify.email,
  password: verify.password
})

export const SigninNameSchema = z.object({
  name: verify.name,
  password: verify.password
})