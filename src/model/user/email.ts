import { UserType, Role, JsonValue } from '../type';
import type { TEmailInfo } from '../type';
import { User } from './index';
import { PGConnect } from 'src/utils';
import crypto from 'crypto';

class EmailUser extends User {
  public constructor(db: PGConnect) {
    super(db);
  }
  /** 
  * 创建新用户，设定role为pending，
  * 如果后面添加新的schema，需要更新sql操作
  */
  public createUser(id: string, name: string, type: UserType, email: string, hash: string) {
    this.setid(id);
    this.setname(name);
    this.settype(type);
    this.setemail(email);
    this.setsalt(crypto.randomBytes(16).toString('hex'));
    if (this.salt !== null)
      this.sethash(crypto.pbkdf2Sync(hash, this.salt, 1000, 64, `sha512`).toString(`hex`));
    return this.db.connect(`
      with new_user as (
        insert into auth.user ("name", "type", "email", "role", "salt", "hash")
        values ($1, $2, $3, $4, $5, $6)
        returning "id"
      )
      insert into auth.auth ("userId") 
      select "id" from new_user as u
      returning u."id";
    `, { isReturning: true, isTransaction: false }, [this.name, this.type, this.email, this.role, this.salt, this.hash]) as Promise<{ id: string } | Error>;
  }
  /** 
  * 读取user，并确认type为email的用户中，是否有重复的name或者email，分别返回查重结果
  */
  public readUser(name: string, email: string) {
    this.setname(name);
    this.setemail(email);
    return this.db.connect(`
      SELECT
      CASE
        WHEN (SELECT COUNT(*) FROM auth.user WHERE name = $1 && type = $3) > 0 
        THEN true
        ELSE false
      END as isRepeatedName,
      CASE
        WHEN (SELECT COUNT(*) FROM auth.email_user WHERE email = $2 and type = $3) > 0 
        THEN true
        ELSE false
      END as isRepeatedEmail;
    `, { isReturning: false, isTransaction: false }, [this.name, this.email, UserType.Email]) as Promise<{ isRepeatedName: boolean, isRepeatedEmail: boolean } | Error>;
  }
  /** 
  * 如果property是'name'则更新name和profile,如果property是email,则更新email和hash，默认更新role为user或者admin
  */
  public updateUser(id: string, value: { name: string, profile: JsonValue } | { email: string, hash: string } | Role, property?: (keyof EmailUser),): Promise<TEmailInfo | Error> {
    this.setid(id);
    switch (property) {
      case 'name':
        this.setname((value as { name: string, profile: JsonValue }).name);
        this.setprofile((value as { name: string, profile: JsonValue }).profile);
        return this.db.connect(`
          update auth.user
          set "name"=$2, "profile"=$3, "lastUpdateAt"=$4
          where "id"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `, { isReturning: true, isTransaction: false }, [this.id, this.name, this.profile, new Date(Date.now()).toISOString()]) as Promise<TEmailInfo | Error>;
      case 'email':
        this.setemail((value as { email: string, hash: string }).email);
        this.sethash((value as { email: string, hash: string }).hash);
        return this.db.connect(`
          update auth.user 
          set "email"=$2, "hash"=$3
          where "id"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `, { isReturning: true, isTransaction: false }, [this.id, this.email, this.hash, new Date(Date.now()).toISOString()]) as Promise<TEmailInfo | Error>;
      default:
        this.setrole(value as Role);
        return this.db.connect(`
          update auth.user
          set "role"=$2
          where "id"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `, { isReturning: true, isTransaction: false }, [this.id, this.role]) as Promise<TEmailInfo | Error>;
    }
  }
}

export { EmailUser };