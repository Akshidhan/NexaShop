const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true
    },
    attributes: {
        color: String,
        size: String,
        material: String
    },
    price: {
        type: Number,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        url: String,
        publicId: String
    }]
})

module.exports = mongoose.model('SKU', skuSchema);