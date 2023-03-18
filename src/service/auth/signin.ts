import {
  SigninNameSchema,
  db,
  redisUpClient,
  generateToken,
  debug,
  setRedis,
} from "../../utils";
import { ZodError } from "zod";
import { EmailUser } from "../../model";
import { Role, JsonObject, TProfile } from "../../model/type";
import crypto from "crypto";
const config = require("config");
import { TSession } from "src/model/type";

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
    if (typeof query[0].user === "boolean") {
      throw new Error(`400 wrong user name`);
    } else {
      const hash = crypto
        .pbkdf2Sync(data.password, query[0].user.salt, 1000, 64, `sha512`)
        .toString(`hex`);
      return {
        isMatched: hash === query[0].user.hash,
        pending: query[0].user.role === Role.Pending,
        isAdmin: query[0].user.role === Role.Admin,
        id: query[0].user.id,
        email: query[0].user.email,
        name: data.name,
        rawProfile: query[0].user.profile,
      };
    }
  } catch (err) {
    throw new Error(`500 from service/auth/signin mistake`);
  }
};
/**
 *
 */
const saveSession = async ({
  locale = "cn",
  source = "email",
  //createAt date额外加了8h, 读取的时候要-8h
  createAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toJSON(),
  ...props
}: TSession & {accessToken?: string}) => {
  try {
    const accessToken = props.accessToken ?? generateToken(
      props.id,
      process.env[config.get("key.access")] as string,
      "3h"
    );
    const refreshToken =
      source !== "email" || props.token
        ? props.token
        : generateToken(
            props.id,
            process.env[config.get("key.refresh")] as string,
            "3 days"
          );
    const session = {
      ...props,
      token: refreshToken,
      locale,
      source,
      createAt,
    };
    const { success } = await setRedis(accessToken, session);
    return { success, accessToken };
  } catch (err) {
    debug.error(`from service/oauth/index: ${err}`);
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error(`${err}`);
    }
  }
};
export { verifySigninData, isMatchUser, saveSession };
