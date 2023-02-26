import type { NextApiRequest, NextApiResponse } from 'next';
import { LoggerMiddleware } from 'src/middleware/logger';
import { SignatureMiddleware } from 'src/middleware/verifySign';
import { ErrorMiddleware } from 'src/middleware/error';
import { verifySignupData, isSignupRepeated, createUser, sendEmailWithToken } from 'src/service';
import { debugLogger } from 'src/utils';
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
*   patch:
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
      case 'post':
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
        //send email for confirmation
        await sendEmailWithToken(id, signupData.email);
        //response
        //add headers or cookie in middleware
        //add status code and json here
        res.status(201).json({ id });
        break;
      case 'patch':
        //validate the email token
        //update the user
        break;
      default:
        res.status(405).send('Method not allowed');
        break;
    }

  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SignUpHandler;