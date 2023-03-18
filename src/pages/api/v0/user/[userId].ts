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
 *   get:
 *     description: get a user info by id, need authen + author
 *     parameters:
 *       - in: path
 *           name: id
 *           schema:
 *             type: string
 *           description: user id
 *   post:
 *     description: update use's info, both authen + author needed
 *   delete:
 *     description: delete a user by id, both authen + author needed
 *
 */

async function SingleUserHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    LoggerMiddleware(req, res);
    const { id } = req.query;
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
          source: 'email',
          locale: 'cn'
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
    } else {
      res.status(405).send("Method not allowed");
    }
  } catch (err) {
    ErrorMiddleware(err, res);
  }
}

export default SingleUserHandler;
