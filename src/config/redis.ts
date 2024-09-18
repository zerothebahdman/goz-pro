import IORedis, { Redis } from 'ioredis';
import { Logger, LoggerConfig, defaultSerializers } from '@blinkclaud/octobus';

import LIB_TYPES from '../common/inversify';
import { Provider } from '@nestjs/common';
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

export const RedisProvider: () => Provider<Redis> = () => ({
  provide: LIB_TYPES.Redis,
  useFactory: () => {
    const LoggerConfig: LoggerConfig = {
      name: env().service_name,
      serializers: defaultSerializers(),
    };
    return createRedis(new Logger(LoggerConfig).child({ service: 'redis' }));
  },
});
