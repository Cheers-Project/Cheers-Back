const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { login, regist } = require('./userController');

const router = express.Router();

router.post('/login', login);
router.post('/regist', upload.single('profileImg'), regist);

module.exports = router;
