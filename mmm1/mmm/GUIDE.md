# Ai Là Triệu Phú Online - Game Guide

## Cài Đặt & Khởi Động

### 1. Cài Đặt Dependencies
```bash
npm install
```

### 2. Khởi Động MongoDB
Đảm bảo MongoDB đang chạy cục bộ trên port 27017 hoặc cập nhật `MONGODB_URI` trong file `.env`

### 3. Seed Questions
```bash
npm run seed
```

### 4. Chạy Server
```bash
npm start
```
hoặc để chạy ở chế độ development với hot-reload:
```bash
npm run dev
```

### 5. Truy Cập Ứng Dụng
Mở trình duyệt và truy cập: **http://localhost:3000**

---

## Tính Năng Chính

### 1. 👤 Hệ Thống Tài Khoản
- ✅ Đăng Ký (Signup)
- ✅ Đăng Nhập (Login)
- ✅ Quên Mật Khẩu (Forgot Password)
- ✅ Hồ Sơ Người Dùng với thống kê

### 2. 🎮 Tạo & Tham Gia Phòng Chơi
- ✅ Tạo phòng chơi mới
- ✅ Xem danh sách phòng có sẵn
- ✅ Tham gia phòng (tối đa 4 người)
- ✅ Chủ phòng kiểm soát bắt đầu trò chơi
- ✅ Trò chuyện trong phòng

### 3. 🎯 Quy Tắc Trò Chơi
- **15 Câu Hỏi** từ dễ đến khó
- **60 Giây** cho mỗi câu hỏi
- **Trả lời đúng**: +15 điểm
- **Trả lời sai**: 0 điểm
- **Cùng một tập câu hỏi** cho tất cả người chơi

### 4. 🆘 Quyền Trợ Giúp (Lifelines)
Mỗi quyền chỉ được dùng 1 lần:

- **50/50** - Loại bỏ 2 câu trả lời sai
- **🎤 Hỏi Ý Kiến Khán Giả** - Xem bình chọn của khán giả (%)
- **🚫 Chặn Người Chơi Khác** - Ngăn người khác trong phòng trả lời
- **⚠️ Dừng Cuộc Chơi** - Kết thúc trò chơi và hiển thị bảng xếp hạng

### 5. 🏆 Bảng Xếp Hạng
- Từng phòng có bảng xếp hạng riêng
- Hiển thị top 3 người chiến thắng (🥇 🥈 🥉)
- Chi tiết: Tên, Điểm, Vị trí

### 6. 📊 Thống Kê Người Chơi
- Số trò chơi đã chơi
- Số lần thắng
- Tổng điểm

---

## 📁 Cấu Trúc Dự Án

```
📦 ai-la-trieu-phu
 ├── 📄 package.json              # Dependencies & Scripts
 ├── 📄 .env                      # Biến môi trường
 ├── 📄 seed.js                   # Seed dữ liệu câu hỏi
 ├── 📁 server/
 │   └── 📄 server.js            # Express + Socket.io
 ├── 📁 models/
 │   ├── 📄 User.js              # Model người dùng
 │   ├── 📄 Room.js              # Model phòng chơi
 │   ├── 📄 Game.js              # Model trò chơi
 │   └── 📄 Question.js          # Model câu hỏi
 ├── 📁 routes/
 │   ├── 📄 auth.js              # API xác thực
 │   ├── 📄 rooms.js             # API phòng chơi
 │   └── 📄 questions.js         # API câu hỏi
 ├── 📁 middleware/
 │   └── 📄 auth.js              # JWT Middleware
 └── 📁 public/
     ├── 📄 index.html           # Trang chính
     ├── 📄 styles.css           # Styling
     └── 📄 app.js               # Frontend logic
```

---

## 🔌 WebSocket Events

### Client → Server

```javascript
// Tham gia phòng
socket.emit('join-room', { roomCode, userId })

// Gửi tin nhắn
socket.emit('chat-message', { roomCode, username, message })

// Bắt đầu trò chơi
socket.emit('start-game', { roomCode, userId })

// Trả lời câu hỏi
socket.emit('answer-question', { roomCode, userId, answer })

// Tiếp tục câu hỏi tiếp theo
socket.emit('next-question', { roomCode })

// Sử dụng quyền trợ giúp
socket.emit('use-lifeline', { roomCode, userId, lifelineType })
```

### Server → Client

```javascript
// Người chơi tham gia
socket.on('player-joined', data)

// Nhận tin nhắn
socket.on('chat-message', data)

// Trò chơi bắt đầu
socket.on('game-started', data)

// Trả lời được nhận
socket.on('answer-received', data)

// Câu hỏi tiếp theo
socket.on('next-question', data)

// Quyền trợ giúp được sử dụng
socket.on('lifeline-used', data)

// Trò chơi kết thúc
socket.on('game-ended', data)
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `GET /api/auth/me` - Lấy thông tin người dùng

### Rooms
- `POST /api/rooms` - Tạo phòng
- `GET /api/rooms` - Danh sách phòng
- `GET /api/rooms/:roomCode` - Chi tiết phòng
- `POST /api/rooms/:roomCode/join` - Tham gia phòng
- `POST /api/rooms/:roomCode/leave` - Rời phòng
- `POST /api/rooms/:roomCode/ready` - Đánh dấu sẵn sàng

### Questions
- `GET /api/questions` - Tất cả câu hỏi
- `GET /api/questions/random/15` - 15 câu ngẫu nhiên
- `POST /api/questions` - Thêm câu hỏi mới
- `PUT /api/questions/:id` - Chỉnh sửa câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi

---

## 🔍 Quy Trình Chơi Game

1. **Đăng Nhập**: Người dùng đăng ký & đăng nhập
2. **Xem Phòng**: Hiển thị danh sách phòng có sẵn
3. **Tham Gia/Tạo**: Tham gia hoặc tạo phòng chơi
4. **Chuẩn Bị**: Chủ phòng bấm "Sẵn sàng", chờ các người khác
5. **Bắt Đầu**: Khi tất cả sẵn sàng, chủ phòng nhấn "Bắt Đầu"
6. **Chơi Game**: 
   - Mỗi câu hỏi 60 giây
   - Người chơi chọn đáp án A/B/C/D
   - Có thể sử dụng quyền trợ giúp
7. **Kết Thúc**: Sau 15 câu, hiển thị bảng xếp hạng
8. **Lặp Lại**: Quay lại sảnh chơi

---

## ⚙️ Yêu Cầu Hệ Thống

- **Node.js**: v14.0.0+
- **MongoDB**: v4.0+
- **Browser**: Chrome, Firefox, Safari, Edge (hiện đại)

---

## 🛠 Troubleshooting

### MongoDB không kết nối
```
Kiểm tra:
- MongoDB đang chạy? (mongod)
- PORT chính xác? (27017)
- MONGODB_URI trong .env?
```

### Port 3000 đã sử dụng
```bash
# Thay đổi PORT trong .env
PORT=3001
```

### WebSocket Connection Failed
```
- Kiểm tra CORS configuration
- Đảm bảo server đang chạy
- Xóa cache browser
```

---

## 📝 License

MIT License - Tự do sử dụng & phát triển

---

## 👨‍💻 Tác Giả

Tạo bởi Team Development

---

## 📧 Hỗ Trợ

Liên hệ qua email hoặc tạo issue trên GitHub

**Chúc bạn chơi vui vẻ! 🎮**
