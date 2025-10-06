import { workerData } from 'worker_threads';

const worker = require(`./${workerData.worker}`);

const workerClass = worker[workerData.name];

const workerClassInst = new workerClass();
workerClassInst.start();
