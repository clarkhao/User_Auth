const config = require('config');
import { PGConnect, generateToken, validateToken } from 'src/utils';
import { JsonValue } from '../type';
import type { TSession } from '../type';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

class Session {
  private _id: string = '';
  private userId: string;
  private _sessionObj: JsonValue = null;
  private db: PGConnect;
  public constructor(userId: string, db: PGConnect) {
    this.userId = userId;
    this.db = db;
  }
  setId(id: string) {
    this._id = id;
  }
  get id(): string {
    return this._id;
  }
  setSessionObj(sessionObj: JsonValue) {
    this._sessionObj = sessionObj;
  }
  get sessionObj(): JsonValue {
    return this._sessionObj;
  }
  /** 
  * create创建sessionObj返回sessionID, 并分别传递给cookie和redis
  */
  public createSession() {
    this.setId(uuidv4());
    return this.db.connect(`
    insert int auth.session ("id", "userId", "session")
    values ($1, $2, $3)
    returning id as "sessinoid";
    `, { isReturning: true, isTransaction: false }, [this.id, this.userId, this.sessionObj]) as Promise<{
      success: boolean;
      query: { sessionid: string }[];
      error: Error | null;
    }>;
  }
  /** 
  * read session by userId
  */
  public readSession() {
    return this.db.connect(`
    select * from auth.session where "userId"=$1;
    `, { isReturning: false, isTransaction: false }, [this.userId]) as Promise<{
      success: boolean;
      query: TSession[];
      error: Error | null;
    }>;
  }
  /** 
  * update sessionObj in the end of every session given by Redis
  * @params id: sessionId in redis
  * @params sessionObj: sessionObj stored in redis
  */
  public updateSession(id: string, sessionObj: JsonValue) {
    this.setSessionObj(sessionObj);
    return this.db.connect(`
    update auth.session
    set sessionObj=$1
    where "id"=$2;
    `, { isReturning: false, isTransaction: false }, [this.sessionObj, id]) as Promise<{
      success: boolean;
      query: null;
      error: Error | null;
    }>;
  }
}

export { Session };