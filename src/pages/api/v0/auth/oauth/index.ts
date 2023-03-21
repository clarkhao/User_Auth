import type { NextApiRequest, NextApiResponse } from "next";
import { getCookie } from "src/middleware/cookie";
import { ErrorMiddleware } from "src/middleware/error";
import { LoggerMiddleware } from "src/middleware/logger";
import { getRedis } from "src/utils";
import { TSession } from "src/model/type";

/**
 * @swagger
 * /api/v0/auth/oauth:
 *   get:
 *     description: after oauth 2.0 signed in successfully, apply for access token and user info
 *     summary: 只是参考不可测试
 *     tags:
 *       - oauth
 *     parameters:
 *       - in: cookie
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     security:
 *       - HttpOnlyCookie: []
 *     responses:
 *       200:
 *         description: get access token and user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *               example:
 *       401:
 *         description: token in cookie missing
 *         $ref: '#/components/responses/FailedAuth'
 *       500:
 *         description: redis or inner server mistake
 *         $ref: '#/components/responses/ServerMistake'
 */

async function RefreshOauthHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    if (req.method === "GET") {
      const { cookie, error } = getCookie("token", req);
      if (error !== null) {
        throw new Error(`401 no token`);
      }
      const originalUrl = getCookie("originalUrl", req);
      const result = await getRedis(cookie);
      if (result.error !== null) throw new Error(`500 cannot read reids`);
      console.log(result.data);
      const { id, userInfo, locale } = result.data as TSession;
      res.status(200).json({
        token: cookie,
        originalUrl: originalUrl.cookie || "/",
        locale,
        userInfo,
        id,
      });
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default RefreshOauthHandler;
