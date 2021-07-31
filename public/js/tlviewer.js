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

let durationStrList = document.getElementById('input')
                          .value.split('\n')
                          .map((s) => s.split(',').splice(0, 2))
                          .filter((e) => e.length == 2)
                          .map((e) => e.map((ds) => ds.split('"').join('')))

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
      if (d.length == 2) {
        rowDivBody.append(genDivDuration('duration-sleep', d[0], d[1])
                              .text(`${((d[1] - d[0]) / 60).toFixed(1)}`));
      } else {
        rowDivBody.append(genDivEvent('time', d[0]).addClass('tooltip').append(`
                    <span class="tooltiptext">${d[0]}</span>
                    `));
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

