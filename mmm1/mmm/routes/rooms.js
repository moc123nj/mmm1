const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const Game = require('../models/Game');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Generate room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomName } = req.body;
    const user = await User.findById(req.user.userId);

    const room = new Room({
      roomCode: generateRoomCode(),
      roomName,
      owner: req.user.userId,
      players: [{
        userId: req.user.userId,
        username: user.username,
        displayName: user.displayName,
        isReady: true
      }]
    });

    await room.save();

    res.status(201).json({
      id: room._id,
      roomCode: room.roomCode,
      roomName: room.roomName,
      players: room.players,
      status: room.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'waiting' })
      .populate('owner', 'username displayName')
      .populate('players.userId', 'username displayName');

    res.json(rooms.map(room => ({
      id: room._id,
      roomCode: room.roomCode,
      roomName: room.roomName,
      owner: room.owner,
      playersCount: room.players.length,
      maxPlayers: room.maxPlayers,
      players: room.players
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get room by code
router.get('/:roomCode', async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode })
      .populate('players.userId', 'username displayName');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      id: room._id,
      roomCode: room.roomCode,
      roomName: room.roomName,
      owner: room.owner,
      players: room.players,
      status: room.status,
      currentQuestion: room.currentQuestion,
      maxPlayers: room.maxPlayers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join room
router.post('/:roomCode/join', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status !== 'waiting') {
      return res.status(400).json({ message: 'Room is not accepting players' });
    }

    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    // Check if user already in room
    const alreadyInRoom = room.players.find(p => p.userId.toString() === req.user.userId);
    if (alreadyInRoom) {
      return res.status(400).json({ message: 'Already in this room' });
    }

    const user = await User.findById(req.user.userId);

    room.players.push({
      userId: req.user.userId,
      username: user.username,
      displayName: user.displayName
    });

    await room.save();

    res.json({
      id: room._id,
      roomCode: room.roomCode,
      roomName: room.roomName,
      players: room.players,
      status: room.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave room
router.post('/:roomCode/leave', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.players = room.players.filter(p => p.userId.toString() !== req.user.userId);

    if (room.players.length === 0) {
      await Room.deleteOne({ _id: room._id });
      return res.json({ message: 'Room deleted' });
    }

    // If owner left, assign new owner
    if (room.owner.toString() === req.user.userId) {
      room.owner = room.players[0].userId;
    }

    await room.save();

    res.json({
      id: room._id,
      roomCode: room.roomCode,
      players: room.players,
      owner: room.owner
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Player ready
router.post('/:roomCode/ready', authMiddleware, async (req, res) => {
  try {
    const { isReady } = req.body;
    const room = await Room.findOne({ roomCode: req.params.roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const player = room.players.find(p => p.userId.toString() === req.user.userId);
    if (player) {
      player.isReady = isReady;
    }

    await room.save();

    res.json({ players: room.players });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
