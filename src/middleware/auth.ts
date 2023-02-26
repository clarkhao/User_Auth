import type { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, verifyToken } from 'src/utils';
const config = require('config');

/** 
* access token from header, and refresh token from cookie
* validate access token first, if token ok then pass, else validate refresh token
* if both token expires, log out, close session and redirect to login page
* if only access token expires, generate new access token and send it back to client
*/
const authMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  const aToken = req.headers['authorization'] ?? '';
  const aTokenVerified = verifyToken(aToken, process.env[config.get('key.access')] ?? '');
  if (!(aTokenVerified instanceof Error))
    return;
  else {
    const rToken = req.cookies['token'] ?? '';
    const rTokenVerified = verifyToken(rToken, process.env[config.get('key.refresh')] ?? '');
    if (rTokenVerified instanceof Error) {
      //logout, close session, redirect to login
    }
    const newAtoken = generateToken((rTokenVerified as { id: string }).id, process.env[config.get('key.access')] ?? '', '1h');
    //write newAtoken into a httponly cookie;
    return;
  }
}

export { authMiddleware };