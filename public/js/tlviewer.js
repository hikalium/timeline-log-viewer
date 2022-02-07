const sleepLogJson = JSON.parse(document.getElementById('sleepLogJson').value);
console.log(sleepLogJson);

const durationDateList = sleepLogJson.map(e => {
  const end_date = new Date(e.end_time);
  return [
    new Date(end_date.getTime() - e.duration_ms),
    end_date,
  ];
});
console.log(durationDateList);

let timeStrList = document.getElementById('ramelteonInput')
                      .value.split('\n')
                      .map((s) => s.split(',').splice(0, 2))
                      .filter((e) => e.length == 2);
let timeDateList = timeStrList.map(
    e => {return {date: new Date(parseFloat(e[0]) * 1000), description: e[1]};});

let durationInDateKV = {};

function appendDuration(key, begin, end) {
  if (durationInDateKV[key] === undefined) durationInDateKV[key] = [];
  if (begin === undefined) begin = 0;
  if (end === undefined) end = 60 * 24;
  durationInDateKV[key].push(['d', begin, end]);
}

function appendTime(key, begin, description) {
  if (durationInDateKV[key] === undefined) durationInDateKV[key] = [];
  durationInDateKV[key].push(['t', begin, description]);
}

function getDateKey(d) {
  var y = d.getFullYear();
  var m = d.getMonth();
  var d = d.getDate();
  return y + '-' + ('00' + (m + 1)).substr(-2) + '-' + ('00' + (d)).substr(-2);
}

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

for (let e of timeDateList) {
  let beginKey = getDateKey(e.date);
  let beginMinutesInDay = e.date.getMinutes() + e.date.getHours() * 60;
  appendTime(beginKey, beginMinutesInDay, e.description);
}

console.log(durationInDateKV);

let durationInDateList = [];

for (let k in durationInDateKV) {
  durationInDateList.push([k, durationInDateKV[k]]);
}

durationInDateList =
    durationInDateList.sort((eL, eR) => (eL[0] > eR[0]) ? 1 : -1);
console.log(durationInDateList);

function genDivDuration(divClass, beginMinutesInDay, endMinutesInDay) {
  return $('<div>')
      .addClass(divClass)
      .css('left', `${(beginMinutesInDay / (60 * 24) * 100)}%`)
      .css(
          'width',
          `${((endMinutesInDay - beginMinutesInDay) / (60 * 24) * 100)}%`);
}
function genDivEvent(divClass, minutesInDay) {
  return $('<div>').addClass(divClass).css(
      'left', '' + (minutesInDay / (60 * 24) * 100) + '%')
}

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
    let keyColor = day == 0 ? 'red' : (day == 6 ? 'blue' : 'black');
    let durations = row[1];
    let rowDivHead =
        $('<div>').addClass('daterowhead').css('color', keyColor).text(key);
    resultDiv.append(rowDivHead);
    // Generate timeline
    let rowDivBody = $('<div>').addClass('daterowbody');
    for (let d of durations) {
      if (d[0] == 'd') {
        rowDivBody.append(genDivDuration('duration-sleep', d[1], d[2])
                              .text(`${((d[2] - d[1]) / 60).toFixed(1)}`));
      } else if (d[0] == 't') {
        if (d[2].indexOf('ロゼレム') != -1) {
          rowDivBody.append(
              genDivEvent('time-ramelteon', d[1]).addClass('tooltip').append(`
                    <span class="tooltiptext">${d[0]}</span>
                    `));
        } else if (d[2].indexOf('ルネスタ') != -1) {
          rowDivBody.append(
              genDivEvent('time-eszopiclone', d[1]).addClass('tooltip').append(`
                    <span class="tooltiptext">${d[0]}</span>
                    `));
        } else if (d[2].indexOf('ロラゼパム') != -1) {
          rowDivBody.append(
              genDivEvent('time-lorazepam', d[1]).addClass('tooltip').append(`
                    <span class="tooltiptext">${d[0]}</span>
                    `));
        }
      } else {
        console.error(`Unexpected ${d}`);
      }
    }
    // Generate Guides
    for (var i = 0; i < 25; i++) {
      rowDivBody.append(genDivDuration('duration-1h', i * 60, 0));
    }
    rowDivBody.append(genDivDuration('duration-6h', 6 * 60, 0));
    rowDivBody.append(genDivDuration('duration-6h', 12 * 60, 0));
    rowDivBody.append(genDivDuration('duration-6h', 18 * 60, 0));
    // Append to the parent
    resultDiv.append(rowDivBody);
  }
}

updateResult();

