const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
    {
        sellerName: {
            type: String,
            required: true
        },
        sellerDescription: String,
        sellerImage: {
            url: String,
            publicId: String
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        businessRegistrationNumber: String
    }
);
  
const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;