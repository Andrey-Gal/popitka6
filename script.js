// === Год в футере + базовый заголовок вкладки ===
const BASE_TITLE = document.title;
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
  if (themeBtn) {
    themeBtn.textContent = '☀️ Светлая тема';
    themeBtn.setAttribute('aria-pressed', 'true');
  }
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

// Миграция со старого ключа YYYY-MM-DD -> daynum (если вдруг остался)
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

  // 🔹 обновляем заголовок вкладки
  document.title = count > 0 ? `🔥 ${count} — ${BASE_TITLE}` : BASE_TITLE;

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

/** Засчитать сегодня */
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

/* =========================
   ОБРАБОТЧИКИ
========================= */
const streakBtn = document.getElementById('streakBtn');
streakBtn?.addEventListener('click', (e) => {
  if (e.shiftKey) { e.preventDefault(); resetStreak(); return; } // скрытый сброс (без confirm)
  markStreakToday();
});

greetBtn?.addEventListener('click', () => {
  if (helloText) {
    helloText.textContent = phrases[phraseIdx];
    phraseIdx = (phraseIdx + 1) % phrases.length;
  }
  markStreakToday();
});

// Первый рендер
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
    idx = storedIdx;                // тот же день — та же цитата
  } else {
    idx = pickQuoteIndex(storedIdx); // новый день — следующая
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

/* =========================
   БЭКАП / ВОССТАНОВЛЕНИЕ БЕЗ МОДАЛОК
========================= */
// Вспомогалки панели импорта
const importBox = document.getElementById('streakImportBox');
const importTA  = document.getElementById('streakImportTA');

function showImportBox(prefill = '') {
  if (!importBox) return;
  importBox.classList.remove('hidden');
  if (importTA) { importTA.value = prefill; importTA.focus(); importTA.select(); }
}
function hideImportBox() { importBox?.classList.add('hidden'); }

function makeBackupPayload(){
  return {
    count: Number(localStorage.getItem(STREAK_COUNT_KEY) || 0),
    daynum: Number(localStorage.getItem(STREAK_DAYNUM_KEY) || 0),
    ts: Date.now()
  };
}
function toBlobString(payload){
  return 'andrey-streak:' + btoa(JSON.stringify(payload));
}
function parseBackup(raw){
  const s = raw.trim();
  if (!s.startsWith('andrey-streak:')) throw new Error('bad prefix');
  const json = atob(s.replace(/^andrey-streak:/,''));
  const data = JSON.parse(json);
  if (typeof data.count !== 'number' || typeof data.daynum !== 'number') throw new Error('bad shape');
  return { count: Math.max(0, Math.floor(data.count)), daynum: Math.floor(data.daynum) };
}

async function exportStreak(){
  const blob = toBlobString(makeBackupPayload());
  try {
    await navigator.clipboard.writeText(blob);
    showToast('Бэкап скопирован ✅');
  } catch {
    // нет доступа к буферу — покажем панель и положим строку туда
    showImportBox(blob);
    showToast('Скопируй строку из поля ниже');
  }
}

async function importStreakFromClipboard(){
  try {
    const raw = await navigator.clipboard.readText();
    const {count, daynum} = parseBackup(raw);
    localStorage.setItem(STREAK_COUNT_KEY, String(count));
    localStorage.setItem(STREAK_DAYNUM_KEY, String(daynum));
    renderStreak(); hideImportBox();
    showToast('Восстановлено ✅');
  } catch {
    // не дали доступ / пусто — открываем панель ручного ввода
    showImportBox('');
    showToast('Вставь строку бэкапа вручную');
  }
}
function importStreakFromTextarea(){
  if (!importTA) return;
  try {
    const {count, daynum} = parseBackup(importTA.value);
    localStorage.setItem(STREAK_COUNT_KEY, String(count));
    localStorage.setItem(STREAK_DAYNUM_KEY, String(daynum));
    renderStreak(); hideImportBox();
    showToast('Восстановлено ✅');
  } catch {
    showToast('Неверный формат бэкапа 🧐');
  }
}

// Привязки
document.getElementById('streakExport')?.addEventListener('click', exportStreak);
document.getElementById('streakImport')?.addEventListener('click', importStreakFromClipboard);
document.getElementById('streakImportDo')?.addEventListener('click', importStreakFromTextarea);
document.getElementById('streakImportHide')?.addEventListener('click', hideImportBox);

/* =========================
   ГОРЯЧИЕ КЛАВИШИ (без confirm)
========================= */
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (k === 'g') {
    greetBtn?.click();
  } else if (k === 't') {
    themeBtn?.click();
  } else if (k === 'enter') {
    e.preventDefault();
    if (e.shiftKey) resetStreak(); else markStreakToday();
  }
});

// === Двойной клик по строке "Серия дней" засчитывает день ===
document.querySelector('.streak')?.addEventListener('dblclick', () => {
  markStreakToday();
  if (typeof showToast === 'function') showToast('Двойной клик — зачёт ⚡');
});
