const Comment = require('../../models/comment');
const jwt = require('jsonwebtoken');
const Board = require('../../models/board');

exports.createComment = async (req, res) => {
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

    await Board.findByIdAndUpdate(
      { _id: postId },
      { $inc: { comment: 1 } },
      { new: true },
    );
    return res.status(200).send({ msg: '댓글 작성' });
  } catch (e) {
    return res.status(500).send({ msg: '서버 오류', e });
  }
};

exports.fetchComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await Comment.find({ postId: id }).sort({
      createdDate: -1,
    });

    return res.status(200).send({ comments });
  } catch (e) {
    return res.status(500).send({ msg: '서버 오류', e });
  }
};

exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const { postId } = req.body;
  try {
    await Comment.deleteOne({ _id: id });
    await Board.findByIdAndUpdate(
      { _id: postId },
      { $inc: { comment: -1 } },
      { new: true },
    );

    return res.status(200).send({ msg: '댓글 삭제' });
  } catch (e) {
    return res.status(500).send({ msg: '서버 오류', e });
  }
};

exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    await Comment.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        content,
      },
      { new: true },
    );
    return res.status(200).send({ msg: '댓글 수정' });
  } catch (e) {
    return res.status(500).send({ msg: '서버 오류', e });
  }
};
