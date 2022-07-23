import {
  concatQueueName,
  splitterQueueName,
  transcoderQueueName,
} from "./types";
import splitterProcessor from "./workers/splitter";
import transcoderProcessor from "./workers/transcoder";
import concatProcessor from "./workers/concat";
import { createWorker } from "./workers/worker.factory";
import { addJobs } from "./producer";

const connection = {
  host: "localhost",
  port: 6379,
};

addJobs().catch((err) => console.error(err));

const { worker: splitterWorker, scheduler: splitterScheduler } = createWorker(
  splitterQueueName,
  splitterProcessor,
  connection
);

const { worker: transcoderWorker, scheduler: transcoderScheduler } =
  createWorker(transcoderQueueName, transcoderProcessor, connection, 8);

const { worker: concatWorker, scheduler: concatScheduler } = createWorker(
  concatQueueName,
  concatProcessor,
  connection
);

process.on("SIGTERM", async () => {
  console.info("SIGTERM signal received: closing queues");

  await splitterWorker.close();
  await splitterScheduler.close();
  await transcoderWorker.close();
  await transcoderScheduler.close();
  await concatWorker.close();
  await concatScheduler.close();

  console.info("All closed");
});
