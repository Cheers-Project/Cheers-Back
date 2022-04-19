const Board = require('../../models/board');
const jwt = require('jsonwebtoken');
const pagination = require('../../utils/pagination');
const s3 = require('../../config/s3');

exports.getBoard = async (req, res) => {
  console.log('게시물 요청');
  const { sort, page } = req.query;

  try {
    const totalBoard = await Board.countDocuments({});

    const { maxPage, skipBoard, maxBoard, pageNums } = pagination(
      page,
      totalBoard,
    );

    if (sort === 'recent') {
      const boards = await Board.find({})
        .skip(skipBoard)
        .sort({ createdDate: -1 })
        .limit(maxBoard);
      return res.status(200).send({ boards, maxPage, page, pageNums });
    }

    if (sort === 'like') {
      const boards = await Board.find({})
        .skip(skipBoard)
        .sort({ like: -1 })
        .limit(maxBoard);
      return res.status(200).send({ boards, maxPage, page, pageNums });
    }

    if (sort === 'view') {
      const boards = await Board.find({})
        .skip(skipBoard)
        .sort({ view: -1 })
        .limit(maxBoard);
      return res.status(200).send({ boards, maxPage, page, pageNums });
    }

    return res.status(400).send({ msg: '게시물 요청 실패' });
  } catch (e) {
    return res.status(500).send({ msg: '게시물 불러오기 실패' });
  }
};

exports.getBoardById = async (req, res) => {
  console.log('게시물 조회');

  const { type } = req.query;
  const { id } = req.params;
  try {
    if (type === 'detail') {
      const board = await Board.findByIdAndUpdate(
        { _id: id },
        { $inc: { view: 1 } },
        { new: true },
      );
      return res.status(200).send({ board });
    }
    const board = await Board.findById(id);

    return res.status(200).send({ board });
  } catch (e) {
    console.log(e);
  }
};

exports.updateBoard = async (req, res) => {
  console.log('게시물 수정');
  const { id } = req.params;
  const { title, contents, imgKeys } = req.body;
  try {
    const board = await Board.findByIdAndUpdate(
      { _id: id },
      {
        title: title,
        contents: contents,
        imgKeys: imgKeys,
        createdDate: new Date(),
      },
      { new: true },
    );

    res.status(200).send({ msg: '게시물 수정', board });
  } catch (e) {
    console.log(e);
  }
};

exports.updateLike = async (req, res) => {
  const { id } = req.params;

  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { nickname } = jwt.verify(token, JWT_SECRET_KEY);

  const oldBoard = await Board.findById(id);

  const validateLikeUser = oldBoard?.likeUsers.includes(nickname);

  try {
    if (validateLikeUser) {
      console.log('좋아요 취소');
      const board = await Board.findByIdAndUpdate(
        { _id: id },
        { $pull: { likeUsers: nickname }, $inc: { like: -1 } },
        { new: true },
      );

      return res.status(200).send({ msg: '좋아요 취소', board });
    }

    console.log('좋아요');

    const board = await Board.findByIdAndUpdate(
      { _id: id },
      { $addToSet: { likeUsers: nickname }, $inc: { like: 1 } },
      { new: true },
    );

    return res.status(200).send({ msg: '좋아요', board });
  } catch (e) {
    return res.status(500).send({ msg: '좋아요 실패' });
  }
};

exports.writeBoard = async (req, res) => {
  console.log('게시물 작성');
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { title, contents, imgKeys } = req.body;

  try {
    const { _id, nickname, profileImg } = jwt.verify(token, JWT_SECRET_KEY);

    const writer = { _id, nickname, profileImg };

    const board = new Board({
      title,
      contents,
      writer,
      imgKeys,
    });

    await board.save();

    return res.status(200).send({ msg: '게시물 작성 완료' });
  } catch (e) {
    return res.status(500).send({ msg: '게시물 작성 실패' });
  }
};

exports.deleteBoard = async (req, res) => {
  console.log('게시물 삭제');
  const { id } = req.params;

  try {
    const board = await Board.findById(id);

    console.log(board.imgKeys);

    await board.imgKeys.map((imgKey) => {
      s3.deleteObject(
        {
          Bucket: 'lemonalcohol-s3',
          Key: `${imgKey}`,
        },
        (err, data) => {
          console.log(data);
        },
      );
    });
    await Board.deleteOne({ _id: id });
    return res.status(200).send({ msg: '삭제완료' });
  } catch (e) {
    return res.status(500).send({ msg: '서버오류' });
  }
};

exports.uploadImage = async (req, res) => {
  const { key: imgKey, location: imgUrl } = req.file;
  try {
    return res.status(200).send({ imgKey, imgUrl });
  } catch (e) {
    return res.status(500).send({ msg: '서버오류' });
  }
};
