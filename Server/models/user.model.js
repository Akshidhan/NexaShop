const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        userImage: {
            url: String,
            publicId: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        addresses: [{
            addressLine: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            isDefault: {
                type: Boolean,
                default: false
            }
        }]
    }
);
  
const User = mongoose.model('User', userSchema);
module.exports = User;