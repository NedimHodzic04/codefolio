const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized: Please log in via GitHub first." });
  }
};

export default checkAuth;
