import type { NextApiRequest, NextApiResponse } from "next";
import { LoggerMiddleware } from "src/middleware/logger";
import { ErrorMiddleware } from "src/middleware/error";
import { DecryptMiddleware } from "src/middleware/decrypt";
import { AuthMiddleware } from "src/middleware/auth";
import {
  verifySigninData,
  isMatchUser,
  saveSession,
  redirectToOauth,
  generateSignupToken,
  sendEmailWithToken,
} from "src/service";
import { setCookie } from "src/middleware/cookie";
import { getRedis, debug, delRedis } from "src/utils";

/**
 * @swagger
 * /api/v0/auth/signin:
 *   get:
 *     description: oauth signin from here
 *     parameters:
 *       - in: query
 *           name: oauth
 *           schema:
 *             type: string
 *           description: indicate which oauth github / google
 *       - in: query
 *           name: locale
 *           schema:
 *             type: string
 *           description: indicate locale
 *   post:
 *     description: email user try to login with email and pwd. if Match it will send 2 tokens, one is access token, another as refresh token inside a httponly cookie. then create session record in redis and backup in db.
 *     requestBody:
 *       description: user information post for signin
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#components/schemas/Encrypted'
 *     parameters:
 *       - in: query
 *           name: locale
 *           schema:
 *             type: string
 *           description: indicate locale
 *     responses:
 *       200:
 *         description: signin with correct name and password, send tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *               example:
 *       307:
 *         description: 登录后跳转至原地址
 *       400:
 *         description: wrong user name
 *       401:
 *         description: wrong password
 *       500:
 *         description: inner server mistake
 *   head:
 *     description: resend the email for comfirmation again, both authen + author needed
 *     responses:
 *       204:
 *         description: apply successfully
 *       401:
 *         description: authentication failed
 *       429:
 *       500:
 *       503:
 *   delete:
 *     description: user log out, delete access token, refresh token and session record in redis, authen needed
 *     responses:
 *       204:
 *       302:
 *       404:
 *       500:
 */
async function SignInHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    const locale = (req.query.locale || "cn") as string;
    if (req.method === "GET") {
      /*前端弹窗登录，到达后端记录保存req.url到session，登录成功后调出session/redis, 跳转*/
      const oauth = req.query.oauth as string;
      const from = (req.query.from as string) || "/";
      if (oauth === undefined)
        res.status(400).json({ msg: "oauth query string missing" });
      console.log(`req.url: ${req.url}`);
      setCookie(from, "originalUrl", 5, res);
      setCookie(locale, "locale", 5, res);
      console.log(oauth);
      res.redirect(redirectToOauth(oauth));
    } else if (req.method === "POST") {
      //decrypt req.body
      const { data, error } = DecryptMiddleware(req);
      if (error !== null) {
        throw error;
      }
      //verify the sign in data format
      const signinData = verifySigninData(data);
      console.log(signinData);
      //check user role whether pending
      //compare user/email + password with db
      const { isMatched, pending, id, email, name, rawProfile, isAdmin } =
        await isMatchUser(signinData);
      //match -> token, not match -> error
      //check header referer, if exists, then 307 else 200
      const role = pending ? "pending" : isAdmin ? "admin" : "user";
      if (isMatched) {
        //generate access token and refresh token
        const userInfo = { name, email, role };
        const profile =
          rawProfile !== null ? JSON.parse(rawProfile as string) : userInfo;
        const { success, accessToken } = await saveSession({
          id,
          locale,
          userInfo,
          profile,
        });
        if (success)
          res.status(200).json({ token: accessToken, locale, userInfo, id });
      } else {
        res.status(401).send("wrong password");
      }
    } else if (req.method === "HEAD") {
      //需要确认权限，只有role=pending的可以请求此资源
      const accessToken = await AuthMiddleware(req, res);
      const session = await getRedis(accessToken);
      if (session.error !== null) throw session.error;
      const { id, userInfo, locale } = session.data;
      const { email, role } = userInfo;
      if (role === "pending") {
        generateSignupToken(id).then((token) => {
          if (token instanceof Error) {
            throw new Error(`${token}`);
          } else {
            sendEmailWithToken(token, email, locale);
          }
        });
        res.status(200).end();
      } else {
        res.status(403).end();
      }
    } else if (req.method === "DELETE") {
      const accessToken = req.headers["Authorization"] as string | undefined;
      if (accessToken) {
        delRedis(accessToken);
      }
      res.status(204).end();
    } else {
      res.status(405).send("Method not allowed");
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SignInHandler;
