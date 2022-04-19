const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const {
  createMeeting,
  featchMeeting,
  fetchMeetingById,
} = require('./meetingController');

const router = express.Router();

router.get('/', featchMeeting);
router.get('/:id', fetchMeetingById);
router.post('/', jwtMiddleware, createMeeting);

module.exports = router;
