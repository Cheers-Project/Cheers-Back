const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema({
  postId: {
    type: String,
  },
  content: {
    type: String,
  },
  writer: {
    type: Object,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
