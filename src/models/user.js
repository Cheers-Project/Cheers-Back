const mongoose = require('mongoose');

const { Schema } = mongoose;

// 스키마
const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  userPw: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  profileImg: String,
});

// document(문서)가 필요하지 않거나 존재하지 않는 경우 정적 메서드 사용
userSchema.statics.checkUser = function (userId) {
  return this.findOne({ userId });
};

// 모델
const User = mongoose.model('User', userSchema);

module.exports = User;
