import type { NextApiRequest, NextApiResponse } from 'next';
import { debug } from 'src/utils';

const ErrorMiddleware = (err: unknown, res: NextApiResponse) => {
  try {
    let errMsg = '';
    if (err instanceof Error) {
      errMsg = err.message;
    } else {
      errMsg = `${err}`;
    }
    const [numStr, ...messageArray] = errMsg.split(' ') as string[];
    const num = parseInt(numStr);
    const statusCode = Number.isNaN(num) ? 500 : num;
    const message = Number.isNaN(num) ? errMsg : messageArray.join(' ');
    if (statusCode === 500) {
      debug.error(message);
      res.status(500).json({ msg: 'inner server mistake' });
    } else {
      res.status(statusCode).json({ msg: message });
    }
  } catch (error) {
    debug.error(error);
    //res.status(500).json({ msg: 'inner server mistake' });
  }
}

export { ErrorMiddleware };