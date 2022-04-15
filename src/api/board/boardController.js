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
  } catch (e) {
    return res.status(500).send({ msg: '게시물 불러오기 실패' });
  }
};

exports.getBoardById = async (req, res) => {
  const { id } = req.params;
  try {
    const board = await Board.findById(id);

    return res.status(200).send({ board });
  } catch (e) {
    console.log(e);
  }
};

exports.increaseView = async (req, res) => {
  const { id } = req.params;

  try {
    const oldBoard = await Board.findById(id);
    const board = await Board.findOneAndUpdate(
      { _id: id },
      { view: oldBoard.view + 1 },
      { new: true },
    );

    return res.status(200).send({ board });
  } catch (e) {
    console.log(e);
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
