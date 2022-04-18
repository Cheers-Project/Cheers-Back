const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');

const router = express.Router();

const { updateLike } = require('./likeController');

router.patch('/:boardId', jwtMiddleware, updateLike);

module.exports = router;
