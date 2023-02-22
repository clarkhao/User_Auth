import type { NextApiRequest, NextApiResponse } from 'next';
/**
* @swagger
* /api/signup:
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
*               $ref:
*               example:
*       400: 
*         $ref: '#/components/responses/BadRequest'
*       409:
*         $ref: '#/components/responses/ConflictId'
*       500:
*         $ref: '#/components/responses/ServerMistake'
*   get:
*     description: click the email link and get here. if success, update the role from pending to user
*     parameters:
*       - in: query
*         name: token
*         schema: 
*           type: string
*     responses:
*       204:
*         description: verify the token successfully
*       400: 
*         $ref: '#/components/responses/BadRequest'
*       404:
*         $ref: '#/components/responses/NotFound'
*       500:
*         $ref: '#/components/responses/ServerMistake'
*
*/

async function SignUpHandler(req: NextApiRequest, res: NextApiResponse) {

}

export default SignUpHandler;