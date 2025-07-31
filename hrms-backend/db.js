const mongoose = require('mongoose');
const { db } = require('./config');
const env = process.env.NODE_ENV || 'local';
const { uri } = db[env];

const connectDB = async () => {
  try {
    console.log("jkjjk",uri)
    await mongoose.connect(uri, {
      useNewUrlParser: true, // Use updated connection parser
    });
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
