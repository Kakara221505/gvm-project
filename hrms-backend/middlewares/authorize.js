const messages = require("../utils/messages");

function authorize(roles) {
  return function (req, res, next) {
    const { role } = req.user;

    if (!roles.includes(role)) {
      return res.status(403).json({ message: messages.error.FORBIDDEN });
    }

    next();
  };
}

module.exports = authorize;
