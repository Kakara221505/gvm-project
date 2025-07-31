

function randomFourDigitCode() {
    return Math.floor(1000 + Math.random() * 9000);
}
function randomSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000);
}


//==========CONST================

const LoginTypeEnum = {
    EMAIL: '0',
    PHONE: '1',
    SOCIAL: '2',
    USERNAME:'0'
};

const UserRole = {
    ADMIN: '1',
    USER: '2'
};

  





module.exports = {
    randomFourDigitCode,
   
    UserRole,
    LoginTypeEnum,
    randomSixDigitCode,
    constants: {
        OTP_EXPIRATION_SECONDS: 180,
    }
};
