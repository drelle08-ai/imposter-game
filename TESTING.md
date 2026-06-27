# 🧪 Testing Guide - The Game Platform

Complete guide to testing all three games locally and in production.

## 🚀 Quick Start Testing (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF

# 3. Run dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 🎮 Testing Each Game

### **Test 1: Imposter Game** (10 minutes)

**Setup:**
1. Create two browser windows/tabs:
   - Tab 1: http://localhost:3000 (Player 1)
   - Tab 2: http://localhost:3000 (Player 2)

**Test Steps:**

```
Step 1: Sign Up (Both tabs)
├─ Tab 1: Click "Sign Up"
├─ Enter: email1@test.com / password123 / Username: Player1
├─ Tab 2: Click "Sign Up"
├─ Enter: email2@test.com / password123 / Username: Player2
├─ Both should see dashboard
└─ ✅ Auth working

Step 2: Create Game (Tab 1)
├─ Tab 1: Go to Dashboard
├─ Click "Create Game"
├─ Select "Imposter"
├─ Click "Create"
├─ Copy invite code (e.g., ABC123)
└─ ✅ Game created with code

Step 3: Join Game (Tab 2)
├─ Tab 2: Dashboard
├─ Click "Join Game"
├─ Paste code: ABC123
├─ Click "Join"
├─ Should see game lobby
└─ ✅ Join working

Step 4: Start Game (Tab 1)
├─ Tab 1: Click "Start Game"
├─ Tab 2: Should see "Game started"
├─ Both see "Your role: [Imposter/Crewmate]"
└─ ✅ Real-time sync working

Step 5: Test Voting
├─ Both: See voting screen
├─ Tab 1: Click on Tab 2's player card (vote)
├─ Tab 2: Click on Tab 1's player card (vote)
├─ Both: Vote counts update in real-time
└─ ✅ Real-time voting working

Step 6: Test Results
├─ Game ends after voting
├─ See results screen
├─ See leaderboard
└─ ✅ Game complete
```

**Checklist:**
- [ ] Both players receive same role
- [ ] Voting updates in real-time
- [ ] Player eliminated correctly
- [ ] Game progresses through rounds
- [ ] Leaderboard updates
- [ ] Can play multiple rounds

---

### **Test 2: Mafia Game** (10 minutes)

**Setup:**
1. Create 5+ player accounts (for full experience)
2. Or use same 2 players but test mechanics

**Test Steps:**

```
Player 1: Create Mafia game
├─ Dashboard → Create
├─ Select "Mafia"
├─ Copy code
└─ Wait for players

Player 2-5: Join game
├─ Dashboard → Join Game
├─ Enter code
├─ Register with name
└─ Wait in lobby

Player 1: Start game
├─ Click "Start Game"
├─ All: Receive roles (Mafia or Civilian)
├─ See: Night phase begins
└─ Roles should be mixed

Night Phase:
├─ Mafia: See each other
├─ Civilians: See only themselves
├─ After 30s: Auto-advance to day

Day Phase:
├─ All: Can discuss
├─ See discussion timer
├─ After time: Go to voting

Voting:
├─ All: Vote on elimination
├─ Majority vote wins
├─ Player eliminated

Check Win Condition:
├─ Mafia eliminated: Civilians win ✅
├─ Mafia survive: Mafia wins ✅
```

**Checklist:**
- [ ] 5+ players can join
- [ ] Roles distributed fairly
- [ ] Mafia see each other
- [ ] Civilians don't see roles
- [ ] Day/night phases work
- [ ] Discussion timer works
- [ ] Voting works
- [ ] Win condition correct

---

### **Test 3: Love Match Game** (15 minutes)

**Setup:**
1. Create 2 browser windows (couple)
2. Can test with 2+ couples

**Test Steps:**

```
Step 1: Create & Join
Player 1 & 2 (Couple 1):
├─ Sign up: Player1A, Player2A
├─ P1: Dashboard → Create
├─ Select "Love Match"
├─ Copy code
├─ P2: Join → Enter code
├─ P1 & P2: Register as team "Player1A & Player2A"
└─ Wait in lobby

Step 2: Lobby Features
├─ See: Room code display
├─ See: QR code button
├─ Click: "Show QR Code" → QR displays ✅
├─ Click: "Copy Invite Link" → Copied ✅
├─ See: Team list updating
└─ ✅ Lobby working

Step 3: Start Game
├─ P1: Click "Start Game"
├─ Both: See "Round 1 / 10"
├─ Both: See question displayed
└─ ✅ Game started

Step 4: Phase 1 - Question (10 seconds)
├─ Question appears: "What is your partner's favorite color?"
├─ See: Timer counting down 10→9→8...
├─ Both: Can read question
├─ After 10s: Auto-advance to Phase 2
└─ ✅ Phase 1 working

Step 5: Phase 2 - Answer (30 seconds)
├─ P1: Hot Seat (red banner) - answers question
│  ├─ Type answer: "Blue"
│  ├─ Input should NOT show on P2's screen
│  └─ Click "Submit Answer"
│
├─ P2: Guesser (blue banner) - guesses partner's answer
│  ├─ Type guess: "Blue"
│  ├─ Click "Submit Answer"
│  └─ Should see "✓ Answer Submitted"
│
├─ See: Timer 30→29→28...
├─ After 30s: Auto-advance to Phase 3
└─ ✅ Phase 2 working

Step 6: Phase 3 - Reveal (15 seconds)
├─ ALL ANSWERS VISIBLE
├─ Both: See P1's team results:
│  ├─ P1 said: "Blue"
│  ├─ P2 guessed: "Blue"
│  ├─ Result: ✅ EXACT MATCH +3 pts
│  └─ (Your team updated in leaderboard)
│
├─ Leaderboard: Shows 1. Your Team: 3 pts
├─ See: Timer 15→14→13...
├─ After 15s: Auto-advance to next round
└─ ✅ Phase 3 working + scoring working

Step 7: Test Multiple Rounds
├─ Rounds 2-10: Repeat phases
├─ Watch: Points accumulate
├─ Watch: Leaderboard updates
├─ Roles: Should rotate (P1 was hot seat, now P2)
└─ ✅ Round rotation working

Step 8: Final Results
├─ After Round 10:
├─ See: Final leaderboard
├─ See: Compatibility score (%)
├─ See: "87% - You REALLY know each other!"
├─ See: Match breakdown (exact, close, miss)
├─ Click: "Share Results" → Copied ✅
└─ ✅ Results working
```

**Checklist:**
- [ ] Create/join works
- [ ] QR code displays
- [ ] Copy link works
- [ ] Leaderboard updates
- [ ] Phase 1 displays question
- [ ] Phase 2 private answers (not visible to partner)
- [ ] Phase 3 shows all answers
- [ ] Scoring correct (exact=3, close=1)
- [ ] Roles rotate each round
- [ ] Timer synced across clients
- [ ] Results show compatibility score
- [ ] Share button works

---

## 🧪 Multi-User Testing

### **Test with 2+ Couples (Love Match)**

**Setup:**
1. Open 4 browser windows:
   - Window 1: Player1A (http://localhost:3000)
   - Window 2: Player1B (http://localhost:3000)
   - Window 3: Player2A (new private/incognito)
   - Window 4: Player2B (new private/incognito)

2. Sign up each player:
   ```
   Window 1: Email1A@test.com / Pass123 / Player1A
   Window 2: Email1B@test.com / Pass123 / Player1B
   Window 3: Email2A@test.com / Pass123 / Player2A
   Window 4: Email2B@test.com / Pass123 / Player2B
   ```

3. Window 1: Create Love Match game, copy code

4. Windows 2-4: Join with same code

5. All register teams:
   ```
   Team 1: Player1A & Player1B
   Team 2: Player2A & Player2B
   ```

**Test Multi-Team Features:**

```
Round Reveal Phase - All Teams Visible:
├─ Window 1: P1A's answer + P1B's guess
├─ Window 3: P2A's answer + P2B's guess
├─ Both teams see each other's results
├─ Leaderboard shows both teams
└─ ✅ Multi-team working

Real-Time Sync:
├─ Window 1: Types answer
├─ Windows 2,3,4: All see timer sync
├─ No lag or desync
└─ ✅ Real-time working

Scoring Multi-Team:
├─ Team 1: 3 points (exact match)
├─ Team 2: 0 points (miss)
├─ Leaderboard: 1. Team 1 (3) 2. Team 2 (0)
└─ ✅ Multi-team scoring working
```

**Checklist:**
- [ ] 4+ players can join one game
- [ ] All see same questions
- [ ] Answers private per team
- [ ] Reveal shows all teams
- [ ] Leaderboard ranks all teams
- [ ] Real-time sync works for all
- [ ] Scoring correct for each team

---

## 🔍 Feature Testing Checklist

### **Authentication**
- [ ] Sign up works (new email)
- [ ] Login works (existing account)
- [ ] Logout works
- [ ] Session persists on refresh
- [ ] Redirects to login if not authenticated

### **Dashboard**
- [ ] Can create Imposter game
- [ ] Can create Mafia game
- [ ] Can create Love Match game
- [ ] Can join with code
- [ ] Displays game history
- [ ] Game codes display correctly

### **Lobbies**
- [ ] Players list updates in real-time
- [ ] QR code generates
- [ ] Copy link button works
- [ ] Can add/remove players
- [ ] Host can start game
- [ ] Timer starts when game begins

### **Gameplay**
- [ ] Timers sync across clients
- [ ] Roles assigned correctly
- [ ] Scoring calculates properly
- [ ] Answers hidden until reveal
- [ ] Leaderboard updates live
- [ ] Results display accurately

### **Love Match Special**
- [ ] Question displays
- [ ] Private answers work
- [ ] Simultaneous reveal works
- [ ] Compatibility score calculates
- [ ] Results shareable
- [ ] Mobile responsive

### **Mobile Responsive**
- [ ] Test on iPhone simulator
- [ ] Test on Android simulator
- [ ] Buttons clickable
- [ ] Text readable
- [ ] No horizontal scrolling
- [ ] Layout responsive at all breakpoints

---

## 📱 Browser Testing

### **Desktop Browsers**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### **Mobile Browsers**
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Firefox Mobile

### **Device Sizes**
- [ ] 320px (small phone)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1920px (large desktop)

---

## 🐛 Testing Common Issues

### **Real-Time Not Updating**

**Test:**
1. Open 2 browser tabs
2. Player 1: Start game
3. Player 2: Should see "Game started" instantly

**If fails:**
```
Check:
- [ ] Supabase Realtime enabled
- [ ] WebSocket connection open (DevTools → Network)
- [ ] RLS policies correct
- [ ] No console errors
```

### **Timers Out of Sync**

**Test:**
1. Open 2 browser tabs
2. Both: Watch timer count down
3. Timers should be within 1 second

**If fails:**
```
Check:
- [ ] Server-side timer (not client-side)
- [ ] Browser clocks synchronized
- [ ] No console errors
- [ ] Network latency acceptable
```

### **Answers Visible Before Reveal**

**Test (Love Match):**
1. Player 1: Enter answer in Phase 2
2. Player 2: Should NOT see answer on their screen
3. Phase 3: Both should see answer

**If fails:**
```
Check:
- [ ] Conditional rendering in code
- [ ] Database query filters
- [ ] Frontend state management
```

### **Scoring Incorrect**

**Test:**
1. Create Love Match game
2. Both: Enter exact same answer
3. Result: Should show "EXACT MATCH +3 pts"

**If fails:**
```
Check:
- [ ] String comparison (case-insensitive)
- [ ] Whitespace trimming
- [ ] Database scoring logic
```

---

## 📊 Performance Testing

### **Page Load Time**
```bash
# Run from DevTools → Performance tab
Measure: Time to First Contentful Paint (FCP)
Target: < 2 seconds
```

### **Real-Time Latency**
```
Test: Player 1 clicks button → Player 2 sees update
Measure: Time difference
Target: < 500ms
```

### **Database Query Speed**
```bash
# Check Supabase dashboard
Measure: Query execution time
Target: < 100ms average
```

### **Bundle Size**
```bash
npm run build
Check: .next folder size
Target: < 200KB gzipped
```

---

## 🔐 Security Testing

### **Authentication**
- [ ] Cannot access dashboard without login
- [ ] Cannot access game without joining
- [ ] Session token valid
- [ ] Cannot manipulate JWT

### **Authorization**
- [ ] Only host can start game
- [ ] Only players in room can join game
- [ ] Cannot modify other user's data
- [ ] Cannot see other user's private answers

### **Input Validation**
- [ ] Cannot inject code in answers
- [ ] Cannot submit empty answers
- [ ] Cannot bypass client-side validation
- [ ] Server validates all inputs

### **Data Protection**
- [ ] Private answers encrypted
- [ ] No sensitive data in logs
- [ ] Database rows protected with RLS
- [ ] API keys not exposed

---

## 📝 Test Results Template

Create a file: `TEST_RESULTS.md`

```markdown
# Test Results - [Date]

## Environment
- Browser: Chrome 120
- Device: MacBook Pro 16"
- Supabase Region: us-east-1
- Build: Production

## Tests Run

### Imposter Game
- [ ] Create game: PASS / FAIL
- [ ] Join game: PASS / FAIL
- [ ] Start game: PASS / FAIL
- [ ] Voting: PASS / FAIL
- [ ] Results: PASS / FAIL

### Mafia Game
- [ ] Create game: PASS / FAIL
- [ ] Role assignment: PASS / FAIL
- [ ] Day/night phases: PASS / FAIL
- [ ] Voting: PASS / FAIL
- [ ] Win condition: PASS / FAIL

### Love Match
- [ ] Create room: PASS / FAIL
- [ ] Phase 1 (Question): PASS / FAIL
- [ ] Phase 2 (Answer): PASS / FAIL
- [ ] Phase 3 (Reveal): PASS / FAIL
- [ ] Scoring: PASS / FAIL
- [ ] Compatibility: PASS / FAIL

## Issues Found
1. [Issue description]
2. [Issue description]

## Performance
- FCP: XXXms
- LCP: XXXms
- Real-time latency: XXXms

## Sign-off
Tested by: [Name]
Date: [Date]
Status: READY FOR PRODUCTION / NEEDS FIXES
```

---

## 🚀 Automated Testing (Optional)

### **Unit Tests**
```bash
# Test scoring logic
npm test -- scoring.test.ts
```

### **Integration Tests**
```bash
# Test game flow
npm test -- game.integration.test.ts
```

### **E2E Tests**
```bash
# Test full user journey
npm test -- e2e.test.ts
```

---

## ✅ Final Testing Checklist

Before going to production:

- [ ] All three games tested
- [ ] Multi-user testing passed
- [ ] Mobile tested on real devices
- [ ] Real-time features working
- [ ] Scoring accurate
- [ ] Results displaying
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Database working
- [ ] Auth system working
- [ ] QR codes working
- [ ] Share buttons working
- [ ] Responsive design verified
- [ ] Browser compatibility verified

---

## 🆘 Debugging Tips

### **Check Console Logs**
```javascript
// In browser DevTools
console.log() // Your custom logs
// Check for errors
```

### **Check Network**
```
DevTools → Network tab
Watch for failed requests
Check response times
Verify WebSocket connected
```

### **Check Database**
```
Supabase Dashboard → SQL Editor
SELECT * FROM love_match_teams
Check: Data being inserted
Check: Updates reflected
```

### **Check Real-Time**
```
Supabase Dashboard → Realtime
See: Active connections
See: Message flow
```

---

## 📞 Getting Help

If test fails:
1. Check error message in console
2. Look for similar error in DEPLOYMENT.md
3. Check Supabase status
4. Verify environment variables
5. Check browser console for errors
6. Verify database has data

---

**Happy Testing!** 🧪✅

