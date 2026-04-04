const express = require('express');
const Question = require('../models/Question');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ difficulty: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get random questions for a game
router.get('/random/15', async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $sample: { size: 15 } }
    ]);
    
    // Sort by difficulty
    questions.sort((a, b) => a.difficulty - b.difficulty);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new question (admin only for now)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { question, options, correctAnswer, difficulty, category } = req.body;

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      difficulty,
      category
    });

    await newQuestion.save();

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update question
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { question, options, correctAnswer, difficulty, category } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { question, options, correctAnswer, difficulty, category },
      { new: true }
    );

    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete question
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
