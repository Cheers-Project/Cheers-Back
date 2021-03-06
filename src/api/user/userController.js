const Joi = require('joi');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;

const User = require('../../models/user');

exports.fetchUser = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;

  try {
    const token = req.headers.authorization;

    const { nickname } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await User.findByNickname(nickname);
    const userInfo = user.serialize();

    res.status(200).send({ userInfo });
  } catch (e) {
    // 액세스 토큰이 만료라면 재발급 후 유저 정보 응답
    if (e.name === 'TokenExpiredError') {
      const token = req.headers.authorization;
      const { nickname } = jwt.decode(token, JWT_SECRET_KEY);

      const user = await User.findByNickname(nickname);

      const { accessToken, refreshToken } = user.generateToken();

      await user.saveRefreshToken(refreshToken);
      const userInfo = user.serialize();

      return res.status(200).send({ userInfo, accessToken });
    }
    // 토큰이 없거나 유효하지 않은 경우 유저 정보는 null 반환
    res.status(200).send(null);
  }
};

// login
exports.login = async (req, res) => {
  // requset를 받아온다.
  const { userId, userPw } = req.body;

  // request 아이디가 없을 때
  if (!userId) {
    res.status(400).send({ msg: '아이디를 입력해 주세요' });
    return;
  }
  // request 비밀번호 없을 때
  if (!userPw) {
    res.status(400).send({ msg: '비밀번호를 입력해 주세요' });
    return;
  }

  try {
    // 유저 아이디로 유효성 검사
    const user = await User.findByUserId(userId);
    // request 정보가 DB에 없을 때
    if (!user) {
      res
        .status(400)
        .send({ msg: '가입하지 않은 회원입니다. 회원가입을 해주세요' });
      return;
    }
    // 비밀번호 유효성 검사
    // request 비밀번호화 DB 비밀번호가 다를 때
    const checkPw = await user.validatePw(userPw);

    if (!checkPw) {
      res.status(400).send({ msg: '비밀번호가 일치 하지 않습니다.' });
      return;
    }

    const { accessToken, refreshToken } = user.generateToken();

    user.saveRefreshToken(refreshToken);
    await user.save();
    const userInfo = user.serialize();

    res.status(200).json({ msg: '로그인 완료', accessToken, userInfo });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

// social login
exports.socialLogin = async (req, res) => {
  // request
  const { kakaoToken: ACCESS_TOKEN, nickname } = req.body;

  if (!nickname) {
    res.status(400).send({ msg: '닉네임을 입력해주세요' });
    return;
  }

  // 닉네임 중복 확인
  const existNickname = await User.findByNickname(nickname);

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
        kakao_account: { profile: socialInfo },
      },
    } = kakaoInfo;

    const userId = `${kakaoId}@lemon.com`;
    const { profile_image_url: profileImg } = socialInfo;

    const validateUser = await User.findByUserId(userId);

    if (validateUser) {
      res.status(400).send({ msg: '이미 카카오 로그인을 했었습니다.' });
      return;
    }

    const user = new User({
      userId,
      nickname,
      profileImg,
      isSocial: true,
    });

    const { accessToken, refreshToken } = user.generateToken();

    user.saveRefreshToken(refreshToken);
    await user.save();
    const userInfo = user.serialize();

    res.status(200).send({ msg: '카카오 로그인 성공', accessToken, userInfo });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

// logout
exports.logout = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;

  const token = req.headers.authorization;
  try {
    const { nickname } = jwt.decode(token, JWT_SECRET_KEY);

    const user = await User.findByNickname(nickname);

    user.removeRefreshToken();
    user.save();

    res.status(200).send({ msg: '로그아웃 성공' });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

// regist
exports.regist = async (req, res) => {
  const { userId, userPw, repeatPw, nickname } = req.body;

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
  });

  const validatedResult = schema.validate({
    userId,
    userPw,
    repeatPw,
    nickname,
  });

  // 필수 입력 항목 예외처리
  if (validatedResult.error) {
    res.status(400).send({ msg: validatedResult.error.details[0].message });
    return;
  }

  try {
    // 사용중인 아이디 예외 처리
    const existId = await User.findByUserId(userId);

    if (existId) {
      res.status(400).send({ msg: '사용중인 아이디 입니다.' });
      return;
    }

    // 사용중인 닉네임 예외처리
    const existNickname = await User.findByNickname(nickname);

    if (existNickname) {
      res.status(400).send({ msg: '사용중인 닉네임 입니다.' });
      return;
    }

    // 유저 모델 생성
    const user = new User({
      userId,
      userPw,
      nickname,
    });

    await user.encryptPassword(userPw);
    await user.save();

    const userInfo = user.serialize();

    res.status(200).send({ userInfo, msg: '회원가입 성공' });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};
