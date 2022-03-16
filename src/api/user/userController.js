const User = require('../../models/user');

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
    if (userInfo.userPw !== userPw) {
      res.status(401).send({ msg: '비밀번호가 일치 하지 않습니다.' });
      return;
    }

    res.status(200).json({ msg: '로그인 완료' });
  } catch (err) {
    res.status(500).send({ msg: '서버 오류' });
  }
};

exports.regist = async (req, res) => {
  const { userId, userPw, nickname, profileImg } = req.body;

  const user = new User({
    userId,
    userPw,
    nickname,
    profileImg,
  });

  try {
    const exist = await User.checkUser(userId);

    if (exist) {
      res.status(400).send({ msg: '이미 존재하는 아이디 입니다.' });
      return;
    }
    res.send('success');
  } catch (e) {
    console.log(e);
  }
};
