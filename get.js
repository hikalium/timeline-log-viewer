require('dotenv').config();
const fs = require('fs');
const {WebClient} = require('@slack/web-api');
const util = require('./util.js');

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
const channelId = 'CAXVB3146';

const dstFileName = `dst/slack_${util.getDateStr(new Date())}.txt`;

(async () => {
  const timestampNow = (new Date()).getTime() / 1000;
  const timestampOld = (new Date('2020-06-01T00:00:00+09:00')).getTime() / 1000;

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
  const dst_file = `dst/report_${util.getDateStr(new Date())}.html`;
  fs.writeFileSync(dstFileName, messages.filter((e) => e.text.indexOf("ロゼレム") != -1).map((e) => e.ts + ',' + e.text).join('\n'));
  console.log(`Result is written to ${dstFileName}`);
})();
