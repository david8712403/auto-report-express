const db = require('../db');

const getMemberList = async (authPayload) => {
  let sql = `
    SELECT userId, account, userName, email FROM
    (SELECT * FROM 
      (SELECT * FROM user_relations
        WHERE organization_id = ${authPayload.organization}) as dr
      JOIN ( SELECT id as userId, name as userName, email, account FROM users ) as users
    ON users.userId = dr.user_id) as t`;
  const [memberRows] = await db.execute(sql);
  return memberRows;
};

module.exports = {
  getMemberList
};