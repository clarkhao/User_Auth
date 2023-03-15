import type { NextApiRequest, NextApiResponse } from 'next';
import { LoggerMiddleware } from "src/middleware/logger";
import { ErrorMiddleware } from "src/middleware/error";
import { DecryptMiddleware } from "src/middleware/decrypt";
import { verifySigninData, isMatchUser, saveSession } from 'src/service';

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
*   post:
*     description: email user try to login with email and pwd. if Match it will send 2 tokens, one is access token, another as refresh token inside a httponly cookie. then create session record in redis and backup in db.
*     requestBody:
*       description: user information post for signin 
*       content:
*         application/x-www-form-urlencoded:
*           schema:
*             $ref: '#components/schemas/Encrypted'
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
*     description: resend the email for comfirmation again
*     responses:
*       204:
*         description: apply successfully
*       401:
*         description: authentication failed
*       429:
*       500:
*       503:
*   delete:
*     description: user log out, delete access token, refresh token and session record in redis
*     responses:
*       204:
*       302:
*       404:
*       500:
*/
async function SignInHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        /*前端弹窗登录，到达后端记录保存req.url到session，登录成功后调出session/redis, 跳转*/

      case "POST":
        LoggerMiddleware(req, res);
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
        const { isMatched, pending, id, name } = await isMatchUser(signinData);
        //match -> token, not match -> error
        //check header referer, if exists, then 307 else 200
        if (isMatched) {
          //generate access token and refresh token
          const { success, accessToken } = await saveSession(pending, id, name);
          if (success)
            res.status(200).json({ token: accessToken });
        } else {
          res.status(401).send('wrong password');
        }
        break;
      case "HEAD":

        break;
      default:
        res.status(405).send("Method not allowed");
        break;
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SignInHandler;