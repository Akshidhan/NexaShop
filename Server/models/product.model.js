const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        description: String,

        basePrice: {
            type: Number,
            required: true, min: 0
        },

        category: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Category', 
            required: true 
        },

        seller: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Seller', 
            required: true 
        },

        createdAt: {
            type: Date,
            default: Date.now
        },
        
        variants: [{
            sku: {
                type: String,
                required: true
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
        }],

        mainImage: {
            url: String,
            publicId: String
        },

        ratingsAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        statu: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        }
    }
);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;