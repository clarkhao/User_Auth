import type { NextApiRequest, NextApiResponse } from 'next';
import { Cryption } from 'src/utils';
import { debugLogger } from 'src/utils';
/** 
* @returns {data, error}, data is the decrypted
*/
const SignatureMiddleware = (req: NextApiRequest) => {
  const { secret, sign, data } = req.body;
  const cryption = new Cryption(secret, sign, data);
  try {
    if (cryption.isSecret() && cryption.isSignValid()) {
      debugLogger.debug('signature passed');
      return { data: cryption.decrypted, error: null };
    } else {
      return { data: '', error: new Error('401 signature broken') };
    }
  } catch (err) {
    debugLogger.debug(err);
    return { data: '', error: new Error('500 internal server mistake') };
  }
}

export { SignatureMiddleware };