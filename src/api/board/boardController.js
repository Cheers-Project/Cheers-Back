const Board = require('../../models/board');
const User = require('../../models/user');

const jwt = require('jsonwebtoken');

exports.writeBoard = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { title, contents } = req.body;

  try {
    const { _id, nickname, profileImg } = jwt.verify(token, JWT_SECRET_KEY);

    const writer = { _id, nickname, profileImg };

    const board = new Board({
      title,
      contents,
      writer,
    });

    await board.save();

    res.status(200).send({ msg: '게시물 작성 완료' });
  } catch (e) {
    res.status(500).send({ msg: '게시물 작성 실패' });
  }
};

exports.uploadImage = async (req, res) => {
  console.log(req.file);
  res.send({ imgUrl: req.file.location });
};

exports.getBoard = async (req, res) => {
  console.log('게시물 요청');
  const boards = await Board.find({});

  res.send({ boards });
};
