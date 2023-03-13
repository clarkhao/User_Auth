/**
 * req.body.data = 'data(base64):key'
 * 非对称解密key后再AES解密data, data格式为{email,name,password}
 */
import crypto from 'crypto';
const config = require('config');
import { debugLogger } from '../index';

class Cryption {
  private raw: string;
  private keyNIV: string;
  private data: string;
  decrypted: string = '';
  constructor(raw: string) {
    this.raw = raw;
    [this.data, this.keyNIV] = raw.split(":");
  }
  public decryptData() {
    //decrypted the key with private-key
    const encryptedKeyNIv = Buffer.from(this.keyNIV, "base64");
    try {
      // Decrypt the encrypted key using the RSA private key
      const savedKey = process.env.SECRET_KEY as string;
      const privateKey = Buffer.from(savedKey, 'base64');
      const decryptedKeyNIv = crypto
        .privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
          },
          encryptedKeyNIv
        )
        .toString();
      console.log(`key: ${decryptedKeyNIv}`);
      const [keyStr, ivStr] = decryptedKeyNIv.split(":");
      const encrypted = Buffer.from(this.data, "base64");
      const key = Buffer.from(keyStr, "base64");
      const iv = Buffer.from(ivStr, "base64");
      //非对称解密
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const decryptedString = decrypted.toString();
      console.log(decryptedString)
      return decryptedString;
    } catch (error) {
      console.log(`${error}`);
      throw error;
    }
  }

}

export { Cryption };
