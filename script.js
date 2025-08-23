// === Год в футере ===
document.getElementById('year').textContent = new Date().getFullYear();

// === Тёмная тема ===
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

// === «Привет, Андрей» + автозачёт ===
const greetBtn  = document.getElementById('greetBtn');
const helloText = document.getElementById('helloText');
const phrases = [
  'Привет, Андрей! 🚀 Поехали!',
  'Делаем маленькие шаги, но каждый — вперёд 💪',
  'Сегодня +1 фича. Завтра — +ещё одна. Так побеждают!',
  'ИИ — напарник. Решения — твои. ✨',
];
let phraseIdx = 0;

// === Утилиты ===
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

// === Стрик (устойчив к часовым поясам) ===
const streakValue = document.getElementById('streakValue');
const streakBtn   = document.getElementById('streakBtn');

const STREAK_COUNT_KEY  = 'andrey_streak_count';
const STREAK_DAYNUM_KEY = 'andrey_streak_daynum'; // номер суток (местная полночь)

// Номер календарного дня относительно эпохи (полночь локального времени)
function dayNum(d = new Date()) {
  const x = new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return Math.floor(x.getTime() / 86400000);
}

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
  streakValue.textContent = count;
  const w = document.getElementById('streakWord');
  if (w) w.textContent = pluralDays(count);

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

/** Засчитать сегодня:
 * last==today   -> уже засчитано
 * last==today-1 -> +1 к серии
 * иначе         -> 1 (начать заново)
 */
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

// Кнопки
streakBtn?.addEventListener('click', markStreakToday);
greetBtn?.addEventListener('click', () => {
  if (helloText) {
    helloText.textContent = phrases[phraseIdx];
    phraseIdx = (phraseIdx + 1) % phrases.length;
  }
  markStreakToday();
});

// Первый рендер
renderStreak();
