var nodemailer = require("nodemailer");


exports.sendmail = (email, html, subject) => {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAILEMAIL,
      pass: process.env.GMAILPWD,
    },
  });
  let mailDetails = {
    from: process.env.GMAILEMAIL,
    to: email,
    subject: subject,
    html: html,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("error: ", err);
      return err;
    } else {
      console.log("Email sent");
      return 1;
    }
  });
};
