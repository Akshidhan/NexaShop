const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: 'dws8iygw5',
  api_key: '618867573431993',
  api_secret: 'N0yV4qV3QmFj3kSxwWKcPyaRHGQ'
});

module.exports = cloudinary;