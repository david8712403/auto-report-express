const reportService = require('../service/dailyReportService');

const getDailyReport = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const { organization } = req.auth;
    const [reportRows] = await reportService.getReport({
      organization: organization,
      startDate: startDate,
      endDate: endDate,
      userId: userId
    });
    res.json({ results: reportRows });
  } catch (error) {
    next(error);
  }
};

const createDailyReport = async (req, res, next) => {
  try {
    const { id, organization } = req.auth;
    const { content, date } = req.body;
    if (!(content && date)) {
      res.status(400).json({ error: 'content, date can not be empty' });
      return;
    }
    const [reports] = await reportService.getReport({
      organization: organization,
      userId: id,
      startDate: date,
      endDate: date
    });
    if (reports.length !== 0) {
      res.status(400).json({ error: `daily report in ${date} already exist` });
      return;
    }

    await reportService.createReport({
      id: id,
      organization: organization,
      content: content,
      date: date
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const deleteDailyReport = async (req, res, next) => {
  try {
    const { id, organization } = req.auth;
    const { date } = req.body;
    const [reports] = await req.db.execute(`SELECT * FROM daily_reports
        WHERE user_id = ${id} AND
        organization_id = ${organization} AND
        date = '${date}'`);
    if (reports.length === 0) {
      res.status(400).json({ error: `daily report in ${date} not found` });
      return;
    }
    await reportService.deleteReport({ id: reports[0].id });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyReport,
  createDailyReport,
  deleteDailyReport
};