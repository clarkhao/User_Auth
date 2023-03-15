import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'src/middleware/cookie';
import { ErrorMiddleware } from 'src/middleware/error';

/**
* @swagger
* /api/v0/auth/oauth:
*   get:
*     description: refresh token with httponly cookie access_token
*     
*/

function RefreshHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            res.setHeader('Access-control-allow-credentials', 'true');
            const token = getCookie('token', req);
            if (token.error !== null) {
                console.log('oops');
                res.send('no token?')
                return;
            }
            console.log(token.cookie);
            res.status(200).json({ token });
        }
    } catch (err) {
        ErrorMiddleware(err, res);
    }

}

export default RefreshHandler;