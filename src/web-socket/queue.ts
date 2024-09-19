import { Injectable } from '@nestjs/common';
import { getRedisConnection } from '../config/redis';
import ms from 'ms';

@Injectable()
export class Queue<T> {
  private instance: Queue<T>;
  private readonly redis = getRedisConnection();
  private readonly prefix = 'WS_PROXY_QUEUE';

  /**
   * Returns the singleton instance of the queue. If the instance does not exist
   * yet, it is created.
   * @returns The singleton instance of the queue
   */
  getInstance() {
    if (!this.instance) {
      this.instance = new Queue();
    }
    return this.instance;
  }

  /**
   * Adds a job to the specified queue. If the queue does not exist yet, it is created.
   * @param jobName the name of the queue to add the job to
   * @param data the job data to add to the queue
   * @returns a promise that resolves once the job has been added to the queue
   */
  async addJob(jobName: string, data: T) {
    const queue = `${this.prefix}::${jobName}`;
    const redisQueue = await this.redis.get(queue);
    if (!redisQueue) {
      return await this.redis.set(queue, JSON.stringify([data]), 'PX', ms('30d'));
    }
    const payload = JSON.parse(redisQueue);
    payload.push(data);
    return await this.redis.set(queue, JSON.stringify(payload), 'PX', ms('30d'));
  }

  /**
   * Processes all jobs in a specified queue. Each job is processed using the
   * provided handler function. The jobs are removed from the queue after they
   * have been processed.
   * @param jobName the name of the queue to process
   * @param handler the function to use to process each job
   * @returns an array of the processed jobs
   */
  async processJob(jobName: string, handler: (data: T) => void) {
    const queue = `${this.prefix}::${jobName}`;
    const payload = await this.redis.get(queue);
    const data = JSON.parse(payload);
    await Promise.all(data.map(handler));
    this.redis.del(queue);
    return data;
  }

  /**
   * Retrieves all jobs from a specified queue.
   * @param jobName the name of the queue to retrieve the jobs from
   * @returns an array of the jobs in the queue, or an empty array if the queue does not exist
   */
  async getJob(jobName: string) {
    const data = await this.redis.get(`${this.prefix}::${jobName}`);
    return JSON.parse(data);
  }
}
