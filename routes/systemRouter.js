const express = require('express');
const router = express.Router('');
const { getSystemLog, createSystemLog, getSystemStatisticData } = require('../controller/systemController');

// 取得系統更新日誌
router.get('/logs', getSystemLog);

// 新增系統更新日誌
router.put('/logs', createSystemLog);

router.get('/statistic', getSystemStatisticData);
module.exports = router;
