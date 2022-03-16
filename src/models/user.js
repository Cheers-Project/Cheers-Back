const mongoose = require('mongoose');

const { Schema } = mongoose;

// 스키마
const userSchema = new Schema({
  userId: String,
  userPw: String,
  nickname: String,
  profileImg: String,
});

// 모델
const User = mongoose.model('User', userSchema);

module.exports = User;
