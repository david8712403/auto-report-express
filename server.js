require('dotenv').config
const express = require("express");
const { errorHandler } = require('./middleware/error')
const dailyReportRouter = require('./routes/dailyReportRouter')
const db = require('./db')

const app = express()
const port = 3000

app.use(express.json())

app.use(async (req, res, next) => {
  try {
    req.db = await db
    next()
  } catch (error) {
    next(error)
  }
})

app.use('/daily_report', dailyReportRouter)

app.get('/', (req, res) => {
  res.send("<h1>Auto Report<h1>")
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`server run on port ${port}`)
})