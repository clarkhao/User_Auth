import { generateToken, setRedis, debug, db } from "../../utils";
import { JsonObject, JsonValue, UserType } from "../../model/type";
import { OauthUser } from "../../model";
const config = require("config");
import axios from "axios";
import { TSession } from "src/model/type";

//get code from github/google after customer logged in github/google with oauth
const getCodeFromOauth = (query: Record<string, string>) => {
  const params = new URLSearchParams(query);
  //maybe return null
  return new Promise<string>((resolve, reject) => {
    if (params.get("code")) return resolve(params.get("code") as string);
    else return reject(new Error("502 code is invalid"));
  });
};
//get github/google user info with token
const getUserInfoWithToken = (token: string, source: string) => {
  let url = "";
  if (source === "github") url = "https://api.github.com/user";
  else if (source === "google")
    url = "https://www.googleapis.com/oauth2/v2/userinfo";
  return axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((info) => {
      const userInfo = JSON.parse(JSON.stringify(info.data)) as JsonObject;
      if (userInfo.email) {
        console.log(userInfo);
        return Promise.resolve(userInfo);
      } else {
        return Promise.reject(
          new Error(`failed to fetch user info from ${source} with token`)
        );
      }
    });
};
//save oauth user info into db
const createOauthUser = async (info: JsonObject, source: UserType) => {
  const user = new OauthUser(db);
  //const infoJson = JSON.stringify(info);
  let id = "",
    name = "",
    email = "";
  if (source === UserType.Github) {
    id = info.node_id as string;
    name = info.login as string;
    email = info.email as string;
  } else if (source === UserType.Google) {
    id = info.id as string;
    name = info.name as string;
    email = info.email as string;
  }
  //需要返回 role, profile by oauthId in db
  const { success, query, error } = await user.createUser(
    id,
    name,
    email,
    info,
    source
  );
  if (error !== null) {
    throw error;
  }
  return query[0];
};
/**
 * to get oauth request url
 */
const redirectToOauth = (oauth: string) => {
  if (oauth === "github") {
    const rootURl = "https://github.com/login/oauth/authorize";
    const options = {
      client_id: process.env.GITHUB_CLIENT_ID as string,
      redirect_uri: process.env.GITHUB_OAUTH_REDIRECT_URL as string,
      scope: "user:email",
    };
    const qs = new URLSearchParams(options);
    return `${rootURl}?${qs.toString()}`;
  } else {
    const rootURl = "https://accounts.google.com/o/oauth2/auth";
    const options = {
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      redirect_uri: process.env.GOOGLE_REDIRECT_URL as string,
      scope: "email profile",
      response_type: "code",
    };
    const qs = new URLSearchParams(options);
    return `${rootURl}?${qs.toString()}`;
  }
};
export {
  getCodeFromOauth,
  getUserInfoWithToken,
  createOauthUser,
  redirectToOauth,
};
