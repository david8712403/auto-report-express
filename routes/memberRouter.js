const express = require('express')
const { authenticationToken } = require('../middleware/auth')
const router = express.Router('')

// 取得組織內成員清單
router.get('/', authenticationToken, async (req, res, next) => {
  try {
    const { organization } = req.auth

    let sql = `
    SELECT userId, account, userName, email FROM
    (SELECT * FROM 
      (SELECT * FROM user_relations
        WHERE organization_id = ${organization}) as dr
      JOIN ( SELECT id as userId, name as userName, email, account FROM users ) as users
    ON users.userId = dr.user_id) as t`
    const [memberRows] = await req.db.execute(sql)
    res.json({
      results: memberRows
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router