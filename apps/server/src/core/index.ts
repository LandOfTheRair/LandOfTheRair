// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('source-map-support').install();

import { GameServerEvent } from '@lotr/interfaces';
import { consoleError, consoleLog } from '@lotr/logger';
import path from 'path';
import { isMainThread, Worker } from 'worker_threads';

const kill = () => process.exit(0);

if (isMainThread) {
  const workers: Record<string, Worker | null> = {
    networking: null,
    gameloop: null,
  };

  const reinit = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    createWorker('networking', 'WebsocketWorker');
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    createWorker('gameloop', 'GameloopWorker');
  };

  const createWorker = (worker, name) => {
    if (workers[worker]) {
      workers[worker]?.terminate();
      delete workers[worker];
    }

    const createdWorker = new Worker(path.join(__dirname, 'start-worker.js'), {
      workerData: { worker, name },
    });

    createdWorker.on('message', (msg) => {
      if (msg.type === GameServerEvent.ForceReboot) {
        consoleLog(
          'Master:ForceReboot',
          'Killing game... hopefully the server restarts!',
        );
        kill();
      }

      if (msg.type === GameServerEvent.ForceRebootLocal) {
        consoleLog(
          'Master:ForceRebootLocal',
          'Killing game... hopefully the server restarts!',
        );

        reinit();
        return;
      }

      const target = msg.target;
      if (!target) {
        consoleError(
          `Worker:${worker}:TargetCheck`,
          new Error(`Message ${JSON.stringify(msg)} has no target.`),
        );
      }

      delete msg.target;

      workers[target]?.postMessage(msg);
    });

    createdWorker.on('messageerror', (err) => {
      consoleError(`Worker:${worker}:MessageError`, err);
    });

    createdWorker.on('error', (err) => {
      consoleError(`Worker:${worker}:Error`, err);
    });

    createdWorker.on('exit', (code) => {
      consoleError(
        `Worker:${worker}:Exit`,
        new Error(`Worker exited with code ${code}`),
      );
    });

    workers[worker] = createdWorker;
  };

  createWorker('networking', 'WebsocketWorker');
  createWorker('gameloop', 'GameloopWorker');
}
