const db = require('../db');
const { dtFormat } = require('../util/date');

const getReport = async ({ organization, startDate, endDate, userId }) => {
  // const defaultStartDate = date.format(new Date(2021, 1, 1), 'Y-MM-DD');
  let condition = '';
  if (organization) condition += `AND organization_id = ${organization} `;
  if (startDate) condition += `AND date >= '${startDate}' `;
  if (endDate) condition += `AND date <= '${endDate}' `;
  if (userId) condition += `AND user_id = ${userId} `;
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
    JOIN (SELECT * FROM daily_reports WHERE TRUE ${condition}) d
      ON d.user_id = u.id
    JOIN (SELECT * FROM user_relations WHERE organization_id = ${organization}) AS r
      ON r.user_id = u.id
    ORDER BY d.created DESC`;
  return await db.execute(sql);
};

const createReport = async (data) => {
  const now = dtFormat(new Date());
  const { id, organization, content, date } = data;
  const insertSql = `INSERT INTO daily_reports (user_id, organization_id, content, date, created)
  VALUES (${id}, ${organization}, '${content}', '${date}', '${now}')`;
  return await db.execute(insertSql);
};

const deleteReport = async (data) => {
  const { id } = data;
  const updateSql = `DELETE FROM daily_reports
  WHERE id = ${id}`;
  await db.execute(updateSql);
};

module.exports = {
  getReport,
  createReport,
  deleteReport
};