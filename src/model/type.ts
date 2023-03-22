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
  source?: string;
  locale: string;
  userInfo: TInfo;
  profile?: TProfile;
  createAt?: string;
};
export type TInfo = {
  name: string;
  email: string;
  role: string;
}
export type TProfile = {
  firstName?: string;
  lastName?: string;
  picture?: string;
  bio?: string;
  lastModifiedAt: string;
}
export type TUserProfile = Partial<TProfile> & {locale?:string} & Partial<TInfo>;