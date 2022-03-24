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

const findNearMeeting = async (lon, lat) => {
  try {
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

    return meeting;
  } catch (e) {
    console.log(e);
  }
};

// 주변 모임 얻기
exports.searchNearMeeting = async (req, res) => {
  const { lon, lat } = req.query;

  const meetings = await findNearMeeting(lon, lat);

  res.send(meetings);
};
