const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyRoles');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.get('/category/:category', productController.getProductsByCategory);
router.get('/search', productController.searchProducts);
router.get('/inactive', verifyJWT, verifyRoles('Admin'), productController.getInactiveProducts);
router.get('/seller/:sellerId', productController.getProductsOfSeller);
router.get('/seller/:sellerId/inactive', verifyJWT, verifyRoles('Seller'), productController.getInactiveProductsOfSeller);
router.get('/:id', productController.getProductById);
router.get('/', productController.getAllProducts);

router.post('/', 
    verifyJWT, 
    verifyRoles('Admin', 'Seller'), 
    upload.single('file'),
    productController.createProduct
);

router.put('/:id', verifyJWT, verifyRoles('Admin', 'Seller'), upload.single('image'), productController.updateProduct);

router.delete('/:id', verifyJWT, verifyRoles('Admin', 'Seller'), productController.deleteProduct);

module.exports = router;