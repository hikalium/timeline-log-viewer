// https://dev.fitbit.com/apps/oauthinteractivetutorial
// https://dev.fitbit.com/build/reference/web-api/sleep/#get-sleep-logs-by-date-range

// Time is recorded as in local time zone of the resource owner.
// https://dev.fitbit.com/build/reference/web-api/developer-guide/application-design/#Time-Zones

const request = require('request');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
require('dotenv').config();

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
    console.log(usage);
    process.exit(0);
  }
  if (options['first-date'] === undefined ||
      options['last-date'] === undefined) {
    console.log('`--first-date` and `--last-date` should be specified.');
    console.log(usage);
    process.exit(1);
  }
  const reDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!reDate.test(options['first-date']) ||
      !reDate.test(options['last-date'])) {
    console.log(`Invalid date format. Expected to be matched with: ${reDate}`);
    console.log(usage);
    process.exit(1);
  }
  const requestHeaders = {
    'Authorization': 'Bearer ' + process.env.FITBIT_TOKEN,
  };
  // Only one day is supported for Intraday Time Series.
  // https://dev.fitbit.com/build/reference/web-api/heart-rate/#get-heart-rate-intraday-time-series
  const requestOptions = {
    url: `https://api.fitbit.com/1/user/${
        process.env.FITBIT_USER}/activities/heart/date/${options['first-date']}/1d/1min.json`,
    headers: requestHeaders
  };
  request(requestOptions, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      console.log(data["activities-heart-intraday"]["dataset"].map(e => `${options['first-date']} ${e.time},${e.value}`).join("\n"));
    }
  });
})();

