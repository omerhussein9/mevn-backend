const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  place: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  team1: {
    type: String,
    required: true
  },
  team2: {
    type: String,
    required: false
  },
  longitude: {
    type: String,
    required: true
  },
  latitude: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: false
  },
  emails: {
    type: [String],
    required: false
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
