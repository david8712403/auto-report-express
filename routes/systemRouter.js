const express = require('express');
const router = express.Router('');
const { authenticationTokenWithAdmin } = require('../middleware/auth');
const { getSystemLog, createSystemLog, getSystemStatisticData, debugSql } = require('../controller/systemController');

// 取得系統更新日誌
router.get('/logs', getSystemLog);

// 新增系統更新日誌
router.put('/logs', createSystemLog);

router.get('/statistic', getSystemStatisticData);

router.post('/debug', authenticationTokenWithAdmin, debugSql);
module.exports = router;
