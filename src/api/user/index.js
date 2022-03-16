const express = require('express');
const { login, regist } = require('./userController');

const router = express.Router();

router.post('/login', login);
router.post('/regist', regist);

module.exports = router;
