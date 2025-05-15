const mongoose = require('mongoose');
const Category = require('../models/category.model');

const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: 'No categories found' });
        }
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    try {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({ message: 'Category already exists' });
        }
        const newCategory = new Category({ name });
        await newCategory.save();
        return res.status(201).json(newCategory);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json({ message: 'Category has been updated', category: updatedCategory });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json({ message: 'Category has been deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    getAllCategory,
    createCategory,
    updateCategory,
    deleteCategory
}