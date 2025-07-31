const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const UserRoleModel = require("../models/UserRole"); // Fix incorrect import
const messages = require("../utils/messages");

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: messages.error.AUTH_TOKEN_NOT_FOUND });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user using the decoded ID, and populate UserRoleID to get role name
    const user = await UserModel.findOne({ _id: decoded._id, isDeleted: false })
      .populate("userRoleID", "name")
      .select("+publicKey");

    if (!user) {
      return res.status(401).json({ message: messages.error.AUTH_FAILED });
    }

    // Extract role name from populated data
    const role = user.userRoleID ? user.userRoleID.name.toLowerCase() : null;

    // Attach user data to request object
    req.user = {
      id: user._id,
      _id: user._id,
      email: user.email,
      role, // Corrected role assignment
      name: user.name,
      publicKey: user.publicKey,
    };

    next();
  } catch (error) {
    console.error("Error in authenticate middleware:", req.headers.authorization?.split(" ")[1], error);
    return res.status(401).json({ message: messages.error.AUTH_FAILED });
  }
}

module.exports = authenticate;
