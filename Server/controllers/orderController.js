const mongoose = require('mongoose');
const Order = require('../models/order.model');

// GET /:id - Get the details of a specific order
const getOrderById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    try {
        const order = await Order.findById(id).populate('user').lean();
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET / - Get all the order details
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').lean();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /pending - Get all the pending orders
const getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' }).populate('user').lean();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /user/:id - Get the orders of a specific user
const getOrdersOfUser = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    try {
        const orders = await Order.find({ user: id }).lean();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /:id - Create an order for a user
const createOrder = async (req, res) => {
    const { id } = req.params; // user id
    const { items, total, shippingAddress } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!items || !Array.isArray(items) || items.length === 0 || !total) {
        return res.status(400).json({ message: 'Order items and total are required' });
    }
    try {
        const newOrder = new Order({
            user: id,
            items,
            total,
            shippingAddress
        });
        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /status/:orderId - Change the status of an order
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /payment/:orderId - Change the payment status of a payment
const updatePaymentStatus = async (req, res) => {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!paymentStatus) {
        return res.status(400).json({ message: 'Payment status is required' });
    }
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /:orderId - Delete an order
const deleteOrder = async (req, res) => {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getOrderById,
    getAllOrders,
    getPendingOrders,
    getOrdersOfUser,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder
};
