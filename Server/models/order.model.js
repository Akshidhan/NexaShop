const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        items: [{
            product: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product', 
                required: true 
            },
            variant: {
                sku: String,
                attributes: Object
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            subTotal: {
                type: Number,
                required: true
            }
        }],
        total: {
            type: Number,
            required: true
        },
        status: { 
            type: String, 
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        shippingAddress: {
            addressLine: String,
            city: String,
            district: String,
            province: String,
            postalCode: String,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);
  
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;