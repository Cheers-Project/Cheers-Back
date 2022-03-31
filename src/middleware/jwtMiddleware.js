const User = require('../models/user');
const jwt = require('jsonwebtoken');

const verifyAccessToken = (accessToken) => {
  const { JWT_SECRET_KEY } = process.env;

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET_KEY);
    return decoded;
  } catch (e) {
    return null;
  }
};

const verifyRefreshToken = async (accessToken) => {
  const { JWT_SECRET_KEY } = process.env;

  try {
    const { nickname } = jwt.decode(accessToken, JWT_SECRET_KEY);
    const user = await User.findByNickname(nickname);

    jwt.verify(user.refreshToken, JWT_SECRET_KEY);

    return user;
  } catch (e) {
    return null;
  }
};

const jwtMiddleware = async (req, res, next) => {
  const accessToken = req.headers.authorization;

  const validAccessToken = verifyAccessToken(accessToken);
  const validUser = await verifyRefreshToken(accessToken);

  // 액세스 토큰이 유효한 경우
  if (validAccessToken) {
    next();
  } else {
    // 액세스 토큰은 유효하지 않지만 리프레쉬 토큰이 유효한 경우
    if (validUser) {
      const { accessToken, refreshToken } = validUser.generateToken();

      await validUser.saveRefreshToken(refreshToken);

      req.headers.authorization = accessToken;
      next();
    } else {
      res.status(401).send({ msg: '유효하지 않은 토큰입니다.' });
    }
  }
};
module.exports = jwtMiddleware;
