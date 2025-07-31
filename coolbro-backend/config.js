module.exports = {
    db: {
      production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        dialect: 'mysql',
        logging: false,
      },
      development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        dialect: 'mysql',
        logging: false,
      },
      local: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        dialect: 'mysql',
        logging: false,
      },
      test: {
        username: 'root',
        password: 'Admin@123',
        database: 'CoolBro',
        host: 'localhost',
        dialect: 'mysql',
        logging: false,
      },
    },
    jwtSecret: process.env.JWT_SECRET,
    saltRounds: 10,
  };