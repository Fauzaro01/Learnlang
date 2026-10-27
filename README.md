# 📚 LernLang - Belajar Bahasa Inggris dengan AI

Aplikasi web modern untuk belajar bahasa Inggris melalui latihan terjemahan yang dinilai oleh AI.

## ✨ Fitur

- 🎯 **Generate Kalimat AI** - Kalimat otomatis dengan 3 tingkat kesulitan (Mudah, Sedang, Sulit)
- 📝 **Latihan Terjemahan** - Terjemahkan kalimat Inggris ke Indonesia
- 🤖 **Evaluasi AI** - Score 0-100 dengan feedback konstruktif
- 👥 **Quiz & Kuis** - Sistem kuis dengan pertanyaan pilihan ganda
- 💬 **Komentar & Reaksi Real-Time** - Diskusi di blog dengan WebSocket
- 📚 **Blog & Artikel** - Baca artikel pembelajaran
- 👤 **User Profile** - Simpan progress belajar Anda
- 🎨 **Modern UI** - Desain clean dengan Shadcn/UI

## 🚀 Quick Start

### 1. Instalasi

```bash
# Clone repository
git clone <repo-url>
cd learnlang

# Install dependencies
npm install
```

### 2. Setup Database (MySQL)

```bash
# Setup Prisma
npm run db:generate
npm run db:migrate

# Seed sample data (includes 50+ A1 vocabulary items)
npm run db:seed
```

**Seed Data Included:**

- 50+ A1 vocabulary questions across categories: numbers, colors, body parts, furniture, family, animals, food, professions, transport, clothing, weather, rooms, nature
- All questions optimized for true beginner (A1) level learning

### 3. Setup AI Gateway (9Router)

Jalankan 9Router lokal atau gunakan endpoint 9Router Anda:

```bash
# Default 9Router berjalan di: http://localhost:20128
# Dashboard & API keys: http://localhost:20128
```

*(Opsional: Jika ingin tetap menggunakan Ollama secara lokal, set `AI_PROVIDER=ollama` di `.env`)*

### 4. Setup Environment Variables

Salin `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Sesuaikan konfigurasi environment:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=mysql://user:password@localhost:3306/learnlang

# AI Provider (9Router)
AI_PROVIDER=9router
NINEROUTER_BASE_URL=http://localhost:20128/v1
NINEROUTER_API_KEY=your-api-key-here
NINEROUTER_MODEL=openai/gpt-4o-mini
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📖 Fitur Lengkap

### 🎓 Learning Module

#### Session-Based Learning (NEW)

The learning system now uses persistent session architecture for better tracking and scoring:

- **Methods Available**: Vocabulary, Listening, Grammar
- **Session Persistence**: Each session stores selected questions and user answers
- **Progressive Feedback**: Real-time correctness indicators after each answer
- **Score Tracking**: Final results page with percentage score and detailed review
- **History Integration**: Completed sessions saved to learning history for progress tracking

**Starting a Learning Session:**

1. Navigate to `/learn`
2. Select a learning method (vocabulary, listening, grammar)
3. Choose difficulty level (A1, A2, B1, B2, C1, C2)
4. Set number of questions
5. Answer each question with instant feedback
6. Submit all answers to see results
7. Review detailed answer breakdown

**Session Flow:**

- Session creation: `POST /api/learn/session` with `{ method, level, limit }`
- Answer submission: `POST /api/learn/session/[id]` with `{ answers: { sessionQuestionId: userAnswer } }`
- Results include: percentage score, total correct, detailed answer review

#### Legacy Features

- Generate kalimat dari AI
- Latihan terjemahan dengan feedback
- Lihat riwayat pembelajaran
- Statistik progress

### 📝 Quiz System

- Create & manage quiz (admin)
- Solve quiz dengan pilihan ganda
- Auto-scoring & detailed results
- Track quiz progress

### 💬 Blog & Community

- Read articles
- Real-time comments
- Reactions (👍 ❤️ 😂 🎉 🤔 👏)
- Comment & reaction notifications

### 👤 User Management

- Register & login
- Edit profile
- View activity history
- Admin dashboard

## 🛠 Tech Stack

- **Framework**: Next.js 16
- **Database**: MySQL + Prisma
- **Auth**: NextAuth.js
- **Real-Time**: Socket.IO
- **AI Gateway**: 9Router (OpenAI-compatible smart router, fallback ke Ollama didukung)
- **UI**: Shadcn/UI + Tailwind CSS
- **Animation**: Framer Motion

## 📋 Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (dev only)
npm run db:seed          # Seed sample data
```

## 🔌 Learning API Endpoints

### Create/Get Session

```
POST /api/learn/session
Content-Type: application/json

Body:
{
  "method": "vocabulary|listening|grammar",
  "level": "A1|A2|B1|B2|C1|C2",
  "limit": 5
}

Response (200):
{
  "success": true,
  "data": {
    "session": {
      "id": "string",
      "userId": "string",
      "method": "string",
      "level": "string",
      "total": 5,
      "score": 0,
      "status": "IN_PROGRESS",
      "createdAt": "ISO datetime"
    },
    "questions": [
      {
        "sessionQuestionId": "string",
        "question": "string",
        "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "userAnswer": null,
        "isCorrect": null
      }
    ]
  }
}
```

### Submit Session Answers

```
POST /api/learn/session/[id]
Content-Type: application/json

Body:
{
  "answers": {
    "sessionQuestionId1": "A",
    "sessionQuestionId2": "B",
    "sessionQuestionId3": "C"
  }
}

Response (200):
{
  "success": true,
  "data": {
    "session": {
      "status": "COMPLETED",
      "score": 3,
      "total": 5,
      "completedAt": "ISO datetime"
    },
    "results": {
      "totalCorrect": 3,
      "total": 5,
      "percentage": 60,
      "details": [
        {
          "question": "...",
          "userAnswer": "A",
          "correctAnswer": "B",
          "isCorrect": false
        }
      ]
    }
  }
}
```

### Get Session Details

```
GET /api/learn/session?sessionId=[id]

Response (200):
{
  "success": true,
  "data": {
    "session": { ... },
    "questions": [ ... ]
  }
}
```

### Get Session Results

```
GET /api/learn/session/[id]

Response (200):
{
  "success": true,
  "data": {
    "session": { ... },
    "questions": [ ... ]
  }
}
```

## 🎵 AudioPlayer Component

For listening exercises, use the `<AudioPlayer />` component:

```jsx
import AudioPlayer from "@/components/AudioPlayer";

<AudioPlayer audioUrl="/path/to/audio.mp3" title="Listening Exercise 1" />;
```

**Features:**

- Play/pause with loading indicator
- Progress bar with seek functionality
- Time display and duration
- Buffered progress visualization
- Error handling with fallback UI
- Volume control ready for extension

## 🔑 Default Login

```
Email: admin@example.com
Password: admin123
```

## 🧪 Testing

### Run Tests

```bash
npm test                 # Run all tests
npm run test:watch      # Run in watch mode
npm run test:coverage   # Generate coverage report
```

### Test Structure

- `lib/__tests__/` - Unit tests for utilities and APIs
- `app/api/__tests__/` - API endpoint integration tests
- Coverage includes: auth, validation, rate limiting, socket events, and learning APIs

### Learn API Tests

Tests for the session-based learning system:

- Session creation with valid/invalid methods
- Question fetching by method
- Answer submission and scoring (100%, 50%, 0%)
- Session completion and history creation
- Edge cases (no questions, already completed, non-existent sessions)

## 📂 Project Structure

```
learnlang/
├── app/                      # Next.js app directory
│   ├── api/
│   │   ├── learn/            # Learning API endpoints
│   │   │   ├── [method]/     # GET questions by method
│   │   │   ├── session/      # POST/GET create & fetch sessions
│   │   │   └── session/[id]/ # GET details, POST submit answers
│   │   ├── admin/            # Admin endpoints
│   │   ├── quiz/             # Quiz endpoints
│   │   └── ...
│   ├── admin/                # Admin pages
│   ├── learn/                # Learning module pages
│   ├── quiz/                 # Quiz pages
│   ├── blogs/                # Blog pages
│   ├── chats/                # Direct messaging (real-time)
│   ├── diskusi/              # Discussion rooms
│   ├── friends/              # Friend management
│   ├── layout.js             # Root layout
│   └── page.js               # Home page
├── components/
│   ├── MethodPracticeClient.jsx  # Main learning session UI
│   ├── AudioPlayer.jsx           # Audio player for listening exercises
│   ├── ChatWindow.jsx            # Chat component
│   ├── BlogComments.jsx          # Blog comments
│   └── ...
├── lib/                      # Utilities & helpers
│   ├── api-response.js       # Centralized API response format
│   ├── auth.js               # NextAuth configuration
│   ├── notifications.js      # Real-time notifications
│   ├── socket.js             # Socket.IO helpers
│   └── __tests__/            # Unit tests
├── prisma/
│   ├── schema.prisma         # Database models
│   ├── seed.js               # Seed orchestrator
│   └── seed/
│       └── questions.js      # 50+ A1 vocabulary questions
└── public/                   # Static assets
```

## 🎯 Next Steps

- Login ke aplikasi
- Explore fitur Learning untuk belajar
- Coba Quiz System
- Baca articles di Blog section
- Join komunitas di comments & reactions

---

**LernLang** © 2026 - Learn English with AI
