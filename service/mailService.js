var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SYSTEM_EMAIL,
    pass: process.env.SYSTEM_EMAIL_PWD
  }
});

const getNewReportContent = (to, dailyReport) => {
  const reportText = dailyReport.content.replace(/\n/g, '<br>');
  console.log(reportText);
  let html = `<div>Hi ${to.name}! 已收到您${dailyReport.date}的進度🎉</div><br>`;
  html += '<div>進度內容為:<div>';
  html += `<strong">${reportText}</strong>`;
  const emailContent = {
    from: `Auto Report <${process.env.SYSTEM_EMAIL}@gmail.com>`,
    to: to.email,
    subject: '已收到您的進度回報!🎉',
    html: html
  };
  return emailContent;
};

module.exports = {
  transporter,
  getNewReportContent
};