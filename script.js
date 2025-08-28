// === Год в футере ===
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================
   ТЁМНАЯ ТЕМА
========================= */
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const THEME_KEY = 'andrey_theme';

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'dark') {
  body.classList.add('dark');
  themeBtn && themeBtn.setAttribute('aria-pressed', 'true');
  themeBtn && (themeBtn.textContent = '☀️ Светлая тема');
}
themeBtn?.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  themeBtn.textContent = isDark ? '☀️ Светлая тема' : '🌙 Тёмная тема';
  themeBtn.setAttribute('aria-pressed', String(isDark));
});

/* =========================
   УТИЛИТЫ
========================= */
function showToast(message, timeout = 1800) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, timeout);
}
function pluralDays(n){
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return 'день';
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'дня';
  return 'дней';
}
// Номер календарных суток (локальная полночь)
function dayNum(d = new Date()) {
  const x = new Date(d.getTime());
  x.setHours(0,0,0,0);
  return Math.floor(x.getTime() / 86400000);
}

/* =========================
   «ПРИВЕТ, АНДРЕЙ» (+ автозачёт)
========================= */
const greetBtn  = document.getElementById('greetBtn');
const helloText = document.getElementById('helloText');
const phrases = [
  'Привет, Андрей! 🚀 Поехали!',
  'Делаем маленькие шаги, но каждый — вперёд 💪',
  'Сегодня +1 фича. Завтра — +ещё одна. Так побеждают!',
  'ИИ — напарник. Решения — твои. ✨',
];
let phraseIdx = 0;

/* =========================
   СТРИК (устойчив к часовым поясам)
========================= */
const STREAK_COUNT_KEY  = 'andrey_streak_count';
const STREAK_DAYNUM_KEY = 'andrey_streak_daynum';

(function migrateStreak() {
  const old = localStorage.getItem('andrey_streak_date');
  if (old && !localStorage.getItem(STREAK_DAYNUM_KEY)) {
    const [y, m, dd] = old.split('-').map(Number);
    const dn = dayNum(new Date(y, (m || 1) - 1, dd || 1));
    localStorage.setItem(STREAK_DAYNUM_KEY, String(dn));
    localStorage.removeItem('andrey_streak_date');
  }
})();

function renderStreak() {
  const count = Number(localStorage.getItem(STREAK_COUNT_KEY) || 0);

  // число и слово
  const valEl = document.getElementById('streakValue');
  if (valEl) valEl.textContent = count;
  const w = document.getElementById('streakWord');
  if (w) w.textContent = pluralDays(count);

  // прогресс-бар 7 из точек
  const bar = document.getElementById('streakBar');
  if (bar) {
    bar.innerHTML = '';
    const k = Math.max(0, Math.min(7, count));
    for (let i = 0; i < 7; i++) {
      const dot = document.createElement('span');
      dot.className = 'streak-dot' + (i < k ? ' on' : '');
      bar.appendChild(dot);
    }
  }

  // мини-подсказка “цель 7 дней”
  const mini = document.getElementById('streakTo7');
  if (mini) {
    const TARGET = 7;
    const shown = Math.min(count, TARGET);
    const left  = Math.max(0, TARGET - shown);
    mini.textContent =
      (count < TARGET)
        ? `Цель 7 дней: ${shown} / ${TARGET} — осталось ${left}`
        : `Цель 7 дней: ${TARGET} / ${TARGET} ✅${count > TARGET ? ` (ещё +${count - TARGET})` : ''}`;
  }

  // DEBUG по ?debug=1
  const dbg = document.getElementById('streakDebug');
  if (dbg) {
    if (location.search.includes('debug=1')) {
      const last = localStorage.getItem(STREAK_DAYNUM_KEY) || '—';
      dbg.style.display = '';
      dbg.textContent = `DEBUG: count=${count}, lastDay=${last}, todayDay=${dayNum()}`;
    } else {
      dbg.style.display = 'none';
    }
  }
}

function markStreakToday() {
  const today = dayNum();
  const last  = Number(localStorage.getItem(STREAK_DAYNUM_KEY));
  let count   = Number(localStorage.getItem(STREAK_COUNT_KEY) || 0);

  if (!Number.isNaN(last)) {
    if (last === today) {
      showToast('Сегодня уже засчитано ✅');
      return;
    }
    count = (last === today - 1) ? Math.max(1, count) + 1 : 1;
  } else {
    count = 1;
  }

  localStorage.setItem(STREAK_COUNT_KEY, String(count));
  localStorage.setItem(STREAK_DAYNUM_KEY, String(today));
  renderStreak();
  showToast(`Засчитано! 🔥 Серия: ${count}`);
}

function resetStreak(){
  localStorage.removeItem(STREAK_COUNT_KEY);
  localStorage.removeItem(STREAK_DAYNUM_KEY);
  renderStreak();
  showToast('Серия сброшена ↩️');
}

// обработчики
const streakBtn = document.getElementById('streakBtn');
streakBtn?.addEventListener('click', (e) => {
  if (e.shiftKey) { e.preventDefault(); resetStreak(); return; }
  markStreakToday();
});

greetBtn?.addEventListener('click', () => {
  if (helloText) {
    helloText.textContent = phrases[phraseIdx];
    phraseIdx = (phraseIdx + 1) % phrases.length;
  }
  markStreakToday();
});

// первый рендер
renderStreak();

/* =========================
   ЦИТАТА ДНЯ
========================= */
const QUOTES = [
  'Лучше сделать маленькую фичу сегодня, чем большую «когда-нибудь».',
  'Секрет прогресса — в ежедневной практике по 15–30 минут.',
  'Чистый код — это доброта к себе из будущего.',
  'Ошибки — это подсказки. Чиним и идём дальше.',
  'Глаза намётанные — баги испуганные 😄',
];
const Q_TEXT_ID   = 'qText';
const Q_COPY_ID   = 'qCopy';
const Q_DEBUG_ID  = 'qQuoteDebug';
const Q_DAY_KEY   = 'andrey_quote_daynum';
const Q_INDEX_KEY = 'andrey_quote_index';

function pickQuoteIndex(prev) {
  return (typeof prev === 'number') ? (prev + 1) % QUOTES.length : 0;
}

function renderQuote() {
  const el = document.getElementById(Q_TEXT_ID);
  if (!el) return;

  const today = dayNum();
  const storedDay  = Number(localStorage.getItem(Q_DAY_KEY));
  let   storedIdx  = localStorage.getItem(Q_INDEX_KEY);
  storedIdx = storedIdx === null ? null : Number(storedIdx);

  let idx;
  if (storedDay === today && typeof storedIdx === 'number') {
    idx = storedIdx;
  } else {
    idx = pickQuoteIndex(storedIdx);
    localStorage.setItem(Q_DAY_KEY, String(today));
    localStorage.setItem(Q_INDEX_KEY, String(idx));
  }

  el.textContent = QUOTES[idx];

  const dbg = document.getElementById(Q_DEBUG_ID);
  if (dbg) {
    if (location.search.includes('debug=1')) {
      dbg.style.display = '';
      dbg.textContent = `QUOTE DEBUG: idx=${idx}, day=${today}`;
    } else {
      dbg.style.display = 'none';
    }
  }
}

(function wireQuoteCopy(){
  const btn = document.getElementById(Q_COPY_ID);
  const el  = document.getElementById(Q_TEXT_ID);
  if (!btn || !el) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el.textContent || '');
      showToast('Цитата скопирована ✅');
    } catch {
      showToast('Не удалось скопировать 😅');
    }
  });
})();
renderQuote();

// === Горячие клавиши ===
// G — привет; T — тема; Enter — зачёт; Shift+Enter — сброс (с подтверждением)
document.addEventListener('keydown', (e) => {
  // не мешаем вводу в полях
  const tag = document.activeElement?.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
  if (e.repeat) return; // игнор удержания

  const k = e.key.toLowerCase();

  if (k === 'g') {
    // "Привет, Андрей"
    greetBtn?.click();
  } else if (k === 't') {
    // тема
    themeBtn?.click();
  } else if (k === 'enter') {
    e.preventDefault();
    if (e.shiftKey) {
      // сброс серии с подтверждением
      if (confirm('Сбросить серию?')) resetStreak?.();
    } else {
      // зачесть сегодня
      markStreakToday?.();
    }
  }
});

