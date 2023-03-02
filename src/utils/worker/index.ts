import { Worker } from "worker_threads";

function doHeavyWork(filepath: string, type: string, data: unknown) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(filepath, {
      workerData: {
        type,
        job: data,
      },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
      console.log("worker exit");
    });
  });
}

export { doHeavyWork };
