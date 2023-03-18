import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken, getRedis, delRedis } from "src/utils";
const config = require("config");
import {
  saveSession,
  getUserInfoWithToken,
  createOauthUser,
} from "src/service";
import { TSession, UserType } from "src/model/type";
import type { TUserType } from "src/model/type";

/**
 * access token from header, and refresh token from redis
 * validate access token first, if token ok then pass, else validate refresh token
 * judge access token source, email/github/google?
 * if both token expires, log out, close session and redirect to login page
 * if only access token expires, generate new access token and send it back to client
 */
const AuthMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  const aToken = req.headers["Authorization"] as string;
  const aTokenVerified = verifyToken(
    aToken,
    process.env[config.get("key.access")] as string
  );
  if (!(aTokenVerified instanceof Error)) return aToken;
  else {
    //access token invalid, now fetch the refresh token / oauth token inside redis
    const { data, error } = await getRedis(aToken);
    if (error !== null) res.status(401).json({ msg: "invalid token" });
    const { token, source } = data as TSession;
    switch (source) {
      case "email":
        const refreshVerified = verifyToken(
          token as string,
          process.env[config.get("key.refresh")] as string
        );
        if (refreshVerified instanceof Error)
          res.status(401).json({ msg: "invalid token" });
        const { success, accessToken } = await saveSession({ ...data });
        if (!success) throw new Error(`500 redis not saved`);
        await delRedis(aToken);
        return accessToken;
      default:
        const info = await getUserInfoWithToken(
          token as string,
          source as string
        );
        if (info instanceof Error)
          res.status(401).json({ msg: "invalid token" });
        const { id } = await createOauthUser(
          info,
          UserType[
            source?.[0]
              .toUpperCase()
              .concat(source.slice(1)) as string as TUserType
          ]
        );
        const result = await saveSession({ ...data, id });
        if (!result.success) throw new Error(`500 redis not saved`);
        await delRedis(aToken);
        return accessToken;
    }
  }
};

export { AuthMiddleware };
