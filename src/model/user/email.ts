import { UserType, Role, JsonValue } from "../type";
import type { TUserInfo } from "../type";
import { User } from "./index";
import { PGConnect } from "src/utils";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

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
    this.setSalt(crypto.randomBytes(16).toString("hex"));
    if (this.salt !== null)
      this.setHash(
        crypto.pbkdf2Sync(hash, this.salt, 1000, 64, `sha512`).toString(`hex`)
      );
    return this.db.connect(
      `
      insert into auth.user ("id", "name", "type", "email", "role", "salt", "hash")
      values ($1, $2, $3, $4, $5, $6, $7)
      returning "id", "name", "email";
    `,
      { isReturning: true, isTransaction: false },
      [
        this.id,
        this.name,
        this.type,
        this.email,
        this.role,
        this.salt,
        this.hash,
      ]
    ) as Promise<{
      success: boolean;
      query: { id: string; name: string; email: string }[];
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
    return this.db.connect(
      `
      SELECT
      CASE
        WHEN (SELECT COUNT(*) FROM auth.user WHERE name = $1) > 0 
        THEN true
        ELSE false
      END as name,
      CASE
        WHEN (SELECT COUNT(*) FROM auth.user WHERE email = $2 and type = $3) > 0 
        THEN true
        ELSE false
      END as email;
    `,
      { isReturning: false, isTransaction: false },
      [this.name, this.email, UserType.Email]
    ) as Promise<{
      success: boolean;
      query: { name: boolean; email: boolean }[];
      error: Error | null;
    }>;
  }
  /**
   * read user by name and hash，确认用户输入账户和密码是否匹配，name或者email，使用validation确认
   */
  public readUserByName(name: string) {
    this.setName(name);
    return this.db.connect(
      `
        with exist_user as (
          select * from auth.user WHERE name = $1
        ) 
        select id, email, salt, hash, role, profile from exist_user;
      `,
      { isReturning: false, isTransaction: false },
      [this.name]
    ) as Promise<{
      success: boolean;
      query: {
        id: string;
        email: string;
        salt: string;
        hash: string;
        role: Role;
        profile: JsonValue;
      }[];
      error: Error | null;
    }>;
  }
  /**
   * 如果property是'name'则更新name和profile,如果property是email,则更新email和hash，默认更新role为user或者admin
   */
  public override updateUser(
    name: string,
    value: {hash: string, salt: string} | Role,
    property?: keyof EmailUser
  ) {
    this.setName(name);
    switch (property) {
      case "hash":
        this.setSalt((value as {hash: string, salt: string}).salt)
        this.setHash((value as {hash: string, salt: string}).hash);
        return this.db.connect(
          `
          update auth.user 
          set "hash"=$2, "salt"=$3, "lastUpdateAt"=$4
          where "name"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `,
          { isReturning: true, isTransaction: false },
          [this.name, this.hash, this.salt, new Date(Date.now()).toISOString()]
        ) as Promise<{
          success: boolean;
          query: TUserInfo[];
          error: Error | null;
        }>;
      default:
        this.setRole(value as Role);
        return this.db.connect(
          `
            update auth.user
          set "role"=$2, "lastUpdateAt"=$3
          where "name"=$1
          returning "id","name","type","email","role","createAt","lastUpdateAt","profile","oauth";
        `,
          { isReturning: true, isTransaction: false },
          [this.name, this.role, new Date(Date.now()).toISOString()]
        ) as Promise<{
          success: boolean;
          query: TUserInfo[];
          error: Error | null;
        }>;
    }
  }
}

export { EmailUser };
