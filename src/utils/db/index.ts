import { Pool } from "pg";
import { debug } from '../logger';
const config = require('config');

type Credentials = {
  user: string,
  host: string,
  database: string,
  password: string,
  port: number,
  //connectionTimeoutMillis: number
  ssl: boolean
}
export type ConnectOption = {
  isReturning: boolean;
  isTransaction: boolean;
}

class PGConnect {
  private credentials: Credentials;
  private pool: Pool
  public constructor(db: string) {
    this.credentials = {
      user: process.env[config.get('db.user')] || '',
      host: process.env[config.get('db.host')] || '',
      database: db,
      password: process.env[config.get('db.pwd')] || '',
      port: config.get('db.port'),
      ssl: true
      //connectionTimeoutMillis: 2000
    }
    this.pool = new Pool(this.credentials);
  }

  /**
   * 封装了普通查询和事务查询
   * @param text sql clauses
   * @param values values in sql clauses, indicated by $1, $2 ...
   * @param options options.isReturning=true, 函数返回boolean, 
   *                options.isReturing=false时，insert,update和delete最后使用returning语句, 函数返回T[]
   *                options.isTransaction
   * @param handler optional handler occured in a transaction situation, not async function
   * @param args the arguments binded with handler
   * @returns Promise<{success: boolean;query: null|T[];error: Error|null;}>
   */
  public connect<T>(text: string, options: ConnectOption, values?: unknown[], handler?: Function, object?: Object, args?: unknown[]) {
    return this.pool.connect().then(async client => {
      try {
        options?.isTransaction && await client.query('BEGIN');
        const result = await client.query(text, values);
        options?.isTransaction && handler?.apply(object, args);
        options?.isTransaction && await client.query('COMMIT');
        if ((result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') && !options?.isReturning) {
          return { success: true, query: null, error: null };
        } else {
          return { success: true, query: result.rows as T[], error: null };
        }
      } catch (err) {
        options?.isTransaction && await client.query('ROLLBACK');
        debug.error(`from db utils connect: ${err}`);
        let errMsg = '';
        if (err instanceof Error) {
          errMsg = err.message;
        } else {
          errMsg = `${err}`
        }
        return { success: false, query: null, error: Error(errMsg) };
      } finally {
        client.release();
      }
    })
  }
}
const db = new PGConnect(process.env[config.get('db.name')] as string);
export { db, PGConnect };