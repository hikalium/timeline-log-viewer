const ejs = require('ejs');
const fs = require('fs');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const express = require('express');

function getDateStr(d) {
  // YYYYMMDD in local time
  var y = d.getFullYear();
  var m = d.getMonth();
  var d = d.getDate();
  return y + ('00' + (m + 1)).substr(-2) + ('00' + (d)).substr(-2);
}

const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean, description: 'print help.'},
  {
    name: 'serve',
    alias: 's',
    type: Boolean,
    description: 'Serve output on localhost'
  },
  {name: 'output', alias: 'o', type: String, description: 'Output file path'},
  {name: 'fitbit-data', type: String, description: 'Output file path'},
  {name: 'slack-data', type: String, description: 'Output file path'},
  {name: 'fitbit-sleep-json', type: String, description: 'Output file path'},
];
const sections = [
  {header: 'tlviewer', content: 'Time line log viewer'},
  {header: 'Options', optionList: optionDefinitions}
];

(async () => {
  const options = commandLineArgs(optionDefinitions);
  const usage = commandLineUsage(sections);

  const data = {};

  const fitbitSleepDataFile = options['fitbit-data'];
  console.log(`fitbitSleepDataFile: ${fitbitSleepDataFile}`);
  try {
    data.fitbit_sleep_data = fs.readFileSync(fitbitSleepDataFile, 'utf-8');
  } catch (e) {
    console.error(e);
    return;
  }

  const ramelteonDataFile = options['slack-data'];
  console.log(`ramelteonDataFile: ${ramelteonDataFile}`);
  try {
    data.ramelteon_data = fs.readFileSync(ramelteonDataFile, 'utf-8');
  } catch (e) {
    console.error(e);
    return;
  }

  const fitbitSleepJsonDataFile = options['fitbit-sleep-json'];
  if (fitbitSleepJsonDataFile) {
    console.log(`fitbit sleep json file: ${fitbitSleepJsonDataFile}`);
    try {
      data.fitbit_sleep_data_json =
          fs.readFileSync(fitbitSleepJsonDataFile, 'utf-8');
    } catch (e) {
      console.error(e);
      return;
    }
  }

  const dst_file = `dst/report_${getDateStr(new Date())}.html`;
  console.log(`dst: ${dst_file}`);

  if (options['serve']) {
    let app = express();
    app.use(express.static('public'));
    app.set('view engine', 'ejs');
    app.get('/', (req, res) => {
      res.render('template', data);
    });
    app.listen(4000, () => console.log('Example app listening on port 4000!'));
    return;
  }

  ejs.renderFile('views/template.ejs', data, null, function(err, str) {
    if (err) {
      console.error(err);
      return;
    }
    fs.writeFileSync(dst_file, str);
  });
})();
