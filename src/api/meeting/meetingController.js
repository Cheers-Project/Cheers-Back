const Meeting = require('../../models/meeting');
const jwt = require('jsonwebtoken');

exports.createMeeting = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;

  const { title, contents, meetingDate, meetingTime, totalNumber, location } =
    req.body;

  const { nickname } = jwt.verify(token, JWT_SECRET_KEY);

  const meeting = new Meeting({
    title,
    contents,
    writer: nickname,
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

  // const { lon, lat } = req.query;
  // console.log('주변 모임 요청');
  // const meeting = await Meeting.findNearMeeting(lon, lat);

  try {
    if (sort === 'recent') {
      const meeting = await Meeting.find({}).sort({ createdDate: -1 }).limit(6);
      res.status(200).send({ meeting });
    }
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};
