import type { NextApiRequest, NextApiResponse } from 'next';

/** 
* access token from header, and refresh token from cookie
* validate access token first, if token ok then pass, else validate refresh token
* if both token expires, log out, close session and redirect to login page
* if only access token expires, generate new access token and send it back to client
*/
const authMiddleware = (req: NextApiRequest, res: NextApiResponse) => {

}