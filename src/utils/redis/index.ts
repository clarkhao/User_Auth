import { Redis } from 'ioredis';
const config = require('config');

const MAX_POOL_SIZE = 10;
const redisClients: Redis[] = [];

for (let i = 0; i < MAX_POOL_SIZE; i++) {
  const redisClient = new Redis(process.env[config.get('redis.url')] as string);
  redisClients.push(redisClient);
}

export function acquireRedisClient() {
  return redisClients.pop() as Redis;
}

export function releaseRedisClient(redisClient: Redis) {
  redisClients.push(redisClient);
}