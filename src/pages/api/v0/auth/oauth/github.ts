import type { NextApiRequest, NextApiResponse } from 'next';
import {getCodeFromGithub, getTokenFromGithub, getUserInfoWithToken, createGithubUser} from 'src/service';
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
*       500:
*       502:
*/

async function githubOauthHandler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === 'GET') {
    const result = await getCodeFromGithub(req.query as Record<string,string>)
    .then( (code) => {
        console.log(`code: ${code}`);
        return getTokenFromGithub(code);
    }).then(async token => {
        console.log(`token: ${token}`);
        const info = async getUserInfoWithToken(token);
        return {info, token};
    }).then(async ({info, token}) => {
        console.log(`info: ${info}`);
        const {Id} = await createGithubUser(info);
        return {id, token, info};
    }).catch(err => {
      console.log(`${err}`);
      throw new Error(`502 Upstream Server is Temporaly not Available`);
    })
    res.status(200).json({msg: result});
  }
}

export default githubOauthHandler;