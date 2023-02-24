import type { NextApiRequest, NextApiResponse } from 'next';
import { debugLogger } from 'src/utils';

const ErrorMiddleware = (err: unknown, res: NextApiResponse) => {
  try {
    let str = '';
    if (err instanceof Error) {
      str = err.message;
    } else {
      str = `${err}`;
    }
    const [numStr, ...messageArray] = str.split(' ') as string[];
    const num = parseInt(numStr);
    const statusCode = Number.isNaN(num) ? 500 : num;
    const message = Number.isNaN(num) ? str : messageArray.join(' ');
    if (statusCode > 499) {
      debugLogger.debug(message);
      res.status(statusCode).json({ msg: 'inner server mistake' });
    } else {
      res.status(statusCode).json({ msg: message });
    }
  } catch (error) {
    debugLogger.debug(error);
    res.status(500).json({ msg: 'inner server mistake' });
  }
}

export { ErrorMiddleware };