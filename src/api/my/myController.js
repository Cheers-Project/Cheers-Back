const jwt = require('jsonwebtoken');

const s3 = require('../../config/s3');
const User = require('../../models/user');
const Board = require('../../models/board');
const Meeting = require('../../models/meeting');

// 내 게시물 가져오기
exports.fetchMyBoard = async (req, res) => {
  const { page } = req.query;
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;

  const { nickname } = jwt.verify(token, JWT_SECRET_KEY);

  try {
    const maxPage = Math.ceil(
      (await Board.countDocuments({
        'writer.nickname': nickname,
      })) / 10,
    );

    const isLastPage = maxPage - page < 0 ? true : false;

    const boardList = await Board.find({ 'writer.nickname': nickname })
      .sort({
        createDate: -1,
      })
      .skip((page - 1) * 10)
      .limit(10);

    res.status(200).send({ boardList, isLastPage });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

// 내 모임 가져오기
exports.fetchMyMeeting = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;

  const { nickname } = jwt.verify(token, JWT_SECRET_KEY);

  try {
    const meeting = await Meeting.find({ 'writer.nickname': nickname }).sort({
      meetingDate: -1,
    });
    res.status(200).send({ meeting });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

// 유저 프로필 이미지 업데이트
exports.updateProfileImg = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { location: profileImg, key: profileImgKey } = req.file;

  const { _id, nickname } = jwt.verify(token, JWT_SECRET_KEY);

  try {
    const oldUser = await User.findById(_id);

    // 기존 유저 프로필 이미지 s3에서 제거
    if (oldUser.profileImgKey) {
      s3.deleteObject(
        {
          Bucket: 'lemonalcohol-s3',
          Key: `${oldUser.profileImgKey}`,
        },
        (err, data) => {
          console.log(err);
        },
      );
    }

    // 새 프로필 이미지 저장
    const user = await User.findOneAndUpdate(
      { _id },
      { profileImg, profileImgKey },
      { new: true },
    ).exec();

    await Board.updateMany(
      {
        'writer.nickname': nickname,
      },
      { 'writer.profileImg': profileImg },
    ).exec();

    const userInfo = user.serialize();

    res.status(200).send({ userInfo });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

// 유저 프로필 이미지 제거
exports.removeProfileImg = async (req, res) => {
  console.log('프로필 이미지 제거');
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;

  const { _id, nickname } = jwt.verify(token, JWT_SECRET_KEY);

  try {
    const oldUser = await User.findById(_id);

    // s3에 저장된 이미지라면 s3에서 제거
    if (oldUser.profileImgKey) {
      s3.deleteObject(
        {
          Bucket: 'lemonalcohol-s3',
          Key: `${oldUser.profileImgKey}`,
        },
        (err, data) => {
          console.log(data);
        },
      );
    }

    // 프로필 이미지 기본 이미지로 변경
    const user = await User.findOneAndUpdate(
      { _id },
      {
        profileImg: `https://lemonalcohol-s3.s3.ap-northeast-2.amazonaws.com/profile/default_profile.png`,
        $unset: { profileImgKey: '' },
      },
      { new: true },
    ).exec();

    await Board.updateMany(
      {
        'writer.nickname': nickname,
      },
      {
        'writer.profileImg': `https://lemonalcohol-s3.s3.ap-northeast-2.amazonaws.com/profile/default_profile.png`,
      },
    ).exec();

    const userInfo = user.serialize();

    res.status(200).send({ userInfo });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

// 유저 정보 수정
exports.updateNickname = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { _id, nickname } = jwt.verify(token, JWT_SECRET_KEY);

  try {
    const existNickname = await User.findByNickname(req.body.nickname);

    // 이미 존재하는 닉네임 예외 처리
    if (existNickname) {
      res.status(400).send({ msg: '사용중인 닉네임 입니다.' });
      return;
    }

    const updateBoard = Board.updateMany(
      {
        'writer.nickname': nickname,
      },
      { 'writer.nickname': req.body.nickname },
    ).exec();

    const updateMeeting = Meeting.updateMany(
      {
        writer: nickname,
      },
      { writer: req.body.nickname },
    ).exec();

    // 게시물과 모임의 닉네임 변경은 순차 작업할 필요가 없기 때문에 병렬 처리
    await Promise.all([updateBoard, updateMeeting]);

    const user = await User.findByIdAndUpdate({ _id }, req.body, {
      new: true,
    });

    // 새 정보로 토큰을 재발급
    const { accessToken, refreshToken } = user.generateToken();
    user.saveRefreshToken(refreshToken);
    await user.save();

    const userInfo = user.serialize();

    res.status(200).send({ userInfo, accessToken });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};
