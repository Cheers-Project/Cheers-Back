const mongoose = require('mongoose');

const { Schema } = mongoose;

const likeSchema = new Schema({
  boardId: {
    type: String,
  },
  likeUsers: {
    type: Array,
  },
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
