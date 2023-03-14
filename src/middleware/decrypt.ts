import type { NextApiRequest, NextApiResponse } from 'next';
import { Cryption } from 'src/utils';
import { debug } from 'src/utils';
/** 
* @returns {data, error}, data is the decrypted
*/
const DecryptMiddleware = (req: NextApiRequest) => {
  const cryption = new Cryption(req.body.data);
  try {
    const data = cryption.decryptData();
    return { data, error: null }
  } catch (err) {
    debug.error(err);
    return { data: '', error: new Error('500 internal server mistake') };
  }
}

export { DecryptMiddleware };