const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// 비밀번호 암호화 메서드
userSchema.methods.encryptPassword = async function (userPw) {
  const hashedPassword = await bcrypt.hash(userPw, 10);
  this.userPw = hashedPassword;
};

// 유저 인스턴스 직렬화 및 비밀번호 삭제
userSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.userPw;

  return data;
};

// document(문서)가 필요하지 않거나 존재하지 않는 경우 정적 메서드 사용
userSchema.statics.checkUser = function (userId) {
  return this.findOne({ userId });
};

// jwt 토큰 발급 인스턴스 메서드 생성
userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      nickname: this.nickname,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '1d',
    },
  );
  return token;
};

// 모델
const User = mongoose.model('User', userSchema);

module.exports = User;
