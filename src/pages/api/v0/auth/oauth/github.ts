import type { NextApiRequest, NextApiResponse } from 'next';
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