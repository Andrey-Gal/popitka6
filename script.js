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

// === Tiny Goal Timer =========================================================
(function TinyGoalTimer(){
  const LS_KEY = 'tgt_state_v1';
  const SEC_DEFAULT = 15*60;

  const state = load() || {
    goal: 'Учусь 15 минут',
    leftSec: SEC_DEFAULT,
    running: false,
    lastTick: null,
    history: {} // по дням: { '2025-10-28': ['Цель 1', 'Цель 2'] }
  };

  // Создаём DOM
  const root = document.createElement('div');
  root.className = 'tgt';
  root.innerHTML = `
    <div class="tgt__row" style="margin-bottom:8px">
      <input class="tgt__goal" type="text" placeholder="Моя цель на 15 минут">
    </div>
    <div class="tgt__row">
      <div class="tgt__ring">
        <svg viewBox="0 0 44 44" width="56" height="56">
          <circle class="bg" cx="22" cy="22" r="18"></circle>
          <circle class="fg" cx="22" cy="22" r="18" stroke-dasharray="${circLen()}" stroke-dashoffset="0"></circle>
        </svg>
        <div class="tgt__time">15:00</div>
      </div>
      <button class="tgt__btn tgt__btn--primary" data-act="toggle">Старт</button>
      <button class="tgt__btn" data-act="add">+5</button>
      <button class="tgt__btn" data-act="reset">Сброс</button>
    </div>
    <div class="tgt__hint">
      <span><b>Хоткеи:</b></span>
      <span><span class="tgt__kbd">P</span> старт/пауза</span>
      <span><span class="tgt__kbd">S</span> +5 мин</span>
      <span><span class="tgt__kbd">R</span> сброс</span>
    </div>
    <div class="tgt__sep"></div>
    <div class="tgt__hint"><b>Сегодня:</b></div>
    <ul class="tgt__hist"></ul>
  `;
  document.body.appendChild(root);

  const el = {
    goal: root.querySelector('.tgt__goal'),
    time: root.querySelector('.tgt__time'),
    fg:   root.querySelector('.fg'),
    toggle: root.querySelector('[data-act="toggle"]'),
    add: root.querySelector('[data-act="add"]'),
    reset: root.querySelector('[data-act="reset"]'),
    hist: root.querySelector('.tgt__hist')
  };

  // init
  el.goal.value = state.goal || '';
  renderTime();
  renderHist();
  setBtnText();

  // listeners
  root.addEventListener('click', (e)=>{
    const act = e.target.dataset.act;
    if(!act) return;
    if(act==='toggle') toggle();
    if(act==='add') { state.leftSec += 5*60; save(); renderTime(true); }
    if(act==='reset') { state.leftSec = SEC_DEFAULT; state.running=false; save(); renderTime(true); setBtnText(); }
  });
  el.goal.addEventListener('input', ()=>{ state.goal = el.goal.value; save(); });

  // hotkeys
  window.addEventListener('keydown', (e)=>{
    if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    if(e.key.toLowerCase()==='p') toggle();
    if(e.key.toLowerCase()==='s'){ state.leftSec+=5*60; save(); renderTime(true); }
    if(e.key.toLowerCase()==='r'){ state.leftSec=SEC_DEFAULT; state.running=false; save(); renderTime(true); setBtnText(); }
  });

  // тикер
  let raf;
  function tick(ts){
    if(!state.running){ cancelAnimationFrame(raf); return; }
    if(state.lastTick==null) state.lastTick = ts;
    const delta = Math.floor((ts - state.lastTick)/1000);
    if(delta>0){
      state.leftSec = Math.max(0, state.leftSec - delta);
      state.lastTick = ts;
      renderTime();
      save();
      if(state.leftSec===0){
        state.running=false;
        setBtnText();
        celebrate();
        pushHistory(state.goal || 'Цель');
        renderHist();
        state.leftSec = SEC_DEFAULT; // новый раунд
        save();
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function toggle(){
    state.running = !state.running;
    state.lastTick = null;
    setBtnText();
    save();
    if(state.running) raf = requestAnimationFrame(tick);
  }

  function setBtnText(){ el.toggle.textContent = state.running ? 'Пауза' : 'Старт'; }

  function renderTime(snap=false){
    const m = Math.floor(state.leftSec/60).toString().padStart(2,'0');
    const s = (state.leftSec%60).toString().padStart(2,'0');
    el.time.textContent = `${m}:${s}`;
    const frac = state.leftSec / SEC_DEFAULT;
    const len = circLen();
    el.fg.style.strokeDasharray = len;
    el.fg.style.strokeDashoffset = snap ? (len*(1-frac)).toString() : (len*(1-frac)).toFixed(2);
  }

  function renderHist(){
    const d = today();
    const arr = state.history[d] || [];
    el.hist.innerHTML = arr.map(t=>`<li>✅ ${escapeHtml(t)}</li>`).join('') || '<li style="color:var(--tgt-muted)">Пока пусто — начни с маленькой цели.</li>';
  }

  function pushHistory(text){
    const d = today();
    state.history[d] = state.history[d] || [];
    state.history[d].push(text);
    save();
  }

  function celebrate(){
    // простое конфетти на canvas
    const c = document.createElement('canvas');
    c.className = 'confetti'; document.body.appendChild(c);
    const ctx = c.getContext('2d');
    function resize(){ c.width = innerWidth; c.height = innerHeight; }
    resize(); window.addEventListener('resize', resize, { once:true });

    const N=160, parts=[];
    for(let i=0;i<N;i++){
      parts.push({
        x: Math.random()*c.width, y: -10-Math.random()*50,
        r: 2+Math.random()*4, vx: -1+Math.random()*2, vy: 2+Math.random()*3, a: Math.random()*Math.PI*2
      });
    }
    let t=0;
    (function anim(){
      t++; ctx.clearRect(0,0,c.width,c.height);
      parts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.a+=0.1;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = `hsl(${(p.x+p.y)%360},85%,60%)`;
        ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2);
        ctx.restore();
      });
      if(t<240) requestAnimationFrame(anim); else c.remove();
    })();
  }

  // utils
  function circLen(){ return 2*Math.PI*18; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  function load(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)); }catch{ return null; } }
  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  // Если до перезагрузки таймер был «в пути», корректно продолжаем
  if(state.running) requestAnimationFrame(tick);
})();
