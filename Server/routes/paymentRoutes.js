const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyUser = require('../middleware/verifyUser');

// We're using verifyJWT but not verifyUser for payment intent creation
// This allows any authenticated user to create payment intents
router.post('/intent', verifyJWT, paymentsController.createPaymentIntent);

router.get('/order/:orderId', verifyJWT, paymentsController.getPaymentByOrder);
router.get('/user/:userId', verifyJWT, paymentsController.getPaymentsByUser);

router.post('/webhook', express.raw({ type: 'application/json' }), paymentsController.handleStripeWebhook);


module.exports = router;
