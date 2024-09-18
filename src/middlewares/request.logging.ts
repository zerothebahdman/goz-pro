import { NextFunction, Request, Response } from 'express';

import { Logger } from '@blinkclaud/octobus';
const kubernetesAgents = [/kube-probe/i, /Prometheus/i, /ELB-Health/i];

/*
 * Captures and stores the body of the response in `Request.locals.body` whenever
 * `Response.send` is called
 * @param _req express request
 * @param res express response
 * @param next next middleware function
 */
export function captureBody(_req: Request, res: Response, next: NextFunction) {
  const send = res.send;

  res.send = function (body?: any) {
    res.locals.body = body instanceof Buffer ? body.toString() : body;
    return send.call(this, body);
  };

  next();
}
function hasUserAgent(req: Request, ignore: RegExp[]) {
  return ignore.some((x) => x.test(req.headers['user-agent']));
}
/**
 * Create middleware to log requests
 * @param logger octonent logger
 * @param ignore user agents of requests to ignore
 */
export function logRequest(logger: Logger, ignore = []) {
  // ignore kubernetes requests by default
  ignore.push(...kubernetesAgents);
  return function (req: Request, _res: Response, next: NextFunction) {
    // ignore some user agents
    if (hasUserAgent(req, ignore)) {
      return next();
    }
    logger.request(req);
    next();
  };
}
