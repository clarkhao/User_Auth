import { EmailUser } from 'src/model';
import { db, verify, SignupSchema, debugLogger, Mailer, generateToken } from 'src/utils';
import type { MailResponse } from 'src/utils';
import { ZodError } from 'zod';
import Mail from 'nodemailer/lib/mailer';
const config = require('config');

export type SignUp = {
  name: string,
  email: string,
  password: string
}
/** 
* decomposite the sigup data, and verify the input signup data
*/
const verifySignupData = (data: string) => {
  const result = SignupSchema.safeParse(JSON.parse(data));
  if (!result.success) {
    throw new Error(`400 ${(result.error as ZodError).issues[0].message}`);
  } else {
    return result.data as SignUp
  }
}
/** 
* check duplicate email and name
*/
const isSignupRepeated = async (signup: SignUp) => {
  const user = new EmailUser(db);
  const { success, query, error } = await user.readUser(signup.name, signup.email);
  let message = '';
  if (error !== null) {
    throw error;
  }
  debugLogger.debug(typeof query[0].name);
  (query[0].name) && (message += `name been token`);
  query[0].email && (message += ` email been token`);
  if (query[0].name || query[0].email) {
    throw new Error(`409 ${message.trim()}`);
  }
  return;
}
/** 
* save signup info into db to create user
*/
const createUser = async (signup: SignUp) => {
  const user = new EmailUser(db);
  const { success, query, error } = await user.createUser(signup.name, signup.email, signup.password);
  if (error !== null) {
    throw error;
  }
  return query[0];
}
/** 
* @params id: user table id returned by creatUser
* @params email: email in signup data
*/
const sendEmailWithToken = async (id: string, email: string) => {
  const token = generateToken(id, process.env[config.get('key.email')] as string, '2h');
  const mailer = new Mailer();
  const url = config.get('server.host')?.concat(`:${config.get('server.port')}`).concat(`/api/auth/email/callback?code=${token}`);

  await mailer.sendMail(email, `注册确认`,
    `<div>
    please click the following url for completing the signup
    <a href="${url}">${url}</a>
    </div>`)
    .then((info: MailResponse) => {
      const status = parseInt(info.response.split(' ')[0]);
      debugLogger.debug(`status: ${status}`);
    });
}

export { verifySignupData, isSignupRepeated, createUser, sendEmailWithToken };