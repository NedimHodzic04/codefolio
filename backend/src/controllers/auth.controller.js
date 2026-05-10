export const githubCallback = (req, res) => {
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  });
};

export const logout = (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
};

export const debugSession = (req, res) => {
  if (process.env.NODE_ENV !== "production") {
    return res.json({
      ok: true,
      env: process.env.NODE_ENV,
      sessionID: req.sessionID,
      hasSession: Boolean(req.session),
      isSecure: req.secure,
      forwardedProto: req.get("x-forwarded-proto"),
    });
  }
  return res.status(404).json({ message: "Not found" });
};
