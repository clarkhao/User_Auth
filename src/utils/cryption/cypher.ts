import { logger } from '../logger';
/**   
* cipher 对称加解密
*/
import * as crypto from 'crypto';
/** 
* encrypt data with cipher aes-256-cbc
* @param data: to be encrypted
* @param secret: correspond to algorithm
* @returns encrypted result string
*/
function encrypt(data: string, secret: string) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', secret, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    logger.warn({ error, location: 'from utils/cryption/cypoher/encrypt' });
    throw new Error(`${error}`);
  }
}
/** 
*
*/
function decrypt(code: string, secret: string) {
  try {
    const data = decodeUrlSafe(code);
    const [ivHex, encryptedHex] = data.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-ctr', secret, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
  } catch (error) {
    logger.warn({ error, location: 'from utils/cryption/cypoher/decrypt' });
    throw new Error(`${error}`);
  }

}

function encodeUrlSafe(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function decodeUrlSafe(data: string): string {
  return Buffer.from(data, 'base64url').toString();
}

export { encrypt, decrypt };