import { UserType, Role, JsonValue, JsonObject } from "../type";
import type { TUserInfo } from "../type";
import { User } from "./index";
import { PGConnect } from "src/utils";
import { EmailUser } from "./email";
import { v4 as uuidv4 } from "uuid";

class OauthUser extends User {
  public constructor(db: PGConnect, emailUser?: EmailUser) {
    super(db);
  }
  /**
   * 返回github/google用户信息后生成, 此时oauth用户的role已经不是pending，而是user
   */
  public createUser(
    id: string,
    name: string,
    email: string,
    oauth: JsonValue,
    source: UserType
  ) {
    this.setId(uuidv4());
    this.setName(name);
    this.setType(source);
    this.setEmail(email);
    this.setRole(Role.User);
    this.setOauthId(id);
    this.setOauth(oauth);
    //先使用oauthId读取，看是否存在，如果存在更新name, email, oauth, 返回role
    //不存在设立新的user, 设定role为user
    return this.db.connect(
      `with select_role as (
        select
        case  
          when (select count(*) from auth.user where "oauthId"=$6) > 0
          then (select role from auth.user where "oauthId"=$6)
          else $5
        end as role
      )
      insert into auth.user ("id", "name", "type", "email", "role", "oauthId", "oauth")
        select $1, $2, $3, $4, r.role, $6, $7 from select_role as r
        on conflict ("oauthId")
        do update set "name"=$2, "email"=$4, "oauth"=$7
        returning "id", "role", "profile";
    `,
      { isReturning: true, isTransaction: false },
      [
        this.id,
        this.name,
        this.type,
        this.email,
        this.role,
        this.oauthId,
        this.oauth,
      ]
    ) as Promise<{
      success: boolean;
      query: { id: string; role: Role; profile: JsonValue }[];
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
    return this.db.connect(
      `
      update auth.user
      set "profile"=$2 "lastUpdateAt"=$3
      where "id"=$1
      returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth"; 
    `,
      { isReturning: true, isTransaction: false },
      [this.id, this.profile, new Date(Date.now()).toISOString()]
    ) as Promise<{
      success: boolean;
      query: TUserInfo[];
      error: Error | null;
    }>;
  }
}

export { OauthUser };
