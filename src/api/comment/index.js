const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const { createComment, fetchComment } = require('./commentController');

const router = express.Router();
router.get('/:id', fetchComment);
router.post('/', jwtMiddleware, createComment);
module.exports = router;
