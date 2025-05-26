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
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Count total orders for pagination metadata
        const totalOrders = await Order.countDocuments();
        
        // Get paginated orders
        const orders = await Order.find()
            .skip(skip)
            .limit(limit)
            .populate('user', 'name')
            .populate('items.product', 'name price')
            .lean();

        // Return orders with pagination metadata
        res.json({
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit
            }
        });
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
        
        // Format orders for frontend display
        const formattedOrders = orders.map(order => ({
            id: order._id.toString(),
            date: new Date(order.createdAt).toISOString().split('T')[0],
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            items: order.items.length, // Count of items instead of the array
            total: order.total
        }));
        
        res.json(formattedOrders);
    } catch (error) {
        console.error(`Error fetching orders for user ${id}:`, error);
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
        const savedOrder = await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', _id: savedOrder._id });
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
            { 
                paymentStatus,
                paidAt: paymentStatus === 'paid' ? new Date() : undefined
            },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating payment status:', error);
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

// GET /seller/:sellerId - Get finished orders (cancelled and delivered) for a seller
const getFinishedOrdersBySeller = async (req, res) => {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        // Count total finished orders for this seller
        const totalOrders = await Order.countDocuments({
            'items.product.seller': sellerId,
            status: { $in: ['delivered', 'cancelled'] }
        });

        // Get paginated finished orders
        const orders = await Order.find({
            'items.product.seller': sellerId,
            status: { $in: ['delivered', 'cancelled'] }
        })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username')
            .populate('items.product', 'name price')
            .lean();

        res.json({
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /seller/:sellerId/pending - Get pending orders (processing and shipped) for a seller
const getPendingOrdersBySeller = async (req, res) => {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        // Count total pending orders for this seller
        const totalOrders = await Order.countDocuments({
            'items.product.seller': sellerId,
            status: { $in: ['processing', 'shipped'] }
        });

        // Get paginated pending orders
        const orders = await Order.find({
            'items.product.seller': sellerId,
            status: { $in: ['processing', 'shipped'] }
        })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username')
            .populate('items.product', 'name price')
            .lean();

        res.json({
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /seller/:sellerId/pending-payment - Get orders with pending payment for a seller
const getPendingPaymentOrdersBySeller = async (req, res) => {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        // Count total pending payment orders for this seller
        const totalOrders = await Order.countDocuments({
            'items.product.seller': sellerId,
            paymentStatus: 'pending'
        });

        // Get paginated pending payment orders
        const orders = await Order.find({
            'items.product.seller': sellerId,
            paymentStatus: 'pending'
        })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username')
            .populate('items.product', 'name price')
            .lean();

        res.json({
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit
            }
        });
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
    deleteOrder,
    getFinishedOrdersBySeller,
    getPendingOrdersBySeller,
    getPendingPaymentOrdersBySeller
};
