const jwt = require('jsonwebtoken');
const Commnet = require('../../models/comment');

exports.createComment = async (req, res) => {
  console.log('댓글 작성');
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { boardId, content } = req.body;

  try {
    const { _id, nickname, profileImg } = jwt.verify(token, JWT_SECRET_KEY);
    const writer = { _id, nickname, profileImg };

    const comment = new Commnet({
      boardId,
      content,
      writer,
    });
    await comment.save();
    return res.status(200).send({ msg: '댓글 작성' });
  } catch (e) {
    return res.status(500).send({ msg: '댓글 작성 실패' });
  }
};
