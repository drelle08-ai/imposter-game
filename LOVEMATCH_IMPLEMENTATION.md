# Love Match - Implementation Roadmap
## Family-Friendly Couples Dating Game

---

## 🎮 **GAME SPECIFICATION (Final)**

### **Removed:**
- ❌ Spicy Round (keeping it family-friendly)

### **Included:**
- ✅ 4 Question Categories (Food, Romance, Confessions, Custom)
- ✅ 4 Special Rounds (Double or Nothing, Audience Guess, Hot Streak, Wildcard)
- ✅ 3-Phase gameplay (Question, Answer Privately, Reveal)
- ✅ Real-time multiplayer (3-8 couples)
- ✅ Scoring + Bonus points
- ✅ Compatibility score + Shareable results
- ✅ Host controls
- ✅ Leaderboards

---

## 📊 **DATABASE SCHEMA**

```sql
-- Game Rooms
CREATE TABLE love_match_rooms (
  id UUID PRIMARY KEY,
  host_id UUID REFERENCES users(id),
  room_code VARCHAR(6) UNIQUE,
  status VARCHAR(20), -- 'lobby', 'in_progress', 'ended'
  round_number INT DEFAULT 1,
  current_phase VARCHAR(20), -- 'question', 'answer', 'reveal'
  max_rounds INT DEFAULT 10,
  max_couples INT DEFAULT 8,
  timer_end_at TIMESTAMP,
  created_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Game Teams (Couples)
CREATE TABLE love_match_teams (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES love_match_rooms(id),
  team_name VARCHAR(100),
  player1_id UUID REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  is_player1_hot_seat BOOLEAN, -- alternates each round
  total_points INT DEFAULT 0,
  created_at TIMESTAMP
);

-- Game Rounds
CREATE TABLE love_match_rounds (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES love_match_rooms(id),
  round_number INT,
  question_id UUID REFERENCES love_match_questions(id),
  phase VARCHAR(20), -- 'question', 'answer', 'reveal'
  hot_seat_player_id UUID REFERENCES users(id),
  timer_end_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Answers (both hot seat and guesser)
CREATE TABLE love_match_answers (
  id UUID PRIMARY KEY,
  round_id UUID REFERENCES love_match_rounds(id),
  team_id UUID REFERENCES love_match_teams(id),
  hot_seat_answer TEXT,
  guesser_answer TEXT,
  match_type VARCHAR(20), -- 'exact', 'close', 'miss'
  points_awarded INT DEFAULT 0,
  submitted_at TIMESTAMP
);

-- Scoring per round
CREATE TABLE love_match_round_scores (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES love_match_rooms(id),
  round_number INT,
  team_id UUID REFERENCES love_match_teams(id),
  round_points INT,
  bonus_points INT DEFAULT 0,
  total_points INT,
  created_at TIMESTAMP
);

-- Questions Database
CREATE TABLE love_match_questions (
  id UUID PRIMARY KEY,
  category VARCHAR(50), -- 'food', 'romance', 'confessions', 'custom'
  text TEXT,
  difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP
);

-- Custom Questions (per game)
CREATE TABLE love_match_custom_questions (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES love_match_rooms(id),
  question_text TEXT,
  submitted_by_team_id UUID REFERENCES love_match_teams(id),
  created_at TIMESTAMP
);

-- Game Results / Compatibility
CREATE TABLE love_match_game_results (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES love_match_rooms(id),
  team_id UUID REFERENCES love_match_teams(id),
  final_points INT,
  exact_matches INT,
  close_matches INT,
  missed_matches INT,
  compatibility_score INT, -- 0-100
  placement INT, -- 1st, 2nd, 3rd, etc
  created_at TIMESTAMP
);
```

---

## 🏗️ **PROJECT STRUCTURE**

```
imposter-game/
├── app/
│   ├── games/
│   │   ├── [code]/
│   │   │   ├── love/
│   │   │   │   ├── page.tsx ..................... Lobby
│   │   │   │   ├── play/
│   │   │   │   │   └── page.tsx ................. Game Play (3 phases)
│   │   │   │   └── results/
│   │   │   │       └── page.tsx ................. Results & Compatibility
│   │
│   ├── api/
│   │   └── games/
│   │       ├── love/
│   │       │   ├── create/route.ts ............. Create room
│   │       │   ├── join/route.ts ............... Join room
│   │       │   ├── start/route.ts .............. Start game
│   │       │   ├── answer/route.ts ............. Submit answers
│   │       │   ├── advance-phase/route.ts ...... Move to next phase
│   │       │   ├── judge-close/route.ts ........ Judge close matches
│   │       │   └── end/route.ts ................ End game
│   │
│   └── components/
│       └── love-match/
│           ├── LoveMatchLobby.tsx .............. Lobby component
│           ├── GamePhase1.tsx .................. Question phase
│           ├── GamePhase2.tsx .................. Answer phase
│           ├── GamePhase3.tsx .................. Reveal phase
│           ├── Leaderboard.tsx ................. Live leaderboard
│           └── CompatibilityScore.tsx .......... Results card
│
├── lib/
│   ├── love-match-questions.ts ................. Question database
│   └── love-match-scoring.ts ................... Scoring logic
│
└── public/
    └── games/
        └── love-match/
            └── assets/ ......................... Icons, backgrounds
```

---

## 📅 **DEVELOPMENT TIMELINE**

### **Week 1: Foundation (Database + Lobby)**
- [ ] Create database tables
- [ ] Build lobby page (create/join room)
- [ ] Team registration
- [ ] Host controls setup
- [ ] Real-time room state

**Deliverable:** Players can create rooms and join with codes

---

### **Week 2: Core Gameplay (3-Phase System)**
- [ ] Phase 1: Question display (10s timer)
- [ ] Phase 2: Private answer input (30s timer)
- [ ] Phase 3: Reveal simultaneously
- [ ] Real-time timer synchronization
- [ ] Server-side phase management

**Deliverable:** Full gameplay loop works for 1 round

---

### **Week 3: Scoring + Leaderboard + Results**
- [ ] Scoring logic (exact, close, miss)
- [ ] Bonus points (fastest match, hot streak)
- [ ] Live leaderboard display
- [ ] Compatibility score calculation
- [ ] Results screen + shareable card

**Deliverable:** Complete 10-round game flow

---

### **Week 4: Polish + Features**
- [ ] Question categories (Food, Romance, Confessions, Custom)
- [ ] Special rounds (Double or Nothing, Audience Guess, Wildcard)
- [ ] Host controls (skip, extend, unlock)
- [ ] Mobile optimization
- [ ] Testing + bug fixes

**Deliverable:** Production-ready Love Match

---

## 🎯 **FEATURE BREAKDOWN**

### **Core (Week 1-3):**
- [x] Room creation with unique code
- [x] Join room (4-8 couples)
- [x] Team registration (player names)
- [x] Role assignment (who answers first)
- [x] 3-phase gameplay
- [x] Timer synchronization
- [x] Private answer submission
- [x] Simultaneous reveal
- [x] Scoring system
- [x] Leaderboard
- [x] Compatibility score
- [x] Results screen
- [x] Shareable results

### **Special (Week 4):**
- [ ] 4 Question categories
- [ ] Custom questions (couples submit)
- [ ] Double or Nothing round
- [ ] Audience Guess round
- [ ] Hot Streak bonus
- [ ] Wildcard round
- [ ] Host controls
- [ ] Mobile responsive

---

## 🛠️ **TECHNICAL CONSIDERATIONS**

### **Real-Time Synchronization:**
```typescript
// Timer must be server-side, not client-side
// All clients subscribe to game:LOVE[CODE]:phase channel
// When phase changes, everyone updates instantly

Supabase.channel(`game:LOVE${code}:phase`)
  .on('broadcast', { event: 'phase_change' }, (payload) => {
    setCurrentPhase(payload.phase);
    setTimerEndAt(payload.timerEndAt);
  })
  .subscribe();
```

### **Private Answers:**
```typescript
// Answers stored but hidden until reveal phase
// Only after reveal do we show all answers
// Frontend: Don't render guesser's answer until Phase 3

const { data: round } = await supabase
  .from('love_match_rounds')
  .select('phase')
  .eq('id', roundId)
  .single();

// Only show answers if phase === 'reveal'
if (round.phase === 'reveal') {
  showAnswers();
}
```

### **Scoring Logic:**
```typescript
function scoreRound(hotSeatAnswer, guesserAnswer) {
  const cleanHot = hotSeatAnswer.toLowerCase().trim();
  const cleanGuess = guesserAnswer.toLowerCase().trim();
  
  // Exact match (case-insensitive, whitespace-insensitive)
  if (cleanHot === cleanGuess) {
    return { type: 'exact', points: 3 };
  }
  
  // Close match (host judgment or semantic similarity)
  // Host clicks approve/reject for borderline cases
  return { type: 'miss', points: 0 };
}
```

---

## 🎮 **GAME FLOW PSEUDOCODE**

```typescript
// 1. LOBBY PHASE
- Host creates room (code: LOVE42)
- 3-8 couples join, register as teams
- Host sets max rounds (1-20)
- Host adds custom questions (optional)
- Host clicks "START GAME"

// 2. ROUND LOOP (repeat 10 times)
for (let round = 1; round <= maxRounds; round++) {
  
  // Assign roles (rotate who answers)
  const hotSeatPlayer = getHotSeatPlayer(round);
  const guesserPlayer = getGuesserPlayer(round);
  
  // PHASE 1: QUESTION (10s)
  setPhase('question');
  displayQuestion(selectedQuestion);
  await timer(10 seconds);
  
  // PHASE 2: ANSWER (30s)
  setPhase('answer');
  
  // Hot seat answers privately
  hotSeatPlayer.submitAnswer(true); // hidden from partner
  
  // Guesser guesses publicly
  guesserPlayer.submitGuess(true); // also hidden
  
  await timer(30 seconds);
  
  // PHASE 3: REVEAL (15s)
  setPhase('reveal');
  
  // Show all couples' answers simultaneously
  displayAllAnswers();
  
  // Judge close matches (host decision)
  if (closeMatch(answer1, answer2)) {
    host.judgeCloseMatch(); // approve or reject
  }
  
  // Award points
  calculatePoints(round);
  updateLeaderboard();
  
  await timer(15 seconds);
}

// 3. RESULTS PHASE
displayFinalLeaderboard();
calculateCompatibilityScores();
showShareableResults();
```

---

## 🎨 **UI MOCKUP SEQUENCE**

### **Screen 1: Lobby**
```
┌──────────────────────────────────┐
│  ❤️ LOVE MATCH - LOBBY          │
│                                  │
│  Room Code: LOVE42               │
│  [Share QR Code] [Copy Link]    │
│                                  │
│  Teams Joined (3/8):             │
│  - Team Jake & Sara              │
│  - Team Tom & Lisa               │
│  - Team Mike & Emma              │
│  [Waiting for more teams...]     │
│                                  │
│  Max Rounds: 10 [slider]         │
│  [START GAME] (if host)          │
└──────────────────────────────────┘
```

### **Screen 2: Phase 1 (Question)**
```
┌──────────────────────────────────┐
│  ROUND 2 / 10                    │
│                                  │
│  What is your partner's          │
│  biggest pet peeve?              │
│                                  │
│  [Timer: 9 seconds]              │
│                                  │
│  (All players see this)          │
└──────────────────────────────────┘
```

### **Screen 3: Phase 2 (Answer) - Two Views**

**Hot Seat Player:**
```
┌──────────────────────────────────┐
│  Jake - Your Turn!               │
│                                  │
│  Answer this (Sara can't see):   │
│  What is YOUR biggest            │
│  pet peeve?                      │
│                                  │
│  [___________________] (text)    │
│  [Timer: 24 seconds]             │
│                                  │
│  [SUBMIT]                        │
└──────────────────────────────────┘
```

**Guesser Player:**
```
┌──────────────────────────────────┐
│  Sara - Guess Time!              │
│                                  │
│  What do you think Jake's        │
│  biggest pet peeve is?           │
│                                  │
│  [___________________] (text)    │
│  [Timer: 24 seconds]             │
│                                  │
│  [SUBMIT]                        │
└──────────────────────────────────┘
```

### **Screen 4: Phase 3 (Reveal)**
```
┌──────────────────────────────────┐
│  ROUND 2 RESULTS                 │
│                                  │
│  Team Jake & Sara:               │
│  ✅ EXACT MATCH +3 pts           │
│  Jake: "dishes in sink"          │
│  Sara: "dishes in sink"          │
│                                  │
│  Team Tom & Lisa:                │
│  ⚠️ CLOSE MATCH                  │
│  Tom: "being messy"              │
│  Lisa: "messiness"               │
│  [Host: ✅ YES / ❌ NO]           │
│                                  │
│  Team Mike & Emma:               │
│  ❌ MISS +0 pts                  │
│  Mike: "work stress"             │
│  Emma: "spending money"          │
│                                  │
│  LEADERBOARD:                    │
│  1. Jake & Sara: 6 pts           │
│  2. Tom & Lisa: 1 pt             │
│  3. Mike & Emma: 0 pts           │
│                                  │
│  [NEXT ROUND]                    │
└──────────────────────────────────┘
```

### **Screen 5: Final Results**
```
┌──────────────────────────────────┐
│  🏆 GAME OVER!                   │
│                                  │
│  Final Leaderboard:              │
│  1. 🥇 Jake & Sara: 28 pts       │
│  2. 🥈 Tom & Lisa: 19 pts        │
│  3. 🥉 Mike & Emma: 12 pts       │
│                                  │
│  Jake & Sara Compatibility:      │
│  ❤️ 87% - "You REALLY know      │
│           each other!"           │
│                                  │
│  [Share Results] [Play Again]    │
└──────────────────────────────────┘
```

---

## 🚀 **BUILD ORDER**

### **Step 1: Database Setup**
- Run migration to create all tables
- Seed question database

### **Step 2: API Routes (Backend)**
1. POST `/api/games/love/create` - Create room
2. POST `/api/games/love/join` - Join room
3. POST `/api/games/love/start` - Start game
4. POST `/api/games/love/answer` - Submit answers
5. POST `/api/games/love/advance-phase` - Move phases
6. POST `/api/games/love/judge-close` - Judge close match
7. POST `/api/games/love/end` - End game

### **Step 3: Frontend Pages (UI)**
1. Lobby page (create/join)
2. Game play page (3 phases)
3. Results page

### **Step 4: Components**
1. Phase 1 display
2. Phase 2 input
3. Phase 3 reveal
4. Leaderboard
5. Compatibility card

### **Step 5: Features**
1. Question categories
2. Custom questions
3. Special rounds
4. Host controls
5. Shareable results

---

## ✅ **DEFINITION OF DONE**

### **MVP Complete When:**
- [x] Players can create rooms with codes
- [x] Players can join via code
- [x] Teams register as couples
- [x] 3-phase gameplay works
- [x] Timers sync across devices
- [x] Answers are private until reveal
- [x] Scoring is accurate
- [x] Leaderboard updates live
- [x] 10 rounds complete
- [x] Compatibility score displays
- [x] Results are shareable
- [x] Mobile responsive
- [x] No bugs in happy path

### **Beyond MVP:**
- Special rounds
- Question categories
- Custom questions
- Host advanced controls
- Cosmetics/premium features

---

## 💡 **QUICK START CHECKLIST**

**To start building:**
1. [ ] Create database migration file
2. [ ] Run migration (update Supabase schema)
3. [ ] Create question seed data (100+ questions)
4. [ ] Build API routes (start with create/join)
5. [ ] Build lobby page
6. [ ] Build game play page
7. [ ] Build results page
8. [ ] Test full flow
9. [ ] Deploy to Vercel

---

**Ready to start coding? Should I begin with Week 1 (Database + Lobby)?** 🚀
