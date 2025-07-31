const nodemailer = require('nodemailer');

async function sendEmailOTP(email, OTP) {

  // Set up the email message with the code
  const mailOptions = {
    from: process.env.FROM_MAIL, // replace with your own email address
    to: email, // replace with the user's email address
    subject: 'Verification Code',
    html: `<p>Hi there,</p><p>Your verification code is:</p><h1>${OTP}</h1><p>Best regards,</p><p>CoolBro</p>`
  };

  // Create a Nodemailer transporter object For Gmail
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.GMAIL_ID, // replace with your own Gmail address
  //     pass: process.env.GMAIL_PASSWORD // replace with your own Gmail password
  //   }
  // });

  // Create a Nodemailer transporter object For GoDaddy
  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASSWORD
    },
  });

  // Send the email message
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


module.exports = { sendEmailOTP };