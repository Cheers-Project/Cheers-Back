const express = require('express');
const { writeBoard } = require('./boardController');
const jwtMiddleware = require('../../middleware/jwtMiddleware');

const router = express.Router();

router.post('/', jwtMiddleware, writeBoard);

module.exports = router;
