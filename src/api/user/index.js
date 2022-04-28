const express = require('express');

const {
  login,
  socialLogin,
  logout,
  regist,
  fetchUser,
} = require('./userController');

const router = express.Router();

router.get('/', fetchUser);
router.get('/logout', logout);
router.post('/login', login);
router.post('/login/:social', socialLogin);
router.post('/regist', regist);

module.exports = router;
