import { UserType, Role } from '../type';
import type { JsonValue } from '../type';
import { PGConnect } from 'src/utils';
import type { TUserInfo } from '../type';

class User {
  protected _id: string = '';
  protected _name: string = '';
  protected _type: UserType = UserType.Email;
  protected _email: string = '';
  protected _role: Role = Role.Pending;
  protected _salt: string | null = null;
  protected _hash: string | null = null;
  protected _oauthId: string | null = null;
  protected _profile: JsonValue = null;
  protected _oauth: JsonValue = null;
  protected db: PGConnect;
  public constructor(db: PGConnect) {
    this.db = db;
  }
  setId(id: string) {
    this._id = id;
  }
  get id(): string {
    return this._id;
  }
  setName(name: string) {
    this._name = name;
  }
  get name(): string {
    return this._name;
  }
  setType(type: UserType) {
    this._type = type;
  }
  get type(): UserType {
    return this._type;
  }
  setEmail(email: string) {
    this._email = email;
  }
  get email(): string {
    return this._email;
  }
  setRole(role: Role) {
    this._role = role;
  }
  get role(): Role {
    return this._role;
  }
  setSalt(salt: string) {
    this._salt = salt;
  }
  get salt(): string | null {
    return this._salt;
  }
  setHash(hash: string) {
    this._hash = hash;
  }
  get hash(): string | null {
    return this._hash;
  }
  setOauthId(oauthId: string) {
    this._oauthId = oauthId;
  }
  get oauthId(): string | null {
    return this._oauthId;
  }
  setProfile(profile: JsonValue) {
    this._profile = profile;
  }
  get profile(): JsonValue {
    return this._profile;
  }
  setOauth(oauth: JsonValue) {
    this._oauth = oauth;
  }
  get oauth(): JsonValue {
    return this._oauth;
  }
  /** 
  * 读取单个用户的信息by name
  */
  public readUserName(name: string) {
    this.setName(name);
    return this.db.connect(`
      select "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth"
      from auth.user
      where name=$1;
    `, { isReturning: false, isTransaction: false }, [this.name]) as Promise<{
      success: boolean;
      query: TUserInfo[];
      error: Error | null;
    }>;
  }
  /** 
  * read User List with pagination by limit and off;
  */
  public readUserList(limit: number, offset: number) {
    return this.db.connect(`
      select "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth"
      from auth.user
      order by "createAt" asc limit $1 offset $2;
    `, { isReturning: false, isTransaction: false }, [limit, offset]) as Promise<{
      success: boolean;
      query: TUserInfo[];
      error: Error | null;
    }>;
  }
  /**
   * update oauth用户的profile
   */
   public updateUser(name: string, profile: JsonValue) {
    this.setName(name);
    this.setProfile(profile);
    return this.db.connect(
      `
      update auth.user
      set "profile"=$2 "lastUpdateAt"=$3
      where "name"=$1
      returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth"; 
    `,
      { isReturning: true, isTransaction: false },
      [this.name, this.profile, new Date(Date.now()).toISOString()]
    ) as Promise<{
      success: boolean;
      query: TUserInfo[];
      error: Error | null;
    }>;
  }
  /** 
  * 注销时删除用户信息，或者Admin批量删除用户
  * 如果后面添加schema，需要更新sql
  */
  public deleteUser(ids: string[]) {
    return this.db.connect(`
      delete from auth.user as u
      where u.id=any($1);
    `, { isReturning: false, isTransaction: false }, [ids]) as Promise<{
      success: boolean;
      query: null;
      error: Error | null;
    }>;
  }
}

export { User };