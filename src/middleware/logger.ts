import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../utils/logger';

const LoggerMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  res.on('finish', () => {
    if (res.statusCode < 400) {
      logger.info({
        method: req.method,
        url: req.url,
        body: req.body,
        status: res.statusCode,
        resHeaders: res.getHeaders(),
      })
    } else {
      logger.error({
        method: req.method,
        url: req.url,
        body: req.body,
        status: res.statusCode,
        resHeaders: res.getHeaders(),
      })
    }
  })
}

export { LoggerMiddleware };