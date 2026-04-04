# Ai Là Triệu Phú Online

Một game đố vui nhiều người chơi trực tuyến dựa trên "Who Wants to Be a Millionaire" được xây dựng bằng Node.js, Express, MongoDB, Socket.io và JavaScript.

## 📋 Tính Năng Chính

✅ **Hệ Thống Tài Khoản**
- Đăng ký, đăng nhập, quên mật khẩu
- Hồ sơ người dùng với thống kê

✅ **Phòng Chơi Multiplayer**
- Tạo và tham gia phòng (tối đa 4 người)
- Chủ phòng kiểm soát bắt đầu game
- Trò chuyện thời gian thực

✅ **Trò Chơi**
- 15 câu hỏi từ dễ đến khó
- 60 giây cho mỗi câu hỏi
- Trả lời đúng: +15 điểm, sai: 0 điểm

✅ **Quyền Trợ Giúp (Lifelines)**
- 50/50: Loại bỏ 2 đáp án sai
- Hỏi Ý Kiến Khán Giả: Xem bình chọn của khán giả
- Chặn Người Chơi Khác: Ngăn người khác trả lời
- Dừng Cuộc Chơi: Kết thúc và xem bảng xếp hạng

✅ **Bảng Xếp Hạng**
- Hiển thị điểm số của mỗi phòng
- Xếp hạng từ cao đến thấp

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu Cầu
- Node.js 14.0.0+
- MongoDB 4.0+
- npm hoặc yarn

### 2. Clone / Setup
```bash
cd c:\mmm
npm install
```

### 3. Cấu Hình Biến Môi Trường
Tạo file `.env`:
```
MONGODB_URI=mongodb://localhost:27017/millionaire
JWT_SECRET=your_secret_key_change_this_in_production
PORT=3000
NODE_ENV=development
```

### 4. Khởi Động MongoDB
```bash
mongod
```

### 5. Seed Câu Hỏi
```bash
npm run seed
```

### 6. Chạy Server
```bash
npm start
```

hoặc development mode:
```bash
npm run dev
```

### 7. Truy Cập Ứng Dụng
```
http://localhost:3000
```

---

## 📁 Cấu Trúc Dự Án

```
📦 mmm/
├── 📄 package.json
├── 📄 .env
├── 📄 seed.js
├── 📁 server/
│   └── server.js              # Express + Socket.io
├── 📁 models/
│   ├── User.js
│   ├── Room.js
│   ├── Game.js
│   └── Question.js
├── 📁 routes/
│   ├── auth.js
│   ├── rooms.js
│   └── questions.js
├── 📁 middleware/
│   └── auth.js
└── 📁 public/
    ├── index.html
    ├── styles.css
    └── app.js
```

---

## 🎮 Cách Chơi

1. **Đăng Ký & Đăng Nhập**: Tạo tài khoản hoặc đăng nhập
2. **Xem Phòng**: Danh sách phòng chơi có sẵn
3. **Tham Gia/Tạo Phòng**: Chọn phòng hoặc tạo phòng mới
4. **Chuẩn Bị**: Bấm "Sẵn sàng", chủ phòng chờ tất cả sẵn sàng
5. **Bắt Đầu**: Chủ phòng nhấn "Bắt Đầu Trò Chơi"
6. **Chơi**: 60 giây cho mỗi câu, sử dụng quyền trợ giúp khi cần
7. **Kết Thúc**: Xem bảng xếp hạng

---

## 🔌 WebSocket Events

```javascript
// Tham gia phòng
'join-room'

// Gửi tin nhắn
'chat-message'

// Bắt đầu trò chơi
'start-game'

// Trả lời câu hỏi
'answer-question'

// Sử dụng quyền trợ giúp
'use-lifeline'

// Nhận sự kiện
'game-started'
'answer-received'
'next-question'
'lifeline-used'
'game-ended'
```

---

## 🌐 API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/auth/me`

### Rooms
- `POST /api/rooms` - Tạo phòng
- `GET /api/rooms` - Danh sách phòng
- `POST /api/rooms/:roomCode/join` - Tham gia
- `POST /api/rooms/:roomCode/leave` - Rời phòng
- `POST /api/rooms/:roomCode/ready` - Đánh dấu sẵn sàng

### Questions
- `GET /api/questions` - Tất cả câu hỏi
- `POST /api/questions` - Thêm câu hỏi
- `PUT /api/questions/:id` - Chỉnh sửa
- `DELETE /api/questions/:id` - Xóa

---

## 🎨 Giao Diện

- **Dark Theme** với gradient màu xanh-đỏ
- **Responsive Design** (Mobile & Desktop)
- **Real-time Updates** với Socket.io
- **Beautiful Animations** và Transitions

---

## 💾 Dữ Liệu

### Collections
- **Users**: Thông tin người dùng, mật khẩu, thống kê
- **Questions**: Câu hỏi, đáp án, độ khó
- **Rooms**: Phòng chơi, người chơi, trạng thái
- **Games**: Lịch sử trò chơi, điểm số, bảng xếp hạng

---

## 🛡️ Bảo Mật

- JWT token cho authentication
- Password hashing với bcryptjs
- CORS configuration
- Input validation

---

## 📊 Statistics Tracked

- Tổng số trò chơi đã chơi
- Số lần thắng
- Tổng điểm số

---

## 🔧 Troubleshooting

**MongoDB không kết nối?**
- Kiểm tra MongoDB đang chạy
- Xác nhận MONGODB_URI trong .env

**Port 3000 đã bị dùng?**
- Thay đổi PORT trong .env

**WebSocket failed?**
- Xóa cache browser
- Kiểm tra server đang chạy

---

## 📖 Dependencies

- **express**: Web framework
- **socket.io**: Real-time communication
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT auth
- **dotenv**: Environment variables
- **cors**: Cross-origin requests

---

## 📝 License

MIT License

---

## 👨‍💻 Author

Made with ❤️ for fun

**Chúc bạn chơi vui vẻ! 🎮💰**
