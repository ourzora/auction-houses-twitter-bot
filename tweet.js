import { TwitterClient } from "twitter-api-client";
const client = process.env.TWITTER_API_KEYS
  ? new TwitterClient(JSON.parse(process.env.TWITTER_API_KEYS))
  : null;

export function sendTweet(text) {
  client.tweets.statusesUpdate({
    status: text,
  });
}
