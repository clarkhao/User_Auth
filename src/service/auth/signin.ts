import {
  SigninNameSchema,
  db,
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
    if (query[0] === undefined) {
      throw new Error(`401 wrong user name`);
    } else {
      const hash = crypto
        .pbkdf2Sync(data.password, query[0].salt, 1000, 64, `sha512`)
        .toString(`hex`);
      return {
        isMatched: hash === query[0].hash,
        pending: query[0].role === Role.Pending,
        isAdmin: query[0].role === Role.Admin,
        id: query[0].id,
        email: query[0].email,
        name: data.name,
        rawProfile: query[0].profile,
      };
    }
  } catch (err) {
    throw err;
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
    throw err;
  }
};
export { verifySigninData, isMatchUser, saveSession };
