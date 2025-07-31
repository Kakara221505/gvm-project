const ContactModel = require('../models/ContactUs');
const messages = require('../utils/messages');
const nodemailer = require('nodemailer');


const addContact = async (req, res, next) => {
    try {
        const { Name, Email, Contact, Message } = req.body;

        // Save contact message to the database
        const contactRecord = await ContactModel.create({ Name, Email, Contact, Message });

        // Send an email notification
        await sendContactEmail(contactRecord);

        return res.status(201).json({
            message: messages.success.CONTACT_US_ADDED,
            status: messages.success.STATUS,
        });
    } catch (error) {
        return next(error);
    }
};


async function sendContactEmail(contactRecord) {
    try {
        const { Name, Email, Contact, Message } = contactRecord;

        // Set up the email message content
        const mailOptions = {
            from: process.env.FROM_MAIL, // Replace with your sender email
            to: Email, // Replace with your recipient email
            subject: 'New Contact Message Received',
            html: `
                <p><strong>Name:</strong> ${Name}</p>
                <p><strong>Email:</strong> ${Email}</p>
                <p><strong>Contact:</strong> ${Contact}</p>
                <p><strong>Message:</strong></p>
                <p>${Message}</p>
            `,
        };

        // Create a Nodemailer transporter object
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_ID, // Replace with your Gmail address
                pass: process.env.GMAIL_PASSWORD, // Replace with your Gmail password or app password
            },
        });

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Contact email sent successfully!');
    } catch (error) {
        console.error('Error sending contact email:', error);
    }
}

module.exports = {
    addContact,
};

module.exports = {
    addContact
};
