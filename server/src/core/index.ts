
require('dotenv').config();

import 'reflect-metadata';

import cluster from 'cluster';
import { cpus } from 'os';

import { GameloopWorker } from './gameloop';
import { WebsocketWorker } from './networking';

const isProd = process.env.NODE_ENV === 'production';

const isSingleMode = process.argv.includes('--single-core') || process.env.SINGLE_CORE;
const processors = cpus().length;


const gameStart = () => {
  const worker = new GameloopWorker();
  worker.start();
};

const netStart = () => {
  const worker = new WebsocketWorker();
  worker.start();
};

if (cluster.isMaster) {
  console.log(isProd ? 'Production mode starting.' : 'Development mode starting.');

  if (isSingleMode || processors < 4) {
    console.log('Starting in single-core mode.', processors < 4 ? 'Not enough processors (need 4).' : '');

    netStart();
    gameStart();

  } else {
    console.log('Starting in normal multi-core mode.');

    const workers: any = {
      net: null,
      gameloop: null
    };

    const pids = {
      net: 0,
      gameloop: 0
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
    console.log(`Networking started as PID ${pids.net}.`);

    createWorker('gameloop');
    console.log(`Gameloop started as PID ${pids.gameloop}.`);

    cluster.on('exit', (deadWorker) => {
      switch (deadWorker.process.pid) {
        case pids.net: {
          createWorker('net');
          console.log(`Respawning networking as PID ${pids.net}`);
          break;
        }

        case pids.gameloop: {
          createWorker('gameloop');
          console.log(`Respawning gameloop as PID ${pids.gameloop}`);
          break;
        }
      }
    });
  }

} else {

  if (process.env.NET) netStart();
  if (process.env.GAMELOOP) gameStart();

}
