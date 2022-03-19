const express = require('express');
const multer = require('multer');
const { login, socialLogin, regist } = require('./userController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/login', login);
router.post('/login/:social', socialLogin);
router.post('/regist', upload.single('profileImg'), regist);

module.exports = router;
