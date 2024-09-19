import { HttpStatus } from '@nestjs/common';
import { Test } from 'supertest';

export async function getSuccess<T>(t: Test) {
  const { body } = await t.expect(HttpStatus.OK);
  return body as T;
}

export async function repeat(n: number, fn: (i: number) => Promise<any>): Promise<any[]> {
  const jobs = Array.from({ length: n }).map((_x, i) => {
    return fn(i);
  });
  return Promise.all(jobs);
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getError(code: number, t: Test): Promise<string> {
  const { body } = await t.expect(code);
  return body.message;
}
