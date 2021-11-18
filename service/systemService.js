const db = require('../db');

const getStatisticData = async () => {
  const sql = 'SELECT SUM(refreshCount), COUNT(value) FROM tokens';
  const [countData] = (await db.execute(sql))[0];
  const visitCount = parseInt(countData['SUM(refreshCount)']);
  const loginCount = parseInt(countData['COUNT(value)']);

  const repostSql = 'SELECT COUNT(content) FROM daily_reports';
  const [reportData] = (await db.execute(repostSql))[0];
  const reportCount = parseInt(reportData['COUNT(content)']);
  return {
    visitCount: visitCount,
    loginCount: loginCount,
    reportCount: reportCount
  };
};

module.exports = {
  getStatisticData
};