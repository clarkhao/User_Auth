import type { NextApiRequest, NextApiResponse } from 'next';
/**
* @swagger
* /api/v0/auth/login:
*   post:
*     description: email user try to login with email and pwd. if Match it will send 2 tokens, one is access token, another as refresh token inside a httponly cookie. then create session record in redis and backup in db.
*     requestBody:
*       description: user information post for signup 
*       content:
*         application/x-www-form-urlencoded:
*           schema:
*             $ref: '#components/schemas/Encrypted'
*     responses:
*       200:
*       307:
*       400:
*       401:
*       500:
*   head:
*     description: resend the email for comfirmation again
*     responses:
*       204:
*       401:
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