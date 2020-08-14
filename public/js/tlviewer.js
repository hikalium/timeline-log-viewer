const sleepLogJson = JSON.parse(document.getElementById('sleepLogJson').value);
console.log(sleepLogJson);

const durationDateList2 = sleepLogJson.map(e => {
  const end_date = new Date(e.end_time);
  return [
  new Date(end_date.getTime() - e.duration_ms),
  end_date,
];
}
);
console.log(durationDateList2);

let durationStrList = document.getElementById('input')
                          .value.split('\n')
                          .map((s) => s.split(',').splice(0, 2))
                          .filter((e) => e.length == 2)
                          .map((e) => e.map((ds) => ds.split('"').join('')))
let durationDateList = durationStrList.map((d) => d.map((s) => {
  let es = s.split(' ');
  let date_nums = es[0].split('.').map((s) => parseInt(s, 10));
  let time_nums = es[2].split(':').map((s) => parseInt(s, 10));
  if (es[1] == '午後')
    time_nums[0] = ((time_nums[0] % 12) + 12);
  else
    time_nums[0] = time_nums[0] % 12;
  return new Date(
      date_nums[0], date_nums[1] - 1, date_nums[2], time_nums[0], time_nums[1]);
}))

let timeStrList = document.getElementById('ramelteonInput')
                      .value.split('\n')
                      .map((s) => s.split(',').splice(0, 2))
                      .filter((e) => e.length == 2);
let timeDateList = timeStrList.map(e => new Date(parseFloat(e[0]) * 1000));

let durationInDateKV = {};

function appendDuration(key, begin, end) {
  if (durationInDateKV[key] === undefined) durationInDateKV[key] = [];
  if (begin === undefined) begin = 0;
  if (end === undefined) end = 60 * 24;
  durationInDateKV[key].push([begin, end]);
}

function appendTime(key, begin) {
  if (durationInDateKV[key] === undefined) durationInDateKV[key] = [];
  durationInDateKV[key].push([begin]);
}

function getDateKey(d) {
  var y = d.getFullYear();
  var m = d.getMonth();
  var d = d.getDate();
  return y + '-' + ('00' + (m + 1)).substr(-2) + '-' + ('00' + (d)).substr(-2);
}

console.log(durationDateList);

for (let d of durationDateList) {
  let beginDate = d[0];
  let endDate = d[1];
  let beginKey = getDateKey(beginDate);
  let endKey = getDateKey(endDate);
  let beginMinutesInDay = beginDate.getMinutes() + beginDate.getHours() * 60;
  let endMinutesInDay = endDate.getMinutes() + endDate.getHours() * 60;
  if (beginKey == endKey) {
    appendDuration(beginKey, beginMinutesInDay, endMinutesInDay);
  } else {
    appendDuration(beginKey, beginMinutesInDay, undefined);
    appendDuration(endKey, undefined, endMinutesInDay);
  }
}

for (let d of timeDateList) {
  let beginKey = getDateKey(d);
  let beginMinutesInDay = d.getMinutes() + d.getHours() * 60;
  appendTime(beginKey, beginMinutesInDay);
}

console.log(durationInDateKV);

let durationInDateList = [];

for (let k in durationInDateKV) {
  durationInDateList.push([k, durationInDateKV[k]]);
}

durationInDateList =
    durationInDateList.sort((eL, eR) => (eL[0] > eR[0]) ? 1 : -1);
console.log(durationInDateList);

function updateResult() {
  let resultDiv = $('#output');
  resultDiv.empty();
  let dateBegin = document.getElementById('dateBegin');
  let dateLast = document.getElementById('dateLast');
  if (!dateBegin.value) dateBegin.value = durationInDateList[0][0];
  if (!dateLast.value)
    dateLast.value = durationInDateList[durationInDateList.length - 1][0];
  let beginDateTime = (new Date(dateBegin.value)).getTime();
  let lastDateTime =
      (new Date(dateLast.value)).getTime() + (1000 * 60 * 60 * 24);
  for (let row of durationInDateList) {
    let key = row[0];
    let keyDate = new Date(key);
    if (keyDate.getTime() < beginDateTime || lastDateTime < keyDate.getTime())
      continue;
    let day = keyDate.getDay();
    let keyColor = day == 0 ? "red" : (day == 6 ? "blue" : "black");
    let durations = row[1];
    let rowDivHead = $('<div>').addClass('daterowhead').css("color", keyColor).text(key);
    resultDiv.append(rowDivHead);
    let rowDivBody = $('<div>').addClass('daterowbody');
    resultDiv.append(rowDivBody);
    for (let d of durations) {
      if (d.length == 2) {
        rowDivBody.append(
            $('<div>')
                .addClass('duration')
                .css('left', '' + (d[0] / (60 * 24) * 100) + '%')
                .css(
                    'width',
                    `calc(${((d[1] - d[0]) / (60 * 24) * 100)}% - 2px)`));
      } else {
        rowDivBody.append(
            $('<div>')
                .addClass('time').addClass('tooltip')
                .css('left', 'calc(' + (d[0] / (60 * 24) * 100) + '% - 6px)')
                .append(`
                    <span class="tooltiptext">${d[0]}</span>
                    `));
      }
    }
  }
}

updateResult();

