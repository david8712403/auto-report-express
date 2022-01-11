const {getStatisticData} = require('../service/systemService');
const { dtFormat } = require('../util/date');

// getSystemLog, createSystemLog, getStatisticData
const getSystemLog = async (req, res, next) => {
  try {
    let sql = `
      SELECT * FROM change_logs ORDER BY created DESC`;
    const [logs] = await req.db.execute(sql);
    res.json({
      results: logs
    });
  } catch (error) {
    next(error);
  }
};

const createSystemLog = async (req, res, next) => {
  try {
    const { title, platform, author, content } = req.body;
    const now = new Date();
    let sql = `
    INSERT INTO change_logs (title, platform, author, content, created)
    VALUES ('${title ?? ''}', '${platform ?? ''}', '${author ?? ''}', '${content ?? ''}','${dtFormat(now)}')`;
    await req.db.execute(sql);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const getSystemStatisticData = async (req, res, next) => {
  try {
    res.json(await getStatisticData());
  } catch (error) {
    next(error);
  }
};

const debugSql = async (req, res, next) => {
  try {
    const data = (await req.db.execute(req.body.sql))[0];
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemLog,
  createSystemLog,
  getSystemStatisticData,
  debugSql
};