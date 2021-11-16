const db = require('../db');

const getStatisticData = async () => {
  const sql = 'SELECT SUM(refreshCount) FROM tokens';
  const [refreshCountData] = (await db.execute(sql))[0];
  const visitCount = parseInt(refreshCountData['SUM(refreshCount)']);
  return { visitCount: visitCount };
};

module.exports = {
  getStatisticData
};