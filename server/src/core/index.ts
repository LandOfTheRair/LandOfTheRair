
require('dotenv').config();

import 'reflect-metadata';

import cluster from 'cluster';
import { cpus } from 'os';

import { GameloopWorker } from './gameloop';
import { GroundWorker } from './ground';
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

const groundStart = () => {
  const worker = new GroundWorker();
  console.log('CORE', 'Start ground...');
  worker.start();
};

if (cluster.isMaster) {
  console.log(isProd ? 'Production mode starting.' : 'Development mode starting.');

  if (isSingleMode || processors < 4) {
    console.log('CORE', 'Starting in single-core mode.', processors < 4 ? 'Not enough processors (need 4).' : '');

    netStart();
    gameStart();
    groundStart();

  } else {
    console.log('CORE', 'Starting in normal multi-core mode.');

    const workers: any = {
      net: null,
      gameloop: null,
      ground: null
    };

    const pids = {
      net: 0,
      gameloop: 0,
      ground: 0
    };

    const createWorker = (type: 'net'|'gameloop'|'ground') => {
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

    createWorker('ground');
    console.log('CORE', `Ground watcher started as PID ${pids.ground}.`);

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

        case pids.ground: {
          createWorker('ground');
          console.log('CORE', `Respawning ground as PID ${pids.ground}`);
          break;
        }
      }
    });
  }

} else {

  if (process.env.NET) netStart();
  if (process.env.GAMELOOP) gameStart();
  if (process.env.GROUND) groundStart();

}
