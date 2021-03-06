const express = require('express');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const jwtMiddleware = require('../../middleware/jwtMiddleware');

const {
  fetchMyMeeting,
  updateProfileImg,
  removeProfileImg,
  updateNickname,
  fetchMyBoard,
} = require('./myController');

const s3 = require('../../config/s3');
const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'lemonalcohol-s3',
    contentType: multerS3.AUTO_CONTENT_TYPE, // multerS3가 자동으로 파일의 content-type을 지정
    key: (req, file, cb) => {
      const fileName = `profile/${Date.now()}_${path.basename(
        file.originalname,
      )}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/board', jwtMiddleware, fetchMyBoard);
router.get('/meeting', jwtMiddleware, fetchMyMeeting);
router.patch('/nickname', jwtMiddleware, updateNickname);
router.post(
  '/profile',
  jwtMiddleware,
  upload.single('profileImg'),
  updateProfileImg,
);
router.delete('/profile', jwtMiddleware, removeProfileImg);

module.exports = router;
