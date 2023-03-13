import axios from 'axios';
import { JsonObject } from '../../model/type';
import { OauthUser } from '../../model';
import { db } from '../../utils';

//get code from github after customer logged in github with oauth
const getCodeFromGithub = (query: Record<string, string>) => {
  const params = new URLSearchParams(query);
  //maybe return null
  return new Promise<string>((resolve, reject) => {
    if (params.get('code'))
      return resolve(params.get('code') as string);
    else
      return reject(new Error('502 code is invalid'));
  })
}
//get github token with async http request.
const getTokenFromGithub = (code: string) => {
  const url = "https://github.com/login/oauth/access_token";
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID as string,
    client_secret: process.env
      .GITHUB_CLIENT_SECRET as string,
    code: code,
  };
  const qs = new URLSearchParams(options);
  return axios.post(url, qs, {headers: { 'Accept': 'application/json' } }).then(token => {
    console.log(token.status);
    if (token.status === 200) {
      console.log(token.data);
      const {access_token, token_type, scope} = token.data;
      return Promise.resolve(access_token as string);
    }
    else
      return Promise.reject(new Error(`502 ${token.data.get('error')}`));
  })
}
//get github user info with token
const getUserInfoWithToken = (token: string) => {
  const url = 'https://api.github.com/user';
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(info => {
    const userInfo = JSON.parse(JSON.stringify(info.data)) as JsonObject;
    if (userInfo.login) {
      console.log(userInfo);
      return Promise.resolve(userInfo);
    }
    else
      return Promise.reject(new Error('failed to fetch user info from github with token'));
  })
}
//save github user info into db
const createGithubUser = async (info: JsonObject) => {
  const user = new OauthUser(db);
  const { success, query, error } = await user.createUser(info.login as string, info?.email as string, info);
  if (error !== null) {
    throw error;
  }
  return query[0];
}
export { getCodeFromGithub, getTokenFromGithub, getUserInfoWithToken, createGithubUser }