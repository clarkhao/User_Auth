import type { NextApiRequest, NextApiResponse } from "next";
import { LoggerMiddleware } from "src/middleware/logger";
import { ErrorMiddleware } from "src/middleware/error";
import { DecryptMiddleware } from "src/middleware/decrypt";
import { AuthMiddleware } from "src/middleware/auth";
import { setRedis, getRedis, delRedis, db } from "src/utils";
import { TSession, TUserProfile, TInfo, Role, UserType } from "src/model/type";
import { saveSession, updateProfile, deleteUser } from "src/service";

/**
 * @swagger
 * /api/v0/user/{name}:
 *   parameters:
 *     - in: path
 *       name: name
 *       schema:
 *         type: string
 *       description: user name
 *   get:
 *     description: get a user info by name, need authen + author
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *               example:
 *       400:
 *         description: parameter missing
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: authentication failed
 *         $ref: '#/components/responses/FailedAuth'
 *       403:
 *         description: role is pending not user
 *         $ref: '#/components/responses/InvalidRole'
 *       500:
 *         $ref: '#/components/responses/ServerMistake'
 *   post:
 *     description: update use's info, both authen + author needed
 *     tags:
 *       - user
 *     requestBody:
 *       description: user information post
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#components/schemas/Encrypted'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: updated successfully
 *       400:
 *         description: parameter missing or input data error
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: authentication failed
 *         $ref: '#/components/responses/FailedAuth'
 *       403:
 *         description: not authorized
 *         $ref: '#/components/responses/InvalidRole'
 *       409:
 *         description: repeated info
 *         $ref: '#/components/responses/ConflictId'
 *       500:
 *         $ref: '#/components/responses/ServerMistake'
 *   delete:
 *     description: delete a user by name, authen needed
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: deleted successfully
 *       401:
 *         description: authentication failed
 *         $ref: '#/components/responses/FailedAuth'
 *       500:
 *         $ref: '#/components/responses/ServerMistake'
 */

async function SingleUserHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    const { name } = req.query;
    console.log(name);
    if (name === undefined) throw new Error(`400 parameter name missing`);
    const accessToken = await AuthMiddleware(req, res);
    if (req.method === "GET") {
      //first read session.profile and info
      const { data, error } = await getRedis(accessToken);
      if (error !== null) {
        throw new Error(`500 read from redis mistake`);
      }
      const { locale, userInfo, profile } = data as TSession;
      const { role } = userInfo;
      //权限
      if (role === "pending") throw new Error(`403 authorization failed`);
      res.status(200).json({ profile: { locale, ...userInfo, ...profile } });
    } else if (req.method === "POST") {
      const { data, error } = await getRedis(accessToken);
      if (error !== null) {
        throw new Error(`500 read from redis mistake`);
      }
      const { userInfo } = data as TSession;
      if (userInfo.role === "pending" || userInfo.name !== name)
        throw new Error(`403 authorization failed`);
      //decrypt req.body
      const decrypted = DecryptMiddleware(req);
      if (decrypted.error !== null) {
        throw decrypted.error;
      }
      const query = await updateProfile(name, decrypted.data);
      const {profile} = query;
      await saveSession({...data, profile, accessToken});
      res.status(204).end();
      //查看更新的用户类型
    } else if (req.method === "DELETE") {
      //read the session for user name
      //use id to delete the user in db
      const { data, error } = await getRedis(accessToken);
      if (error !== null) {
        throw new Error(`500 read from redis mistake`);
      }
      const { id, userInfo } = data as TSession;
      if (userInfo.role === "pending" || userInfo.name !== name)
        throw new Error(`403 authorization failed`);
      await deleteUser([id]);
      res.status(204).end();
    } else {
      res.status(405).send("Method not allowed");
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SingleUserHandler;
