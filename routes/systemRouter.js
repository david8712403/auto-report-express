const express = require('express')
const router = express.Router('')

// 取得組織內成員清單
router.get('/logs', async (req, res, next) => {
  try {
    let sql = `
    SELECT * FROM change_logs ORDER BY created DESC`
    const [logs] = await req.db.execute(sql)
    res.json({
      results: logs
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router