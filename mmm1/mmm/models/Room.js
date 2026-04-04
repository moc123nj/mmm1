const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  roomName: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    displayName: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isReady: {
      type: Boolean,
      default: false
    }
  }],
  maxPlayers: {
    type: Number,
    default: 4,
    max: 4
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  endedAt: Date
});

module.exports = mongoose.model('Room', roomSchema);
