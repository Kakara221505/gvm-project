const jwt = require("jsonwebtoken");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const { designationAdd } = require("../controllers/designationController");

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: messages.error.AUTH_TOKEN_NOT_FOUND });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the employee using the decoded ID
    const employee = await EmployeeModel.findById(decoded.id);

    if (!employee) {
      return res.status(401).json({ message: messages.error.AUTH_FAILED });
    }

    req.user = {
      id: employee._id,
      email: employee.Email,
      role: employee.Role === 0 ? "ADMIN" : "USER", 
      name: employee.First_name + " " + employee.Last_name,
      designation: employee.Designation
    };

    next();
  } catch (error) {
    console.error("Error in authenticate middleware:", error);
    return res.status(401).json({ message: messages.error.AUTH_FAILED });
  }
}

module.exports = authenticate;
