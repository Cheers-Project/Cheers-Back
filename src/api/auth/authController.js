const { default: axios } = require('axios');
const qs = require('qs');
const User = require('../../models/user');

// 카카오 인가 코드 받기 요청

exports.kakao = (req, res) => {
  const { KAKAO_BASE_URL, KAKAO_API_KEY, KAKAO_REDIRECT_URI } = process.env;

  const KAKAO_AUTH_URL = `${KAKAO_BASE_URL}?client_id=${KAKAO_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

  res.redirect(KAKAO_AUTH_URL);
};

exports.kakaoCallback = async (req, res) => {
  // 카카오 토큰 발급
  const { code } = req.query;
  const { KAKAO_API_KEY, KAKAO_REDIRECT_URI, KAKAO_CLIENT_SECRET } =
    process.env;

  const payload = qs.stringify({
    grant_type: 'authorization_code',
    client_id: KAKAO_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    code: code,
    client_secret: KAKAO_CLIENT_SECRET,
  });

  try {
    const {
      data: { access_token: ACCESS_TOKEN },
    } = await axios.post(`https://kauth.kakao.com/oauth/token`, payload, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    // 카카오 정보
    const { data: kakaoInfo } = await axios.get(
      'https://kapi.kakao.com/v2/user/me',
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      },
    );

    const userId = `${kakaoInfo.id}@lemon.com`;

    const userInfo = await User.checkUser(userId);

    if (!userInfo) {
      return res.redirect('http://localhost:3000/oauth/kakao');
    }

    const accessToken = userInfo.generateToken();

    res.cookie('accesstoken', accessToken);

    return res.redirect('http://localhost:3000/');
  } catch (err) {
    console.log(err);
  }
};
