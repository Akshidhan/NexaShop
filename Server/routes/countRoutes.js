// filepath: /home/bl4ck_alc0r/Documents/eCommerceProject/eCommerceProject/Server/routes/countRoutes.js
const express = require('express');
const router = express.Router();
const countController = require('../controllers/countController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyRoles');

// Routes to get counts for admin dashboard
router.get('/products' ,verifyJWT, verifyRoles('Admin'), countController.getProductCount);
router.get('/users', verifyJWT, verifyRoles('Admin'), countController.getUserCount);
router.get('/users-7-days',verifyJWT, verifyRoles('Admin'),  countController.getUserIn7Days);
router.get('/orders',verifyJWT, verifyRoles('Admin'), countController.getOrderCount);

router.get('/products/:id', verifyJWT, verifyRoles('Seller'), countController.getProductCountBySeller);
router.get('/orders/:id', verifyJWT, verifyRoles('Seller'), countController.getOrderCountBySeller);
router.get('/orders/:id/last-7-days', verifyJWT, verifyRoles('Seller'), countController.getOrderIn7Days);

module.exports = router;