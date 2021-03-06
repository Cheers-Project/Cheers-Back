const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const jwt = require('jsonwebtoken');

const s3 = require('../../config/s3');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const sanitizeHtmlMiddleware = require('../../middleware/sanitizeHtmlMiddleware');

const {
  getBoard,
  getBoardById,
  updateBoard,
  writeBoard,
  uploadImage,
  deleteBoard,
  updateLike,
} = require('./boardController');

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'lemonalcohol-s3',
    contentType: multerS3.AUTO_CONTENT_TYPE, // multerS3가 자동으로 파일의 content-type을 지정
    key: (req, file, cb) => {
      const token = req.headers.authorization;
      const { JWT_SECRET_KEY } = process.env;
      const { nickname } = jwt.verify(token, JWT_SECRET_KEY);

      const fileName = `board/${nickname}_${Date.now()}_${path.basename(
        file.originalname,
      )}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/', getBoard);
router.get('/:id', getBoardById);
router.patch('/:id', jwtMiddleware, sanitizeHtmlMiddleware, updateBoard);
router.patch('/like/:id', jwtMiddleware, updateLike);
router.post('/', jwtMiddleware, sanitizeHtmlMiddleware, writeBoard);
router.delete('/:id', jwtMiddleware, deleteBoard);

// 게시물 이미지 관련
router.post('/image', jwtMiddleware, upload.single('image'), uploadImage);

module.exports = router;
