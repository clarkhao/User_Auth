import type { NextApiRequest, NextApiResponse } from "next";
import { ErrorMiddleware } from "src/middleware/error";
import { LoggerMiddleware } from "src/middleware/logger";
import {
  getCodeFromOauth,
  getTokenFromGoogle,
  getUserInfoWithToken,
  createOauthUser,
  saveSession,
} from "src/service";
import { UserType, TProfile, Role } from "src/model/type";
import { setCookie, getCookie } from "src/middleware/cookie";
import { debug } from "src/utils";
/**
 * @swagger
 * /api/v0/auth/oauth/google:
 *   get:
 *     description: authentication with oauth google
 *     summary: 只是参考不可测试
 *     tags:
 *       - oauth
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: The code sent by Google which will be used for token fetch
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
async function googleOauthHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    switch (req.method) {
      //check header referer, if exists, then 307 else 201
      case "GET":
        const { success, accessToken } = await getCodeFromOauth(
          req.query as Record<string, string>
        )
          .then((code) => {
            console.log(`code: ${code}`);
            return getTokenFromGoogle(code);
          })
          .then(async (token) => {
            console.log(`token: ${token}`);
            const userInfo = await getUserInfoWithToken(token, "google");
            return { userInfo, token };
          })
          .then(async ({ userInfo, token }) => {
            console.log(`info: ${userInfo}`);
            try {
              const { id, role, profile } = await createOauthUser(
                userInfo,
                UserType.Google
              );
              const cookie = (locale.cookie || "cn") as string;
              const info = {
                email: userInfo.email as string,
                name: userInfo.name as string,
                role: role === Role.User ? "user" : "admin",
              };
              console.log(`profile: ${profile}`);
              return saveSession({
                id,
                token,
                userInfo: info,
                source: "github",
                locale: cookie,
                profile: JSON.parse(profile as string),
              });
            } catch (error) {
              throw new Error(`500 db and redis`);
            }
          })
          .catch((err) => {
            debug.error(`${err}`);
            throw new Error(`502 Upstream Server is Temporaly not Available`);
          });
        if (!success) throw new Error("500 failed to write to Redis");
        setCookie(accessToken, "token", 2, res, true);
        const locale = getCookie("locale", req);
        res.setHeader(
          "Location",
          `${process.env.NEXT_PUBLIC_ORIGIN}/${
            locale.cookie || "cn"
          }/v0/auth/success`
        );
        res.status(301).end();
        break;
      default:
        res.status(405).send("Method not allowed");
        break;
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default googleOauthHandler;
