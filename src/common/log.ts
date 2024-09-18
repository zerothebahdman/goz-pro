import { Logger, LoggerConfig, defaultSerializers } from '@blinkclaud/octobus';

import LIB_TYPES from './inversify';
import { Provider } from '@nestjs/common';
import env from '../config/env';

/**
 * Returns a provider for the application-wide logger.
 *
 * @returns {Provider<Logger>}
 */
export const LoggerProvider: () => Provider<Logger> = () => ({
  provide: LIB_TYPES.Logger,
  useFactory: () => {
    const LoggerConfig: LoggerConfig = {
      name: env().service_name,
      serializers: defaultSerializers('data.image'),
    };
    return new Logger(LoggerConfig);
  },
});
