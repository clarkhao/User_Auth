import type { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/v0/user:
 *   get:
 *     description: as Admin role get a list of users, first check in redis cache, if not then request in the db
 *     tags:
 *       - users
 *     parameters:
 *       - in: query
 *         name: index
 *         schema:
 *           type: integer
 *         required: true
 *         description: index number for pagination
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: sorting by xxx
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *                 example:
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
 *   delete:
 *     description: as Admin role delete list of users
 *     tags:
 *       - users
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: true
 *         description: array of user ids
 *     responses:
 *       204:
 *         description: deleted successfully
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
 */

function UsersHandler(req: NextApiRequest, res: NextApiResponse) {}

export default UsersHandler;
