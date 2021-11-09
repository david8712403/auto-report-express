const express = require('express')
const router = express.Router('')
const { dtFormat } = require('../util/date')

// 取得系統更新日誌
router.get('/logs', async (req, res, next) => {
  try {
    let sql = `
    SELECT * FROM change_logs ORDER BY created DESC`;
    const [logs] = await req.db.execute(sql);
    res.json({
      results: logs
    });
  } catch (error) {
    next(error);
  }
});

// 新增系統更新日誌
router.put('/logs', async (req, res, next) => {
  try {
    const { title, platform, author, content } = req.body
    const now = new Date()
    let sql = `
    INSERT INTO change_logs (title, platform, author, content, created)
    VALUES ('${title ?? ""}', '${platform ?? ""}', '${author ?? ""}', '${content ?? ""}','${dtFormat(now)}')`
    await req.db.execute(sql)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})
module.exports = router
