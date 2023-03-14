import { UserType, Role, JsonValue } from '../type';
import type { TUserInfo } from '../type';
import { User } from './index';
import { PGConnect } from 'src/utils';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class EmailUser extends User {
  public constructor(db: PGConnect) {
    super(db);
  }
  /** 
  * 创建新用户，设定role为pending，
  * 如果后面添加新的schema，需要更新sql操作
  */
  public createUser(name: string, email: string, hash: string) {
    this.setId(uuidv4());
    this.setName(name);
    this.setType(UserType.Email);
    this.setEmail(email);
    this.setRole(Role.Pending);
    this.setSalt(crypto.randomBytes(16).toString('hex'));
    if (this.salt !== null)
      this.setHash(crypto.pbkdf2Sync(hash, this.salt, 1000, 64, `sha512`).toString(`hex`));
    return this.db.connect(`
      insert into auth.user ("id", "name", "type", "email", "role", "salt", "hash")
      values ($1, $2, $3, $4, $5, $6, $7)
      returning "email", "id";
    `, { isReturning: true, isTransaction: false }, [this.id, this.name, this.type, this.email, this.role, this.salt, this.hash]) as Promise<{
      success: boolean;
      query: { email: string, id: string }[];
      error: Error | null;
    }>;
  }
  /** 
  * 读取user by name and email，并确认type为email的用户中，是否有重复的name或者email，分别返回查重结果
  * @params name
  * @params email
  */
  public readUser(name: string, email: string) {
    this.setName(name);
    this.setEmail(email);
    return this.db.connect(`
      SELECT
      CASE
        WHEN (SELECT COUNT(*) FROM auth.user WHERE name = $1 and type = $3) > 0 
        THEN true
        ELSE false
      END as name,
      CASE
        WHEN (SELECT COUNT(*) FROM auth.user WHERE email = $2 and type = $3) > 0 
        THEN true
        ELSE false
      END as email;
    `, { isReturning: false, isTransaction: false }, [this.name, this.email, UserType.Email]) as Promise<{
      success: boolean;
      query: { name: boolean, email: boolean }[];
      error: Error | null;
    }>;
  }
  /** 
  * read user by name/email and hash，确认用户输入账户和密码是否匹配，name或者email，使用validation确认
  * 分两步，第一步，read salt by user name,确认是否存在user name,然后读取salt和hash
  * 第二步，通过salt和password计算出hash后，比对DB中的hash
  */
  public readUserByName(name: string) {
    this.setName(name);
    this.setType(UserType.Email);
    return this.db.connect(`
          select id, salt, hash from auth.user as u
          where u.name=$1 and u.type=$2;
        `, { isReturning: false, isTransaction: false }, [this.name, this.type]) as Promise<{
      success: boolean;
      query: { id: string, salt: string, hash: string }[];
      error: Error | null;
    }>;
  }
  /** 
  * 如果property是'name'则更新name和profile,如果property是email,则更新email和hash，默认更新role为user或者admin
  */
  public updateUser(id: string, value: { name: string, profile: JsonValue } | { email: string, hash: string } | Role, property?: (keyof EmailUser)) {
    this.setId(id);
    switch (property) {
      case 'name':
        this.setName((value as { name: string, profile: JsonValue }).name);
        this.setProfile((value as { name: string, profile: JsonValue }).profile);
        return this.db.connect(`
          update auth.user
          set "name"=$2, "profile"=$3, "lastUpdateAt"=$4
          where "id"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `, { isReturning: true, isTransaction: false }, [this.id, this.name, this.profile, new Date(Date.now()).toISOString()]) as Promise<{
          success: boolean;
          query: TUserInfo[];
          error: Error | null;
        }>;
      case 'email':
        this.setEmail((value as { email: string, hash: string }).email);
        this.setHash((value as { email: string, hash: string }).hash);
        return this.db.connect(`
          update auth.user 
          set "email"=$2, "hash"=$3, "lastUpdateAt"=$4
          where "id"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `, { isReturning: true, isTransaction: false }, [this.id, this.email, this.hash, new Date(Date.now()).toISOString()]) as Promise<{
          success: boolean;
          query: TUserInfo[];
          error: Error | null;
        }>;
      default:
        this.setRole(value as Role);
        return this.db.connect(`
            update auth.user
          set "role"=$2, "lastUpdateAt"=$3
          where "id"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `, { isReturning: true, isTransaction: false }, [this.id, this.role, new Date(Date.now()).toISOString()]) as Promise<{
          success: boolean;
          query: TUserInfo[];
          error: Error | null;
        }>;
    }
  }
}

export { EmailUser };