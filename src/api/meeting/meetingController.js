const Meeting = require('../../models/meeting');
const Comment = require('../../models/comment');
const jwt = require('jsonwebtoken');
const { format } = require('date-fns');

exports.createMeeting = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;

  const { title, contents, meetingDate, meetingTime, totalNumber, location } =
    req.body;

  const { profileImg, nickname, _id } = jwt.verify(token, JWT_SECRET_KEY);

  const meeting = new Meeting({
    title,
    contents,
    writer: {
      nickname,
      profileImg,
      _id,
    },
    meetingDate,
    meetingTime,
    totalNumber,
    attendMember: [_id],
    location,
  });

  await meeting.save();

  res.status(200).send(meeting);
};

// 모임 얻기
exports.featchMeeting = async (req, res) => {
  const { sort, page } = req.query;

  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const maxPage = Math.ceil((await Meeting.countDocuments({})) / 3);
    const isLastPage = maxPage - page < 0 ? true : false;

    // 최신순
    if (sort === 'recent') {
      const meeting = await Meeting.find({ meetingDate: { $gte: today } })
        .sort({ createdDate: -1 })
        .skip((page - 1) * 3)
        .limit(3);

      return res.status(200).send({ meeting, isLastPage });
    }
    // 조회수순
    if (sort === 'view') {
      const meeting = await Meeting.find({ meetingDate: { $gte: today } })
        .sort({ view: -1 })
        .skip((page - 1) * 3)
        .limit(3);

      return res.status(200).send({ meeting, isLastPage });
    }

    // 근처 모임
    if (sort === 'near') {
      const { lon, lat } = req.query;
      if (lon && lat) {
        const meeting = await Meeting.find({
          meetingDate: { $gte: today },
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

        return res.status(200).send({ meeting, isLastPage: true });
      }
    }

    // 메인 페이지 최신 작성된 10개 모임만 응답
    const meeting = await Meeting.find({}).sort({ createdDate: -1 }).limit(10);
    res.status(200).send({ meeting });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

exports.fetchMeetingById = async (req, res) => {
  const { id: meetingId } = req.params;

  try {
    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        $inc: { view: 1 },
      },
      { new: true },
    );

    const isClosed =
      meeting.totalNumber <= meeting.attendMember.length ? true : false;

    res.status(200).send({ meeting, isClosed });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

exports.editMeeting = async (req, res) => {
  const { id: meetingId } = req.params;

  try {
    const meeting = await Meeting.findByIdAndUpdate(meetingId, req.body, {
      new: true,
    });
    res.status(200).send({ meeting });
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};

exports.deleteMeeting = async (req, res) => {
  const { id: meetingId } = req.params;
  try {
    await Comment.deleteMany({ postId: id });
    await Meeting.deleteOne({ _id: meetingId });
    res.status(200).send();
  } catch (e) {
    res.status(500).send({ msg: '서버 오류', e });
  }
};
