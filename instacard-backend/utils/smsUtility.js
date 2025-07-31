// const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const axios = require('axios');

async function sendSMS(phone, otp) {
  try {
    let data = JSON.stringify({
      "variables_values": otp,
      "route": "otp",
      "numbers": phone
    });

    console.log(data);

    const apiKey = process.env.FAST2SMS_ACCESS_TOKEN;
    const endpointUrl = process.env.FAST2SMS_ENDPOINT;

    const response = await axios.post(endpointUrl, data, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log(response.data)
    return response.data;

  } catch (error) {
    console.error('Error while send OTP:', error);
    throw error;
  }
}


module.exports = {
  sendSMS
};