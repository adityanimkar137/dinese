const mongoose = require('mongoose');

// Connects our app to MongoDB using the address stored in the .env file.
// async/await lets us write asynchronous code (code that takes time) like normal top-to-bottom code.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection failed:', error.message);
    process.exit(1); // stop the app, nothing works without the database
  }
};

module.exports = connectDB;
