import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
const http = require('http');
import {currentTime} from './utils';

const requestListener = (_, res) => {
  res.writeHead(200);
  res.end('twitter bot');
}

const server = http.createServer(requestListener);


const scheduler = new ToadScheduler();


let startAt = currentTime();

const task = new Task("simple task", () => {
  console.log(counter);
  counter++;
});

const job = new SimpleIntervalJob({ seconds: 20 }, task);

scheduler.addSimpleIntervalJob(job);

server.listen(8000);
