const dotenv = require('dotenv');
dotenv.config();

// These are the EXACT names as they appear in your .env file
const requiredEnv = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'YOUTUBE_API_KEY'];

// Validation: Ensure the app has what it needs to run
requiredEnv.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`FATAL ERROR: Environment variable ${name} is missing. Please check your .env file.`);
  }
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

  // Mapping: .env name -> App name
  MONGODB_URI: process.env.MONGO_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Adding these in case you need them for other features later
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};
