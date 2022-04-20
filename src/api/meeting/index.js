const express = require('express');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const {
  createMeeting,
  featchMeeting,
  fetchMeetingById,
  editMeeting,
  deleteMeeting,
} = require('./meetingController');

const router = express.Router();

router.get('/', featchMeeting);
router.get('/:id', fetchMeetingById);
router.patch('/:id', jwtMiddleware, editMeeting);
router.post('/', jwtMiddleware, createMeeting);
router.delete('/:id', jwtMiddleware, deleteMeeting);

module.exports = router;
