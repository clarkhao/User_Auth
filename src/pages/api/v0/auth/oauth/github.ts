import type { NextApiRequest, NextApiResponse } from 'next';
import { getCodeFromOauth, getTokenFromGithub, getUserInfoWithToken, createOauthUser, saveOauthSession } from 'src/service';
import { generateToken } from 'src/utils';
import { ErrorMiddleware } from "src/middleware/error";
import { UserType } from 'src/model/type';
import { setCookie, getCookie } from 'src/middleware/cookie';

/**
* @swagger
* /api/v0/auth/oauth/github:
*   get:
*     description: authentication with oauth github
*     paremeters:
*       - in: query
*         name: code
*         schema:
*           type: string
*         description: The code sent by Github which will be used for token fetch
*     responses:
*       201:
*         description: signin with oauth successfully, send tokens
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Token'
*               example:
*       500:
*         description inner server mistake due to db or redis i/o or others
*       502:
*         description: upstream mistake
*/

async function oauthHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        //client side make request like xxx.com/xxx?code=xxx
        const { success, accessToken } = await getCodeFromOauth(req.query as Record<string, string>)
          .then((code) => {
            console.log(`code: ${code}`);
            return getTokenFromGithub(code);
          }).then(async token => {
            console.log(`token: ${token}`);
            const info = await getUserInfoWithToken(token, 'github');
            return { info, token };
          }).then(async ({ info, token }) => {
            console.log(`info: ${info}`);
            const { id } = await createOauthUser(info, UserType.Github);
            return saveOauthSession(id, token, info, 'github');
          }).catch(err => {
            console.log(`${err}`);
            throw new Error(`502 Upstream Server is Temporaly not Available`);
          })
          if(!success)
            throw new Error('500 failed to write to Redis');
          const originalUrl = getCookie('originalUrl', req);
          let redirect = '';
          if(originalUrl.error !== null)
            redirect = '/';
          redirect = originalUrl.cookie;
          console.log(redirect);
          setCookie(accessToken, 'token', 200, res, true);
          res.status(307).redirect('http://localhost:3000/v0/auth/success');
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