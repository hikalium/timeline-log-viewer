
function getDateStr(d) {
  // YYYYMMDD in local time
  var y = d.getFullYear();
  var m = d.getMonth();
  var d = d.getDate();
  return y + ('00' + (m + 1)).substr(-2) + ('00' + (d)).substr(-2);
}

module.exports.getDateStr = getDateStr;
