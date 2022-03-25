const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const { createMeeting, searchNearMeeting } = require('./meetingController');

const router = express.Router();

router.get('/', searchNearMeeting);
router.post('/', jwtMiddleware, createMeeting);

module.exports = router;
