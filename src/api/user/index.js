const express = require('express');
const { regist } = require('./userController');

const router = express.Router();

router.post('/regist', regist);

module.exports = router;
