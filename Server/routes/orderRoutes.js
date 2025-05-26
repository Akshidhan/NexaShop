const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyRoles');
const verifyUser = require('../middleware/verifyUser');

router.get('/seller/:sellerId', verifyJWT, verifyRoles('Seller'), orderController.getFinishedOrdersBySeller);
router.get('/seller/:sellerId/pending', verifyJWT, verifyRoles('Seller'), orderController.getPendingOrdersBySeller);
router.get('/seller/:sellerId/pending-payment', verifyJWT, verifyRoles('Seller'), orderController.getPendingPaymentOrdersBySeller);

router.get('/pending', verifyJWT, verifyRoles('Admin'), orderController.getPendingOrders);
router.get('/user/:id', verifyJWT, verifyRoles('User', 'Admin'), verifyUser(), orderController.getOrdersOfUser);
router.get('/:id', verifyJWT, orderController.getOrderById);
router.get('/', verifyJWT, verifyRoles('Admin'), orderController.getAllOrders);

router.post('/:id', verifyJWT, verifyRoles('User'), verifyUser(), orderController.createOrder);

router.put('/status/:orderId', verifyJWT, verifyRoles('Admin'), orderController.updateOrderStatus);
router.put('/payment/:orderId', verifyJWT, orderController.updatePaymentStatus);

router.delete('/:orderId', verifyJWT, verifyRoles('Admin'), orderController.deleteOrder);

module.exports = router;