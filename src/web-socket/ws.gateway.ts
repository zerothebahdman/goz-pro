import { EventName, EventQueue } from './ws.model';
import { Inject, Logger, OnModuleInit, UseInterceptors } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import LIB_TYPES from '../common/inversify';
import { Queue } from './queue';
import { Server } from 'socket.io';
import { WSLogger } from '../middlewares/ws.logger';
import { getRedisConnection } from '../config/redis';

const redis = getRedisConnection();

@UseInterceptors(WSLogger)
@WebSocketGateway({ namespace: 'ws/gateway', cors: { origin: '*' } })
export class SocketIOProxy implements OnModuleInit {
  @Inject(LIB_TYPES.Logger) private readonly logger: Logger;
  @Inject(LIB_TYPES.Queue) private readonly queue: Queue<EventQueue>;

  @WebSocketServer()
  server: Server;

  /**
   * Listens for connection and disconnection events on the socket.
   * When a connection is established, emits a connection event with the socket ID.
   * When a disconnection is detected, disconnects the socket.
   */
  async onModuleInit() {
    this.server.on('connection', async (socket) => {
      const socketId = socket.id;
      socket.emit('connection', { socket_id: socketId });
      this.logger.log({
        message: `Connected with socket id ${socketId}`,
      });

      socket.on('disconnect', async () => {
        socket.disconnect(true);
      });
    });
  }

  /**
   * Saves a user's socket ID to Redis. The socket ID is valid for 1 day.
   * @param user_id The user ID to save the socket ID for
   * @param socketID The socket ID to save
   * @returns The user associated with the user ID
   */
  async saveUserSocketId(user_id: string, socketID: string) {
    let user = await redis.get(this.getCacheKey(user_id));
    if (user) {
      return user;
    }

    user = await redis.set(this.getCacheKey(user_id), socketID, 'EX', 60 * 10); // 10 minutes
    return user;
  }

  /**
   * Emits an event to a user, given their ID and the event name. If the user
   * does not have a valid socket ID, the event is added to a job queue and
   * processed when the user connects.
   * @param user_id The user ID to emit the event to
   * @param event The event name
   * @param data The data to emit with the event
   * @returns The result of emitting the event, or a promise that resolves when
   * the event is processed if the user does not have a valid socket ID.
   */
  async emitToUser<T>(user_id: string, event: EventName, data: T) {
    const socketID = await redis.get(this.getCacheKey(user_id));
    if (!socketID) {
      return await this.queue.addJob(user_id, { event, data });
    }
    return this.server.to(socketID).emit(event, data);
  }

  broadcastEvent<T>(event: EventName, data: T) {
    return this.server.emit(event, data);
  }

  getCacheKey(userID: string) {
    return `GOZ_PRO::SOCKET_ID::${userID}`;
  }
}
