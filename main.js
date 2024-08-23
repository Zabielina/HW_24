import { performance } from 'perf_hooks';
import { Worker } from 'node:worker_threads';
import os from 'node:os';
import http from 'node:http';
import cluster from 'node:cluster';

const PORT = 3000;
const cpus = os.cpus().length;

function createLargeArray(size) {
  return Array.from({ length: size }, (_, i) => i + 1);
}

function calculateSum(array) {
  return array.reduce((acc, val) => acc + val, 0);
}

function calculateSumWithWorker(array) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: array });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const arraySize = 10_000_000;
  const largeArray = createLargeArray(arraySize);

 
  const startTime = performance.now();
  const sum = calculateSum(largeArray);
  const endTime = performance.now();
  
  console.log(`Sum (without worker_threads): ${sum}`);
  console.log(`Time taken (without worker_threads): ${endTime - startTime} milliseconds`);

  const workerStartTime = performance.now();
  const sumFromWorker = await calculateSumWithWorker(largeArray);
  const workerEndTime = performance.now();

  console.log(`Sum (with worker_threads): ${sumFromWorker}`);
  console.log(`Time taken (with worker_threads): ${workerEndTime - workerStartTime} milliseconds`);
}

if (cluster.isPrimary) {
  for (let i = 0; i < cpus - 1; i++) {
    cluster.fork();
  }
  http.createServer((req, res) => {
    res.end('OK');
  }).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
} else {
  main().catch(console.error);
}
