const mongoose = require('mongoose');

const { Schema } = mongoose;

const boardSchema = new Schema({
  title: {
    type: String,
  },
  contents: {
    type: String,
  },
  writer: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  like: {
    type: Number,
    default: 0,
  },
  comment: {
    type: Number,
    default: 0,
  },
  visit: {
    type: Number,
    default: 0,
  },
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
