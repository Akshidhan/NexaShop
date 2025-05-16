// filepath: /home/bl4ck_alc0r/Documents/eCommerceProject/eCommerceProject/Server/routes/countRoutes.js
const express = require('express');
const router = express.Router();
const countController = require('../controllers/countController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyRoles');

// Routes to get counts for admin dashboard
router.get('/products', countController.getProductCount);
router.get('/users', countController.getUserCount);
router.get('/users-7-days', countController.getUserIn7Days);
router.get('/orders', countController.getOrderCount);

module.exports = router;