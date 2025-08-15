// === Год в футере ===
document.getElementById('year').textContent = new Date().getFullYear();

// === Тёмная тема (сохранение состояния) ===
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const THEME_KEY = 'andrey_theme';

// восстановим состояние
const saved = localStorage.getItem(THEME_KEY);
if (saved === 'dark') {
  body.classList.add('dark');
  themeBtn.textContent = '☀️ Светлая тема';
  themeBtn.setAttribute('aria-pressed', 'true');
}

themeBtn.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  themeBtn.textContent = isDark ? '☀️ Светлая тема' : '🌙 Тёмная тема';
  themeBtn.setAttribute('aria-pressed', String(isDark));
});

// === «Привет, Андрей» — смена фраз ===
const greetBtn = document.getElementById('greetBtn');
const helloText = document.getElementById('helloText');

const phrases = [
  'Привет, Андрей! 🚀 Поехали!',
  'Делаем маленькие шаги, но каждый — вперёд 💪',
  'Сегодня +1 фича. Завтра — +ещё одна. Так побеждают!',
  'ИИ — напарник. Решения — твои. ✨',
];
let idx = 0;

greetBtn.addEventListener('click', () => {
  helloText.textContent = phrases[idx];
  idx = (idx + 1) % phrases.length;
});

// === Стрик (серия дней) ===
const streakValue = document.getElementById('streakValue');
const streakBtn   = document.getElementById('streakBtn');

const STREAK_COUNT_KEY = 'andrey_streak_count';
const STREAK_DATE_KEY  = 'andrey_streak_date';

function yyyymmdd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadStreak() {
  const count = Number(localStorage.getItem(STREAK_COUNT_KEY) || 0);
  streakValue.textContent = count;
}
loadStreak();

// === Toast (ненавязчивое уведомление) ===
function showToast(message, timeout = 1800) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.appendChild(t);
  // показать в следующем кадре
  requestAnimationFrame(() => t.classList.add('show'));
  // убрать через timeout
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 250);
  }, timeout);
}


streakBtn.addEventListener('click', () => {
  const today = yyyymmdd(new Date());
  const last  = localStorage.getItem(STREAK_DATE_KEY);
  let count   = Number(localStorage.getItem(STREAK_COUNT_KEY) || 0);

  if (last === today) {
  showToast('Сегодня уже засчитано ✅');
  return;
}


  // если последний день — вчера, то серия продолжается, иначе начинается заново
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return yyyymmdd(d);
  })();

  if (last === yesterday) {
    count += 1;
  } else {
    count = 1; // новая серия
  }

  localStorage.setItem(STREAK_COUNT_KEY, String(count));
  localStorage.setItem(STREAK_DATE_KEY, today);
  streakValue.textContent = count;
  streakValue.textContent = count;
showToast(`Засчитано! 🔥 Серия: ${count}`);

});

