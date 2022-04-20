const Comment = require('../../models/comment');
const jwt = require('jsonwebtoken');

exports.createComment = async (req, res) => {
  console.log('댓글 작성');
  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { postId, content } = req.body;

  try {
    const { _id, nickname, profileImg } = jwt.verify(token, JWT_SECRET_KEY);
    const writer = { _id, nickname, profileImg };

    const comment = new Comment({
      postId,
      content,
      writer,
    });
    await comment.save();
    return res.status(200).send({ msg: '댓글 작성' });
  } catch (e) {
    return res.status(500).send({ msg: '댓글 작성 실패' });
  }
};

exports.fetchComment = async (req, res) => {
  console.log('댓글 요청');
  const { id } = req.params;

  try {
    const comments = await Comment.find({ postId: id });

    return res.status(200).send({ comments });
  } catch (e) {
    return res.status(500).send({ msg: '댓글 요청 실패' });
  }
};
