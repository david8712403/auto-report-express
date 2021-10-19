require('dotenv').config()
const mysql = require('mysql')

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}
const db = mysql.createConnection(config);

db.connect((err) => {
    if (err)
        console.log(JSON.stringify(err));
    else
        console.log("Connect to database successful");
})

module.exports = db