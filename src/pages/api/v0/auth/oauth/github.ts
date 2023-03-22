import type { NextApiRequest, NextApiResponse } from "next";
import {
  getCodeFromOauth,
  getTokenFromGithub,
  getUserInfoWithToken,
  createOauthUser,
  saveSession,
} from "src/service";
import { ErrorMiddleware } from "src/middleware/error";
import { LoggerMiddleware } from "src/middleware/logger";
import { JsonObject, TProfile, UserType, Role } from "src/model/type";
import { setCookie, getCookie } from "src/middleware/cookie";
import { JsonValue } from "src/component/utils";

/**
 * @swagger
 * /api/v0/auth/oauth/github:
 *   get:
 *     description: authentication with oauth github
 *     summary: 只是参考不可测试
 *     tags:
 *       - oauth
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: The code sent by Github which will be used for token fetch
 *     responses:
 *       303:
 *         description: signin with oauth successfully, redirect to success page where request the token
 *         headers: 
 *           Set-Cookie:
 *             schema:
 *               type: string
 *       405:
 *         description: method not allowed
 *         $ref: '#/components/responses/NoSuchMethod'
 *       500:
 *         description: db or redis io mistake
 *         $ref: '#/components/responses/ServerMistake'
 *       502:
 *         description: upstream server mistake
 *         $ref: '#/components/responses/UpstreamMistake'
 */

async function oauthHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    switch (req.method) {
      case "GET":
        //client side make request like xxx.com/xxx?code=xxx
        const locale = getCookie("locale", req);
        const { success, accessToken } = await getCodeFromOauth(
          req.query as Record<string, string>
        )
          .then((code) => {
            console.log(`code: ${code}`);
            return getTokenFromGithub(code);
          })
          .then(async (token) => {
            console.log(`token: ${token}`);
            const userInfo = await getUserInfoWithToken(token, "github");
            return { userInfo, token };
          })
          .then(async ({ userInfo, token }) => {
            console.log(`info: ${userInfo}`);
            const { id, role, profile } = (await createOauthUser(
              userInfo,
              UserType.Github
            )) as { id: string; role: Role; profile: JsonValue };
            const cookie = (locale.cookie || "cn") as string;
            const info = {
              email: userInfo.email as string,
              name: userInfo.login as string,
              role: role === Role.User ? "user" : "admin",
            };
            console.log(`profile: ${profile}`)
            return saveSession({
              id,
              token,
              userInfo: info,
              source: "github",
              locale: cookie,
              profile: JSON.parse(profile as string)
            });
          })
          .catch((err) => {
            console.log(`${err}`);
            throw new Error(`502 Upstream Server is Temporaly not Available`);
          });
        if (!success) throw new Error("500 failed to write to Redis");

        setCookie(accessToken, "token", 200, res, true);
        res
          .status(307)
          .redirect(
            `${process.env.NEXT_PUBLIC_ORIGIN}/${
              locale.cookie || "cn"
            }/v0/auth/success/signin`
          );
        break;
      default:
        res.status(405).send("Method not allowed");
        break;
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default oauthHandler;
