const config = require('config');
import { generateToken, validateToken } from 'src/utils';
import { PGConnect } from 'src/utils';
import type { TAuth } from '../type';

class Auth {
  private userId: string;
  private _token: string = '';
  private db: PGConnect;
  public constructor(userId: string, db: PGConnect) {
    this.userId = userId;
    this.db = db;
  }
  setToken(token: string) {
    this._token = token;
  }
  get token(): string {
    return this._token;
  }
  /** 
  * create
  */
  createAuth() {
    this.setToken(generateToken(this.userId, process.env[config.get('key.refresh')] || '', '7d'));
    return this.db.connect(`
      insert into auth.auth ("userId", "token")
      values ($1, $2)
      returning *;
    `, { isReturning: true, isTransaction: false }, [this.userId, this.token]) as Promise<TAuth[] | Error>
  }
  /** 
  * read by token to be cheked whether repeated
  */
  readAuth() {
    return this.db.connect(`
    select 
    case
      when (select count(*) from auth.auth where token=$1) > 0
      then true
      else false
    end as isTokenExisted;
    `, { isReturning: false, isTransaction: false }, [this.token]) as Promise<Error | { isTokenExisted: boolean }[]>;
  }
}

export { Auth };