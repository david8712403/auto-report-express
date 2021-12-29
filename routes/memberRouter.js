const express = require('express');
const { authenticationToken, authenticationTokenWithAdmin } = require('../middleware/auth');
const router = express.Router('');
const {
  getMemberList,
  addMemberToOrganization
} = require('../controller/memberController');

// 取得組織內成員清單
router.get('/', authenticationToken, getMemberList);

// 加入成員至組織
router.put('/', authenticationTokenWithAdmin, addMemberToOrganization);

module.exports = router;