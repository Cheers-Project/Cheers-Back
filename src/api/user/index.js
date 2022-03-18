const express = require('express');
const { login, socialLogin, regist } = require('./userController');

const router = express.Router();

router.post('/login', login);
router.post('/login/:social', socialLogin);
router.post('/regist', regist);

module.exports = router;
