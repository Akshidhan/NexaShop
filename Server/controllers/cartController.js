const mongoose = require('mongoose');
const Cart = require('../models/cart.model');

const getCartDetailById = async (req, res) => {
    const { id } = req.params;
    try {
        const cart = await Cart.findOne({ user: id }).lean();
        if (!cart) {
            return res.status(404).json({ message: 'User and cart not found' });
        }
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const createCart = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'user Id is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user Id' });
    }
    try {
        const existingCart = await Cart.findOne({ user: id });
        if (existingCart) {
            return res.status(409).json({ message: 'Cart already exists for this user' });
        }
        const newCart = new Cart({ user: id });
        await newCart.save();
        return res.status(201).json(newCart);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const updateCart = async (req, res) => {
    const { id } = req.params;
    const { items } = req.body;
    if (!items) {
        return res.status(400).json({ message: 'items are required' });
    }
    try {
        const updatedCart = await Cart.findOneAndUpdate(
            { user: id },
            { items },
            { new: true }
        );
        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        return res.status(200).json({ message: 'Cart has been updated', cart: updatedCart });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const deleteCart = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCart = await Cart.findOneAndDelete({ user: id });
        if (!deletedCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        return res.status(200).json({ message: 'Cart deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    getCartDetailById,
    createCart,
    updateCart,
    deleteCart
}