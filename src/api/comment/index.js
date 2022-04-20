const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const { createComment } = require('./commentController');

const router = express.Router();

router.post('/', jwtMiddleware, createComment);
module.exports = router;
