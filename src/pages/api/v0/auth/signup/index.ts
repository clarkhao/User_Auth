import type { NextApiRequest, NextApiResponse } from "next";
import { LoggerMiddleware } from "src/middleware/logger";
import { ErrorMiddleware } from "src/middleware/error";
import { DecryptMiddleware } from "src/middleware/decrypt";
import {
  verifySignupData,
  isSignupRepeated,
  createUser,
  generateSignupToken,
  sendEmailWithToken,
  verifySignupToken,
  checkUserRole,
} from "src/service";
import { debug, logger } from "src/utils";
const config = require("config");
/**
 * @swagger
 * /api/v0/auth/signup:
 *   post:
 *     description: sign up a new email user. if success, craete user with pending role in db and send a email confirmation with token inside url
 *     tags:
 *       - auth
 *     requestBody:
 *       description: user information post for signup
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
 *       201:
 *         description: craete user with pending role in db and send a email confirmation with token inside url
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleMessage'
 *               example:
 *       400:
 *         description: mistake from request body or missing parameters
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: repeated name / email
 *         $ref: '#/components/responses/ConflictId'
 *       500:
 *         description: db i/o error or server mistake
 *         $ref: '#/components/responses/ServerMistake'
 *   get:
 *     description: click the email link and get here.then validate the token inside the email link. if success, update the role from pending to user and redirect to login
 *     tags:
 *       - auth
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *     responses:
 *       301:
 *         description: the email had been invalid, send a new email instead
 *       307:
 *         description: verify the token successfully
 *         headers:
 *           location:
 *             schema:
 *               type: string
 *             description: the login url
 *       400:
 *         description: invalid url inside email
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         description: inner server mistake
 *         $ref: '#/components/responses/ServerMistake'
 *
 */

async function SignUpHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    const locale = req.query["locale"] as string;
    if (req.method === "POST") {
      if (locale === undefined || !["cn", "en", "jp"].includes(locale))
        res.status(400).json({ msg: "oauth query string missing" });
      //decrypt req.body
      const { data, error } = DecryptMiddleware(req);
      if (error !== null) {
        throw error;
      }
      //verify the input signup data, and duplicate signup info check
      const signupData = verifySignupData(data);
      await isSignupRepeated(signupData);
      //save signup info into db
      const { id, email, name } = await createUser(signupData);
      //generate the code inside email url
      generateSignupToken(id, name, email).then((token) => {
        if (token instanceof Error) {
          return;
        } else {
          //send email for confirmation
          sendEmailWithToken(token, email, locale || "cn");
        }
      });
      //response
      //add headers or cookie
      //add status code and json here
      res.status(201).json({ email, name });
    } else if (req.method === "GET") {
      const code = req.query["code"];
      if (typeof code !== "string") throw new Error(`400 invalid url`);
      //validate the email token，如失效，重发连接
      const { isValid, id, name, email } = await verifySignupToken(code);
      if (!isValid) {
        generateSignupToken(id, name, email).then((token) => {
          if (token instanceof Error) {
            return;
          } else {
            sendEmailWithToken(token, email, locale || "cn");
          }
        });
        res.status(301).end();
      }
      //确认是否pending, if pending turn pending into user,
      //otherwise check authentication, if already in, do nothing just send status 200,
      //else redirect to login page with status code 307
      //update the user
      const update = await checkUserRole(name);
      if (update instanceof Error) {
        res.status(204).end();
      } else if (update) {
        res.setHeader(
          "location",
          `${(process.env.NEXT_PUBLIC_ORIGIN as string).concat(
            "/v0/auth/profile"
          )}`
        );
        //获取token
        res.status(307).end();
      } else {
        debug.error({ err: "failed to update role from pending to user" });
        throw new Error(`500 inner server mistake`);
      }
    } else {
      res.status(405).send("Method not allowed");
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SignUpHandler;
