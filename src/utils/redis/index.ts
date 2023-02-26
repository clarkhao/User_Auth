import { Redis } from 'ioredis';
const config = require('config');

const MAX_POOL_SIZE = 10;
const redisClients: Redis[] = [];

const redisClient = new Redis(process.env[config.get('redis.url')] as string);