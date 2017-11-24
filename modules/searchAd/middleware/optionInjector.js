module.exports = function(req, res, next) {
  req.searchAdOptions = {
    method: req.method,
    endPoint: req.path,
    qs: req.query,
    body: req.body
  };

  next();
};