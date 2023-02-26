import jwt from 'jsonwebtoken';

/** 
  * @params secret key.access或者key.refresh
  * @params duration 可以是'2 days', '10h', '7d' 类似符合https://github.com/vercel/ms
  * @returns 返回token
  */
const generateToken = (id: string, secret: string, duration: string) => {
  try {
    return jwt.sign({ id: id }, secret, { expiresIn: duration });
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else
      throw new Error(`${err}`);
  }
}
/** 
* @params token to be verified
* @params secret key.access或者key.refresh
* @returns true if ok otherwise throw error
*/
const verifyToken = (token: string, secret: string) => {
  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    if (err instanceof Error) {
      return err;
    } else
      return new Error(`${err}`);
  }
}

export { generateToken, verifyToken }