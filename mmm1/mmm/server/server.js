require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('../routes/auth');
const roomRoutes = require('../routes/rooms');
const questionRoutes = require('../routes/questions');
const authMiddleware = require('../middleware/auth');

const Room = require('../models/Room');
const Game = require('../models/Game');
const Question = require('../models/Question');
const User = require('../models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected - server.js:38'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/questions', questionRoutes);

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// WebSocket events
const games = new Map();
const playerRooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected: - server.js:56', socket.id);

  // Join room via WebSocket
  socket.on('join-room', async (data) => {
    try {
      const { roomCode, userId } = data;
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      playerRooms.set(socket.id, roomCode);
      socket.join(roomCode);

      // Broadcast player joined
      io.to(roomCode).emit('player-joined', {
        players: room.players,
        message: `Player ${room.players.find(p => p.userId.toString() === userId)?.displayName} joined`
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Chat message
  socket.on('chat-message', async (data) => {
    try {
      const { roomCode, message, username } = data;
      io.to(roomCode).emit('chat-message', {
        username,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Chat error: - server.js:92', error);
    }
  });

  // Start game
  socket.on('start-game', async (data) => {
    try {
      const { roomCode, userId } = data;
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Check if user is room owner
      if (room.owner.toString() !== userId) {
        socket.emit('error', { message: 'Chỉ chủ phòng mới có thể bắt đầu trò chơi' });
        return;
      }

      // Check if all players are ready
      const allReady = room.players.every(p => p.isReady);
      if (!allReady) {
        socket.emit('error', { message: 'Not all players are ready' });
        return;
      }

      // Get 15 random questions sorted by difficulty
      const questions = await Question.aggregate([
        { $sample: { size: 15 } }
      ]);
      questions.sort((a, b) => a.difficulty - b.difficulty);

      // Create game with properly initialized player data
      const game = new Game({
        room: room._id,
        players: room.players.map(p => ({
          userId: p.userId,
          username: p.username,
          displayName: p.displayName,
          score: 0,
          answers: [],
          lifelinesUsed: {
            fifty50: false,
            askAudience: false,
            blockPlayer: false,
            stopGame: false
          },
          finalRank: 0
        })),
        questions: questions.map(q => q._id),
        startedAt: new Date(),
        status: 'in-progress'
      });

      await game.save();

      room.status = 'playing';
      room.startedAt = new Date();
      await room.save();

      games.set(roomCode, {
        gameId: game._id,
        questions: questions,
        currentQuestion: 0,
        answers: new Map(),
        startTime: Date.now(),
        playerAnswers: new Map()
      });

      // Send first question
      const firstQuestion = questions[0];
      io.to(roomCode).emit('game-started', {
        totalQuestions: 15,
        currentQuestion: 1,
        question: {
          id: firstQuestion._id,
          question: firstQuestion.question,
          options: firstQuestion.options
        },
        timeLimit: 60
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Answer question
  socket.on('answer-question', async (data) => {
    try {
      const { roomCode, userId, answer } = data;
      const gameData = games.get(roomCode);

      if (!gameData) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const currentQuestion = gameData.questions[gameData.currentQuestion];
      const isCorrect = answer === currentQuestion.correctAnswer;

      if (!gameData.playerAnswers.has(roomCode)) {
        gameData.playerAnswers.set(roomCode, {});
      }

      const playerAnswers = gameData.playerAnswers.get(roomCode);
      playerAnswers[userId] = {
        answer,
        isCorrect,
        questionNumber: gameData.currentQuestion + 1
      };

      // Save answer to Game document in database
      const gameDoc = await Game.findById(gameData.gameId);
      if (gameDoc) {
        const playerIndex = gameDoc.players.findIndex(p => p.userId.toString() === userId);
        if (playerIndex !== -1) {
          // Initialize answers array if not exists
          if (!gameDoc.players[playerIndex].answers) {
            gameDoc.players[playerIndex].answers = [];
          }
          
          gameDoc.players[playerIndex].answers.push({
            questionNumber: gameData.currentQuestion + 1,
            answer,
            isCorrect,
            timeTaken: 0
          });
          
          // Update score immediately if correct - ONLY if answer is correct
          if (isCorrect) {
            gameDoc.players[playerIndex].score = (gameDoc.players[playerIndex].score || 0) + 15;
          }
          
          await gameDoc.save();
        }
      }

      // Only grant points if answer is correct
      io.to(roomCode).emit('answer-received', {
        userId,
        isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        pointsEarned: isCorrect ? 15 : 0
      });

      // Get room info for broadcast
      const room = await Room.findOne({ roomCode });
      const player = room.players.find(p => p.userId.toString() === userId);
      
      // Broadcast player answer update to other players
      io.to(roomCode).emit('player-answer-update', {
        userId,
        displayName: player?.displayName || 'Unknown',
        hasAnswered: true,
        selectedAnswer: answer
      });
    } catch (error) {
      console.error('Answer error: - server.js:198', error);
    }
  });

  // Next question
  socket.on('next-question', async (data) => {
    try {
      const { roomCode } = data;
      const gameData = games.get(roomCode);

      if (!gameData) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      gameData.currentQuestion++;

      if (gameData.currentQuestion >= 15) {
        // Game finished
        await finishGame(roomCode, gameData);
        return;
      }

      const nextQuestion = gameData.questions[gameData.currentQuestion];
      io.to(roomCode).emit('next-question', {
        currentQuestion: gameData.currentQuestion + 1,
        question: {
          id: nextQuestion._id,
          question: nextQuestion.question,
          options: nextQuestion.options
        },
        timeLimit: 60
      });
    } catch (error) {
      console.error('Next question error: - server.js:232', error);
    }
  });

  // Use lifeline
  socket.on('use-lifeline', async (data) => {
    try {
      const { roomCode, userId, lifelineType } = data;
      const gameData = games.get(roomCode);

      if (!gameData) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Check if player has already used this lifeline
      const gameDoc = await Game.findById(gameData.gameId);
      const playerIndex = gameDoc.players.findIndex(p => p.userId.toString() === userId);
      
      if (playerIndex !== -1) {
        const lifelinesUsed = gameDoc.players[playerIndex].lifelinesUsed;
        
        // Map lifeline type to property name
        let lifelineProperty = '';
        switch (lifelineType) {
          case '50-50':
            lifelineProperty = 'fifty50';
            break;
          case 'ask-audience':
            lifelineProperty = 'askAudience';
            break;
          case 'stop-game':
            lifelineProperty = 'stopGame';
            break;
          default:
            socket.emit('error', { message: 'Invalid lifeline type' });
            return;
        }

        // Check if lifeline already used by this player
        if (lifelinesUsed[lifelineProperty]) {
          socket.emit('error', { message: 'Bạn đã dùng quyền trợ giúp này rồi' });
          return;
        }

        // Mark lifeline as used for this player
        lifelinesUsed[lifelineProperty] = true;
        await gameDoc.save();
      }

      const currentQuestion = gameData.questions[gameData.currentQuestion];

      switch (lifelineType) {
        case '50-50':
          // Remove two incorrect options
          const correctAnswer = currentQuestion.correctAnswer;
          const options = ['a', 'b', 'c', 'd'];
          const incorrect = options.filter(o => o !== correctAnswer);
          const toRemove = incorrect.slice(0, 2);

          // Only send lifeline effect to the player who used it - other players only get notification
          socket.emit('lifeline-used', {
            type: '50-50',
            userId,
            removedOptions: toRemove
          });
          
          // Notify other players that someone used a lifeline
          socket.broadcast.to(roomCode).emit('lifeline-used-notification', {
            type: '50-50',
            userId
          });
          break;

        case 'ask-audience':
          // Generate audience opinion with correct answer having higher percentage
          const correctOpt = currentQuestion.correctAnswer;
          const allOpts = ['a', 'b', 'c', 'd'];
          const audienceOpinion = {};
          
          // Start with 40% for correct answer
          let correctPercent = 40 + Math.floor(Math.random() * 30); // 40-70%
          audienceOpinion[correctOpt] = correctPercent;
          
          // Distribute remaining percentage among other options
          const remainingPercent = 100 - correctPercent;
          const wrongOpts = allOpts.filter(o => o !== correctOpt);
          const perWrongOpt = Math.floor(remainingPercent / wrongOpts.length);
          let remaining = remainingPercent;
          
          wrongOpts.forEach((opt, idx) => {
            if (idx === wrongOpts.length - 1) {
              audienceOpinion[opt] = remaining;
            } else {
              audienceOpinion[opt] = perWrongOpt;
              remaining -= perWrongOpt;
            }
          });

          // Only send audience opinion to the player who used it
          socket.emit('lifeline-used', {
            type: 'ask-audience',
            userId,
            audienceOpinion
          });
          
          // Notify other players that someone used ask-audience
          socket.broadcast.to(roomCode).emit('lifeline-used-notification', {
            type: 'ask-audience',
            userId
          });
          break;

        case 'stop-game':
          await finishGame(roomCode, gameData);
          io.to(roomCode).emit('player-stopped-game', { userId });
          break;
      }
    } catch (error) {
      console.error('Lifeline error: - server.js:294', error);
      socket.emit('error', { message: 'Lỗi sử dụng quyền trợ giúp' });
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    try {
      const roomCode = playerRooms.get(socket.id);
      if (roomCode) {
        const room = await Room.findOne({ roomCode });
        if (room) {
          io.to(roomCode).emit('player-left', {
            message: 'A player disconnected',
            playersRemaining: room.players.length - 1
          });
        }
      }
      playerRooms.delete(socket.id);
    } catch (error) {
      console.error('Disconnect error: - server.js:313', error);
    }
  });
});

// Finish game function
async function finishGame(roomCode, gameData) {
  try {
    const room = await Room.findOne({ roomCode });
    const gameDoc = await Game.findById(gameData.gameId);

    if (!gameDoc) return;

    // Recalculate scores from answers to ensure accuracy
    for (const player of gameDoc.players) {
      let score = 0;
      if (player.answers && Array.isArray(player.answers)) {
        for (const answer of player.answers) {
          // Only count correct answers
          if (answer.isCorrect === true) {
            score += 15;
          }
        }
      }
      player.score = score;
    }

    // Sort by score for ranking
    gameDoc.players.sort((a, b) => b.score - a.score);
    gameDoc.players.forEach((player, index) => {
      player.finalRank = index + 1;
    });

    gameDoc.status = 'completed';
    gameDoc.endedAt = new Date();
    await gameDoc.save();

    // Update user stats
    for (const player of gameDoc.players) {
      const user = await User.findById(player.userId);
      if (user) {
        user.gamesPlayed += 1;
        user.totalScore += player.score;
        if (player.finalRank === 1) {
          user.wins += 1;
        }
        await user.save();
      }
    }

    room.status = 'finished';
    room.endedAt = new Date();
    await room.save();

    // Send leaderboard to all players
    io.to(roomCode).emit('game-ended', {
      leaderboard: gameDoc.players.map(p => ({
        displayName: p.displayName,
        score: p.score,
        rank: p.finalRank
      }))
    });

    games.delete(roomCode);
  } catch (error) {
    console.error('Finish game error: - server.js:375', error);
  }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - server.js:382`);
});
