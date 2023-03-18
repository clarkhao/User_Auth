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
export type TSession = {
  id: string;
  token?: string;
  userInfo: JsonObject;
  source?: string;
  locale: string;
  profile?: TUserProfile;
  createAt?: string;
};
export type TInfo = {
  name: string;
  email: string;
  role: string;
}
export type TProfile = {
  name: string;
  email: string;
  role: string;
  locale: string;
  picture?: string;
  bio?: string;
  createAt: string;
  lastModifiedAt: string;
}
export type TUserProfile = Partial<TProfile> & {id?:string};