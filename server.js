require('dotenv').config
const express = require("express");
const dailyReportRouter = require('./routes/dailyReportRouter')

const app = express()
const port = 3000

app.use(express.json())

app.use('/daily_report', dailyReportRouter)

app.get('/', (req, res) => {
    res.send("<h1>Auto Report<h1>")
})

app.listen(port, () => {
    console.log(`server run on port ${port}`)
})