const express = require('express');
const user = require('./user');
const auth = require('./auth');
const meeting = require('./meeting');
const board = require('./board');
const my = require('./my');

const router = express.Router();

router.use('/user', user);
router.use('/auth', auth);
router.use('/meeting', meeting);
router.use('/board', board);
router.use('/my', my);

module.exports = router;
