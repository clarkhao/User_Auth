import { EmailUser } from 'src/model';
import {
  db,
  verify, SignupSchema,
  logger, debugLogger,
  Mailer,
  generateToken, verifyToken,
  encrypt, decrypt
} from 'src/utils';
import type { MailResponse } from 'src/utils';
import { ZodError } from 'zod';
import Mail from 'nodemailer/lib/mailer';
const config = require('config');

const SECRET_KEY = process.env[config.get('key.cipher')] || '';
const EXPIRY_DURATION = 3600; // Expiry duration in seconds (1 hour)
/** 
* this interface is used in email confirmation data
*/
interface SignupData {
  userId: string;
  expiryTime: number;
}

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
* generate code inside the email url for confirming signup in a promise style
*/
const generateSignupToken = async (userId: string) => {
  // promise化
  new Promise((resolve, reject) => {
    const expiryTime = Math.floor(Date.now() / 1000) + EXPIRY_DURATION;
    const data: SignupData = { userId, expiryTime };
    const jsonData = JSON.stringify(data);
    const encryptedData = encrypt(jsonData, SECRET_KEY);
    return resolve(Buffer.from(encryptedData).toString('base64url'));
  }).catch(error => {
    logger.warn({ err: `${error}`, location: 'from service/auth/generateSignupToken' });
  })
}
/** 
* @params id: user table id returned by creatUser
* @params email: email in signup data
*/
const sendEmailWithToken = async (token: string, email: string) => {
  const encodedToken = Buffer.from(token).toString('base64url');
  const mailer = new Mailer();
  const url = config.get('server.host')?.concat(`:${config.get('server.port')}`).concat(`/api/v0/auth/signup?code=${encodedToken}`);
  mailer.sendMail(email, `注册确认`,
    `<div>
    please click the following url for completing the signup
    <a href="${url}">${url}</a>
    </div>`)
    .then((info: MailResponse) => {
      const status = parseInt(info.response.split(' ')[0]);
      debugLogger.debug(`email send status: ${status}`);
    }).catch(err => {
      debugLogger.debug(err.message);
      logger.warn({ err });
    })
}
/** 
* veryfy token inside the email url by 2 steps
* 1st verify it is valid
* 2nd verify user is pending or not
*/
const verifySignupToken = (code: string): SignupData | null => {
  const decodedData = Buffer.from(code, 'base64url').toString();
  const jsonData = decrypt(decodedData, SECRET_KEY);
  const dataObj = JSON.parse(jsonData) as SignupData;
  if (dataObj.expiryTime < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return dataObj;
}

export {
  verifySignupData,
  isSignupRepeated,
  createUser,
  generateSignupToken,
  sendEmailWithToken,

  verifySignupToken
};