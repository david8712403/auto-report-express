require('dotenv').config()
const express = require('express')
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
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
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

app.post('/login', (req, res) => {
  // authentication user
  const { account, password } = req.body
  db.query(`SELECT id, account, password FROM users WHERE account = '${account}';`,
    (err, results, fields) => {
      if (err) {
        res.status(400).json({ error: err })
        return
      }
      if (results.length === 0) {
        res.status(400).json({ error: "Account not found" })
        return
      }
      const { id, account } = results[0]
      if (!bcrypt.compareSync(password, results[0]['password'])) {
        res.status(400).json({ error: "Invalid password" })
        return
      }
      const payload = { id: id, account: account }
      const accessToken = generateAccessToken(payload)
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
      res.json({ id: id, account: account, accessToken: accessToken, refreshToken: refreshToken })
    }
  )
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
      if (err) return res.sendStatus(403)
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