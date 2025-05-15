const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyRoles = require('../middleware/verifyRoles');
const multer = require('multer');
const upload = multer();

router.get('/category/:category', productController.getProductsByCategory);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/', productController.getAllProducts);
router.get('/seller/:sellerId', productController.getProductsOfSeller);

router.post('/', 
    verifyJWT, 
    verifyRoles('Admin', 'Seller'), 
    upload.single('file'),
    productController.createProduct
);

router.put('/:id', verifyJWT, verifyRoles('Admin', 'Seller'), productController.updateProduct);

router.delete('/:id', verifyJWT, verifyRoles('Admin', 'Seller'), productController.deleteProduct);

module.exports = router