
import { parentPort, workerData } from 'node:worker_threads';

const sum = workerData.reduce((acc, val) => acc + val, 0);
parentPort.postMessage(sum);
