require('dotenv').config();
const express = require('express');
const { dtFormat } = require('./util/date');
const { authenticationToken } = require('./middleware/auth');
const bcrypt = require('bcrypt');
const db = require('./db');
const { errorHandler } = require('./middleware/error');
const app = express();
const port = process.env.AUTH_SERVER_PORT;

const jwt = require('jsonwebtoken');

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    req.db = await db;
    next();
  } catch (error) {
    next(error);
  }
});

app.post('/sign_up', async (req, res, next) => {
  try {
    const now = new Date();
    const { account, name, email, password } = req.body;
    // 確認是否有資訊重複或存在
    const [userRows] = await req.db.execute(
      `SELECT * FROM users WHERE account = '${account}' OR email = '${email}';`);
    if (userRows.length !== 0)
      throw new Error('account or email already exist');

    // 建立帳號
    const pwdHashed = bcrypt.hashSync(password, 9487);
    await req.db.execute(`
    INSERT INTO users (account, name, email, password, created, updated)
    VALUES	('${account}', '${name}', '${email}', '${pwdHashed}', '${dtFormat(now)}', '${dtFormat(now)}');`);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

app.post('/login', async (req, res, next) => {
  // authentication user
  try {
    const { account, password } = req.body;
    const [users] = await req.db
      .execute(`SELECT * FROM users WHERE account = '${account}';`);
    if (users.length === 0)
      throw new Error('Account not found');

    const user = users[0];
    if (!bcrypt.compareSync(password, user.password))
      throw new Error('Invalid password');

    const orgCheckSql = 
    `SELECT * FROM user_relations
    JOIN organizations ON user_relations.organization_id = organizations.id
    WHERE user_id = ${user.id};`;
    const [userRelateRows] = await req.db.execute(orgCheckSql);
    if (userRelateRows.length === 0) {
      res.status(404).json({ error: 'No organization found, please contact your manager' });
      return;
    }

    const now = new Date();
    const payload = { id: user.id, account: user.account };
    const [tokens] = await req.db
      .execute(`SELECT * FROM tokens WHERE user_id = '${user.id}' AND valid = "Y";`);
    if (tokens.length) {
      const updateSql = `UPDATE tokens 
        SET updated = '${dtFormat(now)}',
        refreshCount = refreshCount + 1 
      WHERE id = ${tokens[0].id};`;
      await req.db.execute(updateSql);
      res.json({
        id: user.id,
        account: user.account,
        accessToken: generateAccessToken(payload),
        refreshToken: tokens[0].value,
        orgName: userRelateRows[0].name
      });
      return;
    }
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    await req.db.execute(`INSERT INTO tokens (user_id, value, created, updated)
      VALUES (${user.id}, '${refreshToken}', '${dtFormat(now)}', '${dtFormat(now)}');`);
    res.json({
      id: user.id,
      account: user.account,
      accessToken: accessToken,
      refreshToken: refreshToken,
      orgName: userRelateRows[0].name
    });

  } catch (error) {
    next(error);
  }
});

app.post('/logout', async (req, res, next) => {
  try {
    const token = req.body.token;
    await req.db.execute(`SELECT * FROM tokens WHERE value = '${token}' AND valid != 'N';`);
    // if (tokenRows.length === 0)
    //   throw new Error("Logout failed")

    await req.db.execute(
      `UPDATE tokens SET valid = 'N' WHERE value = '${token}';`);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

app.post('/token', async (req, res) => {
  const refreshToken = req.body.token;
  const [tokenRows] = await req.db
    .execute(`SELECT * FROM tokens WHERE value = '${refreshToken}' AND valid != 'N';`);
  if (tokenRows.length === 0) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
    async (err, payload) => {
      payload.iat = Math.round(new Date().getTime() / 1000);
      if (err) return res.status(403).json({ error: err });
      const accessToken = generateAccessToken(payload);
      // increase refresh count
      await req.db.execute(`UPDATE tokens
      SET refreshCount = refreshCount + 1
      WHERE id = '${tokenRows[0].id}';`);
      res.json({ accessToken: accessToken });
    });
});

app.post('/reset_password', authenticationToken, async (req, res, next) => {
  try {
    const now = new Date();
    const { oldPassword, newPassword } = req.body;
    const { id } = req.auth;
    console.log(req.body);
    // 確認是否有資訊重複或存在
    const [userRows] = await req.db.execute(
      `SELECT * FROM users WHERE id = '${id}';`);
    if (userRows.length === 0)
      throw new Error('account not found');

    // 驗證舊密碼
    if (!bcrypt.compareSync(oldPassword, userRows[0].password))
      throw new Error('Invalid password');
    const pwdHashed = bcrypt.hashSync(newPassword, 9487);

    // Update password
    await req.db.execute(`UPDATE users
    SET password = '${pwdHashed}', updated = '${dtFormat(now)}'
    WHERE id = '${userRows[0].id}';`);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
}

app.listen(port, () => {
  console.log(`auth server run on port ${port}...`);
});