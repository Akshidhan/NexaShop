const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyRoles = require('../middleware/verifyRoles')
const verifyUser = require('../middleware/verifyUser')

router.get('/',verifyJWT, verifyRoles('Admin'), userController.getAllUsers)
router.get('/search',verifyJWT, verifyRoles('Admin'), userController.searchUsers)
router.get('/:id', userController.getUserById)


router.post('/', userController.createUser)

router.delete('/:id',verifyJWT, verifyRoles('Admin'), userController.deleteUser)

router.put('/password/:id', verifyJWT, verifyUser(), userController.updateUserPassword)
router.put('/username/:id', verifyJWT, verifyUser(), userController.updateUsername)
router.put('/address/:id', verifyJWT, verifyUser(), userController.updateAddress)

module.exports = router