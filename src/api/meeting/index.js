const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const { createMeeting, featchMeeting } = require('./meetingController');

const router = express.Router();

router.get('/', featchMeeting);
router.post('/', jwtMiddleware, createMeeting);

module.exports = router;
