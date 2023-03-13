import { Redis } from 'ioredis';
const config = require('config');

const redisUpClient = new Redis(process.env[config.get('redis.upurl')] as string);

export {redisUpClient};