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
  updateHash
} from "src/service";
import { setCookie } from "src/middleware/cookie";
import { getRedis, debug, delRedis, verifyToken } from "src/utils";
const config = require("config");
/**
 * @swagger
 * /api/v0/auth/signin:
 *   get:
 *     description: oauth signin from here
 *     summary: 只是参考不可测试
 *     tags:
 *       - oauth
 *     parameters:
 *       - in: query
 *         name: oauth
 *         schema:
 *           type: string
 *         required: true
 *         description: indicate which oauth github / google
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         description: indicate locale
 *     responses:
 *       307:
 *         description: record the url from which make the request and the locale in cookies, and then redirect to oauth url
 *         headers:
 *           set-cookie:
 *             schema:
 *               type: string
 *             description: original url and locale cookies
 *       400:
 *         description: oauth parameters inside query string missing
 *         $ref: '#/components/responses/BadRequest'
 *   post:
 *     description: email user try to login with email and pwd. if Match it will send 2 tokens, one is access token, another as refresh token inside a httponly cookie. then create session record in redis and backup in db.
 *     tags:
 *       - auth
 *     requestBody:
 *       description: user information post for signin
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#components/schemas/Encrypted'
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         description: indicate locale
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
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *       400:
 *         description: errors from user input data verified or parameters missing
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: wrong password or user name
 *         $ref: '#/components/responses/FailedAuth'
 *       500:
 *         description: inner server mistake
 *         $ref: '#/components/responses/ServerMistake'
 *   head:
 *     description: resend the email for comfirmation again, both authen + author needed
 *     tags:
 *       - auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: apply successfully
 *       401:
 *         description: authentication failed
 *         $ref: '#/components/responses/FailedAuth'
 *       403:
 *         description: not pending any more
 *         $ref: '#/components/responses/InvalidRole'
 *       429:
 *         description: too many requests
 *       500:
 *         description: inner server mistake
 *         $ref: '#/components/responses/ServerMistake'
 *   put:
 *     description: email user update the password
 *     requestBody:
 *       description: user information post for signin
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#components/schemas/Encrypted'
 *     tags:
 *       - auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: successfull updated password
 *       500:
 *         description: inner server mistake
 *         $ref: '#/components/responses/ServerMistake'
 *   delete:
 *     description: user log out, delete access token, refresh token and session record in redis, authen needed
 *     tags:
 *       - auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: successfull log out
 *       500:
 *         description: inner server mistake
 *         $ref: '#/components/responses/ServerMistake'
 */
async function SignInHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    if (req.method === "GET") {
      /*前端弹窗登录，到达后端记录保存req.url到session，登录成功后调出session/redis, 跳转*/
      const oauth = req.query.oauth as string;
      const from = (req.query.from as string) || "/";
      const locale = (req.query.locale || "cn") as string;
      if (oauth === undefined || !["google", "github"].includes(oauth))
        res.status(400).json({ msg: "oauth query string missing" });
      if (locale === undefined || !["cn", "en", "jp"].includes(locale))
        res.status(400).json({ msg: "oauth query string missing" });
      console.log(`req.url: ${req.url}`);
      setCookie(from, "originalUrl", 5, res);
      setCookie(locale, "locale", 5, res);
      console.log(oauth);
      res.redirect(redirectToOauth(oauth));
    } else if (req.method === "POST") {
      const locale = (req.query.locale || "cn") as string;
      if (locale === undefined || !["cn", "en", "jp"].includes(locale))
        res.status(400).json({ msg: "oauth query string missing" });
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
        const { success, accessToken } = await saveSession({
          id,
          locale,
          userInfo,
          profile: JSON.parse(rawProfile as string),
        });
        if (success)
          res.status(200).json({ token: accessToken, locale, userInfo, id });
      } else {
        res.status(401).json({ msg: "wrong password" });
      }
    } else if (req.method === "HEAD") {
      //需要确认权限，只有role=pending的可以请求此资源
      const accessToken = await AuthMiddleware(req, res);
      const session = await getRedis(accessToken);
      if (session.error !== null) throw session.error;
      const { id, userInfo, locale } = session.data;
      const { name, email, role } = userInfo;
      if (role === "pending") {
        generateSignupToken(id, name, email).then((token) => {
          if (token instanceof Error) {
            throw new Error(`${token}`);
          } else {
            sendEmailWithToken(token, email, locale);
          }
        });
        res.status(204).end();
      } else {
        res.status(403).end();
      }
    } else if (req.method === "PUT") {
      //需要确认权限，只有role=user的可以请求此资源
      const accessToken = await AuthMiddleware(req, res);
      const session = await getRedis(accessToken);
      if (session.error !== null) throw session.error;
      const { userInfo } = session.data;
      const {name, role} = userInfo;
      if(role === 'pending')
        res.status(403).end();
      const { data, error } = DecryptMiddleware(req);
      if (error !== null) {
        throw error;
      }
      const {newPwd} = JSON.parse(data);
      if(await updateHash(name, newPwd))
        res.status(204).end();
      else 
        res.status(500).json({msg: 'inner server mistake'});
    } else if (req.method === "DELETE") {
      const aToken = (req.headers["authorization"] as string).split(" ")[1];
      const aTokenVerified = verifyToken(
        aToken,
        process.env[config.get("key.access")] as string
      );
      if (!(aTokenVerified instanceof Error)) delRedis(aToken);
      res.status(204).end();
    } else {
      res.status(405).send("Method not allowed");
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SignInHandler;
