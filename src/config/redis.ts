import IORedis, { Redis } from 'ioredis';

import { Logger } from '@blinkclaud/octobus';
import env from './env';

let redis: Redis;

export function getRedisConnection() {
  if (!redis) {
    redis = new IORedis(env().redis.url);
  }

  return redis;
}

export function createRedis(logger: Logger): Redis {
  redis = getRedisConnection();
  redis.on('error', (err) => logger.error(err));

  return redis;
}
