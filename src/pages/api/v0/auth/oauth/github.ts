import type { NextApiRequest, NextApiResponse } from 'next';
import { getCodeFromOauth, getTokenFromGithub, getUserInfoWithToken, createOauthUser, saveOauthSession } from 'src/service';
import { generateToken } from 'src/utils';
import { ErrorMiddleware } from "src/middleware/error";
import { UserType } from 'src/model/type';

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
        //cliend side make request like xxx.com/xxx?code=xxx
        getCodeFromOauth(req.query as Record<string, string>)
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
            const { success, accessToken } = await saveOauthSession(id, token, info, 'github');
            res.status(201).json({ token: accessToken });
          }).catch(err => {
            console.log(`${err}`);
            throw new Error(`502 Upstream Server is Temporaly not Available`);
          })
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