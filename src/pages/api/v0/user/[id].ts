import type { NextApiRequest, NextApiResponse } from "next";
import { LoggerMiddleware } from "src/middleware/logger";
import { ErrorMiddleware } from "src/middleware/error";
import { DecryptMiddleware } from "src/middleware/decrypt";
import { AuthMiddleware } from "src/middleware/auth";
import { setRedis, getRedis, delRedis, db } from "src/utils";
import { TSession, TUserProfile, TInfo, Role, UserType } from "src/model/type";
import { User } from "src/model";
import { saveSession } from "src/service";

/**
 * @swagger
 * /api/v0/user/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       description: user id
 *   get:
 *     description: get a user info by id, need authen + author
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
 *     description: delete a user by id, authen needed
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
    const { id } = req.query;
    console.log(id);
    if(id === undefined) throw new Error(`400 parameter id missing`)
    const accessToken = await AuthMiddleware(req, res);
    if (req.method === "GET") {
      //first read session.profile and info
      //if not read db.profile and info
      let userProfile: TUserProfile = {};
      const { data, error } = await getRedis(accessToken);
      if (error === null) {
        const { id, userInfo, profile } = data as TSession;
        const info = {
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
        } as TInfo;
        //权限
        if (info.role === "pending")
          throw new Error(`403 authorization failed`);
        userProfile = { id, ...profile };
      } else {
        const user = new User(db);
        const { success, query, error } = await user.readUserById(id as string);
        if (error !== null) throw new Error(`500 inner server error`);
        const { name, type, email, role, oauth, profile } = query[0];
        //权限
        if (type === UserType.Email && role === Role.Pending)
          throw new Error(`403 authorization failed`);
        else if (type !== UserType.Email)
          throw new Error(`401 authentication missing`);
        const info = {
          name,
          email,
          role: role === Role.User ? "user" : "admin",
        };
        const userInfo = JSON.parse(profile as string);
        userProfile = { id, ...userInfo };
        //重新存入redis
        const result = await saveSession({
          id: id as string,
          accessToken,
          userInfo: info,
          profile: userInfo,
          source: "email",
          locale: "cn",
        });
      }
      res.status(200).json({ profile: { ...userProfile } });
    } else if (req.method === "POST") {
      //decrypt req.body
      const { data, error } = DecryptMiddleware(req);
      if (error !== null) {
        throw error;
      }
    } else if (req.method === "DELETE") {
      //read the session for user id
      //use id to delete the user in db
    } else {
      res.status(405).send("Method not allowed");
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SingleUserHandler;
