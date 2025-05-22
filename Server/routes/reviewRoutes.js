const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyRoles');

router.get('/user/:id', verifyJWT, reviewController.getReviewsOfUser);
router.get('/seller/:sellerId', verifyJWT, verifyRoles('Seller'), reviewController.getReviewsForASeller);
router.get('/product/:id', reviewController.getApprovedReviewsForProduct);
router.get('/unapproved', verifyJWT, verifyRoles('Admin'), reviewController.getUnapprovedReviews);
router.get('/approved', reviewController.getApprovedReviews);

router.post('/:productId', verifyJWT, verifyRoles('User'), reviewController.postReview);

router.put('/check/:reviewId', verifyJWT, verifyRoles('Admin'), reviewController.checkReview);

router.delete('/:id', verifyJWT, reviewController.deleteReview);

module.exports = router;
