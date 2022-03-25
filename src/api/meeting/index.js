const express = require('express');
const { createMeeting, searchNearMeeting } = require('./meetingController');

const router = express.Router();

router.get('/', searchNearMeeting);
router.post('/', createMeeting);

module.exports = router;
