// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getRedis } from "src/utils";

/**
 * @swagger
 * /api/hello:
 *   get:
 *     description: do some test
 *     responses:
 *       200:
 *         description: some test
 *
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await getRedis("foo");
  if (error !== null) res.send(error);
  else res.json({ data });
}

export default handler;