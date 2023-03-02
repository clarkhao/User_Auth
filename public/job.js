const crypto = require("crypto");
const { Worker, parentPort, workerData } = require("worker_threads");
/**
 * type: encrypt | decrypt
 */
try {
  const { type, job } = workerData;
  console.log(`data from worker, type is ${type}, data is ${job}`);
  if (type === "encrypt") {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-ctr", jop.secret, iv);
    const encrypted = Buffer.concat([cipher.update(job.data), cipher.final()]);
    parentPort.postMessage(
      iv.toString("hex") + ":" + encrypted.toString("hex")
    );
  } else if (type === "decrypt") {
    const [ivHex, encryptedHex] = job.data.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-ctr", job.secret, iv);
    parentPort.postMessage(
      Buffer.concat([decipher.update(encrypted), decipher.final()]).toString()
    );
  }
} catch (error) {
  if (error instanceof Error) throw new Error(`${error.message}`);
  else throw new Error(`errro from worker: ${error}`);
}
