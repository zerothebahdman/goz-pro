import { AgentConfig, HttpAgent, Logger, defaultSerializers } from '@blinkclaud/octobus';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

import LIB_TYPES from './inversify';
import { Provider } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import { dateReviver } from './strings';
import env from '../config/env';
import { getRedisConnection } from '../config/redis';
import ms from 'ms';

@Injectable()
export class ControllerRes<T> {
  @Inject(LIB_TYPES.Logger) private readonly logger: Logger;

  protected send(req: Request, res: Response, data: T, opts?: { [key: string]: string | number }) {
    res.status(HttpStatus.OK).json({
      status: 'success',
      data,
      ...opts,
    });
    this.logger.response(req, res);
  }
}

export interface RateLimitConfig {
  redis: Redis;
  numberOfReqs: number;
  duration: number;
  prefix: string;
  blockDuration?: number;
}

export const HttpProvider: () => Provider<HttpAgent> = () => ({
  provide: LIB_TYPES.HTTPAgent,
  useFactory: () => {
    const HTTPAgentConfig: AgentConfig = {
      service: env().service_name,
      scheme: 'Bearer',
      logger: new Logger({
        name: env().service_name,
        serializers: defaultSerializers('data.image', 'password', 'secret', 'authorization'),
      }).child({ service: 'axios' }),
    };
    return new HttpAgent(HTTPAgentConfig, {
      transformResponse: [
        (data) => {
          if (data === '') {
            return {};
          }

          return JSON.parse(data, dateReviver);
        },
      ],
    });
  },
});

export function getRateLimiter(config: RateLimitConfig): RateLimiterRedis {
  return new RateLimiterRedis({
    storeClient: config.redis,
    points: config.numberOfReqs,
    duration: config.duration,
    blockDuration: config.blockDuration,
    keyPrefix: config.prefix,
  });
}

export function setConfig(config?: Partial<RateLimitConfig>): RateLimitConfig {
  return {
    redis: getRedisConnection(),
    numberOfReqs: 1,
    duration: ms('1m') / 1000,
    blockDuration: ms('1m') / 1000,
    prefix: 'rate_limit_verify_identity',
    ...config,
  };
}
