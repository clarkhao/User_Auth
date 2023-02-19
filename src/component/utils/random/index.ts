import crypto from 'crypto';

const randomString = (length: number) => {
  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  const hexString = buffer.toString('hex').slice(0, length);
  return hexString;
}

export {randomString};