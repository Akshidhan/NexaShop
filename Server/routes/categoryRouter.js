const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyRoles = require('../middleware/verifyRoles')

router.get('/', categoryController.getAllCategory)

router.post('/', verifyJWT, verifyRoles('Admin'), categoryController.createCategory)

router.put('/:id', verifyJWT, verifyRoles('Admin'), categoryController.updateCategory)

router.delete('/:id', verifyJWT, verifyRoles('Admin'), categoryController.deleteCategory)

module.exports = router
