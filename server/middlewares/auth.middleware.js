export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ code: "UNAUTHORIZED" });
  }
  else {
    next();
  }
}


export function requireAuthPage(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/start');
  }
  else {
    next();
  }
}