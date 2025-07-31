module.exports = {
  db: {
    production: {
      uri: process.env.MONGO_URI_PROD,
    },
    vivekProduction: {
      uri: process.env.MONGO_URI_VIVEK_PROD,
    },
    development: {
      uri: process.env.MONGO_URI_DEV,
    },
    local: {
      uri: process.env.MONGO_URI_LOCAL,
    },
    test: {
      uri: 'mongodb://localhost:27017/aitextdrip',
    },
  },
  jwtSecret: process.env.JWT_SECRET,
  saltRounds: 10,
};
