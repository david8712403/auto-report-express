const express = require('express');
const { authenticationToken } = require('../middleware/auth');
const router = express.Router('');
const { dtFormat } = require('../util/date');
const date = require('date-and-time');
const { rmNullValue } = require('../util/json');
const { getDailyReport, createDailyReport, deleteDailyReport } = require('../controller/dailyReportController');

// 取得組織內daily report
router.get('/', authenticationToken, getDailyReport);

// 新增daily report
router.put('/', authenticationToken, createDailyReport);

// 更新指定日期的daily report
router.patch('/', authenticationToken, async (req, res, next) => {
  try {
    const { id, organization } = req.auth;
    const { content, date } = req.body;
    var now = dtFormat(new Date());
    const [reportRows] = await req.db.execute(`SELECT * FROM daily_reports
        WHERE user_id = ${id} AND
        organization_id = ${organization} AND
        date = '${date}'`);
    if (reportRows.length === 0) {
      res.status(400).json({ error: `daily report in ${date} not found` });
      return;
    }
    const updateSql = `UPDATE daily_reports 
    SET content = '${content}',
        updated = '${now}'
    WHERE id = ${reportRows[0].id}`;
    await req.db.execute(updateSql);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// 刪除指定日期的daily report
router.delete('/', authenticationToken, deleteDailyReport);

// 取得每日組織內的daily_report統計
router.get('/summary', authenticationToken, async (req, res, next) => {
  try {
    const defaultDate = date.format(new Date(), 'Y-MM-DD');
    const { organization } = req.auth;

    const sql = `SELECT
      d.id,
      u.id AS userId,
      u.name AS userName,
      d.content,
      d.date,
      d.created,
      d.updated
    FROM users u
    LEFT JOIN (SELECT * FROM daily_reports WHERE date = '${req.body.date ?? defaultDate}') d
      ON d.user_id = u.id
    JOIN (SELECT * FROM user_relations WHERE organization_id = ${organization}) AS r
      ON r.user_id = u.id`;
    const [reports] = await req.db.execute(sql);
    var results = rmNullValue(reports);
    res.status(200).json({ results: results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;