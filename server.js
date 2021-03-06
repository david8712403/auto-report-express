require('dotenv').config;
const express = require('express');
const { errorHandler } = require('./middleware/error');
const dailyReportRouter = require('./routes/dailyReportRouter');
const memberRouter = require('./routes/memberRouter');
const systemRouter = require('./routes/systemRouter');
const addonRouter = require('./routes/addonRouter');
const db = require('./db');

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());

// TODO: 等各個controller, service完工，就不需要這個middleware了
app.use(async (req, res, next) => {
  try {
    req.db = await db;
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/daily_report', dailyReportRouter);
app.use('/member', memberRouter);
app.use('/addon', addonRouter);
app.use('/system', systemRouter);

app.get('/', (req, res) => {
  res.send('<h1>Auto Report<h1>');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server run on port ${port}`);
});