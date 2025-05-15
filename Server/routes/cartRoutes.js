const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cartController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyRoles = require('../middleware/verifyRoles')
const verifyUser = require('../middleware/verifyUser')

router.get('/:id', verifyJWT, verifyRoles('User'), verifyUser(), cartController.getCartDetailById)
router.post('/:id', verifyJWT, verifyRoles('User'), verifyUser(), cartController.createCart)
router.put('/:id', verifyJWT, verifyRoles('User'), verifyUser(), cartController.updateCart)
router.delete('/:id', verifyJWT, verifyRoles('User'), verifyUser(), cartController.deleteCart)

module.exports = router