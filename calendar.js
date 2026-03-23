/* ═══════════════════════════════════════════════════════════
   NEON CALENDAR — Date Picker for Entry Cards
   ═══════════════════════════════════════════════════════════ */
'use strict';

(function () {
  /* ── State ─────────────────────────────────── */
  let viewYear, viewMonth;      // month shown in the picker (0-based)
  let activeMetaEl = null;      // the .card-meta element being edited
  let calendarEl, monthYearEl, daysEl;

  const MONTHS = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  /* ── Build the modal once ──────────────────── */
  function createCalendarModal() {
    calendarEl = document.createElement('div');
    calendarEl.id = 'neonCalendar';
    calendarEl.className = 'nc-calendar';
    calendarEl.innerHTML = `
      <div class="nc-overlay"></div>
      <div class="nc-panel">
        <div class="nc-header">
          <button class="nc-nav" id="ncPrevYear" title="Previous year">«</button>
          <button class="nc-nav" id="ncPrev" title="Previous month">‹</button>
          <div class="nc-month-year" id="ncMonthYear"></div>
          <button class="nc-nav" id="ncNext" title="Next month">›</button>
          <button class="nc-nav" id="ncNextYear" title="Next year">»</button>
        </div>
        <div class="nc-weekdays">
          <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
        </div>
        <div class="nc-days" id="ncDays"></div>
        <div class="nc-footer">
          <button class="nc-btn nc-btn-cancel" id="ncCancel">CANCEL</button>
          <button class="nc-btn" id="ncToday">TODAY</button>
        </div>
      </div>
    `;
    document.body.appendChild(calendarEl);

    monthYearEl = document.getElementById('ncMonthYear');
    daysEl = document.getElementById('ncDays');

    // Wire buttons
    document.getElementById('ncPrev').addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });
    document.getElementById('ncNext').addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });
    document.getElementById('ncPrevYear').addEventListener('click', () => { viewYear--; render(); });
    document.getElementById('ncNextYear').addEventListener('click', () => { viewYear++; render(); });
    document.getElementById('ncToday').addEventListener('click', () => { const t = new Date(); pick(t.getFullYear(), t.getMonth(), t.getDate()); });
    document.getElementById('ncCancel').addEventListener('click', close);

    // Close on overlay click
    calendarEl.querySelector('.nc-overlay').addEventListener('click', close);
  }

  /* ── Render month grid ─────────────────────── */
  function render() {
    monthYearEl.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    daysEl.innerHTML = '';

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();

    // Empty leading cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'nc-day nc-empty';
      daysEl.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= totalDays; d++) {
      const cell = document.createElement('div');
      cell.className = 'nc-day';
      cell.textContent = d;

      if (d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()) {
        cell.classList.add('nc-today');
      }

      cell.addEventListener('click', () => pick(viewYear, viewMonth, d));
      daysEl.appendChild(cell);
    }
  }

  /* ── Pick a date ───────────────────────────── */
  const svgDate = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

  function pick(y, m, d) {
    if (!activeMetaEl) return;

    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');

    // Get the rest of the meta text after the date portion, stripping any SVGs
    const full = activeMetaEl.textContent.trim();
    // Match the date part: "YYYY - YYYY" or "YYYY-MM-DD" or "YYYY", handling optional emoji if somehow preserved
    const rest = full.replace(/^(?:📅\s*)?[\d\s\-]+/, '').trim();

    activeMetaEl.innerHTML = `${svgDate} ${y}-${mm}-${dd}${rest ? ' · ' + rest.replace(/^[·\-]\s*/, '') : ''}`;
    close();
  }

  /* ── Open / Close ──────────────────────────── */
  function open(metaEl) {
    if (!calendarEl) createCalendarModal();
    activeMetaEl = metaEl;

    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();

    render();
    calendarEl.classList.add('nc-open');
  }

  function close() {
    if (calendarEl) calendarEl.classList.remove('nc-open');
    activeMetaEl = null;
  }

  /* ── Expose the open function globally ─────── */
  window.openCalendar = function (btn) {
    const card = btn.closest('.entry-card');
    if (!card) return;
    const meta = card.querySelector('.card-meta');
    if (!meta) return;
    open(meta);
  };
})();
