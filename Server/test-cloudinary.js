require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Test if config is working
console.log('Cloudinary config status:');
console.log('Cloud name:', cloudinary.config().cloud_name ? 'Configured' : 'Not configured');
console.log('API Key:', cloudinary.config().api_key ? 'Configured' : 'Not configured');
console.log('API Secret:', cloudinary.config().api_secret ? 'Configured' : 'Not configured');
