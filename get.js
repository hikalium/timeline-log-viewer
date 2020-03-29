require('dotenv').config();
const {WebClient} = require('@slack/web-api');

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
const channelId = 'CAXVB3146';

(async () => {
  const timestampNow = (new Date()).getTime() / 1000;
  const timestampOld = (new Date('2020-01-01T00:00:00+09:00')).getTime() / 1000;

  messages = [];
  hasMore = true;
  latest = timestampNow;

  while (hasMore) {
    hasMore = false;
    const response = await web.apiCall('conversations.history', {
      channel: channelId,
      inclusive: true,
      latest: latest,
      oldest: timestampOld,
    });
    if (!response.ok) throw Error('API fail');
    textMessages = response.messages.map((e) => {
      return {ts: e.ts, text: e.text};
    }).filter((e) => e.text !== undefined);
    hasMore = response.has_more;
    if(textMessages.length)
      latest = textMessages[textMessages.length - 1].ts;
    messages = messages.concat(textMessages);
  }
  console.log(messages.filter((e) => e.text.indexOf("ロゼレム") != -1).map((e) => e.ts + ',' + e.text).join('\n'));
})();