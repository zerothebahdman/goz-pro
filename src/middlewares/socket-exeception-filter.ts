import { Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common';

import { SocketIOProxy } from '../web-socket/ws.gateway';
import TYPES from '../config/inversify.types';

@Catch()
export class SocketExceptionFilter implements ExceptionFilter {
  @Inject(TYPES.SocketIO) private readonly socket: SocketIOProxy;

  /**
   * Catch and emit an error to the user over the socket if the error is a 4xx error.
   * If the error is a 5xx error, emit a generic "We are having system level issues. Please bear with us" message.
   * @param exception the error to catch
   * @param host the arguments host
   */
  catch(exception: HttpException) {
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;

    if (status.toString().startsWith('4')) {
      this.socket.emitToUser('', 'error', {
        status: 'error',
        message,
      });
    } else {
      this.socket.emitToUser('', 'error', {
        message: 'We are having system level issues. Please bear with us',
      });
    }
  }
}
