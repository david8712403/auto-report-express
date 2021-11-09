const { dtFormat } = require('../util/date')
const date = require('date-and-time');
const { rmNullValue } = require('../util/json')

const getDailyReport = async (req, res, next) => {
  try {
    const defaultStartDate = date.format(new Date(2021, 1, 1), "Y-MM-DD")
    const defaultEndDate = date.format(new Date(), "Y-MM-DD")
    const { startDate, endDate } = req.query
    const { organization } = req.auth

    let sql = `
    SELECT
      d.id,
      u.id AS userId,
      u.name AS userName,
      d.content,
      d.date,
      d.created,
      d.updated
    FROM users u
    JOIN (SELECT * FROM daily_reports WHERE organization_id = ${organization} AND 
      date >= '${startDate ?? defaultStartDate}' AND
      date <= '${endDate ?? defaultEndDate}') d
      ON d.user_id = u.id
    JOIN (SELECT * FROM user_relations WHERE organization_id = ${organization}) AS r
      ON r.user_id = u.id
    ORDER BY d.created DESC`
    const [reportRows] = await req.db.execute(sql)
    res.json({
      results: reportRows
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDailyReport
}