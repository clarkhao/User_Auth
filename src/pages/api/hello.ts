// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { redisDownClient } from 'src/utils';

type Data = {
  msg: string
}
/** 
* @swagger
* /api/hello:
*   get:
*     description: say hello
*     responses:
*       200:
*         description: name
*           
*/
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const value = await redisDownClient.get('foo');
  res.json({ msg: value ?? 'value is null' });
}

export default handler;