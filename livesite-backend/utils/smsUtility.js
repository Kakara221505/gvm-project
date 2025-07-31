// const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const axios = require('axios');

// async function sendSMS(receiver, text) {
//   const sns = new SNSClient({
//     region: process.env.AWS_REGION,
//     credentials: {
//       accessKeyId: process.env.AWS_SNS_KEY,
//       secretAccessKey: process.env.AWS_SNS_SECRET,
//     },
//   });

//   const params = {
//     Message: text,
//     MessageAttributes: {
//       "AWS.SNS.SMS.SMSType": {
//         DataType: "String",
//         StringValue: "Transactional",
//       },
//       "AWS.SNS.SMS.SenderID": {
//         DataType: "String",
//         StringValue: "Live_Site",
//       },
//     },
//     PhoneNumber: receiver,
//   };

//   const command = new PublishCommand(params);

//   sns.send(command)
//     .then((data) => {
//       console.log("message sent:", data.MessageId);
//     })
//     .catch((error) => {
//       console.error(error, error.stack);
//     });
// }

async function sendSMS(phone, otp) {
  // try {
  //   let data = JSON.stringify({
  //     "variables_values": otp,
  //     "route": "otp",
  //     "numbers": phone
  //   });

  //   console.log(data);

  //   const apiKey = process.env.FAST2SMS_ACCESS_TOKEN;
  //   const endpointUrl = process.env.FAST2SMS_ENDPOINT;

  //   const response = await axios.post(endpointUrl, data, {
  //     headers: {
  //       'Authorization': apiKey,
  //       'Content-Type': 'application/json'
  //     }
  //   });
  //   console.log(response.data)
  //   return response.data;

  // } catch (error) {
  //   console.error('Error while send OTP:', error);
  //   throw error;
  // }
}


module.exports = {
  sendSMS
};