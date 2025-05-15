const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product'
        },
        variant: { // Reference to specific SKU
            sku: String,
            attributes: Object
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        priceAtAddition: {
            type: Number,
            required: true
        }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;