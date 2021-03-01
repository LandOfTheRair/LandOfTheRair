
require('dotenv').config();
require('source-map-support').install();

import path from 'path';
import { isMainThread, Worker } from 'worker_threads';

if (isMainThread) {

  const workers: Record<string, Worker | null> = {
    networking: null,
    gameloop: null
  };

  const createWorker = (worker, name) => {
    if (workers[worker]) {
      workers[worker]?.terminate();
      delete workers[worker];
    }

    const createdWorker = new Worker(path.join(__dirname, 'start-worker.js'), {
      workerData: { worker, name }
    });

    createdWorker.on('message', (msg) => {
      const target = msg.target;
      if (!target) console.error(`Worker:${worker}:TargetCheck`, `Message ${JSON.stringify(msg)} has no target.`);

      delete msg.target;

      workers[target]?.postMessage(msg);
    });

    createdWorker.on('messageerror', (err) => {
      console.error(`Worker:${worker}:MessageError`, err);
    });

    createdWorker.on('error', (err) => {
      console.error(`Worker:${worker}:Error`, err);
    });

    createdWorker.on('exit', (code) => {
      console.error(`Worker:${worker}:Exit`, code);

      setTimeout(() => {
        createWorker(worker, name);
      }, 1000);
    });

    workers[worker] = createdWorker;
  };

  createWorker('networking', 'WebsocketWorker');
  createWorker('gameloop', 'GameloopWorker');

}
