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
