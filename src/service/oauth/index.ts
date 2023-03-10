import { generateToken } from '../../utils';
import { JsonObject, JsonValue, UserType } from '../../model/type';
import { OauthUser } from '../../model';
const config = require('config');
import { redisUpClient, debug, db } from '../../utils';
import axios from 'axios';

//get code from github/google after customer logged in github/google with oauth
const getCodeFromOauth = (query: Record<string, string>) => {
  const params = new URLSearchParams(query);
  //maybe return null
  return new Promise<string>((resolve, reject) => {
    if (params.get('code'))
      return resolve(params.get('code') as string);
    else
      return reject(new Error('502 code is invalid'));
  })
}
//get github/google user info with token
const getUserInfoWithToken = (token: string, source: string) => {
  let url = '';
  if (source === 'github')
    url = 'https://api.github.com/user';
  else if (source === 'google')
    url = 'https://www.googleapis.com/oauth2/v2/userinfo';
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(info => {
    const userInfo = JSON.parse(JSON.stringify(info.data)) as JsonObject;
    if (userInfo.email) {
      console.log(userInfo);
      return Promise.resolve(userInfo);
    }
    else {
      return Promise.reject(new Error(`failed to fetch user info from ${source} with token`));
    }
  })
}
//save oauth user info into db
const createOauthUser = async (info: JsonObject, source: UserType) => {
  const user = new OauthUser(db);
  const infoJson = JSON.stringify(info);
  let id = '', name = '', email = '';
  if (source === UserType.Github) {
    id = info.node_id as string;
    name = info.login as string;
    email = info.email as string;
  } else if (source === UserType.Google) {
    id = info.id as string;
    name = info.name as string;
    email = info.email as string;
  }
  const { success, query, error } = await user.createUser(id, name, email, info, source);
  if (error !== null) {
    throw error;
  }
  return query[0];
}
//
const saveOauthSession = async (id: string, token: string, info: JsonObject, source: string) => {
  try {
    //???oauth token??????accessToken???
    const accessToken = generateToken(token, process.env[config.get('key.access')] as string, '3h');
    let userInfo = {} as JsonObject;
    if (source === 'github')
      userInfo = { id: info.id, node_id: info.node_id, email: info.email, login: info.login }
    else
      userInfo = info;
    const session = {
      id,
      token,
      userInfo,
      source
    };
    const sessionStr = JSON.stringify(session);
    const sessionBase64 = Buffer.from(sessionStr).toString('base64');
    //return "OK" if saved OK
    const save = await redisUpClient.set(accessToken, sessionStr);
    return { success: save === 'OK', accessToken };
  } catch (err) {
    debug.error(`from service/oauth/index: ${err}`)
    if (err instanceof Error) {
      throw err;
    }
    else {
      throw new Error('cannot write into up redis');
    }
  }
}

export { getCodeFromOauth, getUserInfoWithToken, createOauthUser, saveOauthSession };