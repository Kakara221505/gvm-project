const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

function getRandomKey() {
  return uuidv4();
}

function getAESKey(key, publicKey) {
  try {
    const encryptedData = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(key)
    );

    return encryptedData.toString("base64");
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getRandomKey,
  getAESKey,
};
