require('dotenv').config();
const fs = require('fs');
const {WebClient} = require('@slack/web-api');
const util = require('./util.js');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
const channelId = 'CAXVB3146';
const dstFileName = `dst/slack_${util.getDateStr(new Date())}.txt`;

const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean, description: 'print help.'},
  {
    name: 'first-date',
    type: String,
    description: 'First date (YYYY-MM-DD) to be included in a result.'
  },
  {
    name: 'last-date',
    type: String,
    description: 'Last date (YYYY-MM-DD) to be included in a result.'
  },
];
const sections = [
  {header: 'get_fitbit.js', content: 'Fitbit sleep data fetcher'},
  {header: 'Options', optionList: optionDefinitions}
];

(async () => {
  const options = commandLineArgs(optionDefinitions);
  const usage = commandLineUsage(sections);
  if (options.help) {
    console.error(usage);
    process.exit(0);
  }
  if (options['first-date'] === undefined ||
      options['last-date'] === undefined) {
    console.error('`--first-date` and `--last-date` should be specified.');
    console.error(usage);
    process.exit(1);
  }

  const timestampFirst =
      (new Date(`${options['first-date']}T00:00:00+09:00`)).getTime() / 1000;
  const timestampLast =
      (new Date(`${options['last-date']}T00:00:00+09:00`)).getTime() / 1000 +
      60 * 60 * 24 /* last-date + 1 day [sec] */;

  messages = [];
  hasMore = true;
  latest = timestampLast;

  while (hasMore) {
    hasMore = false;
    const response = await web.apiCall('conversations.history', {
      channel: channelId,
      inclusive: true,
      latest: latest,
      oldest: timestampFirst,
    });
    if (!response.ok) throw Error('API fail');
    textMessages = response.messages
                       .map((e) => {
                         return {ts: e.ts, text: e.text};
                       })
                       .filter((e) => e.text !== undefined);
    hasMore = response.has_more;
    if (textMessages.length) latest = textMessages[textMessages.length - 1].ts;
    messages = messages.concat(textMessages);
  }
  const dst_file = `dst/report_${util.getDateStr(new Date())}.html`;
  fs.writeFileSync(
      dstFileName,
      messages.filter((e) => e.text.indexOf('ロゼレム') != -1 || e.text.indexOf('ルネスタ') != -1 || e.text.indexOf('ロラゼパム') != -1)
          .map((e) => e.ts + ',' + e.text)
          .join('\n'));
  console.error(`Result is written to ${dstFileName}`);
})();
