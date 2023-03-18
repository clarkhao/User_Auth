import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * @swagger
 * /api/v0/user:
 *   get:
 *     description: as Admin role get a list of users, first check in redis cache, if not then request in the db
 *   delete:
 *     description: as Admin role delete list of users
 */

function UsersHandler(req: NextApiRequest, res: NextApiResponse) {

}

export default UsersHandler;