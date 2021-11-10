const date = require('date-and-time');
const dtFormat = (datetime) => {
  return date.format(datetime, 'YYYY-MM-DD HH:mm:ss.SSS');
};
module.exports = {
  dtFormat
};