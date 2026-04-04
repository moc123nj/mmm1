const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    displayName: String,
    score: {
      type: Number,
      default: 0
    },
    answers: [{
      questionNumber: Number,
      answer: String,
      isCorrect: Boolean,
      timeTaken: Number
    }],
    lifelinesUsed: {
      fifty50: { type: Boolean, default: false },
      askAudience: { type: Boolean, default: false },
      blockPlayer: { type: Boolean, default: false },
      stopGame: { type: Boolean, default: false }
    },
    finalRank: Number
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  endedAt: Date,
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  }
});

module.exports = mongoose.model('Game', gameSchema);
