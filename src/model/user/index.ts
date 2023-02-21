import { UserType, Role } from '../type';
import type { JsonValue } from '../type';
import { PGConnect } from 'src/utils';

class User {
  protected _id: string = '';
  protected _name: string = '';
  protected _type: UserType = UserType.Email;
  protected _email: string = '';
  protected _role: Role = Role.Pending;
  protected _salt: string | null = null;
  protected _hash: string | null = null;
  protected _createAt: Date = new Date();
  protected _lastUpdateAt: Date = new Date();
  protected _profile: JsonValue = null;
  protected _oauth: JsonValue = null;
  protected db: PGConnect;
  public constructor(db: PGConnect) {
    this.db = db;
  }

  setid(id: string) {
    this._id = id;
  }
  get id(): string {
    return this._id;
  }
  setname(name: string) {
    this._name = name;
  }
  get name(): string {
    return this._name;
  }
  settype(type: UserType) {
    this._type = type;
  }
  get type(): UserType {
    return this._type;
  },
  setemail(email: string) {
    this._email = email;
  }
  get email(): string {
    return this._email;
  }
  setrole(role: Role) {
    this._role = role;
  }
  get role(): Role {
    return this._role;
  }
  setsalt(salt: string) {
    this._salt = salt;
  }
  get salt(): string | null {
    return this._salt;
  }
  sethash(hash: string) {
    this._hash = hash;
  }
  get hash(): string | null {
    return this._hash;
  }
  setcreateAt(createAt: Date) {
    this._createAt = createAt;
  }
  get createAt(): Date {
    return this._createAt;
  }
  setlastUpdateAt(lastUpdateAt: Date) {
    this._lastUpdateAt = lastUpdateAt;
  }
  get lastUpdateAt(): Date {
    return this._lastUpdateAt;
  }
  setprofile(profile: JsonValue) {
    this._profile = profile;
  }
  get profile(): JsonValue {
    return this._profile;
  }
  setoauth(oauth: JsonValue) {
    this._oauth = oauth;
  }
  get oauth(): JsonValue {
    return this._oauth;
  }
  /** 
  * 注销时删除用户信息，或者Admin批量删除用户
  * 如果后面添加schema，需要更新sql
  */
  public deleteUser(ids: string[]) {
    return this.db.connect(`
      with delete_auth as (
        delete from auth.auth as a
        where a."userId"=any($1)
        returning "userId" ad id
      )
      delete from auth.user as u
      using delete_auth
      where u.id=any(
        select "userId" from delete_auth
      );
    `, { isReturning: false, isTransaction: false }, [ids]) as Promise<boolean | Error>;
  }
}

export { User };