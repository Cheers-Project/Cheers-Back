const jwt = require('jsonwebtoken');
const Board = require('../../models/board');
const Like = require('../../models/like');

exports.updateLike = async (req, res) => {
  console.log('좋아요 요청');
  const { boardId } = req.params;

  const { JWT_SECRET_KEY } = process.env;
  const token = req.headers.authorization;
  const { nickname } = jwt.verify(token, JWT_SECRET_KEY);

  const likeBoard = await Like.findOne({ boardId });
  const oldBoard = await Board.findById(boardId);

  const validateLikeUser = likeBoard?.likeUsers.includes(nickname);

  try {
    if (validateLikeUser) {
      console.log('좋아요 취소');
      await Like.updateOne({ boardId }, { $pull: { likeUsers: nickname } });

      const board = await Board.findByIdAndUpdate(
        { _id: boardId },
        { like: oldBoard.like - 1 },
        { new: true },
      );
      return res.status(200).send({ msg: '좋아요 취소', board });
    }

    if (likeBoard) {
      console.log('좋아요 유저 업데이트');
      await Like.updateOne(
        {
          boardId,
        },
        {
          $addToSet: { likeUsers: nickname },
        },
      );

      const board = await Board.findByIdAndUpdate(
        { _id: boardId },
        { like: oldBoard.like + 1 },
        { new: true },
      );

      return res.status(200).send({ msg: '좋아요', board });
    }

    const newLike = new Like({
      boardId,
      likeUsers: [nickname],
    });

    await newLike.save();

    const board = await Board.findByIdAndUpdate(
      { _id: boardId },
      { like: oldBoard.like + 1 },
      { new: true },
    );

    return res.status(200).send({ msg: '좋아요 추가', board });
  } catch (e) {
    return res.status(500).send({ msg: '좋아요 실패' });
  }
};
