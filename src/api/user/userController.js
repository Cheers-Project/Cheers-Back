const User = require('../../models/user');
const Joi = require('joi');
const s3 = require('../../config/s3');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;

// login
exports.login = async (req, res, next) => {
  // requset를 받아온다.
  const { userId, userPw } = req.body;

  // request 아이디가 없을 때
  if (!userId) {
    res.status(401).send({ msg: '아이디를 입력해 주세요' });
    return;
  }
  // request 비밀번호 없을 때
  if (!userPw) {
    res.status(401).send({ msg: '비밀번호를 입력해 주세요' });
    return;
  }

  try {
    // 유저 아이디로 유효성 검사
    const userInfo = await User.checkUser(userId);
    // request 정보가 DB에 없을 때
    if (!userInfo) {
      res
        .status(400)
        .send({ msg: '가입하지 않은 회원입니다. 회원가입을 해주세요' });
      return;
    }
    // 비밀번호 유효성 검사
    // request 비밀번호화 DB 비밀번호가 다를 때
    const checkPw = await userInfo.validatePw(userPw);

    if (!checkPw) {
      res.status(401).send({ msg: '비밀번호가 일치 하지 않습니다.' });
      return;
    }

    const { accessToken, refreshToken } = userInfo.generateToken();

    userInfo.saveRefreshToken(refreshToken);
    await userInfo.save();

    res.status(200).json({ msg: '로그인 완료', accessToken });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류' });
  }
};

// social login
exports.socialLogin = async (req, res) => {
  // request
  const { kakaoToken: ACCESS_TOKEN, nickname } = req.body;

  // 닉네임 중복 확인
  const existNickname = await User.checkNickname(nickname);

  if (existNickname) {
    res.status(400).send({ msg: '사용중인 닉네임입니다.' });
    return;
  }
  // 유저 정보 받아오기, 우리 토큰 발급해주기
  try {
    const kakaoInfo = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    // 프로필 이미지
    const {
      data: {
        id: kakaoId,
        kakao_account: { profile: userInfo },
      },
    } = kakaoInfo;

    const userId = `${kakaoId}@lemon.com`;
    const { profile_image_url: profileImg } = userInfo;

    const validateUser = await User.checkUser(userId);

    if (validateUser) {
      res.status(400).send({ msg: '이미 카카오 로그인을 했었습니다.' });
      return;
    }

    const socialUser = new User({
      userId,
      nickname,
      profileImg,
      isSocial: true,
    });

    const { accessToken, refreshToken } = socialUser.generateToken();

    socialUser.saveRefreshToken(refreshToken);
    await socialUser.save();

    res.status(200).send({ msg: '카카오 로그인 성공', accessToken });
  } catch (e) {
    res.status(500).send({ msg: '카카오 로그인 실패' });
  }
};

// logout
exports.logout = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;

  const token = req.headers.authorization;
  try {
    const { nickname } = jwt.decode(token, JWT_SECRET_KEY);

    const user = await User.checkNickname(nickname);

    user.removeRefreshToken();

    res.status(200).send({ msg: '로그아웃 성공' });
  } catch (e) {
    res.status(500).send({ msg: '로그아웃 실패' });
  }
};

// regist
exports.regist = async (req, res) => {
  const { userId, userPw, repeatPw, nickname } = req.body;
  const { location: profileImg, key: profileImgKey } = req.file;

  const schema = Joi.object({
    userId: Joi.string()
      .email({ tlds: { allow: ['com', 'net', 'kr'] } })
      .required(),
    userPw: Joi.string()
      .pattern(
        new RegExp('^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,20}$'),
      )
      .required(),
    repeatPw: Joi.ref('userPw'),
    nickname: Joi.string().min(2).max(10).required(),
    profileImg: Joi.string(),
  });

  const validatedResult = schema.validate({
    userId,
    userPw,
    repeatPw,
    nickname,
    profileImg,
  });

  if (validatedResult.error) {
    s3.deleteObject(
      {
        Bucket: 'lemonalcohol-s3',
        Key: `${profileImgKey}`,
      },
      (err, data) => {
        console.log(err, data);
      },
    );
    res.status(400).send({ error: validatedResult.error });
    return;
  }

  try {
    const existId = await User.checkUser(userId);

    if (existId) {
      s3.deleteObject(
        {
          Bucket: 'lemonalcohol-s3',
          Key: `${profileImgKey}`,
        },
        (err, data) => {
          console.log(err, data);
        },
      );
      res.status(400).send({ msg: '사용중인 아이디 입니다.' });
      return;
    }

    const existNickname = await User.checkNickname(nickname);

    if (existNickname) {
      s3.deleteObject(
        {
          Bucket: 'lemonalcohol-s3',
          Key: `${profileImgKey}`,
        },
        (err, data) => {
          console.log(err, data);
        },
      );
      res.status(400).send({ msg: '사용중인 닉네임 입니다.' });
      return;
    }

    const user = new User({
      userId,
      userPw,
      nickname,
      profileImg,
    });

    await user.encryptPassword(userPw);
    await user.save();

    const data = user.serialize();

    res.status(200).send({ data, msg: '회원가입 성공' });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};
