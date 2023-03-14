import { UserType, Role, JsonValue } from '../type';
import type { TUserInfo } from '../type';
import { User } from './index';
import { PGConnect } from 'src/utils';
import { EmailUser } from './email';
import { v4 as uuidv4 } from 'uuid';

class OauthUser extends User {
  public constructor(db: PGConnect, emailUser?: EmailUser) {
    super(db);
  }
  /** 
  * 返回github/google用户信息后生成, 此时oauth用户的role已经不是pending，而是user
  */
  public createUser(id: string, name: string, email: string, oauth: JsonValue, source: UserType) {
    this.setId(uuidv4());
    this.setName(name);
    this.setType(source);
    this.setEmail(email);
    this.setOauthId(id);
    this.setRole(Role.User);
    this.setOauth(oauth);
    return this.db.connect(`
      insert into auth.user ("id", "name", "type", "email", "role", "oauthId", "oauth")
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict ("oauthId")
        do update set "name"=$2, "email"=$4, "oauth"=$7
        returning "id";
    `, { isReturning: true, isTransaction: false }, [this.id, this.name, this.type, this.email, this.role, this.oauthId, this.oauth]) as Promise<{
      success: boolean;
      query: { id: string }[];
      error: Error | null;
    }>;
  }
  /** 
  * oauth用户可以通过添加email和hash新建一个email账户
  */

  /** 
  * update oauth用户的profile
  */
  public updateUser(id: string, profile: JsonValue) {
    this.setId(id);
    this.setProfile(profile);
    return this.db.connect(`
      update auth.user
      set "profile"=$2 "lastUpdateAt"=$3
      where "id"=$1
      returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth"; 
    `, { isReturning: true, isTransaction: false }, [this.id, this.profile, new Date(Date.now()).toISOString()]) as Promise<{
      success: boolean;
      query: TUserInfo[];
      error: Error | null;
    }>;
  }
}

export { OauthUser };