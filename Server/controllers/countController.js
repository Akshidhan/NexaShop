const mongoose = require('mongoose');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Order = require('../models/order.model');

const getProductCount = async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        return res.status(200).json({ count: productCount });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getUserCount = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        return res.status(200).json({ count: userCount });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getUserIn7Days = async (req, res) => {
    try {
        const counts = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const startOfDay = new Date(today);
            startOfDay.setDate(today.getDate() - i);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setDate(today.getDate() - i);
            endOfDay.setHours(23, 59, 59, 999);

            const count = await User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
            counts.push( count );
        }

        return res.status(200).json(counts);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getOrderIn7Days = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid seller ID' });
    }
    try {
        const counts = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const startOfDay = new Date(today);
            startOfDay.setDate(today.getDate() - i);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setDate(today.getDate() - i);
            endOfDay.setHours(23, 59, 59, 999);

            const count = await Order.countDocuments({ seller: id, createdAt: { $gte: startOfDay, $lte: endOfDay } });
            counts.push( count );
        }

        return res.status(200).json(counts);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getOrderCount = async (req, res) => {
    try {
        const orderCount = await Order.countDocuments({ status: 'pending' });
        return res.status(200).json({ count: orderCount });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getProductCountBySeller = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid seller ID' });
    }
    try {
        const productCount = await Product.countDocuments({ seller: id });
        return res.status(200).json({count: productCount});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getOrderCountBySeller = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid seller ID' });
    }
    try {
        const orderCount = await Order.countDocuments({ seller: id, status: 'pending' });
        return res.status(200).json({count: orderCount});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    getProductCount,
    getUserCount,
    getUserIn7Days,
    getOrderCount,
    getProductCountBySeller,
    getOrderCountBySeller,
    getOrderIn7Days
}