// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./textdrip-gvm-firebase-adminsdk-fbsvc-bec05a8570.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
