import { EmailUser } from "../../model";
import {
  db,
  verify,
  SignupSchema,
  logger,
  debug,
  Mailer,
  generateToken,
  verifyToken,
  encrypt,
  decrypt,
  doHeavyWork,
} from "../../utils";
import type { MailResponse } from "../../utils";
import { ZodError } from "zod";
import Mail from "nodemailer/lib/mailer";
import { Role } from "../../model/type";
const config = require("config");
import path from "path";
import EmailTemplate from "./emailComponent";
import { renderToString } from "react-dom/server";
import { createElement } from "react";

const SECRET_KEY = process.env[config.get("key.cipher")] || "";
const EXPIRY_DURATION = 3600; // Expiry duration in seconds (1 hour)
/**
 * this interface is used in email confirmation data
 */
interface SignupData {
  id: string;
  name: string;
  email: string;
  expiryTime: number;
}

export type SignUp = {
  name: string;
  email: string;
  password: string;
};
/**
 * decomposite the sigup data, and verify the input signup data
 */
const verifySignupData = (data: string) => {
  const result = SignupSchema.safeParse(JSON.parse(data));
  if (!result.success) {
    throw new Error(`400 ${(result.error as ZodError).issues[0].message}`);
  } else {
    return result.data as SignUp;
  }
};
/**
 * check duplicate email and name
 */
const isSignupRepeated = async (signup: SignUp) => {
  const user = new EmailUser(db);
  const { success, query, error } = await user.readUser(
    signup.name,
    signup.email
  );
  let message = "";
  if (error !== null) {
    throw error;
  }
  query[0].name && (message += `name been token`);
  query[0].email && (message += ` email been token`);
  if (query[0].name || query[0].email) {
    throw new Error(`409 ${message.trim()}`);
  }
  return;
};
/**
 * save signup info into db to create user
 */
const createUser = async (signup: SignUp) => {
  const user = new EmailUser(db);
  const { success, query, error } = await user.createUser(
    signup.name,
    signup.email,
    signup.password
  );
  if (error !== null) {
    throw error;
  }
  return query[0];
};
/**
 * generate code inside the email url for confirming signup in a promise style
 */
const generateSignupToken = async (id: string, name: string, email: string) => {
  // promise化
  return Promise.resolve()
    .then(async () => {
      const expiryTime = Math.floor(Date.now() / 1000) + EXPIRY_DURATION;
      const data: SignupData = { id, name, email, expiryTime };
      const jsonData = JSON.stringify(data);
      const encryptedData = encrypt(jsonData, SECRET_KEY);
      return Buffer.from(encryptedData).toString("base64url");
    })
    .catch((error) => {
      logger.warn({
        err: `${error}`,
        location: "from service/auth/generateSignupToken",
      });
      return new Error(`${error}`);
    });
};
/**
 * @param email: email in signup data
 */
const sendEmailWithToken = async (
  token: string,
  email: string,
  locale: string
) => {
  const mailer = new Mailer();
  const url = config
    .get("server.host")
    ?.concat(`:${config.get("server.port")}`)
    .concat(`/api/v0/auth/signup?locale=${locale}&code=${token}`);
  //此处使用mdx替换
  const title: { [key: string]: string } = {
    cn: "注册确认",
    en: "Registration Confirmation",
    jp: "登録確認",
  };
  mailer
    .sendMail(
      email,
      title[locale],
      renderToString(createElement(EmailTemplate, { url: url, locale: locale }))
    )
    .then((info: MailResponse) => {
      const status = parseInt(info.response.split(" ")[0]);
      debug.error(`email send status: ${status}`);
    })
    .catch((err) => {
      debug.error(err.message);
      logger.warn({ err });
    });
};
/**
 * veryfy token inside the email url by 2 steps
 * 1st verify it is valid
 * 2nd verify user is pending or not
 * @param code: url query string
 * @returns userId as string
 */
const verifySignupToken = async (code: string) => {
  try {
    const decodedData = Buffer.from(code, "base64url").toString();
    const jsonData = decrypt(decodedData, SECRET_KEY);
    const dataObj = JSON.parse(jsonData) as SignupData;
    if (dataObj.expiryTime < Math.floor(Date.now() / 1000)) {
      return {
        isValid: false,
        id: dataObj.id,
        name: dataObj.name,
        email: dataObj.email,
      };
    }
    return {
      isValid: true,
      id: dataObj.id,
      name: dataObj.name,
      email: dataObj.email,
    };
  } catch (error) {
    logger.warn({
      err: `${error}`,
      location: "from service/auth/verifySignupToken",
    });
    throw new Error(`400 invalid url`);
  }
};
//确认是否pending, if pending turn pending into user,
//otherwise check authentication, if already in, do nothing just send status 200,
// else redirect to login page with status code 307
const checkUserRole = async (name: string) => {
  try {
    //read user by id
    const user = new EmailUser(db);
    const { query, error } = await user.readUserByName(name);
    if (error) {
      throw new Error(`500 inner server mistake`);
    }
    debug.error(`current role: ${query[0].role}`);
    if (query[0].role !== Role.Pending) {
      return new Error("already");
    }
    const update = await user.updateUser(name, Role.User, "role");
    return update.success;
  } catch (error) {
    throw new Error(`500 inner server mistake`);
  }
};

export {
  verifySignupData,
  isSignupRepeated,
  createUser,
  generateSignupToken,
  sendEmailWithToken,
  verifySignupToken,
  checkUserRole,
};
