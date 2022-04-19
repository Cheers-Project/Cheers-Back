const mongoose = require('mongoose');

const { Schema } = mongoose;

const meetingSchema = new Schema({
  title: {
    type: String,
  },
  contents: {
    type: String,
  },
  writer: {
    nickname: {
      type: String,
    },
    profileImg: {
      type: String,
    },
    _id: {
      type: String,
    }
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  meetingDate: {
    type: String,
  },
  meetingTime: {
    type: String,
  },
  totalNumber: {
    type: String,
  },
  attendMember: {
    type: [String],
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    placeName: String,
    addressName: String,
    coordinates: [Number],
  },
  view: {
    type: Number,
    default: 0,
  },
});

meetingSchema.index({ location: '2dsphere' });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
