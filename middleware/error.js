function errorHandler(err, req, res, next) {
  console.error(req.originalUrl);
  console.error(err.stack);
  res.status(500).json({ error: err.message });
  next();
}

module.exports = {
  errorHandler
};