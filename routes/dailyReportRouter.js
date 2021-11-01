const express = require('express')
const { authenticationToken } = require('../middleware/auth')
const router = express.Router('')
const { dtFormat } = require('../util/date')
const date = require('date-and-time');

// 取得組織內daily report
router.get('/', authenticationToken, async (req, res, next) => {
  try {
    const defaultStartDate = date.format(new Date(2021, 1, 1), "Y-MM-D")
    const defaultEndDate = date.format(new Date(), "Y-MM-D")
    const { startDate, endDate } = req.query
    const { organization } = req.auth

    let sql = `
    SELECT id, userId, userName, content, date, created, updated FROM
    (SELECT * FROM 
      (SELECT * FROM daily_reports
        WHERE organization_id = ${organization} AND
        date >= '${startDate ?? defaultStartDate}' AND
        date <= '${endDate ?? defaultEndDate}') as dr
      JOIN ( SELECT id as userId, name as userName FROM users ) as users
    ON users.userId = dr.user_id) as t
    ORDER BY t.date DESC`
    const [reportRows] = await req.db.execute(sql)
    res.json({
      results: reportRows
    })
  } catch (error) {
    next(error)
  }
})

// 新增daily report
router.put('/', authenticationToken, async (req, res, next) => {
  try {
    const { id, organization } = req.auth
    const { content, date } = req.body
    if (!(content && date)) {
      res.status(400).json({ error: "content, date can not be empty" })
      return;
    }
    var now = dtFormat(new Date())
    const [reportRows] = await req.db.execute(`SELECT * FROM daily_reports
        WHERE user_id = ${id} AND
        organization_id = ${organization} AND
        date = '${date}'`)
    if (reportRows.length !== 0) {
      res.status(400).json({ error: `daily report in ${date} already exist` })
      return
    }
    await req.db.execute(`INSERT INTO daily_reports (user_id, organization_id, content, date, created)
        VALUES (${id}, ${organization}, '${content}', '${date}', '${now}')`)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

// 更新指定日期的daily report
router.patch('/', authenticationToken, async (req, res, next) => {
  try {
    const { id, organization } = req.auth
    const { content, date } = req.body
    var now = dtFormat(new Date())
    const [reportRows] = await req.db.execute(`SELECT * FROM daily_reports
        WHERE user_id = ${id} AND
        organization_id = ${organization} AND
        date = '${date}'`)
    if (reportRows.length === 0) {
      res.status(400).json({ error: `daily report in ${date} not found` })
      return
    }
    const updateSql = `UPDATE daily_reports 
    SET content = '${content}',
        updated = '${now}'
    WHERE id = ${reportRows[0].id}`
    await req.db.execute(updateSql)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

// 更新指定日期的daily report
router.delete('/', authenticationToken, async (req, res, next) => {
  try {
    const { id, organization } = req.auth
    const { date } = req.body
    const [reportRows] = await req.db.execute(`SELECT * FROM daily_reports
        WHERE user_id = ${id} AND
        organization_id = ${organization} AND
        date = '${date}'`)
    if (reportRows.length === 0) {
      res.status(400).json({ error: `daily report in ${date} not found` })
      return
    }
    const updateSql = `DELETE FROM daily_reports
    WHERE id = ${reportRows[0].id}`
    await req.db.execute(updateSql)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

// 取得每日組織內的daily_report統計
router.get('/summary', authenticationToken, async (req, res, next) => {
  try {
    const defaultDate = date.format(new Date(), "Y-MM-D")
    const { organization } = req.auth
    const sqlMember = `
    SELECT userId, account, userName, email FROM
    (SELECT * FROM 
      (SELECT * FROM user_relations
        WHERE organization_id = ${organization}) as dr
      JOIN ( SELECT id as userId, name as userName, email, account FROM users ) as users
    ON users.userId = dr.user_id) as t`

    const sqlReport = `
    SELECT id, userId, userName, content, date, created, updated FROM
    (SELECT * FROM 
      (SELECT * FROM daily_reports
        WHERE organization_id = ${organization} AND
        date = '${req.query.date ?? defaultDate}') as dr
      JOIN ( SELECT id as userId, name as userName FROM users ) as users
      ON users.userId = dr.user_id) as t
    ORDER BY t.date DESC`

    const [memberRows] = await req.db.execute(sqlMember)
    const [reportRows] = await req.db.execute(sqlReport)
    let reportDic = reportRows.reduce((a, x) => ({ ...a, [x.userId]: x }), {})
    const reportResult = memberRows.map((e) => {
      return { ...e, report: reportDic[e.userId] }
    })
    res.status(200).json({ results: reportResult })
  } catch (error) {
    next(error)
  }
})

module.exports = router