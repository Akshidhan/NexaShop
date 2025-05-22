const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyRoles = require('../middleware/verifyRoles')
const multer = require('multer')

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
})

router.get('/', categoryController.getAllCategory)

router.post('/', 
    verifyJWT, 
    verifyRoles('Admin'), 
    upload.single('file'), 
    categoryController.createCategory
)

router.put('/:id', verifyJWT, verifyRoles('Admin'), categoryController.updateCategory)

router.delete('/:id', verifyJWT, verifyRoles('Admin'), categoryController.deleteCategory)

module.exports = router
