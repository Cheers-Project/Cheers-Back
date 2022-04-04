const Board = require('../../models/board');

const jwt = require('jsonwebtoken');

exports.writeBoard = async (req, res) => {
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { title, contents } = req.body;

  try {
    const { nickname } = jwt.verify(token, JWT_SECRET_KEY);
    const board = new Board({
      title,
      contents,
      writer: nickname,
    });

    console.log(board);
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
