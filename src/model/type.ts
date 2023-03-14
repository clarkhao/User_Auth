export type JsonValue = string | number | boolean | JsonObject | JsonArray | null
export type JsonObject = { [Key in string]?: JsonValue }
export interface JsonArray extends Array<JsonValue> { }
/**
 * Model User
 */
export type TUser = {
  id: string
  name: string
  type: UserType
  email: string
  role: Role
  salt: string | null
  hash: string | null
  createAt: Date
  lastUpdateAt: Date
  profile: JsonValue | null
  oauth: JsonValue | null
}
/**
 * Model Auth
 */
export type TAuth = {
  id: number
  userId: string
  token: string
  createAt: Date
}
/**
 * Model Session
 */
export type TSession = {
  id: string
  userId: string
  createAt: Date
  session: JsonValue
}
/**
 * Enums
 */
export enum Role {
  Pending = 'Pending',
  User = 'User',
  Admin = 'Admin'
};
export type TRole = keyof typeof Role

export enum UserType {
  Github = 'Github',
  Email = 'Email',
  Google = 'Google'
};
export type TUserType = keyof typeof UserType
/** 
* User数据库返回类型
*/
export type TUserInfo = Omit<TUser, 'salt' | 'hash'>;
/** 
* Github API Info返回类型，name即githubInfo.name, email即githubInfo.email
*/
export type TGithubUser = { name: string, email: string, githubInfo: JsonValue };
