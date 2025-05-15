const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyUser = require('../middleware/verifyUser');

router.post('/intent', verifyJWT, verifyUser(), paymentsController.createPaymentIntent);

router.get('/order/:orderId', verifyJWT, paymentsController.getPaymentByOrder);
router.get('/user/:userId', verifyJWT, paymentsController.getPaymentsByUser);

router.post('/webhook', express.raw({ type: 'application/json' }), paymentsController.handleStripeWebhook);


module.exports = router;
