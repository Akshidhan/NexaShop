const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Product = require('../models/product.model');

// Get reviews of a specific user
const getReviewsOfUser = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }
    try {
        const reviews = await Review.find({ user: id }).populate('product', 'name').lean();
        if (!reviews.length) {
            return res.status(404).json({ status: 'error', message: 'No reviews found for this user' });
        }
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

const getReviewsForASeller = async (req, res) => {
    const { sellerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid seller ID' });
    }
    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Count total reviews for the seller for pagination metadata
        const totalReviews = await Review.countDocuments({ seller: sellerId });
        
        // Get paginated seller reviews
        const reviews = await Review.find({ seller: sellerId })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username')
            .populate('product', 'name')
            .lean();

        // Return reviews with pagination metadata
        res.json({
            reviews,
            pagination: {
                totalReviews,
                totalPages: Math.ceil(totalReviews / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
}

// Get reviews for a specific product (approved only)
const getApprovedReviewsForProduct = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid product ID' });
    }
    try {
        const reviews = await Review.find({ product: id, approved: true }).populate('user', 'username').lean();
        if (!reviews.length) {
            return res.status(404).json({ status: 'error', message: 'No approved reviews found for this product' });
        }
        res.json({ status: 'success', data: reviews });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

// Get all unapproved reviews
const getUnapprovedReviews = async (req, res) => {
    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Count total unapproved reviews for pagination metadata
        const totalReviews = await Review.countDocuments({ approved: false });
        
        // Get paginated unapproved reviews
        const reviews = await Review.find({ approved: false })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username')
            .populate('product', 'name')
            .lean();

        if (!reviews.length) {
            return res.status(404).json({ status: 'error', message: 'No unapproved reviews found' });
        }

        // Return reviews with pagination metadata
        res.json({
            reviews,
            pagination: {
                totalReviews,
                totalPages: Math.ceil(totalReviews / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

// Get all approved reviews
const getApprovedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ approved: true }).populate('user', 'username').populate('product', 'name').lean();
        if (!reviews.length) {
            return res.status(404).json({ status: 'error', message: 'No approved reviews found' });
        }
        res.json({ status: 'success', data: reviews });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

// Post a review for a product by a user
const postReview = async (req, res) => {
    const { productId } = req.params;
    const { user, rating, reviewText, variant } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ status: 'error', message: 'Invalid product or user ID' });
    }
    if(req.id !== user) {
        return res.status(403).json({ status: 'error', message: 'You are not authorized to post this review' });
    }
    try {
        const newReview = new Review({
            user,
            product: productId,
            rating,
            reviewText,
            variant,
            approved: false
        });
        await newReview.save();
        res.status(201).json({ status: 'success', data: newReview });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

// Approve or disapprove a review (by Admin)
const checkReview = async (req, res) => {
    const { reviewId } = req.params;
    const { approved } = req.body;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid review ID' });
    }
    try {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { approved },
            { new: true }
        );
        if (!review) {
            return res.status(404).json({ status: 'error', message: 'Review not found' });
        }
        res.json({ status: 'success', data: review });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

// Delete a review by a specific user
const deleteReview = async (req, res) => {
    const { id } = req.params; // review id
    try {
        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return res.status(404).json({ status: 'error', message: 'Review not found' });
        }
        res.json({ status: 'success', message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

module.exports = {
    getReviewsOfUser,
    getReviewsForASeller,
    getApprovedReviewsForProduct,
    getUnapprovedReviews,
    getApprovedReviews,
    postReview,
    checkReview,
    deleteReview
};