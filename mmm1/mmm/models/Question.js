const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true }
  },
  correctAnswer: {
    type: String,
    enum: ['a', 'b', 'c', 'd'],
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 15,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
