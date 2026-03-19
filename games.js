/* ═══════════════════════════════════════════════════════════
   MINI-GAMES — games.js  |  Quiz + Word Search
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════════════
   QUIZ GAME
   ══════════════════════════════════════════════════════════ */
const QUIZ_QUESTIONS = [
  {
    q: 'What does the acronym "PLE" stand for in the context of English learning?',
    opts: ['Professional Language Exam', 'Personal Learning Environment', 'Public Literacy Education', 'Primary Language Evaluation'],
    ans: 1
  },
  {
    q: 'Which tense is most commonly used to narrate past events in a chronicle?',
    opts: ['Present perfect', 'Future continuous', 'Past simple', 'Present continuous'],
    ans: 2
  },
  {
    q: 'What is "cognitive offloading" in the context of AI and critical thinking?',
    opts: ['Using AI to increase memory capacity', 'Relying on technology instead of engaging in analytical thinking', 'Teaching AI to think critically', 'A technique for faster reading'],
    ans: 1
  },
  {
    q: 'Which of these is a "hedging expression" used in academic English?',
    opts: ['Obviously', 'It seems to me', 'Without a doubt', 'Absolutely'],
    ans: 1
  },
  {
    q: 'What type of justice focuses on repairing harm rather than punishment?',
    opts: ['Retributive justice', 'Distributive justice', 'Restorative justice', 'Procedural justice'],
    ans: 2
  },
  {
    q: 'Which word is a connector of sequence commonly used in academic writing?',
    opts: ['However', 'Subsequently', 'Although', 'Nevertheless'],
    ans: 1
  },
  {
    q: 'What does "CAIL" stand for in the context of AI literacy?',
    opts: ['Computer-Aided Intelligent Learning', 'Critical AI Literacy', 'Creative Artificial Intelligence Lab', 'Comprehensive AI Language'],
    ans: 1
  },
  {
    q: 'Which skill does a word search puzzle primarily reinforce?',
    opts: ['Grammar rules', 'Vocabulary recognition', 'Listening comprehension', 'Speaking fluency'],
    ans: 1
  },
  {
    q: '"Recidivism" refers to:',
    opts: ['A type of legal defense', 'The tendency to reoffend after punishment', 'A rehabilitation program', 'A court procedure'],
    ans: 1
  },
  {
    q: 'What is the purpose of "signposting language" in a presentation?',
    opts: ['To add humor', 'To guide the audience through the structure', 'To cite references', 'To introduce new vocabulary'],
    ans: 1
  }
];

let quizState = { current: 0, score: 0, answered: false };

function quizRender() {
  const { current, score } = quizState;
  const total = QUIZ_QUESTIONS.length;

  if (current >= total) {
    // Show final result
    document.getElementById('quizQuestionNum').textContent = 'QUIZ COMPLETE';
    document.getElementById('quizProgressBar').style.width = '100%';
    document.getElementById('quizQuestion').innerHTML = '';
    document.getElementById('quizOptions').innerHTML = '';
    document.getElementById('quizFeedback').innerHTML = '';
    document.getElementById('quizScore').textContent = `FINAL: ${score} / ${total}`;

    const pct = Math.round((score / total) * 100);
    let msg = '';
    if (pct === 100) msg = '🏆 PERFECT SCORE! Outstanding knowledge!';
    else if (pct >= 70) msg = '🌟 GREAT JOB! Excellent understanding!';
    else if (pct >= 50) msg = '📚 GOOD EFFORT! Keep studying!';
    else msg = '💪 KEEP PRACTISING! Review the portfolio entries.';

    document.getElementById('quizQuestion').innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result-score">${score}/${total}</div>
        <div class="quiz-result-label">${pct}% CORRECT — ${msg}</div>
      </div>
    `;
    document.getElementById('quizNextBtn').style.display = 'none';
    document.getElementById('quizResetBtn').style.display = '';
    return;
  }

  const item = QUIZ_QUESTIONS[current];
  document.getElementById('quizQuestionNum').textContent = `QUESTION ${current + 1} OF ${total}`;
  document.getElementById('quizProgressBar').style.width = `${((current) / total) * 100}%`;
  document.getElementById('quizQuestion').textContent = item.q;
  document.getElementById('quizScore').textContent = `SCORE: ${score} / ${total}`;
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('quizFeedback').className = 'quiz-feedback';

  const optsEl = document.getElementById('quizOptions');
  optsEl.innerHTML = '';
  item.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.addEventListener('click', () => quizAnswer(i));
    optsEl.appendChild(btn);
  });

  document.getElementById('quizNextBtn').disabled = true;
  quizState.answered = false;
}

function quizAnswer(idx) {
  if (quizState.answered) return;
  quizState.answered = true;

  const item = QUIZ_QUESTIONS[quizState.current];
  const buttons = document.querySelectorAll('#quizOptions .quiz-opt');
  const feedback = document.getElementById('quizFeedback');

  buttons.forEach((btn, i) => {
    if (i === item.ans) btn.classList.add('quiz-opt-correct');
    if (i === idx && idx !== item.ans) btn.classList.add('quiz-opt-wrong');
    btn.classList.add('quiz-opt-disabled');
  });

  if (idx === item.ans) {
    quizState.score++;
    feedback.textContent = '✓ CORRECT!';
    feedback.className = 'quiz-feedback correct';
  } else {
    feedback.textContent = `✗ WRONG — The correct answer was: "${item.opts[item.ans]}"`;
    feedback.className = 'quiz-feedback wrong';
  }

  document.getElementById('quizScore').textContent = `SCORE: ${quizState.score} / ${QUIZ_QUESTIONS.length}`;
  document.getElementById('quizNextBtn').disabled = false;
}

function quizNext() {
  quizState.current++;
  quizRender();
}

function quizReset() {
  quizState = { current: 0, score: 0, answered: false };
  document.getElementById('quizNextBtn').style.display = '';
  document.getElementById('quizResetBtn').style.display = 'none';
  quizRender();
}

// Initialize quiz
quizRender();


/* ══════════════════════════════════════════════════════════
   WORD SEARCH GAME
   ══════════════════════════════════════════════════════════ */
const WS_WORDS = ['LITERACY', 'CRITICAL', 'EVIDENCE', 'FLUENCY', 'GRAMMAR', 'RHETORIC', 'COHESION', 'DISCOURSE'];
const WS_SIZE = 12;

let wsGridData = [];
let wsPlaced = [];   // { word, cells: [{r,c}] }
let wsFound = [];
let wsSelection = null; // { startR, startC }

function wsGenerateGrid() {
  // Create empty grid
  wsGridData = Array.from({ length: WS_SIZE }, () => Array(WS_SIZE).fill(''));
  wsPlaced = [];

  // Shuffle words so placement varies
  const shuffled = [...WS_WORDS].sort(() => Math.random() - 0.5);

  for (const word of shuffled) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;
      // 0 = horizontal, 1 = vertical
      const dir = Math.random() < 0.5 ? 0 : 1;
      let r, c;

      if (dir === 0) { // horizontal
        r = Math.floor(Math.random() * WS_SIZE);
        c = Math.floor(Math.random() * (WS_SIZE - word.length + 1));
      } else { // vertical
        r = Math.floor(Math.random() * (WS_SIZE - word.length + 1));
        c = Math.floor(Math.random() * WS_SIZE);
      }

      // Check if fits
      let fits = true;
      const cells = [];
      for (let i = 0; i < word.length; i++) {
        const cr = dir === 0 ? r : r + i;
        const cc = dir === 0 ? c + i : c;
        const existing = wsGridData[cr][cc];
        if (existing !== '' && existing !== word[i]) { fits = false; break; }
        cells.push({ r: cr, c: cc });
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          wsGridData[cells[i].r][cells[i].c] = word[i];
        }
        wsPlaced.push({ word, cells });
        placed = true;
      }
    }
  }

  // Fill remaining empty cells with random letters
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < WS_SIZE; r++) {
    for (let c = 0; c < WS_SIZE; c++) {
      if (wsGridData[r][c] === '') {
        wsGridData[r][c] = alpha[Math.floor(Math.random() * 26)];
      }
    }
  }
}

function wsRenderGrid() {
  const grid = document.getElementById('wsGrid');
  grid.style.gridTemplateColumns = `repeat(${WS_SIZE}, 1fr)`;
  grid.innerHTML = '';

  for (let r = 0; r < WS_SIZE; r++) {
    for (let c = 0; c < WS_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'ws-cell';
      cell.textContent = wsGridData[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener('click', () => wsCellClick(r, c));
      grid.appendChild(cell);
    }
  }
}

function wsRenderWordList() {
  const list = document.getElementById('wsWordList');
  list.innerHTML = '';
  for (const w of WS_WORDS) {
    const span = document.createElement('span');
    span.className = 'ws-word' + (wsFound.includes(w) ? ' ws-word-found' : '');
    span.textContent = w;
    span.id = `ws-word-${w}`;
    list.appendChild(span);
  }
}

function wsCellClick(r, c) {
  // Check if this cell is already found
  const cell = document.querySelector(`.ws-cell[data-r="${r}"][data-c="${c}"]`);
  if (cell.classList.contains('ws-found')) return;

  if (!wsSelection) {
    // Start selection
    wsSelection = { startR: r, startC: c };
    cell.classList.add('ws-selected');
    document.getElementById('wsFeedback').textContent = 'Select the last letter of the word…';
  } else {
    // End selection — check if valid word
    const sr = wsSelection.startR;
    const sc = wsSelection.startC;
    wsSelection = null;

    // Clear all selected
    document.querySelectorAll('.ws-cell.ws-selected').forEach(el => el.classList.remove('ws-selected'));

    // Determine direction
    const dr = r - sr;
    const dc = c - sc;

    // Must be purely horizontal or purely vertical
    if (dr !== 0 && dc !== 0) {
      document.getElementById('wsFeedback').textContent = '⚠ Select horizontal or vertical only';
      return;
    }

    // Collect letters
    let letters = '';
    const selectedCells = [];
    if (dr === 0 && dc === 0) {
      letters = wsGridData[r][c];
      selectedCells.push({ r, c });
    } else if (dr === 0) {
      // horizontal
      const startC = Math.min(sc, c);
      const endC = Math.max(sc, c);
      for (let cc = startC; cc <= endC; cc++) {
        letters += wsGridData[sr][cc];
        selectedCells.push({ r: sr, c: cc });
      }
    } else {
      // vertical
      const startR = Math.min(sr, r);
      const endR = Math.max(sr, r);
      for (let rr = startR; rr <= endR; rr++) {
        letters += wsGridData[rr][sc];
        selectedCells.push({ r: rr, c: sc });
      }
    }

    // Check if letters match a placed word
    const match = wsPlaced.find(p =>
      !wsFound.includes(p.word) &&
      (p.word === letters || p.word === letters.split('').reverse().join(''))
    );

    if (match) {
      wsFound.push(match.word);
      // Highlight found cells
      match.cells.forEach(({ r: cr, c: cc }) => {
        document.querySelector(`.ws-cell[data-r="${cr}"][data-c="${cc}"]`).classList.add('ws-found');
      });
      // Strike word in list
      const wordEl = document.getElementById(`ws-word-${match.word}`);
      if (wordEl) wordEl.classList.add('ws-word-found');

      document.getElementById('wsScore').textContent = `FOUND: ${wsFound.length} / ${WS_WORDS.length}`;
      document.getElementById('wsFeedback').textContent = `✓ Found "${match.word}"!`;

      if (wsFound.length === WS_WORDS.length) {
        document.getElementById('wsFeedback').textContent = '🏆 ALL WORDS FOUND! CONGRATULATIONS!';
      }
    } else {
      document.getElementById('wsFeedback').textContent = '✗ No word found — try again!';
    }
  }
}

function wsReset() {
  wsFound = [];
  wsSelection = null;
  document.getElementById('wsFeedback').textContent = '';
  document.getElementById('wsScore').textContent = `FOUND: 0 / ${WS_WORDS.length}`;
  wsGenerateGrid();
  wsRenderGrid();
  wsRenderWordList();
}

// Initialize word search
wsReset();
