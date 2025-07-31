const nodemailer = require("nodemailer");

async function sendEmailOTP(email, OTP) {
  // Set up the email message with the code
  const mailOptions = {
    from: process.env.FROM_MAIL, // replace with your own email address
    to: email, // replace with the user's email address
    subject: "Verification Code",
    html: `<p>Hi there,</p><p>Your verification code is:</p><h1>${OTP}</h1><p>Best regards,</p><p>GVM</p>`,
  };

  // Create a Nodemailer transporter object For Gmail
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.GMAIL_ID, // replace with your own Gmail address
  //     pass: process.env.GMAIL_PASSWORD // replace with your own Gmail password
  //   }
  // });

  // Create a Nodemailer transporter object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_ID, // Replace with your own Gmail address
      pass: process.env.GMAIL_PASSWORD, // Replace with your own Gmail password
    },
  });

  // Send the email message
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + email);
    }
  });
}

async function sendEmailTo(recipients, subject, content) {
  try {
    // Ensure recipients are formatted as an array
    const toEmails = Array.isArray(recipients) ? recipients : [recipients];

    // Default CC emails to be included in every email
    const defaultCCEmails = [
      "career1@gvmtechnologies.com",
      "hardi1@gvmtechnologies.com",
      "sweta1@gvmtechnologies.com",
    ];
    // Combine the recipients with the CC emails
    const allEmails = {
      to: toEmails.join(","),
      cc: defaultCCEmails.join(","), // Add the default CC emails
    };

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail service or another provider
      auth: {
        user: process.env.GMAIL_ID, // Your Gmail address
        pass: process.env.GMAIL_PASSWORD, // Your Gmail password
      },
    });

    // Set up the email message options
    const mailOptions = {
      from: process.env.FROM_MAIL || "no-reply@company.com", // Replace with your email address
      to: allEmails.to, // To recipients
      cc: allEmails.cc, // CC recipients (default)
      subject, // Email subject
      html: content, // Email body content (HTML format)
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${toEmails.join(", ")}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email.");
  }
}



module.exports = {
  sendEmailOTP,
  sendEmailTo
};
