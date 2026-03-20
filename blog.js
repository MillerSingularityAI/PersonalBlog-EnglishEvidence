/* ═══════════════════════════════════════════════════════════
   MILLER SALCEDO PORTFOLIO ENGLISH SKILLS — blog.js  |  Neon Futurista
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ── Theme Toggle ────────────────────────────────────────── */
const themeBtn = document.getElementById('themeBtn');
const html     = document.documentElement;

function applyTheme(dark) {
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  localStorage.setItem('blog-theme', dark ? 'dark' : 'light');
}

themeBtn.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') !== 'dark');
});

// Default: dark. Restore saved preference.
const saved = localStorage.getItem('blog-theme');
applyTheme(saved ? saved === 'dark' : true);


/* ── YouTube Custom Player (Error 153 fix) ───────────────── */
/*
   Instead of embedding the iframe immediately (which triggers Error 153
   for videos with embedding restrictions set by the owner), we show a
   clickable thumbnail. On click we inject the iframe with autoplay=1,
   which opens in the same page context and bypasses the restriction.
   If the video still cannot play embedded, the user is redirected to
   YouTube directly.
*/
function initYTPlayers() {
  document.querySelectorAll('.yt-player').forEach(player => {
    player.addEventListener('click', () => {
      const videoId = player.dataset.videoid;
      if (!videoId) return;

      // If already playing, do nothing
      if (player.classList.contains('playing')) return;

      // Inject iframe with autoplay
      const iframe = player.querySelector('.yt-iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

      player.classList.add('playing');

      // Fallback: if iframe fires error or stays blank, open in YouTube
      iframe.addEventListener('error', () => {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        player.classList.remove('playing');
        iframe.src = '';
      }, { once: true });
    });
  });
}
initYTPlayers();


/* ── Read More / Collapse ───────────────────────────────── */
function toggleExpand(btn) {
  const card   = btn.closest('.entry-card');
  const post   = card.querySelector('.card-post');
  const isOpen = post.classList.toggle('open');
  btn.textContent = isOpen ? 'COLLAPSE ↑' : 'READ FULL POST ↓';
}


/* ── Edit Mode ──────────────────────────────────────────── */
function toggleEdit(btn) {
  const card      = btn.closest('.entry-card');
  const isEditing = btn.getAttribute('data-editing') === 'true';
  const fields    = card.querySelectorAll('.card-title, .card-summary, .post-content, .card-code, .card-meta');

  fields.forEach(el => { el.contentEditable = isEditing ? 'false' : 'true'; });

  btn.textContent = isEditing ? '✏️' : '💾';
  btn.title       = isEditing ? 'Edit this post' : 'Save changes';
  btn.setAttribute('data-editing', String(!isEditing));

  if (!isEditing) {
    const post = card.querySelector('.card-post');
    if (!post.classList.contains('open')) {
      post.classList.add('open');
      card.querySelector('.btn-read').textContent = 'COLLAPSE ↑';
    }
    card.querySelector('.post-content')?.focus();
  }
}


/* ── Delete Entry ───────────────────────────────────────── */
function deleteEntry(btn) {
  if (confirm('Are you sure you want to delete this post?')) {
    const card = btn.closest('.entry-card');
    card.remove();
  }
}


/* ── Word Count ─────────────────────────────────────────── */
function updateWordCount(el) {
  const counter = el.closest('.card-post')?.querySelector('.post-wordcount');
  if (!counter) return;
  const words = el.innerText.trim().split(/\s+/).filter(Boolean).length;
  counter.textContent = `[ ${words.toLocaleString()} WORDS ]`;
}

function initWordCounts() {
  document.querySelectorAll('.post-content').forEach(el => {
    updateWordCount(el);
    el.addEventListener('input', () => updateWordCount(el));
  });
}
initWordCounts();


/* ── Tag Filter ─────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const selected = btn.dataset.tag;

    document.querySelectorAll('.entry-card').forEach(card => {
      const tags    = (card.dataset.tags || '').split(',').map(t => t.trim());
      const visible = selected === 'all' || tags.includes(selected);
      card.style.display = visible ? '' : 'none';
    });
  });
});

// Tag badge click → trigger filter
document.addEventListener('click', e => {
  if (!e.target.matches('.tag')) return;
  e.stopPropagation();
  const match = [...filterBtns].find(b => b.dataset.tag === e.target.dataset.tag);
  if (match) match.click();
});


/* ── Add New Entry ──────────────────────────────────────── */
function addEntry() {
  const stack = document.getElementById('entries');
  const count = stack.querySelectorAll('.entry-card').length + 1;

  const card = document.createElement('article');
  card.className    = 'entry-card';
  card.dataset.tags = 'Writing';

  card.innerHTML = `
    <div class="card-topbar">
      <div class="entry-num">${String(count).padStart(2,'0')}</div>
      <div class="card-topbar-text">
        <div class="card-code" contenteditable="false">[EDIT CODE]</div>
        <div class="card-meta" contenteditable="false">📅 2025 · New Activity</div>
      </div>
    </div>

    <div class="card-body">
      <h2 class="card-title" contenteditable="false">// NEW_ENTRY_TITLE</h2>

      <div class="card-tags">
        <span class="tag" data-tag="Writing">Writing</span>
      </div>

      <p class="card-summary" contenteditable="false">
        [EDIT THIS] Add a short summary of this entry here — 2 to 3 lines.
      </p>

      <div class="card-media placeholder-wrap">
        <p>📎 <strong>[EDIT THIS]</strong> — Paste your &lt;iframe&gt; embed code here in the HTML.</p>
      </div>

      <div class="card-actions">
        <button class="btn-read" onclick="toggleExpand(this)">READ FULL POST ↓</button>
        <button class="btn-edit" onclick="toggleEdit(this)" title="Edit this post" data-editing="false">✏️</button>
        <button class="btn-delete" onclick="deleteEntry(this)" title="Delete this post">🗑️</button>
      </div>

      <div class="card-post">
        <div class="post-content" contenteditable="false">
          <p>[EDIT THIS] Write the full body of this entry here. You have space for up to 2,000 words. Click the ✏️ button to activate editing mode.</p>
        </div>
        <div class="post-wordcount">[ 0 WORDS ]</div>
      </div>
    </div>
  `;

  card.style.animation = 'fadeUp 0.5s ease both';
  stack.appendChild(card);

  // Init word count for new card
  const content = card.querySelector('.post-content');
  updateWordCount(content);
  content.addEventListener('input', () => updateWordCount(content));

  card.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Observe the new card for scroll animations
  if (window.scrollObserver) {
    window.scrollObserver.observe(card);
  }
}

/* ── Scroll Animations ──────────────────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target); // Animate once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  window.scrollObserver = observer;

  document.querySelectorAll('.entry-card, .hero, .filter-bar').forEach(el => {
    observer.observe(el);
  });
}
// Run on load
document.addEventListener('DOMContentLoaded', initScrollAnimations);
// Also run immediately in case DOM is already loaded
initScrollAnimations();
