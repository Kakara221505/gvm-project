// const twilio = require("twilio");

// Retrieve credentials from environment variables
const apiKeySid = process.env.TWILIO_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client using Account SID and Auth Token
// const client = new twilio(apiKeySid, authToken);

// Function to send OTP via Twilio SMS
async function sendSMS(phone, OTP) {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${apiKeySid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic U0tkZTVjYzFiMGQ5ODZiMDVkMzQzYzI5MWZhZTk2OTZiNDpjdjk2d3NKZHRab3ZMY0NNc1B6aGIybk5MMTAzWTlnUg==",
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: phone,
          Body: `${OTP} is your Jnto OTP. Do not share it with anyone.`,
        }),
      }
    );
    const message = await response.json();

    return message; // Return the message response from Twilio
  } catch (error) {
    console.error("Error while sending OTP via Twilio:", error);
    // If Twilio throws an error due to invalid phone number
    if (
      error.code === 21211 || // Twilio specific code for "Invalid 'To' Phone Number"
      (error.message.includes("Invalid") &&
        error.message.includes("Phone Number"))
    ) {
      // You can throw a custom error that you catch in the controller
      const customError = new Error("Invalid phone number provided.");
      customError.statusCode = 400;
      throw customError;
    }
    const customError = new Error("Error sending OTP.");
    customError.statusCode = 400;
    throw customError;

    // throw error;
  }
}

module.exports = {
  sendSMS,
};
