import type { NextApiRequest, NextApiResponse } from 'next';
import { encrypt, decrypt } from 'src/utils';
const config = require('config');
/**
 * 
 * @param data raw data
 * @param duration minutes
 * @param res response
 */
const setCookie = (data: unknown, cookieKey: string, duration: number, res: NextApiResponse, isHttpOnly: boolean = false) => {
    const cookieData = JSON.stringify(data);
    const encrypted = encrypt(cookieData, process.env[config.get('key.cipher')] as string);
    const expires = (new Date(Date.now() + duration * 60 * 1000)).toUTCString();
    const maxAge = duration * 60;
    if(isHttpOnly)
        res.setHeader('Set-Cookie', `${cookieKey}=${encrypted};expires=${expires};Max-Age=${maxAge};SameSite=Lax;HttpOnly`);
    else
        res.setHeader('Set-Cookie', `${cookieKey}=${encrypted};expires=${expires};Max-Age=${maxAge};SameSite=Lax`);
}
const getCookie = (key: string, req: NextApiRequest) => {
    const cookie = req.cookies[key];
    if(cookie === undefined)
        return {cookie: null, error: new Error('no such cookie or expires')};
    const decrypted = decrypt(cookie, process.env[config.get('key.cipher')] as string);
    const deserialized = JSON.parse(decrypted);
    return {cookie: deserialized, error: null};
}
export { setCookie, getCookie };