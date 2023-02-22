import { UserType, Role, JsonValue } from '../type';
import type { TUserInfo } from '../type';
import { User } from './index';
import { PGConnect } from 'src/utils';
import { EmailUser } from './email';

class OauthUser extends User {
  private emailUser: EmailUser | undefined;
  public constructor(db: PGConnect, emailUser?: EmailUser) {
    super(db);
    this.emailUser = emailUser;
  }
  /** 
  * 返回github用户信息后生成, 此时oauth用户的role已经不是pending，而是user
  */
  public createUser(name: string, email: string, oauth: JsonValue) {
    this.setName(name);
    this.setType(UserType.Github);
    this.setEmail(email);
    this.setRole(Role.User);
    this.setOauth(oauth);
    return this.db.connect(`
      with new_user as (
        insert into auth.user ("name", "type", "email", "role", "oauth")
        values ($1, $2, $3, $4, $5)
        on conflict ("name", "email", "oauth")
        do update set "name"=$1, set "email"=$3, set "oauth"=$5
        returning "id"
      )
      insert into auth.auth ("userId") 
      select "id" from new_user as u
      returning u."id";
    `, { isReturning: true, isTransaction: false }, [this.name, this.type, this.email, this.role, this.oauth]) as Promise<{ id: string } | Error>;
  }
  /** 
  * github用户可以通过添加email和hash新建一个email账户
  */

  /** 
  * update github用户的profile
  */
  public updateUser(id: string, profile: JsonValue) {
    this.setId(id);
    this.setProfile(profile);
    return this.db.connect(`
      update auth.user
      set "profile"=$2 "lastUpdateAt"=$3
      where "id"=$1
      returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth"; 
    `, { isReturning: true, isTransaction: false }, [this.id, this.profile, new Date(Date.now()).toISOString()]) as Promise<TUserInfo | Error>;
  }
}
