const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const s3 = require('../../config/s3');
const checkOwned = require('../../middleware/checkOwned');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const sanitizeHtmlMiddleware = require('../../middleware/sanitizeHtmlMiddleware');

const {
  getBoard,
  getBoardById,
  increaseView,
  writeBoard,
  uploadImage,
} = require('./boardController');

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'lemonalcohol-s3',
    contentType: multerS3.AUTO_CONTENT_TYPE, // multerS3가 자동으로 파일의 content-type을 지정
    key: (req, file, cb) => {
      const fileName = `board/${Date.now()}_${path.basename(
        file.originalname,
      )}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/', getBoard);
router.get('/:id', getBoardById);
router.patch('/:id', increaseView);
router.post('/', jwtMiddleware, sanitizeHtmlMiddleware, writeBoard);

// 게시물 이미지 관련
router.post('/image', upload.single('image'), uploadImage);

module.exports = router;
