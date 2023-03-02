import type { NextApiRequest, NextApiResponse } from "next";
import { LoggerMiddleware } from "src/middleware/logger";
import { SignatureMiddleware } from "src/middleware/verifySign";
import { ErrorMiddleware } from "src/middleware/error";
import {
  verifySignupData,
  isSignupRepeated,
  createUser,
  generateSignupToken,
  sendEmailWithToken,
  verifySignupToken,
  checkUserRole,
} from "src/service";
import { debugLogger, logger } from "src/utils";
const config = require("config");
/**
 * @swagger
 * /api/v0/auth/signup:
 *   post:
 *     description: sign up a new email user. if success, craete user with pending role in db and send a email confirmation with token inside url
 *     requestBody:
 *       description: user information post for signup
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#components/schemas/Encrypted'
 *     responses:
 *       201:
 *         description: craete user with pending role in db and send a email confirmation with token inside url
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleMessage'
 *               example:
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/ConflictId'
 *       500:
 *         $ref: '#/components/responses/ServerMistake'
 *   get:
 *     description: click the email link and get here.then validate the token inside the email link. if success, update the role from pending to user and redirect to login
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *     responses:
 *       307:
 *         description: verify the token successfully
 *         headers:
 *           location:
 *             schema:
 *               type: string
 *             description: the login url
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerMistake'
 *
 */

async function SignUpHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "POST":
        LoggerMiddleware(req, res);
        //decrypt req.body and verify signature
        const { data, error } = SignatureMiddleware(req);
        if (error !== null) {
          throw error;
        }
        //verify the input signup data, and duplicate signup info check
        const signupData = verifySignupData(data);
        await isSignupRepeated(signupData);
        //save signup info into db
        const { id } = await createUser(signupData);
        //generate the code inside email url
        generateSignupToken(id).then((token) => {
          if (token instanceof Error) {
            logger.warn({err: token, location: 'from service/generateSignupToken'})
            return;
          } else {
            //send email for confirmation
            sendEmailWithToken(token, signupData.email);
          }
        });
        //response
        //add headers or cookie
        //add status code and json here
        res.status(201).json({ id });
        break;
      case "GET":
        const code = req.query["code"];
        if (typeof code !== "string") throw new Error(`400 invalid url`);
        //validate the email token，如失效，重发连接
        const { isValid, userId } = await verifySignupToken(code);
        if (!isValid) {
          generateSignupToken(userId).then((token) => {
            if (token instanceof Error) {
              return;
            } else {
              sendEmailWithToken(token, signupData.email);
            }
          });
          res.status(301).end();
        }
        //确认是否pending, if pending turn pending into user,
        //otherwise check authentication, if already in, do nothing just send status 200,
        // else redirect to login page with status code 307
        //update the user
        const update = await checkUserRole(userId);
        if (update) {
          res.setHeader(
            "location",
            `${config.get("server.host").concat("/auth/login")}`
          );
          res.status(307).end();
        } else {
          logger.warn({err: 'failed to update role from pending to user'});
          throw new Error(`500 inner server mistake`);
        }
        break;
      default:
        res.status(405).send("Method not allowed");
        break;
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SignUpHandler;
