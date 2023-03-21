import { Redis } from "ioredis";
const config = require("config");
import { debug } from "../logger";
import { TSession } from "src/model/type";

const redisUpClient = new Redis({
  port: parseInt(process.env.REDIS_UP_PORT as string),
  host: process.env.REDIS_UP_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_UP_PASSWORD,
  tls: {},
  retryStrategy(times) {
    if (times > 2) return null; // return null to stop retrying
    return Math.min(times * 500, 2000);
  },
});
//redisUpClient.on("connect", () => console.log(`connected`));
redisUpClient.on("disconnect", () => console.log("disconnected"));
redisUpClient.on("error", (error) =>
  console.warn("got an error from redis", error)
);

const setRedis = async (key: string, obj: any) => {
  try {
    const objStr = JSON.stringify(obj);
    const objStrBase64 = Buffer.from(objStr).toString("base64");
    //return "OK" if saved objStr
    const save = await redisUpClient.set(key, objStr);
    const success = save === "OK";
    return { success };
  } catch (err) {
    debug.error(`from utils/redis/index: ${err}`);
    redisUpClient.disconnect();
    throw err;
  }
};
const getRedis = async (key: string) => {
  try {
    //return "OK" if saved objStr
    const str = (await redisUpClient.get(key)) as string | null;
    console.log(str);
    if (str === null) return { data: null, error: new Error("key not exited") };
    else {
      const data = JSON.parse(str as string);
      return { data, error: null };
    }
  } catch (err) {
    debug.error(`from utils/redis/index: ${err}`);
    redisUpClient.disconnect();
    return { data: null, error: err };
  }
};
const delRedis = async (key: string) => {
  try {
    const del = await redisUpClient.del(key);
    console.log(`deleted redis ${del}`);
  } catch (err) {
    debug.error(`from utils/redis/index: ${err}`);
    redisUpClient.disconnect();
    throw err;
  }
};

export { setRedis, getRedis, delRedis };
