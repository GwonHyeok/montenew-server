module.exports = (req, res, next) => {

  if (!req.isAuthenticated()) {
    const err = new Error('인증된 유저만 사용할 수 있는 API 입니다');
    err.status = 401;
    return next(err);
  }

  // Admin, SuperAdmin
  if (req.user.isAdmin) return next();

  // Admin 등급 혹은, SuperAdmin 등급만 사용가능합니다.
  const err = new Error('관리자 등급이 사용할 수 있는 API 입니다');
  err.status = 401;
  return next(err);
};