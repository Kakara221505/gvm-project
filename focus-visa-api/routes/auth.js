const express = require('express');
const Auth = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../helper/Sendemail')
// var fetchUser =require('../middleware/fetchUser')



//Create  a User using: Post "/api/auth/createUser"
router.post('/createUser', [
    // body('email', 'Enter Valid Email').isEmail(),
    // body('password', 'Password must be 5 charector').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check  wheater the email allready is there
    try {
        let user = await Auth.findOne({ email: req.body.email });
        if (user) {
            return res.status(200).json({ status: "fail", statuscode: 200, message: "Email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await Auth.create({
            fullName: req.body.fullName,
            mobileNo: req.body.mobileNo,
            password: secPass,
            email: req.body.email
        })
        const data = {
            user_id: user.id
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "365d" })
        if (user) {
            var htmlContent = `<h2>Click here to activate your account</h2>
  <a href=${process.env.SERVER_URL}/api/auth/activate-email?token=${authToken}>Click here to activate account</a>`;
            sendEmail.sendmail(
                req.body.email,
                htmlContent,
                "Visa-app : Account activation link",
                "E-mail verification"
            );
            res.json({
                statuscode: 200,
                status: "success",
                message: "Registration Successfully Done, Email Verification link sends to your email id. Without verification, the user can't able to log in.",
                // data: { token: authToken },
            });
        }


        // res.status(200).send({status:"success",statuscode: 200,data:{meassage:"Signup Successfully",token:authToken}})
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send({ status: "fail", statuscode: 500, message: "Internal Server Error" })
    }
})

//Create by social media a User using: Post "/api/auth/loginSocialMedia"

router.post('/loginSocialMedia', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check  wheater the email allready is there
    try {
        let user = await Auth.findOne({ email: req.body.email });
        if (user) {
            if (user && user.isEmailverfied) {
                const data = {
                    user_id: user.id
                }
                const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1d" })
                return res.json({
                    statuscode: 200,
                    status: "success",
                    message: "Login successfully",
                    data: { token: authToken },
                });
            }
            else {
                return res.json({
                    statuscode: 200,
                    status: "error",
                    message: "Email verification pending",

                });
            }
        }
        else {
            user = await Auth.create({
                fullName: req.body.fullName,
                mobileNo: req.body.mobileNo,
                password: null,
                email: req.body.email
                // req.body.password?secPass:

            })
            const data = {
                user_id: user.id
            }
            const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "365d" })
          
                user.isEmailverfied = true;
                user.emailVerfiedAt = new Date();
                let user1 = await user.save();
                res.json({
                    statuscode: 200,
                    status: "success",
                    message: "Signup successfully",
                    // data: { token: authToken },
                });
            

        }
        // res.status(200).send({status:"success",statuscode: 200,data:{meassage:"Signup Successfully",token:authToken}})
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send({ status: "error", statuscode: 500, message: "internal server error" })
    }
})

// Email Activation link 
router.get("/activate-email", async (req, res) => {
    const { token } = req.query;
    console.log(token)
    if (token) {
        try {
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                async function (err, decodetoken) {
                    if (err) {
                        res.json({
                            statuscode: 200,
                            status: "error",
                            message: "incorrect or expired link",
                        });
                    }
                    console.log(decodetoken)
                    const { user_id } = decodetoken;
                    const userDetail = await Auth.findOne({ _id: user_id, });
                    if (userDetail) {
                        userDetail.isEmailverfied = true;
                        userDetail.emailVerfiedAt = new Date();
                        let user = await userDetail.save();
                        res.json({
                            statuscode: 200,
                            status: "success",
                            message: "Email Verified",
                        })
                    } else {
                        res.json({
                            statuscode: 200,
                            status: "error",
                            message: "account not found",
                        });
                    }
                }
            );
        } catch (err) {
            return res.json({
                statuscode: 500,
                status: "Internal server error",
                message: err.message,
                err: err,
            });
        }
    } else {
        res.json({
            statuscode: 500,
            status: "error",
            message: "something went wrong",
        });
    }
});





//Authenticate  a User using: Post "/api/auth/login"
router.post('/login', [

    // body('email', 'Enter Valid Email').isEmail(),
    // body('password', 'Password can not be blank').exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email,password}= req.body
    try {
        let user = await Auth.findOne({ email: req.body.email });
        if (!user) {
            return res.json({
                statuscode: 200,
                status: "error",
                message: "User Not Exist",
            });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(200).json({ status: "error", statuscode: 200, message: "Please enter correct userId password" });
        }
        if (
            user.isEmailverfied == false
        ) {
            return res.json({
                statuscode: 200,
                status: "fail",
                message: "account not activated",
            });
        }
        const payload = {
            user_id: user.id
        }
        const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" })
        // console.log(jwtData)
        res.status(200).send({ status: "success", statuscode: 200, message: "Login Successfully", data: { token: authToken } })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send({ status: "fail", statuscode: 500, message: "Internal Server Error" })
    }

})





module.exports = router