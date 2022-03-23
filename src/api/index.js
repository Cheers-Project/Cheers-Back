const express = require('express');
const user = require('./user');
const auth = require('./auth');

const router = express.Router();

router.use('/user', user);
router.use('/auth', auth);

module.exports = router;
