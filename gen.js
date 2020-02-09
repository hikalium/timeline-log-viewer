const ejs = require('ejs');
const fs = require('fs');

function getDateStr(d) {
  // YYYYMMDD in local time
  var y = d.getFullYear();
  var m = d.getMonth();
  var d = d.getDate();
  return y + ('00' + (m + 1)).substr(-2) + ('00' + (d)).substr(-2);
}

const data = {};

const fitbitSleepDataFile = process.argv[2];
console.log(`fitbitSleepDataFile: ${fitbitSleepDataFile}`);
try {
  data.fitbit_sleep_data = fs.readFileSync(fitbitSleepDataFile, 'utf-8');
} catch (e) {
  console.error(e);
  return;
}

const ramelteonDataFile = process.argv[3];
console.log(`ramelteonDataFile: ${ramelteonDataFile}`);
try {
  data.ramelteon_data = fs.readFileSync(ramelteonDataFile, 'utf-8');
} catch (e) {
  console.error(e);
  return;
}

const dst_file = `dst/report_${getDateStr(new Date())}.html`;
console.log(`dst: ${dst_file}`);

ejs.renderFile(
    'template/template.ejs', data,
    null, function(err, str) {
      if (err) {
        console.error(err);
        return;
      }
      fs.writeFileSync(dst_file, str);
    });
