// 用來移除json資料中為Null的值
const rmNullValue = (json) => {
    return JSON.parse(JSON.stringify(json),
        (key, value) => { if (value !== null) return value })
}

module.exports = {
    rmNullValue
}