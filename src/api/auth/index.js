const express = require('express');
const { kakao, kakaoCallback } = require('./authController');

const router = express.Router();

router.get('/kakao', kakao);
router.get('/kakao/callback', kakaoCallback);

module.exports = router;
