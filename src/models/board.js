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
    type: Object,
  },
  imgKeys: {
    type: [String],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  modifiedDate: {
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
  view: {
    type: Number,
    default: 0,
  },
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
