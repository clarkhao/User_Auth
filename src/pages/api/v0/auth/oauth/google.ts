import type { NextApiRequest, NextApiResponse } from 'next';
import { ErrorMiddleware } from "src/middleware/error";
import { getCodeFromOauth, getTokenFromGoogle, getUserInfoWithToken, createOauthUser, saveSession } from 'src/service';
import { UserType } from 'src/model/type';
/**
* @swagger
* /api/v0/auth/oauth/google:
*   get:
*     description: authentication with oauth google
*     paremeters:
*       - in: query
*         name: code
*         schema:
*           type: string
*         description: The code sent by Google which will be used for token fetch
*     responses:
*       201:
*       500:
*       502:
*/
async function googleOauthHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        getCodeFromOauth(req.query as Record<string, string>)
          .then((code) => {
            console.log(`code: ${code}`);
            return getTokenFromGoogle(code);
          }).then(async token => {
            console.log(`token: ${token}`);
            const info = await getUserInfoWithToken(token, 'google');
            return { info, token };
          }).then(async ({ info, token }) => {
            console.log(`info: ${info}`);
            const { id } = await createOauthUser(info, UserType.Google);
            const { success, accessToken } = await saveSession(id, token, info, 'google');
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

export default googleOauthHandler