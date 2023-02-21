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
  type: AuthType
}
/**
 * Enums
 */
export enum AuthType {
  Email = 'Email',
  Bearer = 'Bearer'
};

export type TAuthType = keyof typeof AuthType

export enum Role {
  Pending = 'Pending',
  User = 'User',
  Admin = 'Admin'
};

export type TRole = keyof typeof Role

export enum UserType {
  Github = 'Github',
  Email = 'Email'
};

export type TUserType = keyof typeof UserType

export type TEmailInfo = Omit<TUser, 'salt' | 'hash'>;