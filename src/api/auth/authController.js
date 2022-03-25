const { default: axios } = require('axios');
const User = require('../../models/user');

exports.kakaoCallback = async (req, res) => {
  // 카카오 토큰 발급
  const { code } = req.query;

  const { KAKAO_API_KEY, KAKAO_REDIRECT_URI, KAKAO_CLIENT_SECRET } =
    process.env;

  const payload = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KAKAO_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    code: code,
    client_secret: KAKAO_CLIENT_SECRET,
  }).toString();

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
      res.send({ kakaoToken: ACCESS_TOKEN });
      return;
    }

    const accessToken = userInfo.generateToken();

    res.status(200).send({ accessToken });
  } catch (err) {
    console.log(err);
  }
};
