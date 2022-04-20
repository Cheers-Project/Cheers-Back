const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const {
  createComment,
  fetchComment,
  deleteComment,
} = require('./commentController');

const router = express.Router();
router.get('/:id', fetchComment);
router.post('/', jwtMiddleware, createComment);
router.delete('/:id', deleteComment);
module.exports = router;
