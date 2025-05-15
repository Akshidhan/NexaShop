const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Seller = require('../models/seller.model');
const cloudinary = require('../config/cloudinary');

// Helper functions for validation
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateCategoryAndSeller = async (category, seller) => {
    if (category && !await Category.findById(category)) {
        throw new Error('Invalid category ID');
    }
    if (seller && !await Seller.findById(seller)) {
        throw new Error('Invalid seller ID');
    }
};

const validateSeller = async (seller) => {
    if (seller && !await Seller.findById(seller)) {
        throw new Error('Invalid seller ID');
    }
}

//Get products section

const getProductsByCategory = async (req, res) => {
    const { category } = req.params;

    if (!validateObjectId(category)) {
        return res.status(400).json({ status: 'error', message: 'Invalid category ID' });
    }

    try {
        const products = await Product.find({ category }).select('-__v').lean();

        if (!products.length) {
            return res.status(404).json({ status: 'error', message: 'No products found for this category' });
        }

        res.json({ status: 'success', data: products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

const getProductsOfSeller = async (req, res) => {
    const { sellerId } = req.params;

    try {
        const products = await Product.find({ seller: sellerId }).lean();

        if (!products.length) {
            return res.status(400).json({ message: 'No products found for this seller' });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id).lean();

        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();

        if (!products) {
            return res.status(400).json({ message: 'No products found' });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// create product section

const createProduct = async (req, res) => {
  const { name, description, basePrice, category, seller, variants } = req.body;

  if(!name || !description || !basePrice || !category || !seller) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }

  if (!validateObjectId(category) || !validateObjectId(seller)) {
    return res.status(400).json({ status: 'error', message: 'Invalid category or seller ID' });
  }

  try {
    await validateCategoryAndSeller(category, seller);

    if (!req.file) {
      throw new Error('No image uploaded');
    }

    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'ecommerce-products',
          format: 'webp',
          quality: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const newProduct = new Product({
      name,
      description,
      basePrice,
      category,
      seller,
      variants,
      mainImage: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id
      }
    });

    await newProduct.save();

    res.status(201).json({ 
      status: 'success', 
      data: newProduct 
    });

  } catch (error) {
    res.status(400).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};


// update product section

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { seller } = req.body;

    if (!validateObjectId(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid product ID' });
    }

    try {
        await validateSeller(seller);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true }
        ).select('-__v');

        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        res.json({ status: 'success', data: updatedProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};


// delete product section

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const cloudinary = require('../config/cloudinary');

    if (!validateObjectId(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid product ID' });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        if (product.mainImage?.publicId) {
            await cloudinary.uploader.destroy(product.mainImage.publicId);
        }

        await Product.findByIdAndDelete(id);

        res.json({ 
            status: 'success', 
            message: 'Product and image deleted successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error', 
            error: error.message 
        });
    }
};


// search product section

const searchProducts = async (req, res) => {
    const { query } = req.query;

    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).lean();

        if (!products.length) {
            return res.status(400).json({ message: 'No products found' });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getProductsByCategory,
    getProductsOfSeller,
    getProductById,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
}