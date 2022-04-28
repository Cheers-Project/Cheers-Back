const express = require('express');
const { kakaoCallback } = require('./authController');

const router = express.Router();

router.get('/kakao/callback', kakaoCallback);

module.exports = router;
