require('dotenv').config()
const express = require('express')
const { dtFormat } = require('./util/date')
const bcrypt = require('bcrypt')
const db = require('./db')
const { errorHandler } = require('./middleware/error')
const app = express()
const port = 4000

const jwt = require('jsonwebtoken')

app.use(express.json())

app.use(async (req, res, next) => {
  try {
    req.db = await db
    next()
  } catch (error) {
    next(error)
  }
})

app.post('/sign_up', async (req, res, next) => {
  try {
    const now = new Date()
    const { account, name, email, password } = req.body;
    // 確認是否有資訊重複或存在
    const [userRows, userFields] = await req.db.execute(
      `SELECT * FROM users WHERE account = '${account}' OR email = '${email}';`)
    if (userRows.length !== 0)
      throw new Error("account or email already exist")

    // 建立帳號
    const pwdHashed = bcrypt.hashSync(password, 9487)
    await req.db.execute(`
    INSERT INTO users (account, name, email, password, created, updated)
    VALUES	('${account}', '${name}', '${email}', '${pwdHashed}', '${dtFormat(now)}', '${dtFormat(now)}');`)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

app.post('/login', async (req, res, next) => {
  // authentication user
  try {
    const { account, password } = req.body
    const [users, userFields] = await req.db
      .execute(`SELECT id, account, password FROM users WHERE account = '${account}';`)
    if (users.length === 0)
      throw new Error("Account not found")

    const user = users[0]
    if (!bcrypt.compareSync(password, user.password))
      throw new Error("Invalid password")

    const now = new Date()
    const payload = { id: user.id, account: user.account }
    const [tokens, tokenFields] = await req.db
      .execute(`SELECT value, user_id FROM tokens WHERE user_id = '${user.id}';`)
    if (tokens.length) {
      await req.db.execute(`UPDATE tokens SET updated = '${dtFormat(now)}' WHERE value = '${tokens[0].value}';`)
      res.json({
        id: user.id,
        account: user.account,
        accessToken: generateAccessToken(payload),
        refreshToken: tokens[0].value
      })
      return
    }
    const accessToken = generateAccessToken(payload)
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
    await req.db.execute(`INSERT INTO tokens (user_id, value, created, updated)
      VALUES (${user.id}, '${refreshToken}', '${dtFormat(now)}', '${dtFormat(now)}');`)
    res.json({
      id: user.id,
      account: user.account,
      accessToken: accessToken,
      refreshToken: refreshToken
    })

  } catch (error) {
    next(error)
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

app.use(errorHandler)

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
}

app.listen(port, () => {
  console.log(`auth server run on port ${port}...`);
})