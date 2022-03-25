const Meeting = require('../../models/meeting');
const jwt = require('jsonwebtoken');

exports.createMeeting = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;

  const { title, contents, meetingDate, totalNumber, location } = req.body;

  const { nickname } = jwt.verify(token, JWT_SECRET_KEY);

  const meeting = new Meeting({
    title,
    contents,
    write: nickname,
    meetingDate,
    totalNumber,
    attendMember: [nickname],
    location,
  });

  await meeting.save();

  res.status(200).send(meeting);
};

// 주변 모임 얻기
exports.searchNearMeeting = async (req, res) => {
  const { lon, lat } = req.query;

  try {
    const meeting = await Meeting.findNearMeeting(lon, lat);
    res.send(meeting);
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};
