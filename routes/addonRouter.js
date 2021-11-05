const axios = require('axios')
const express = require('express')
const { authenticationToken } = require('../middleware/auth')
const router = express.Router('')

// 取得組織內成員清單
router.post('/slack/remind', authenticationToken, async (req, res, next) => {
  try {
    const { id, organization, role } = req.auth
    if (role !== "admin")
      throw new Error("Only admin can send Slack message")
    let { type, mentions, message } = req.body
    const orgSql = `SELECT * FROM organizations WHERE id = '${organization}'`
    const [orgs] = await req.db.execute(orgSql)
    const webhookUrl = orgs[0].slack_webhook

    const userSql = `SELECT * FROM user_relations
    INNER JOIN (SELECT * FROM users) as users ON user_relations.user_id = users.id
    WHERE users.id IN (${mentions}) AND organization_id = ${organization}`
    const [users] = await req.db.execute(userSql)

    let mentionUserStr = ""
    users.forEach(e => {
      if (e.slack_id)
        mentionUserStr += `<@${e.slack_id}> `
      else
        mentionUserStr += `${e.name} `
    });
    message = message.replace('{}', mentionUserStr)

    // send slack message
    await axios.post(webhookUrl, { text: message })
    res.status(200).json({ message: message })
  } catch (error) {
    next(error)
  }
})

module.exports = router