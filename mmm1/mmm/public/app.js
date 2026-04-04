// Global state
const state = {
  user: null,
  token: null,
  currentRoom: null,
  currentGame: null,
  gameData: null,
  socket: null
};

// API Base URL
const API_BASE = 'http://192.168.1.8:3000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Connect socket.io
  state.socket = io();

  // Setup socket event listeners
  setupSocketListeners();

  // Check if user is logged in
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (savedToken && savedUser) {
    state.token = savedToken;
    state.user = JSON.parse(savedUser);
    showPage('lobbyPage');
    loadUserStats();
    loadRooms();
  } else {
    showPage('authPage');
  }
});

// ===== AUTHENTICATION =====

function switchForm(formId) {
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(formId).classList.add('active');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Login failed');
      return;
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showPage('lobbyPage');
    loadUserStats();
    loadRooms();
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  } catch (error) {
    alert('Connection error: ' + error.message);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const displayName = document.getElementById('signupDisplayName').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (password !== confirm) {
    alert('Mật khẩu không khớp');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, displayName })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Signup failed');
      return;
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showPage('lobbyPage');
    loadUserStats();
    loadRooms();

    // Reset form
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupDisplayName').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirm').value = '';
  } catch (error) {
    alert('Connection error: ' + error.message);
  }
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value;

  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Error');
      return;
    }

    alert('Check your email for reset instructions');
    switchForm('loginForm');
    document.getElementById('forgotEmail').value = '';
  } catch (error) {
    alert('Connection error: ' + error.message);
  }
}

function logout() {
  state.user = null;
  state.token = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showPage('authPage');
}

// ===== LOBBY PAGE =====

async function loadUserStats() {
  if (!state.user) return;

  document.getElementById('userName').textContent = state.user.displayName || state.user.username;
  document.getElementById('statGames').textContent = state.user.gamesPlayed || 0;
  document.getElementById('statWins').textContent = state.user.wins || 0;
  document.getElementById('statScore').textContent = state.user.totalScore || 0;
}

async function createRoom() {
  const roomName = document.getElementById('roomNameInput').value;
  if (!roomName) {
    alert('Vui lòng nhập tên phòng');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ roomName })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Failed to create room');
      return;
    }

    state.currentRoom = data;
    document.getElementById('roomNameInput').value = '';
    showRoomPage();
  } catch (error) {
    alert('Connection error: ' + error.message);
  }
}

async function loadRooms() {
  try {
    const response = await fetch(`${API_BASE}/rooms`);
    const rooms = await response.json();

    const container = document.getElementById('roomsContainer');
    if (rooms.length === 0) {
      container.innerHTML = '<p class="loading">Không có phòng nào. Hãy tạo một phòng!</p>';
      return;
    }

    container.innerHTML = rooms.map(room => `
      <div class="room-card" onclick="joinRoom('${room.roomCode}')">
        <h3>${room.roomName}</h3>
        <p>Chủ phòng: ${room.owner.displayName}</p>
        <p>Người chơi: ${room.playersCount}/${room.maxPlayers}</p>
        <p style="color: var(--success-color); font-weight: bold;">Nhấn để tham gia</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading rooms: - app.js:224', error);
  }
}

async function joinRoom(roomCode) {
  try {
    const response = await fetch(`${API_BASE}/rooms/${roomCode}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Failed to join room');
      return;
    }

    state.currentRoom = data;
    showRoomPage();
  } catch (error) {
    alert('Connection error: ' + error.message);
  }
}

// ===== ROOM PAGE =====

function showRoomPage() {
  showPage('roomPage');
  document.getElementById('roomNameDisplay').textContent = state.currentRoom.roomName;

  // Join via websocket
  state.socket.emit('join-room', {
    roomCode: state.currentRoom.roomCode,
    userId: state.user.id
  });

  updatePlayersList();
}

async function refreshRoom() {
  try {
    const response = await fetch(
      `${API_BASE}/rooms/${state.currentRoom.roomCode}`,
      {
        headers: { 'Authorization': `Bearer ${state.token}` }
      }
    );
    const data = await response.json();
    state.currentRoom = data;
    updatePlayersList();
  } catch (error) {
    console.error('Error refreshing room: - app.js:279', error);
  }
}

function updatePlayersList() {
  const container = document.getElementById('playersContainer');
  document.getElementById('playersCount').textContent = state.currentRoom.players.length;

  container.innerHTML = state.currentRoom.players.map(player => `
    <div class="player-item">
      <div class="player-info">
        <div class="player-avatar">${player.displayName[0].toUpperCase()}</div>
        <div>
          <div>${player.displayName}</div>
          <small>@${player.username}</small>
        </div>
      </div>
      <div class="player-status ${!player.isReady ? 'not-ready' : ''}">
        ${player.isReady ? '✓ Sẵn sàng' : '⏳ Chưa sẵn sàng'}
      </div>
    </div>
  `).join('');

  // Show start button if user is owner and all players are ready
  const isOwner = state.currentRoom.owner === state.user.id;
  const allReady = state.currentRoom.players.every(p => p.isReady);
  const startBtn = document.getElementById('startGameBtn');

  if (isOwner && allReady && state.currentRoom.players.length > 1) {
    startBtn.classList.remove('hidden');
  } else {
    startBtn.classList.add('hidden');
  }
}

function toggleReady() {
  const isReady = document.getElementById('readyToggle').checked;
  state.socket.emit('player-ready', {
    roomCode: state.currentRoom.roomCode,
    userId: state.user.id,
    isReady
  });

  fetch(`${API_BASE}/rooms/${state.currentRoom.roomCode}/ready`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    body: JSON.stringify({ isReady })
  }).then(() => refreshRoom());
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value;

  if (!message) return;

  state.socket.emit('chat-message', {
    roomCode: state.currentRoom.roomCode,
    username: state.user.displayName,
    message
  });

  input.value = '';
}

async function leaveRoom() {
  try {
    await fetch(`${API_BASE}/rooms/${state.currentRoom.roomCode}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });

    state.currentRoom = null;
    showPage('lobbyPage');
    loadRooms();
  } catch (error) {
    alert('Error leaving room: ' + error.message);
  }
}

async function startGame() {
  // Check if user is owner
  if (state.currentRoom.owner !== state.user.id) {
    alert('Chỉ chủ phòng mới có thể bắt đầu trò chơi');
    return;
  }

  state.socket.emit('start-game', {
    roomCode: state.currentRoom.roomCode,
    userId: state.user.id
  });
}

// ===== GAME PAGE =====

let gameState = {
  currentQuestionIndex: 0,
  score: 0,
  selectedAnswer: null,
  timeRemaining: 60,
  timerInterval: null,
  answered: false,
  otherPlayersAnswers: {},
  lifelinesUsed: {
    '50-50': false,
    'ask-audience': false,
    'stop-game': false
  }
};

function startGamePage(gameData) {
  state.gameData = gameData;
  gameState = {
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    timeRemaining: 60,
    timerInterval: null,
    answered: false,
    otherPlayersAnswers: {},
    lifelinesUsed: {
      '50-50': false,
      'ask-audience': false,
      'stop-game': false
    }
  };

  showPage('gamePage');
  displayQuestion(gameData.question);
  startTimer();
}

function displayQuestion(question) {
  document.getElementById('questionNumber').textContent = gameState.currentQuestionIndex + 1;
  document.getElementById('questionText').textContent = question.question;
  document.getElementById('optionA').textContent = question.options.a;
  document.getElementById('optionB').textContent = question.options.b;
  document.getElementById('optionC').textContent = question.options.c;
  document.getElementById('optionD').textContent = question.options.d;

  // Reset button states
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('selected', 'correct', 'wrong', 'disabled');
    btn.disabled = false;
  });

  document.getElementById('confirmAnswerBtn').classList.add('hidden');
  gameState.selectedAnswer = null;
  gameState.answered = false;
  gameState.otherPlayersAnswers = {};
  updateOtherPlayersDisplay();
}

function selectAnswer(answer) {
  if (gameState.answered) return;

  gameState.selectedAnswer = answer;
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-answer="${answer}"]`).classList.add('selected');

  // Hiển thị nút xác nhận
  document.getElementById('confirmAnswerBtn').classList.remove('hidden');
}

function confirmAnswer() {
  if (!gameState.selectedAnswer) {
    alert('Vui lòng chọn một đáp án');
    return;
  }

  state.socket.emit('answer-question', {
    roomCode: state.currentRoom.roomCode,
    userId: state.user.id,
    answer: gameState.selectedAnswer
  });

  gameState.answered = true;
  document.getElementById('confirmAnswerBtn').classList.add('hidden');
}

function startTimer() {
  gameState.timeRemaining = 60;
  clearInterval(gameState.timerInterval);

  gameState.timerInterval = setInterval(() => {
    gameState.timeRemaining--;
    document.getElementById('gameTimer').textContent = gameState.timeRemaining;

    if (gameState.timeRemaining <= 10) {
      document.getElementById('gameTimer').style.color = 'var(--secondary-color)';
    }

    if (gameState.timeRemaining <= 0) {
      clearInterval(gameState.timerInterval);
      autoNextQuestion();
    }
  }, 1000);
}

function useFiftyFifty() {
  if (gameState.lifelinesUsed['50-50']) {
    alert('Bạn đã dùng quyền trợ giúp này rồi');
    return;
  }

  state.socket.emit('use-lifeline', {
    roomCode: state.currentRoom.roomCode,
    userId: state.user.id,
    lifelineType: '50-50'
  });
}

function useAskAudience() {
  if (gameState.lifelinesUsed['ask-audience']) {
    alert('Bạn đã dùng quyền trợ giúp này rồi');
    return;
  }

  state.socket.emit('use-lifeline', {
    roomCode: state.currentRoom.roomCode,
    userId: state.user.id,
    lifelineType: 'ask-audience'
  });
}

function stopGame() {
  if (gameState.lifelinesUsed['stop-game']) {
    alert('Bạn đã dùng quyền trợ giúp này rồi');
    return;
  }

  if (!confirm('Bạn có chắc muốn dừng cuộc chơi?')) {
    return;
  }

  state.socket.emit('use-lifeline', {
    roomCode: state.currentRoom.roomCode,
    userId: state.user.id,
    lifelineType: 'stop-game'
  });
}

function exitGame() {
  if (confirm('Bạn có chắc muốn thoát game?')) {
    clearInterval(gameState.timerInterval);
    state.currentRoom = null;
    showPage('lobbyPage');
    loadRooms();
    loadUserStats();
  }
}

function updateOtherPlayersDisplay() {
  const container = document.getElementById('otherPlayersContainer');
  if (!container) return;

  const html = Object.entries(gameState.otherPlayersAnswers).map(([playerId, data]) => {
    return `
      <div class="other-player-status">
        <div class="player-name">${data.name}</div>
        <div class="player-answer">${data.hasAnswered ? `✓ Đã chọn: ${data.answer}` : '⏳ Chưa trả lời'}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html || '<p>Chỉ bạn trong phòng</p>';
}

function autoNextQuestion() {
  if (!gameState.answered) {
    selectAnswer(null);
  }
  setTimeout(() => state.socket.emit('next-question', { roomCode: state.currentRoom.roomCode }), 2000);
}

// ===== LEADERBOARD PAGE =====

function showLeaderboard(leaderboard) {
  showPage('leaderboardPage');
  const container = document.getElementById('leaderboardRows');

  container.innerHTML = leaderboard.map((player, index) => {
    let rankClass = '';
    if (index === 0) rankClass = 'first';
    else if (index === 1) rankClass = 'second';
    else if (index === 2) rankClass = 'third';

    return `
      <div class="leaderboard-row ${rankClass}">
        <div class="rank">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</div>
        <div class="name">${player.displayName}</div>
        <div class="score">${player.score} điểm</div>
      </div>
    `;
  }).join('');
}

function goToLobby() {
  showPage('lobbyPage');
  loadRooms();
  loadUserStats();
}

// ===== SOCKET EVENT LISTENERS =====

function setupSocketListeners() {
  state.socket.on('player-joined', (data) => {
    console.log('Player joined: - app.js:593', data);
    if (state.currentRoom) {
      refreshRoom();
    }
  });

  state.socket.on('chat-message', (data) => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    messageEl.innerHTML = `
      <div class="chat-sender">${data.username}</div>
      <div class="chat-text">${data.message}</div>
    `;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  state.socket.on('game-started', (data) => {
    console.log('Game started: - app.js:614', data);
    startGamePage(data);
  });

  state.socket.on('answer-received', (data) => {
    console.log('Answer received: - app.js:619', data);
    if (data.isCorrect) {
      gameState.score += data.pointsEarned;
      document.getElementById('currentScore').textContent = gameState.score + ' điểm';
      document.querySelector(`[data-answer="${gameState.selectedAnswer}"]`).classList.add('correct');
    } else {
      document.querySelector(`[data-answer="${gameState.selectedAnswer}"]`).classList.add('wrong');
    }
  });

  state.socket.on('next-question', (data) => {
    console.log('Next question: - app.js:630', data);
    gameState.currentQuestionIndex = data.currentQuestion - 1;
    displayQuestion(data.question);
    startTimer();
  });

  state.socket.on('lifeline-used', (data) => {
    console.log('Lifeline used: - app.js:637', data);

    // Mark lifeline as used if it's the current player
    if (data.userId === state.user.id) {
      if (data.type === '50-50') {
        gameState.lifelinesUsed['50-50'] = true;
        document.getElementById('lifelineHalf').disabled = true;
      } else if (data.type === 'ask-audience') {
        gameState.lifelinesUsed['ask-audience'] = true;
        document.getElementById('lifelineAudience').disabled = true;
      }
    }

    // Only apply visual effects if it's the current player's lifeline
    if (data.type === '50-50' && data.userId === state.user.id) {
      data.removedOptions.forEach(option => {
        const btn = document.querySelector(`[data-answer="${option}"]`);
        if (btn) btn.classList.add('disabled');
      });
    } else if (data.type === 'ask-audience' && data.userId === state.user.id) {
      const opinion = data.audienceOpinion;
      const resultText = `Khán giả bình chọn:\nA: ${opinion.a}%\nB: ${opinion.b}%\nC: ${opinion.c}%\nD: ${opinion.d}%`;
      alert(resultText);
    }
  });

  state.socket.on('lifeline-used-notification', (data) => {
    console.log('Player used lifeline: - app.js:664', data);
    // Just show a notification that another player used a lifeline
    // Don't apply any visual effects
  });

  state.socket.on('player-answer-update', (data) => {
    if (data.userId !== state.user.id) {
      gameState.otherPlayersAnswers[data.userId] = {
        name: data.displayName,
        hasAnswered: data.hasAnswered,
        answer: data.selectedAnswer
      };
      updateOtherPlayersDisplay();
    }
  });

  state.socket.on('game-ended', (data) => {
    console.log('Game ended: - app.js:681', data);
    clearInterval(gameState.timerInterval);
    showLeaderboard(data.leaderboard);
  });

  state.socket.on('player-stopped-game', (data) => {
    console.log('Player stopped game: - app.js:687', data);
    alert('Trò chơi đã dừng lại!');
  });

  state.socket.on('error', (data) => {
    alert('Lỗi: ' + data.message);
  });
}

// ===== UI HELPERS =====

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });
  document.getElementById(pageId).classList.remove('hidden');
}
