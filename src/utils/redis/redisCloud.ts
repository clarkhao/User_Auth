import { Redis } from 'ioredis';
const config = require('config');

const redisDownClient = new Redis(process.env[config.get('redis.downurl')] as string);

export {redisDownClient};