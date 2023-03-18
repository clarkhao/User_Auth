import type { NextApiRequest, NextApiResponse } from "next";
import { getCookie } from "src/middleware/cookie";
import { ErrorMiddleware } from "src/middleware/error";
import { LoggerMiddleware } from "src/middleware/logger";
import { getRedis } from "src/utils";
import { TSession } from "src/model/type";

/**
 * @swagger
 * /api/v0/auth/oauth:
 *   get:
 *     description: use httponly access token to get the bearer token,
 *     in case for frontend to store token inside localStorage;
 *     the info frontend will get are {accessToken, originalUrl}
 *     originalUrl方便前端跳转到登陆前发起页面,
 *     authen needed, it is a httponly cookie token
 */

async function RefreshOauthHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    if (req.method === "GET") {
      const { cookie, error } = getCookie("token", req);
      if (error !== null) {
        throw new Error(`401 no token`);
      }
      const originalUrl = getCookie("originalUrl", req);
      const result = await getRedis(cookie);
      if (result.error !== null) throw new Error(`500 cannot read reids`);
      console.log(result.data);
      const { id, userInfo, locale } = result.data as TSession;
      res
        .status(200)
        .json({
          token: cookie,
          originalUrl: originalUrl.cookie || "/",
          locale,
          userInfo,
          id
        });
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default RefreshOauthHandler;
