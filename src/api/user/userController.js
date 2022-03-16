const User = require('../../models/user');

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
