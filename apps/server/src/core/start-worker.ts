import { workerData } from 'worker_threads';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const worker = require(`./${workerData.worker}`);

const workerClass = worker[workerData.name];

const workerClassInst = new workerClass();
workerClassInst.start();
