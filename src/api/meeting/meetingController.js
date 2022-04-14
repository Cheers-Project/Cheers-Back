const Meeting = require('../../models/meeting');
const jwt = require('jsonwebtoken');

exports.createMeeting = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;

  const { title, contents, meetingDate, meetingTime, totalNumber, location } =
    req.body;

  const { profileImg, nickname } = jwt.verify(token, JWT_SECRET_KEY);

  const meeting = new Meeting({
    title,
    contents,
    writer: {
      nickname,
      profileImg,
    },
    meetingDate,
    meetingTime,
    totalNumber,
    attendMember: [nickname],
    location,
  });

  await meeting.save();

  res.status(200).send(meeting);
};

// 모임 얻기
exports.featchMeeting = async (req, res) => {
  const { sort } = req.query;

  try {
    // 최신순
    if (sort === 'recent') {
      const meeting = await Meeting.find({})
        .sort({ createdDate: -1 })
        .limit(18);

      return res.status(200).send({ meeting });
    }
    // 조회수순
    if (sort === 'view') {
      const meeting = await Meeting.find({}).sort({ view: -1 }).limit(18);

      return res.status(200).send({ meeting });
    }
    // 근처 모임
    if (sort === 'near') {
      const { lon, lat } = req.query;

      if (lon && lat) {
        const meeting = await Meeting.find({
          location: {
            $near: {
              $maxDistance: 2000,
              $geometry: {
                type: 'Point',
                coordinates: [lon, lat],
              },
            },
          },
        });

        return res.status(200).send({ meeting });
      } else {
        return res
          .status(403)
          .send({ msg: '위치 정보가 활성화 되어 있지 않습니다.' });
      }
    }

    // 메인 페이지 최신 작성된 10개 모임만 응답
    const meeting = await Meeting.find({}).sort({ createdDate: -1 }).limit(10);
    res.status(200).send({ meeting });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};
