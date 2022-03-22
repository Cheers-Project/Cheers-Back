// 카카오 인가 코드 받기 요청

exports.kakao = (req, res) => {
  const { KAKAO_BASE_URL, KAKAO_API_KEY, KAKAO_REDIRECT_URI } = process.env;

  const KAKAO_AUTH_URL = `${KAKAO_BASE_URL}?client_id=${KAKAO_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

  res.redirect(KAKAO_AUTH_URL);
};

exports.kakaoCallback = (req, res) => {
  console.log(req.query);
};
