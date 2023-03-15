import {
  SigninNameSchema, db, redisUpClient, generateToken, debug
} from '../../utils';
import { ZodError } from "zod";
import { EmailUser } from '../../model';
import { Role } from '../../model/type'
import crypto from 'crypto';
const config = require('config');

export type SignIn = {
  name: string;
  password: string;
};
/** 
* verify the signin Data
*/
const verifySigninData = (data: string) => {
  const result = SigninNameSchema.safeParse(JSON.parse(data));
  if (!result.success) {
    throw new Error(`400 ${(result.error as ZodError).issues[0].message}`);
  } else {
    return result.data as SignIn;
  }
};
/** 
* test whether the name and password is match with ones in db
*/
const isMatchUser = async (data: SignIn) => {
  try {
    const user = new EmailUser(db);
    const { success, query, error } = await user.readUserByName(data.name);
    if (error !== null) {
      throw error;
    }
    if (typeof query[0].user === 'boolean') {
      throw new Error(`400 wrong user name`);
    } else {
      const hash = crypto.pbkdf2Sync(data.password, query[0].user.salt, 1000, 64, `sha512`).toString(`hex`);
      return { isMatched: hash === query[0].user.hash, pending: query[0].user.role === Role.Pending, id: query[0].user.id, name: data.name};
    }
  } catch (err) {
    throw new Error(`500 from service/auth/signin mistake`);
  }
}
/** 
* 
*/
const saveSession = async (pending: boolean, id: string, name: string) => {
  try {
    const accessToken = generateToken(id, process.env[config.get('key.access')] as string, '3h');
    const refreshToken = generateToken(id, process.env[config.get('key.refresh')] as string, '3 days');
    const session = {
      id,
      token: refreshToken,
      userInfo: { name, pending },
      source: 'email'
    };
    const sessionStr = JSON.stringify(session);
    const sessionBase64 = Buffer.from(sessionStr).toString('base64');
    //return "OK" if saved OK
    const save = await redisUpClient.set(accessToken, sessionStr);
    return { success: save === 'OK', accessToken };
  } catch (err) {
    debug.error(`from service/oauth/index: ${err}`)
    if (err instanceof Error) {
      throw err;
    }
    else {
      throw new Error('500 cannot write into up redis');
    }
  }
}
export { verifySigninData, isMatchUser, saveSession }