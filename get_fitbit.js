// https://dev.fitbit.com/apps/oauthinteractivetutorial
// https://dev.fitbit.com/build/reference/web-api/sleep/#get-sleep-logs-by-date-range

require('dotenv').config();
const request = require('request');

var headers = {
  'Authorization': 'Bearer ' + process.env.FITBIT_TOKEN,
};

var options = {
  url:
      `https://api.fitbit.com/1.2/user/${process.env.FITBIT_USER}/sleep/date/2020-08-01/2020-08-15.json`,
  headers: headers
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    const data = JSON.parse(body);
    const subset = data.sleep.map(e => {
      return {date: e.dateOfSleep, duration_ms: e.duration, end_time: e.endTime};
    });
    console.log(JSON.stringify(subset, null, " "));
  }
}

request(options, callback);

