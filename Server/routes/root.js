const express = require('express')
const router = express.Router()
const path = require('path')

// Use a RegExp for the route pattern to avoid path-to-regexp error
router.get(/^\/$|\/index(\.html)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router