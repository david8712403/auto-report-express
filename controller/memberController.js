const memeberService = require('../service/memberService');
const getMemberList = async (req, res, next) => {
  try {
    res.json({results: await memeberService.getMemberList(req.auth)});
  } catch (error) {
    next(error);
  }
};

const addMemberToOrganization = async (req, res, next) => {
  let role = req.auth.role;
  try {
    // TODO: Implement feature: 組織管理員可以加入使用者到組織內 #9
    res.status(200).json({role: role});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMemberList,
  addMemberToOrganization
};