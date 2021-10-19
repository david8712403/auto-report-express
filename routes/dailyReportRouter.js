const express = require('express')
const { authenticationToken } = require('../middleware/auth')
const router = express.Router('')

router.get('/', authenticationToken, (req, res) => {
    console.log(req.auth)
    res.send("Daily Report List")
})

module.exports = router