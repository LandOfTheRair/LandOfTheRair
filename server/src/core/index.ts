
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

/*
import { GameloopWorker } from './gameloop';
import { WebsocketWorker } from './networking';

const isProd = process.env.NODE_ENV === 'production';
const isSingleMode = process.argv.includes('--single-core') || process.env.SINGLE_CORE;
const processors = cpus().length;

const gameStart = () => {
  const worker = new GameloopWorker();
  console.log('CORE', 'Start game...');
  worker.start();
};

const netStart = () => {
  const worker = new WebsocketWorker();
  console.log('CORE', 'Start net...');
  worker.start();
};

/*
if (cluster.isMaster) {
  console.log(isProd ? 'Production mode starting.' : 'Development mode starting.');

  if (isSingleMode || processors < 4) {
    console.log('CORE', 'Starting in single-core mode.', processors < 4 ? 'Not enough processors (need 4).' : '');

    netStart();
    gameStart();

  } else {
    console.log('CORE', 'Starting in normal multi-core mode.');

    const workers: any = {
      net: null,
      gameloop: null
    };

    const pids = {
      net: 0,
      gameloop: 0,
      ground: 0
    };

    const createWorker = (type: 'net'|'gameloop') => {
      workers[type] = cluster.fork({ [type.toUpperCase()]: 1 });
      pids[type] = workers[type].process.pid;

      workers[type].on('message', (msg: any) => {
        Object.keys(workers).forEach(workerType => {
          if (workerType === type) return;
          workers[workerType].send(msg);
        });
      });
    };

    createWorker('net');
    console.log('CORE', `Networking started as PID ${pids.net}.`);

    createWorker('gameloop');
    console.log('CORE', `Gameloop started as PID ${pids.gameloop}.`);

    cluster.on('exit', (deadWorker) => {
      switch (deadWorker.process.pid) {
        case pids.net: {
          createWorker('net');
          console.log('CORE', `Respawning networking as PID ${pids.net}`);
          break;
        }

        case pids.gameloop: {
          createWorker('gameloop');
          console.log('CORE', `Respawning gameloop as PID ${pids.gameloop}`);
          break;
        }
      }
    });
  }

} else {

  if (process.env.NET) netStart();
  if (process.env.GAMELOOP) gameStart();

}

*/
