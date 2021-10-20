require('dotenv').config()
const express = require('express')
const { now } = require('./util/date')
const bcrypt = require('bcrypt')
const db = require('./db')
const app = express()
const port = 4000

const jwt = require('jsonwebtoken')

app.use(express.json())

app.post('/sign_up', (req, res) => {
  const { account, name, email, password } = req.body;
  const sql = `SELECT * FROM users WHERE account = '${account}' OR email = '${email}';`
  // 確認是否有資訊重複或存在
  db.query(sql, (err, results, fields) => {
    if (err) {
      console.log({ error: err })
      res.sendStatus(400)
      return
    }
    if (results.length !== 0) {
      res.status(400).json({ error: "account or email is exist" })
      return
    }
    // 建立帳號
    const pwdHashed = bcrypt.hashSync(password, 9487)
    const insertSql = `
    INSERT INTO users (account, name, email, password, created, updated)
    VALUES	('${account}', '${name}', '${email}', '${pwdHashed}', '${now}', '${now}');
    `
    db.query(insertSql, (err, results, fields) => {
      if (err) {
        res.status = 400
        res.json({ error: err })
        return
      }
      res.sendStatus(201)
    })
  })
})

app.post('/login', async (req, res) => {
  // authentication user
  try {
    const { account, password } = req.body
    const [users, userFields] = await (await db)
      .execute(`SELECT id, account, password FROM users WHERE account = '${account}';`)
    if (users.length === 0) {
      res.status(400).json({ error: "Account not found" })
      return
    }
    const user = users[0]
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(400).json({ error: "Invalid password" })
      return
    }

    const payload = { id: user.id, account: user.account }
    const [tokens, tokenFields] = await (await db)
      .execute(`SELECT value, user_id FROM tokens WHERE user_id = '${user.id}';`)
    if (tokens.length) {
      const accessToken = generateAccessToken(payload)
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
      await (await db).execute(`INSERT INTO tokens (user_id, value, created, updated)
      VALUES (${user.id}, '${refreshToken}', '${now}', '${now}');`)
      res.json({ id: user.id, account: user.account, accessToken: accessToken, refreshToken: refreshToken })
      return
    }
    res.json({ id: user.id, account: user.account, accessToken: generateAccessToken(payload), refreshToken: tokens[0].value })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/logout', (req, res) => {
  // refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(200)
})

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
    (err, payload) => {
      if (err) return res.status(403).json({ error: err })
      const accessToken = generateAccessToken(payload)
      res.json({ accessToken: accessToken })
    })
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
}

app.listen(port, () => {
  console.log(`auth server run on port ${port}...`);
})