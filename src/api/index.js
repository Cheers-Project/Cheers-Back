const express = require('express');
const user = require('./user');
const auth = require('./auth');
const meeting = require('./meeting');

const router = express.Router();

router.use('/user', user);
router.use('/auth', auth);
router.use('/meeting', meeting);

module.exports = router;
