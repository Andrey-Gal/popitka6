// === Год в футере ===
document.getElementById('year').textContent = new Date().getFullYear();

// === Тёмная тема (сохранение состояния) ===
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const THEME_KEY = 'andrey_theme';

// восстановим состояние темы
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'dark') {
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

// === Тост (ненавязчивое уведомление) ===
function showToast(message, timeout = 1800) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 250);
  }, timeout);
}

// === Вспомогалки для дат ===
function yyyymmdd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return yyyymmdd(d);
}

// === Стрик (серия дней) ===
const streakValue = document.getElementById('streakValue');
const streakBtn   = document.getElementById('streakBtn');

const STREAK_COUNT_KEY = 'andrey_streak_count';
const STREAK_DATE_KEY  = 'andrey_streak_date';

function loadStreak() {
  const count = Number(localStorage.getItem(STREAK_COUNT_KEY) || 0);
  streakValue.textContent = count;
}
loadStreak();

// Универсальная функция: засчитать сегодня (автоповтор не даём)
function markStreakToday() {
  const today = yyyymmdd(new Date());
  const last  = localStorage.getItem(STREAK_DATE_KEY);
  let count   = Number(localStorage.getItem(STREAK_COUNT_KEY) || 0);

  if (last === today) {
    showToast('Сегодня уже засчитано ✅');
    return false; // ничего не меняли
  }

  if (last === yesterdayStr()) {
    count += 1;        // продолжаем серию
  } else {
    count = 1;         // начинаем новую
  }

  localStorage.setItem(STREAK_COUNT_KEY, String(count));
  localStorage.setItem(STREAK_DATE_KEY, today);
  streakValue.textContent = count;
  showToast(`Засчитано! 🔥 Серия: ${count}`);
  return true; // серия обновлена
}

// Кнопка «Засчитать сегодня»
if (streakBtn) {
  streakBtn.addEventListener('click', () => {
    markStreakToday();
  });
}

// «Привет, Андрей» — меняет фразу + АВТОзачёт серии
if (greetBtn) {
  greetBtn.addEventListener('click', () => {
    helloText.textContent = phrases[idx];
    idx = (idx + 1) % phrases.length;
    markStreakToday();
  });
}
