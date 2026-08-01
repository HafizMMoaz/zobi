const Redis = require('ioredis');
const config = require('../config.json');
const { randomUUID } = require('crypto');
const redis = new Redis(config.redis);

const numClients = 256;
const globalEventStreamName = `${config.redisStreamPrefix}full`;

function pushData() {
  for (let i = 0; i < numClients; i++) {
    const channelId = String(i);
    const streamId = `${config.redisStreamPrefix}${channelId}`;
    const data = {
      channel_id: channelId,
      job_id: randomUUID(),
      status: 'pending',
    };

    // push to channel stream
    redis
      .xadd(streamId, 'MAXLEN', 1000, '*', 'data', JSON.stringify(data))
      .then(resp => {
        console.log('stream response', resp);
      });

    // push to firehose (all events) stream
    redis
      .xadd(
        globalEventStreamName,
        'MAXLEN',
        100000,
        '*',
        'data',
        JSON.stringify(data),
      )
      .then(resp => {
        console.log('stream response', resp);
      });
  }
}

pushData();
setInterval(pushData, 1000);
