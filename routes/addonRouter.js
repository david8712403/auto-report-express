const axios = require('axios')
const express = require('express')
const { authenticationToken } = require('../middleware/auth')
const router = express.Router('')

// 取得組織內成員清單
router.post('/slack/remind', authenticationToken, async (req, res, next) => {
  try {
    const { id, organization, role } = req.auth
    const { type, mentions, message } = req.body
    const orgSql = `SELECT * FROM organizations WHERE id = '${organization}'`
    const [orgs] = await req.db.execute(orgSql)
    const webhookUrl = orgs[0].slack_webhook
    console.log(webhookUrl);
    // const userSql = `SELECT * FROM users WHERE id IN (${mentions})`
    // const [users] = await req.db.execute(userSql)
    // console.log(userSql);
    // console.log(users);
    axios.post(webhookUrl, {
      text: message
    })
    res.sendStatus(200)
    console.log(req.auth);
  } catch (error) {
    next(error)
  }
})

module.exports = router