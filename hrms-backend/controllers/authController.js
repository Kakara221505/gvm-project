const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const EmployeeModel = require("../models/Employee");
const messages = require("../utils/messages");
const commonFunctions = require("../utils/commonFunctions");
const { sendEmailOTP } = require("../utils/emailUtility");
const XLSX = require("xlsx");
const fs = require("fs");

  // Add Employee  
  async function employeeAdd(req, res, next) {
    try {
      const {
        First_name,
        Last_name,
        Email,
        Phone,
        Date_of_birth,
        Date_of_join,
        Designation,
        Branch,
        Department,
        Experience,
        Password,
        Skills,
        Role,
        Report_To,
        Alternate_Email,
        Alternate_Phone
      } = req.body;
  
      // Handle file upload
      let file = "";
      if (req.file) {
        file = `${process.env.EMPLOYEE_MEDIA_ROUTE}${req.file.filename}`;
      }
  
      // Check if email already exists
      const existingEmployee = await EmployeeModel.findOne({ Email ,Is_deleted:false });
      if (existingEmployee) {
        return res
          .status(409)
          .json({ message: messages.error.EMAIL_EXISTS });
      }
  
      // Validate Role
      if (!["ADMIN", "USER"].includes(Role) && Role !== undefined) {
        return res
          .status(400)
          .json({ message: messages.error.INVALID_ROLE });
      }
      
  
      // Calculate Leave Balance based on joining date
      let Leave_Balance = 0;
      if (Date_of_join) {
        const joiningMonth = new Date(Date_of_join).getMonth(); // 0 = January
        const leavePolicy = [18, 18, 18, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        Leave_Balance = leavePolicy[joiningMonth];
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(Password, 10);
  
      // Generate OTP and expiration time
      let otp = null;
      let expirationTime = null;
      if (Email) {
        otp = commonFunctions.randomFourDigitCode(); // Generate a 4-digit OTP
        expirationTime = new Date(
          Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000 // OTP expiration time
        );
      }
  
      // Generate AccessToken
      const tempAccessToken = jwt.sign({ email: Email }, process.env.JWT_SECRET, {
        expiresIn: "1d", // Token expires in 1 day
      });
  
      const userRoleDBValue = commonFunctions.UserRole[Role];
  
      // Create and save the new employee
      const newEmployee = new EmployeeModel({
        First_name,
        Last_name,
        Email,
        Phone,
        Date_of_birth,
        Date_of_join,
        Designation,
        Branch,
        Department,
        Experience,
        Password: hashedPassword,
        Skills,
        AccessToken: tempAccessToken,
        Otp: otp,
        Otp_expiration_time: expirationTime,
        Role: userRoleDBValue,
        Leave_Balance,
        Image: file,
        Report_To,
        Alternate_Email,
        Alternate_Phone
      });
  
      const savedEmployee = await newEmployee.save();
  
      // Return success response
      return res.status(201).json({
        message: messages.success.EMPLOYEE_CREATED,
        Employee: {
          _id: savedEmployee._id,
          First_name: savedEmployee.First_name,
          Last_name: savedEmployee.Last_name,
          Email: savedEmployee.Email,
          Phone: savedEmployee.Phone,
          Date_of_birth: savedEmployee.Date_of_birth,
          Date_of_join: savedEmployee.Date_of_join,
          Designation: savedEmployee.Designation,
          Report_To: savedEmployee.Report_To,
          Branch: savedEmployee.Branch,
          Department: savedEmployee.Department,
          Experience: savedEmployee.Experience,
          Skills: savedEmployee.Skills,
          AccessToken: savedEmployee.AccessToken,
          Leave_Balance: savedEmployee.Leave_Balance,
          Alternate_Email:savedEmployee.Alternate_Email,
          Alternate_Phone:savedEmployee.Alternate_Phone,
          Image: savedEmployee.Image,

        },
      });
    } catch (error) {
      console.error("Error in employeeAdd:", error);
      return next(error);
    }
  }




const bulkEmployeeAdd = async (req, res, next) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const employees = XLSX.utils.sheet_to_json(worksheet);
    // Extract email addresses from the Excel data
    const excelEmails = employees.map(emp => emp["Email id"]);

   // Check if any of these emails already exist in the database
   const existingEmployees = await EmployeeModel.find({
    Email: { $in: excelEmails },
    Is_deleted: false
  }).lean();

  // Map existing emails to quickly check against the new Excel data
  const existingEmails = new Set(existingEmployees.map(emp => emp.Email));

  // Prepare the data to be inserted (skip existing email records)
  const bulkInsertData = [];
  const duplicateEmails = [];

    for (const emp of employees) {
      // Extract employee data
      const {
        "First Name": First_name,
        "Last Name": Last_name,
        "Email id": Email,
        "Contact No": Phone,
        "Alternate Contact No": Alternate_Phone,
        "Birth Date": Date_of_birth,
        "Joining Date": Date_of_join,
        Designation,
        "Report to": Report_To,
        Branch,
        Department,
        Experience,
        Password,
        Skills,
        Role,
      } = emp;

     // Skip this record if the email already exists in the database
     if (existingEmails.has(Email)) {
        duplicateEmails.push(Email);
        continue; // Skip this iteration and move to the next employee
      }

      // Validate Role
      const validRoles = ["ADMIN", "USER"];
      if (!validRoles.includes(Role)) {
        return res
        .status(400)
        .json({ message: messages.error.INVALID_ROLE });
    }

      // Hash the password
      const hashedPassword = await bcrypt.hash(Password, 10);

      // Calculate Leave Balance based on joining date
      let Leave_Balance = 0;
      if (Date_of_join) {
        const joiningMonth = new Date(Date_of_join).getMonth(); // 0 = January
        const leavePolicy = [18, 18, 18, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        Leave_Balance = leavePolicy[joiningMonth];
      }

      // Prepare employee object for bulk insertion
      bulkInsertData.push({
        First_name,
        Last_name,
        Email,
        Phone,
        Date_of_birth: Date_of_birth ? new Date(Date_of_birth) : null,
        Date_of_join: Date_of_join ? new Date(Date_of_join) : null,
        Designation,
        Report_To,
        Branch,
        Department,
        Experience,
        Password: hashedPassword,
        Skills,
        Role: validRoles.indexOf(Role), // Convert role to integer (0 or 1)
        Leave_Balance,
        Alternate_Phone,
      });
    }

    // Insert employees in bulk
    await EmployeeModel.insertMany(bulkInsertData);

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    // If no new records were added, return a message saying no new records
    if (bulkInsertData.length === 0 && duplicateEmails.length === employees.length) {
        return res.status(409).json({
          message: messages.error.ALL_EMAIL_EXISTS,
          duplicateEmails: duplicateEmails,
        });
      }
  

    return res.status(201).json({
        message: messages.success.EMPLOYEE_CREATED_BY_EXCEL,
      count: bulkInsertData.length,
    });
  } catch (error) {
    console.error("Error in bulkEmployeeAdd:", error);
    return next(error);
  }
};

// Login Employee

async function loginWithPassword(req, res, next) {
  // #swagger.tags = ['Employee']
  // #swagger.description = 'Login employee using password'

  const { Email, Password } = req.body;

  try {
    // Validate the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if the employee exists
    const employee = await EmployeeModel.findOne({ Email, Is_deleted: false });
    if (!employee) {
      return res
        .status(404)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(Password, employee.Password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: messages.error.INVALID_CREDENTIALS });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: employee._id, email: employee.Email },
      JWT_SECRET,
      { expiresIn: "5d" } // Token expires in 5 day
    );

    // Sanitize the employee object
    const sanitizedEmployee = sanitizeEmployee(employee);

    // Respond with the token and employee details
    return res.status(200).json({
      message: messages.success.LOGIN_SUCCESS,
      token,
      Employee: sanitizedEmployee,
    });
  } catch (error) {
    console.error("Error in loginWithPassword:", error);
    return next(error);
  }
}

// Get All Employee

    async function getAllEmployeeData(req, res, next) {
        try {
          const { 
            page = 1, 
            limit = 10, 
            search = "", 
            branch, 
            department, 
            designation 
          } = req.query;
      
          const pageNumber = parseInt(page, 10);
          const pageSize = parseInt(limit, 10);
          
          const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const normalizedSearch = escapedSearch.replace(/\s+/g, '');
          const phoneRegex = new RegExp(`^\\+?(91)?\\s*${normalizedSearch}`, "i");

          const searchQuery = {
            Is_deleted: false,
            $or: [
              { First_name: { $regex: escapedSearch, $options: "i" } },
              { Last_name: { $regex: escapedSearch, $options: "i" } },
              { Email: { $regex: escapedSearch, $options: "i" } },
              { Phone: { $regex: phoneRegex } },
            ],
          };
          
          // Helper to parse comma-separated query params into an array
          const parseToArray = (param) =>
            typeof param === "string" ? param.split(",").map((item) => item.trim()) : param;
      
          // Parse and handle multiple branch, department, and designation filters
          if (branch) {
            const branchArray = parseToArray(branch);
            searchQuery.Branch = { $in: branchArray.map((b) => new RegExp(b, "i")) };
          }
      
          if (department) {
            const departmentArray = parseToArray(department);
            searchQuery.Department = { $in: departmentArray.map((d) => new RegExp(d, "i")) };
          }
      
          if (designation) {
            const designationArray = parseToArray(designation);
            searchQuery.Designation = { $in: designationArray.map((d) => new RegExp(d, "i")) };
          }
      
          const totalRecords = await EmployeeModel.countDocuments(searchQuery);
          const totalPages = Math.ceil(totalRecords / pageSize);
      
          const employees = await EmployeeModel.find(searchQuery)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .select("-AccessToken -Otp -Otp_expiration_time -Is_deleted -Password -Created_at -Updated_at")
            .lean()
            .populate({
              path: "Report_To",
              select: "First_name Last_name", // Include only the needed fields
            });          
      
          const BASE_URL = process.env.BASE_URL || "http://localhost:3005";
          const employeesWithImageURLs = employees.map((employee) => ({
            ...employee,
            Image: employee.Image ? `${BASE_URL}${employee.Image}` : null,
          }));
      
          return res.status(200).json({
            employees: employeesWithImageURLs,
            totalRecords,
            totalPages,
            currentPage: pageNumber,
            limit: pageSize,
          });
        } catch (error) {
          console.error("Error in getAllEmployeeData:", error);
          return next(error);
        }
      }
      
      

 // Export Employee  

 async function exportEmployeeData(req, res, next) {
    try {
      // Extract query parameters for pagination, search, and filters
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        branch, 
        department, 
        designation 
      } = req.query;
  
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
  
      // Construct the search query (searches in First_name, Last_name, and Email)
      const searchQuery = {
        Is_deleted: false,
        $or: [
          { First_name: { $regex: search, $options: "i" } },
          { Last_name: { $regex: search, $options: "i" } },
          { Email: { $regex: search, $options: "i" } },
        ],
      };
  
      if (branch) searchQuery.Branch = { $regex: branch, $options: "i" };
      if (department) searchQuery.Department = { $regex: department, $options: "i" };
      if (designation) searchQuery.Designation = { $regex: designation, $options: "i" };
  
      // Fetch employee data based on the search query
      const employees = await EmployeeModel.find(searchQuery)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .select("-AccessToken -Otp -Otp_expiration_time -Is_deleted -Password -Created_at -Updated_at")
        .lean();
  
      // Add BASE_URL to Image paths
      const BASE_URL = process.env.BASE_URL || "http://localhost:3005";
      const employeesWithImageURLs = employees.map((employee) => ({
        ...employee,
        Image: employee.Image ? `${BASE_URL}${employee.Image}` : null,
      }));
  
      // Create a worksheet and workbook using XLSX
      const worksheet = XLSX.utils.json_to_sheet(employeesWithImageURLs);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
  
      // Write the Excel file to a buffer
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  
      // Set the headers to prompt file download
      res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
      // Send the buffer as a downloadable file
      return res.status(200).send(excelBuffer);
    } catch (error) {
      console.error("Error in exportEmployeeData:", error);
      return next(error);
    }
  }
  
      
      

// Update Employee by ID
async function updateEmployee(req, res, next) {
  try {
    const { employeeId } = req.params; // Get the employeeId from the request params

    const {
      First_name,
      Last_name,
      Email,
      Phone,
      Date_of_birth,
      Date_of_join,
      Designation,
      Branch,
      Department,
      Experience,
      Skills,
      Role,
      Password,
      Report_To,
      Alternate_Phone,
      Alternate_Email,
    } = req.body;
    // Find the employee by ID
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });
    }

    // Update image if a file is provided
    let file = "";
    if (req.file) {
      file = `${process.env.EMPLOYEE_MEDIA_ROUTE}${req.file.filename}`;
      employee.Image = file; // Update image path
    }
    // Validate Role
    if (!["ADMIN", "USER"].includes(Role) && Role !== undefined) {
      return res.status(400).json({ message: messages.error.INVALID_ROLE });
    }

    // Update leave balance if Date_of_join changes
    if (Date_of_join && Date_of_join !== employee.Date_of_join) {
      const joiningMonth = new Date(Date_of_join).getMonth() + 1; // Get the joining month (1-based)
      const leaveRules = {
        1: 18,
        2: 18,
        3: 18,
        4: 9,
        5: 8,
        6: 7,
        7: 6,
        8: 5,
        9: 4,
        10: 3,
        11: 2,
        12: 1,
      };
      employee.Leave_Balance = leaveRules[joiningMonth] || 0; // Calculate leave balance
    }
    const userRoleDBValue = commonFunctions.UserRole[Role];
    // Update provided fields (all are optional)
    if (First_name) employee.First_name = First_name;
    if (Last_name) employee.Last_name = Last_name;
    if (Email) employee.Email = Email;
    if (Phone) employee.Phone = Phone;
    if (Date_of_birth) employee.Date_of_birth = Date_of_birth;
    if (Date_of_join) employee.Date_of_join = Date_of_join;
    if (Designation) employee.Designation = Designation;
    if (Report_To) employee.Report_To = Report_To;
    if (Branch) employee.Branch = Branch;
    if (Department) employee.Department = Department;
    if (Experience) employee.Experience = Experience;
    if (Skills) employee.Skills = Skills;
    if (Role) employee.Role = userRoleDBValue;
    if (Alternate_Email) employee.Alternate_Email = Alternate_Email;
    if (Alternate_Phone) employee.Alternate_Phone = Alternate_Phone;
    if (Report_To) employee.Report_To = Report_To;

    // Hash and update Password if provided
    if (Password) {
      const saltRounds = 10; // Define salt rounds for bcrypt
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
      employee.Password = hashedPassword;
    }

    employee.Updated_at = Date.now(); // Update the timestamp

    // Save the updated employee
    const updatedEmployee = await employee.save();

    return res.status(200).json({
      message: messages.success.EMPLOYEE_UPDATED,
      // Employee: {
      //   _id: updatedEmployee._id,
      //   First_name: updatedEmployee.First_name,
      //   Last_name: updatedEmployee.Last_name,
      //   Email: updatedEmployee.Email,
      //   Phone: updatedEmployee.Phone,
      //   Date_of_birth: updatedEmployee.Date_of_birth,
      //   Date_of_join: updatedEmployee.Date_of_join,
      //   Designation: updatedEmployee.Designation,
      //   ReportTo: updatedEmployee.ReportTo,
      //   Branch: updatedEmployee.Branch,
      //   Department: updatedEmployee.Department,
      //   Experience: updatedEmployee.Experience,
      //   Skills: updatedEmployee.Skills,
      //   Image: updatedEmployee.Image,
      //   Leave_Balance: updatedEmployee.Leave_Balance,
      //   Role: updatedEmployee.Role, // Include updated Role in the response
      // },
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return next(error);
  }
}

// Get Employee by ID
async function getEmployeeById(req, res, next) {
  // #swagger.tags = ['Employee']
  // #swagger.description = 'To get Employee by ID'
  try {
    const { employeeId } = req.params; // Get the employeeId from the request params

    // Find the employee by ID, excluding sensitive fields
    const employee = await EmployeeModel.findById(employeeId).select(
      "-AccessToken -Otp -Otp_expiration_time -Password"
    )
    .populate("Report_To", "First_name Last_name");

    if (!employee) {
      return res
        .status(404)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });
    }

   // Add BASE_URL to Image path
   const BASE_URL = process.env.BASE_URL || "http://localhost:3005";
   const employeeWithDetails = {
     ...employee.toObject(), // Convert to plain object
     Image: employee.Image ? `${BASE_URL}${employee.Image}` : null, // Concatenate BASE_URL with Image path
     Reported_To_Name: employee.Report_To
       ? `${employee.Report_To.First_name} ${employee.Report_To.Last_name}`
       : null, // Concatenate First_name and Last_name of Report_To
   };

   return res.status(200).json({
     Employee: employeeWithDetails,
   });
 } catch (error) {
   console.error("Error getting employee:", error);
   return next(error);
 }
}

// Delete Employee by ID
async function deleteEmployee(req, res, next) {
  // #swagger.tags = ['Employee']
  // #swagger.description = 'To delete Employee by ID'
  try {
    const { employeeId } = req.params; // Get the employeeId from the request params

    // Find the employee and update Is_deleted to true
    const employee = await EmployeeModel.findByIdAndUpdate(
      employeeId,
      { Is_deleted: true }, // Soft delete by setting Is_deleted to true
      { new: true } // Return the updated document
    );
    if (!employee) {
      return res
        .status(404)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });
    }

    return res.status(200).json({ message: messages.success.EMPLOYEE_DELETED });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return next(error);
  }
}

async function requestOTP(req, res, next) {
  try {
    const { email } = req.body;

    // Check if the email exists
    const employee = await EmployeeModel.findOne({
      Email: email,
      Is_deleted: false,
    });
    if (!employee) {
      return res
        .status(400)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });
    }

    // Generate OTP and expiration time
    const code = commonFunctions.randomFourDigitCode();
    const expirationTime = new Date(
      Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
    );

    // Update OTP and expiration in the database
    employee.Otp = code;
    employee.Otp_expiration_time = expirationTime;
    await employee.save();

    // Send OTP via email
    await sendEmailOTP(email, code);

    return res
      .status(200)
      .json({ message: messages.success.OTP_SENT, ID: employee._id });
  } catch (error) {
    console.error("Error in requestOTP:", error);
    return next(error);
  }
}

// 2. Verify OTP API
async function verifyOTP(req, res, next) {
  try {
    const { email, otp } = req.body;

    // Find the employee by email
    const employee = await EmployeeModel.findOne({
      Email: email,
      Is_deleted: false,
    });
    if (!employee) {
      return res
        .status(400)
        .json({ message: messages.error.EMPLOYEE_NOT_FOUND });
    }

    // Check if the OTP is correct
    if (employee.Otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    // Check if the OTP is expired
    if (new Date() > employee.Otp_expiration_time) {
      return res.status(400).json({ message: messages.error.OTP_EXPIRED });
    }

    // Generate access token
    const accessToken = jwt.sign(sanitizeEmployee(employee), JWT_SECRET, {
      expiresIn: "1d",
    });

    // Update employee data
    employee.Otp = null;
    employee.Otp_expiration_time = null;
    employee.AccessToken = accessToken;
    await employee.save();

    // Use the sanitizeEmployee function to sanitize employee data for the response
    const sanitizedEmployee = sanitizeEmployee(employee);

    // OTP is verified
    return res.status(200).json({
      message: messages.success.OTP_VERIFIED,
      AccessToken: accessToken,
      Employee: sanitizedEmployee,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { employeeId, newPassword } = req.body;

    // Find the employee by ID
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee || employee.Is_deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear OTP data
    employee.Password = hashedPassword;
    employee.Otp = null;
    employee.Otp_expiration_time = null;
    await employee.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return next(error);
  }
}

function sanitizeEmployee(employee) {
  const BASE_URL = process.env.BASE_URL || "http://localhost:3005";
  const sanitizedEmployee = { ...employee._doc };
  delete sanitizedEmployee.Password;
  delete sanitizedEmployee.Created_at;
  delete sanitizedEmployee.Updated_at;
  delete sanitizedEmployee.Otp;
  delete sanitizedEmployee.AccessToken;
  delete sanitizedEmployee.Otp_expiration_time;
  delete sanitizedEmployee.notifications;

  // Append BASE_URL to Image field if it exists
  sanitizedEmployee.Image = sanitizedEmployee.Image
    ? `${BASE_URL}${sanitizedEmployee.Image}`
    : null;

  return sanitizedEmployee;
}

// employee dropdown list
async function dropdownValue(req, res, next) {
  try {
    const employees = await EmployeeModel.find();
    const data = employees.map(emp => ({
      _id: emp._id,
      First_name: emp.First_name,
      Last_name: emp.Last_name,
      Email: emp.Email
    }))
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}


module.exports = { 
employeeAdd,
loginWithPassword,
getAllEmployeeData,
updateEmployee,
getEmployeeById,
deleteEmployee,
requestOTP,
verifyOTP,
resetPassword,
bulkEmployeeAdd,
exportEmployeeData,
dropdownValue
};
