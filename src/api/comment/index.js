const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const {
  createComment,
  fetchComment,
  deleteComment,
  updateComment,
} = require('./commentController');

const router = express.Router();

router.get('/:id', fetchComment);
router.patch('/:id', jwtMiddleware, updateComment);
router.post('/', jwtMiddleware, createComment);
router.delete('/:id', jwtMiddleware, deleteComment);
module.exports = router;
