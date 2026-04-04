require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const questions = [
  // Difficulty 1 - Easy
  {
    question: 'Thủ đô của Pháp là gì?',
    options: {
      a: 'Cannes',
      b: 'Paris',
      c: 'Nice',
      d: 'Lyon'
    },
    correctAnswer: 'b',
    difficulty: 1,
    category: 'Geography'
  },
  {
    question: 'Năm nào Columbus khám phá Châu Mỹ?',
    options: {
      a: '1492',
      b: '1500',
      c: '1498',
      d: '1510'
    },
    correctAnswer: 'a',
    difficulty: 1,
    category: 'History'
  },
  {
    question: 'Biển Chết nằm giữa những quốc gia nào?',
    options: {
      a: 'Ai Cập và Israel',
      b: 'Israel và Jordan',
      c: 'Ai Cập và Jordan',
      d: 'Israel và Palestine'
    },
    correctAnswer: 'b',
    difficulty: 1,
    category: 'Geography'
  },
  {
    question: 'Phần tử hoá học nào có ký hiệu "O"?',
    options: {
      a: 'Vàng',
      b: 'Bạc',
      c: 'Oxy',
      d: 'Thị'
    },
    correctAnswer: 'c',
    difficulty: 1,
    category: 'Science'
  },
  {
    question: '2 cộng 2 bằng bao nhiêu?',
    options: {
      a: '3',
      b: '4',
      c: '5',
      d: '6'
    },
    correctAnswer: 'b',
    difficulty: 1,
    category: 'Math'
  },
  {
    question: 'Thủ đô của Việt Nam là gì?',
    options: {
      a: 'TP.HCM',
      b: 'Đà Nẵng',
      c: 'Hà Nội',
      d: 'Hải Phòng'
    },
    correctAnswer: 'c',
    difficulty: 1,
    category: 'Geography'
  },
  // Difficulty 2-3 - Easy-Medium
  {
    question: 'Cha đẻ của bóng đá hiện đại là ai?',
    options: {
      a: 'Pelé',
      b: 'Maradona',
      c: 'Những người Anh',
      d: 'Johan Cruyff'
    },
    correctAnswer: 'c',
    difficulty: 2,
    category: 'Sports'
  },
  {
    question: 'Ai Cập xây dựng Kim tự tháp Giza vào thời kỳ nào?',
    options: {
      a: 'Vương triều Mới',
      b: 'Vương triều Cũ',
      c: 'Vương triều Giữa',
      d: 'Vương triều Ptolemy'
    },
    correctAnswer: 'b',
    difficulty: 2,
    category: 'History'
  },
  {
    question: 'Nước nào là quê hương của cà phê arabica?',
    options: {
      a: 'Brazil',
      b: 'Colombia',
      c: 'Ethiopia',
      d: 'Vietnam'
    },
    correctAnswer: 'c',
    difficulty: 2,
    category: 'Geography'
  },
  {
    question: 'Nhà vật lý nào phát minh ra tính tương đối tính?',
    options: {
      a: 'Isaac Newton',
      b: 'Albert Einstein',
      c: 'Galileo Galilei',
      d: 'Stephen Hawking'
    },
    correctAnswer: 'b',
    difficulty: 3,
    category: 'Science'
  },
  {
    question: 'Chiến tranh Ba mươi năm diễn ra từ năm nào đến năm nào?',
    options: {
      a: '1600-1630',
      b: '1618-1648',
      c: '1580-1610',
      d: '1640-1670'
    },
    correctAnswer: 'b',
    difficulty: 3,
    category: 'History'
  },
  {
    question: 'Tác phẩm "Mona Lisa" được vẽ bởi ai?',
    options: {
      a: 'Michelangelo',
      b: 'Raphael',
      c: 'Leonardo da Vinci',
      d: 'Donatello'
    },
    correctAnswer: 'c',
    difficulty: 3,
    category: 'Art'
  },
  {
    question: 'Quần đảo Galápagos thuộc chủ quyền của nước nào?',
    options: {
      a: 'Peru',
      b: 'Colombia',
      c: 'Ecuador',
      d: 'Bolivia'
    },
    correctAnswer: 'c',
    difficulty: 3,
    category: 'Geography'
  },
  {
    question: 'Bóng tennis được tạo ra vào thế kỷ nào?',
    options: {
      a: 'Thế kỷ 11',
      b: 'Thế kỷ 12',
      c: 'Thế kỷ 19',
      d: 'Thế kỷ 20'
    },
    correctAnswer: 'c',
    difficulty: 3,
    category: 'Sports'
  },
  // Difficulty 4-5 - Hard
  {
    question: 'Hiến pháp của nước Mỹ được ký vào năm nào?',
    options: {
      a: '1776',
      b: '1787',
      c: '1792',
      d: '1803'
    },
    correctAnswer: 'b',
    difficulty: 4,
    category: 'History'
  },
  {
    question: 'Tác giả của "Anna Karenina" là ai?',
    options: {
      a: 'Fyodor Dostoevsky',
      b: 'Leo Tolstoy',
      c: 'Ivan Turgenev',
      d: 'Nikolai Gogol'
    },
    correctAnswer: 'b',
    difficulty: 4,
    category: 'Literature'
  },
  {
    question: 'Ngôn ngữ lập trình Python được tạo ra vào năm nào?',
    options: {
      a: '1989',
      b: '1991',
      c: '1993',
      d: '1995'
    },
    correctAnswer: 'a',
    difficulty: 4,
    category: 'Technology'
  },
  {
    question: 'Nước nào có diện tích liên tục lớn nhất trên Trái đất?',
    options: {
      a: 'Nga',
      b: 'Canada',
      c: 'Trung Quốc',
      d: 'Hoa Kỳ'
    },
    correctAnswer: 'a',
    difficulty: 4,
    category: 'Geography'
  },
  {
    question: 'Phản ứng quang hợp diễn ra ở phần nào của cây xanh?',
    options: {
      a: 'Gốc',
      b: 'Thân',
      c: 'Lá',
      d: 'Hoa'
    },
    correctAnswer: 'c',
    difficulty: 5,
    category: 'Science'
  },
  {
    question: 'Chu kỳ Milankovitch ảnh hưởng đến điều gì?',
    options: {
      a: 'Chuyển động tự quay Trái đất',
      b: 'Khí hậu địa cầu',
      c: 'Từ trường Trái đất',
      d: 'Lực hấp dẫn'
    },
    correctAnswer: 'b',
    difficulty: 5,
    category: 'Science'
  },
  {
    question: 'Tác giả của lý thuyết Tiến hóa là ai?',
    options: {
      a: 'Jean-Baptiste Lamarck',
      b: 'Charles Darwin',
      c: 'Gregor Mendel',
      d: 'Thomas Huxley'
    },
    correctAnswer: 'b',
    difficulty: 5,
    category: 'Science'
  },
  {
    question: 'Cuộc cách mạng Pháp bắt đầu vào năm nào?',
    options: {
      a: '1788',
      b: '1789',
      c: '1790',
      d: '1791'
    },
    correctAnswer: 'b',
    difficulty: 5,
    category: 'History'
  },
  {
    question: 'Ai là tác giả của "Những người Anh quốc"?',
    options: {
      a: 'James Joyce',
      b: 'George Orwell',
      c: 'Joseph Conrad',
      d: 'D.H. Lawrence'
    },
    correctAnswer: 'd',
    difficulty: 6,
    category: 'Literature'
  },
  {
    question: 'Thủ đô của Kazakhstan là gì?',
    options: {
      a: 'Almaty',
      b: 'Bishkek',
      c: 'Astana',
      d: 'Karaganda'
    },
    correctAnswer: 'c',
    difficulty: 6,
    category: 'Geography'
  },
  {
    question: 'The Beatles được thành lập vào năm nào?',
    options: {
      a: '1960',
      b: '1963',
      c: '1965',
      d: '1968'
    },
    correctAnswer: 'b',
    difficulty: 6,
    category: 'Music'
  },
  {
    question: 'Ai phát minh ra máy điện tín?',
    options: {
      a: 'Alexander Graham Bell',
      b: 'Samuel Morse',
      c: 'Thomas Edison',
      d: 'Nikola Tesla'
    },
    correctAnswer: 'b',
    difficulty: 6,
    category: 'Technology'
  },
  {
    question: 'Biểu tượng hoá học của Thorium là gì?',
    options: {
      a: 'Th',
      b: 'Tr',
      c: 'To',
      d: 'Tm'
    },
    correctAnswer: 'a',
    difficulty: 6,
    category: 'Science'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert new questions
    await Question.insertMany(questions);
    console.log(`Successfully inserted ${questions.length} questions`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();