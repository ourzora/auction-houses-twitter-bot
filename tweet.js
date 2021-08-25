const { TwitterClient } = require("twitter-api-client");
const client = new TwitterClient(JSON.parse(process.env.TWITTER_API_KEYS));

function sendTweet(text) {
  client.tweets.statusesUpdate({
    status: text,
  });
}

module.exports = { sendTweet };
