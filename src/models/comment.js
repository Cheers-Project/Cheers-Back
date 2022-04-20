const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema({
  boardId: {
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
    default: Date.now(),
  },
});

const Commnet = mongoose.model('Commnet', commentSchema);

module.exports = Commnet;
