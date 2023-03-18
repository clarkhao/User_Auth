import { Redis } from "ioredis";
const config = require("config");
import { debug } from "../logger";
import { TSession } from "src/model/type";

const redisUpClient = new Redis(
  process.env[config.get("redis.upurl")] as string
);

const setRedis = async (key: string, obj: any) => {
  try {
    const objStr = JSON.stringify(obj);
    const objStrBase64 = Buffer.from(objStr).toString("base64");
    //return "OK" if saved objStr
    const save = await redisUpClient.set(key, objStr);
    return { success: save === "OK" };
  } catch (err) {
    debug.error(`from utils/redis/index: ${err}`);
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("cannot write into up redis");
    }
  }
};
const getRedis = async (key: string) => {
  try {
    //return "OK" if saved objStr
    const str = (await redisUpClient.get(key)) as string | null;
    if(str === null)
      throw new Error('key not exited');
    const data = JSON.parse(str);
    return { data, error: null };
  } catch (err) {
    debug.error(`from utils/redis/index: ${err}`);
    return { data: null, error: err };
  }
};
const delRedis = async (key: string) => {
  try {
    const del = await redisUpClient.del(key);
    console.log(`deleted redis ${del}`);
  } catch (err) {
    debug.error(`from utils/redis/index: ${err}`);
  }
};

export { redisUpClient, setRedis, getRedis, delRedis };
