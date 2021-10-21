const dtFormat = (datetime) => {
    return datetime.toISOString().slice(0, 19).replace('T', ' ')
}
module.exports = {
    dtFormat
} 