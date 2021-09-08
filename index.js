import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
import http from 'http';
import {currentTime} from './utils.js';
import {fetchLatestUpdateStrings} from './zora-indexer-queries.js';
import {sendTweet} from './tweet.js';



const scheduler = new ToadScheduler();

let startAt = currentTime();
const pendingTweets = [];

// This is for railway / heroku / etc HTTP status
const requestListener = (_, res) => {
  res.writeHead(200);
  res.end(`twitter bot (${pendingTweets.length} pending tweets)`);
}

const server = http.createServer(requestListener);


const updateTask = new Task("Fetch updates", async () => {
  const newTweets = await fetchLatestUpdateStrings(startAt);
  for (let tweet of newTweets) {
    pendingTweets.push(tweet.text);
  }
  startAt = currentTime();
});

const tweetTask = new Task("Tweet task", () => {
  if (pendingTweets.length) {
    console.log(newTweet);
    const newTweet = pendingTweets.pop();
    sendTweet(newTweet);
  }
})

const job1 = new SimpleIntervalJob({ seconds: 60 }, updateTask);
const job2 = new SimpleIntervalJob({ seconds: 22 }, tweetTask);

scheduler.addSimpleIntervalJob(job1);
scheduler.addSimpleIntervalJob(job2);

server.listen(8000);
