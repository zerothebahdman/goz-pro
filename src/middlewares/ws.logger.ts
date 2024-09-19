import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';

import LIB_TYPES from '../common/inversify';
import { Logger } from '@blinkclaud/octobus';
import { Observable } from 'rxjs';

@Injectable()
export class WSLogger implements NestInterceptor {
  @Inject(LIB_TYPES.Logger) private logger: Logger;

  /**
   * Intercepts incoming WS messages to log the data of the message.
   *
   * @param context - The execution context of the incoming request.
   * @param next - The next call handler in the interceptor chain.
   * @return {Observable<any>} A promise that resolves to the response of the next call handler.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const pattern = context.switchToWs().getPattern();
    const data = context.switchToWs().getData();

    this.logger.log({ event_name: pattern, data });
    return next.handle().pipe();
  }
}
