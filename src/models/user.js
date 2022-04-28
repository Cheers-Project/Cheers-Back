const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;
const { DEFAULT_PROFILE_IMG } = process.env;

// 스키마
const userSchema = new Schema({
  userId: String,
  userPw: String,
  nickname: String,
  isSocial: { default: false, type: Boolean },
  profileImg: {
    default: `https://lemonalcohol-s3.s3.ap-northeast-2.amazonaws.com/profile/default_profile.png`,
    type: String,
  },
  profileImgKey: String,
  refreshToken: String,
});

// 비밀번호 암호화 메서드
userSchema.methods.encryptPassword = async function (userPw) {
  const hashedPassword = await bcrypt.hash(userPw, 10);
  this.userPw = hashedPassword;
};

// 비밀번호 복호화 및 확인 메서드
userSchema.methods.validatePw = async function (userPw) {
  const res = await bcrypt.compare(userPw, this.userPw);
  return res;
};

// 유저 인스턴스 직렬화 및 비밀번호 삭제
userSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.userPw;
  delete data.refreshToken;

  return data;
};

// jwt 토큰 발급 인스턴스 메서드 생성
userSchema.methods.generateToken = function () {
  const accessToken = jwt.sign(
    {
      _id: this._id,
      nickname: this.nickname,
      profileImg: this.profileImg,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '20m',
    },
  );

  const refreshToken = jwt.sign(
    {
      _id: this._id,
      nickname: this.nickname,
      profileImg: this.profileImg,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '7d',
    },
  );
  return { accessToken, refreshToken };
};

userSchema.methods.saveRefreshToken = function (refreshToken) {
  this.refreshToken = refreshToken;
};

userSchema.methods.removeRefreshToken = function () {
  this.refreshToken = '';
};

userSchema.methods.saveProfileImg = function (profileImg, profileImgKey) {
  this.profileImg = profileImg;
  this.profileImgKey = profileImgKey;
};

// document(문서)가 필요하지 않거나 존재하지 않는 경우 정적 메서드 사용
// 아이디 확인
userSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

// 닉네임 확인
userSchema.statics.findByNickname = function (nickname) {
  return this.findOne({ nickname });
};

// 모델
const User = mongoose.model('User', userSchema);

module.exports = User;
