// ===== Модель 8-дневного цикла =====
const DAYS = [
  { n:1, type:'day',   name:'Дневная смена (1 из 2)',   study:'Лёгкое повторение (15–20 мин)', gym:'Нет',  hint:'Лечь пораньше' },
  { n:2, type:'day',   name:'Дневная смена (2 из 2)',   study:'Лёгкое повторение (15–20 мин)', gym:'Нет',  hint:'Экономим силы' },
  { n:3, type:'off',   name:'Выходной (1 из 2)',        study:'Новые темы + проект',            gym:'Зал',  hint:'Сила: грудь/спина/руки' },
  { n:4, type:'off',   name:'Выходной (2 из 2)',        study:'Новые темы + проект',            gym:'Зал',  hint:'Ноги/пресс + кардио' },
  { n:5, type:'night', name:'Ночная смена (1 из 2)',    study:'Короткое повторение (по желанию)', gym:'Нет', hint:'Сон днём' },
  { n:6, type:'night', name:'Ночная смена (2 из 2)',    study:'Короткое повторение (по желанию)', gym:'Нет', hint:'Сон днём' },
  { n:7, type:'rest',  name:'Отсыпной',                 study:'Только лёгкая теория до 30 мин', gym:'Нет',  hint:'Максимум сна' },
  { n:8, type:'off',   name:'Выходной (после отсыпного)', study:'Полноценная учёба + проект',   gym:'Зал',  hint:'Средняя нагрузка' },
];

// ===== Ключи хранилища =====
const KEY_START_DATE  = 'andrey_cycle_start_date';
const KEY_START_INDEX = 'andrey_cycle_start_index';

// ===== Утилиты =====
const toMidnight = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function showToast(message, timeout=1800){
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),250); }, timeout);
}

function getCycleDay(startDate, startIndex, now){
  const a = toMidnight(startDate);
  const b = toMidnight(now);
  const diff = Math.floor((b - a) / 86400000);
  const shift = ((diff % 8) + 8) % 8;
  const base = (Number(startIndex) - 1 + shift) % 8;
  return base + 1; // 1..8
}

function renderGrid(){
  const wrap = document.getElementById('gridBody');
  wrap.innerHTML = '';
  DAYS.forEach(d=>{
    const row = document.createElement('div');
    row.className = 'grid';
    row.innerHTML = `
      <div><span class="pill">${d.n}</span></div>
      <div>${d.name}</div>
      <div>${d.study}</div>
      <div>${d.gym}</div>
    `;
    wrap.appendChild(row);
  });
}

function renderToday(dayIdx){
  const model = DAYS[dayIdx - 1];
  document.getElementById('todayTitle').textContent = `Сегодня: день ${dayIdx} — ${model.name}`;
  document.getElementById('todayHint').textContent  = model.hint;

  const next = dayIdx % 8 + 1;
  document.getElementById('tomorrowLine').textContent =
    `Завтра: день ${next} — ${DAYS[next - 1].name}`;

  const holder = document.getElementById('todayTasks');
  holder.innerHTML = '';
  const key = 'andrey_checks_' + toMidnight(new Date()).toISOString().slice(0,10);
  const saved = JSON.parse(localStorage.getItem(key) || '{}');

  const tasks = [];
  if (model.gym === 'Зал') tasks.push({ id:'gym', label:'Зал / тренировка' });
  if (model.type === 'day')   tasks.push({ id:'sleep', label:'Лечь пораньше' });
  if (model.type === 'night') tasks.push({ id:'sleep', label:'Сон днём' });
  if (model.type === 'rest')  tasks.push({ id:'sleep', label:'Отсыпной — максимум сна' });
  if (/по желанию/i.test(model.study)) tasks.push({ id:'study', label:'Учёба (по желанию): коротко' });
  else tasks.push({ id:'study', label:`Учёба: ${model.study}` });

  tasks.forEach(t=>{
    const lab = document.createElement('label');
    lab.className = 'chk';
    lab.innerHTML = `<input type="checkbox" id="t_${t.id}"><span>${t.label}</span>`;
    holder.appendChild(lab);
    const cb = lab.querySelector('input');
    cb.checked = !!saved[t.id];
    cb.addEventListener('change', ()=>{
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      data[t.id] = cb.checked;
      localStorage.setItem(key, JSON.stringify(data));
    });
  });

  document.getElementById('resetToday').onclick = ()=>{
    localStorage.removeItem(key);
    renderToday(dayIdx);
  };
}

const startInput = document.getElementById('startInput');
const startIndexSelect = document.getElementById('startIndex');
const startInfo = document.getElementById('startInfo');

function loadStart(){
  const dateVal  = localStorage.getItem(KEY_START_DATE);
  const indexVal = localStorage.getItem(KEY_START_INDEX);
  if (dateVal && indexVal){
    startInput.value = dateVal;
    startIndexSelect.value = indexVal;
    const dayIdx = getCycleDay(new Date(dateVal), Number(indexVal), new Date());
    startInfo.textContent = `Старт: ${dateVal}, выбран «День ${indexVal}». Сегодня — день ${dayIdx} из 8.`;
    document.getElementById('todayCard').hidden = false;
    renderToday(dayIdx);
  } else {
    startInfo.textContent = 'Выбери дату и конкретный день цикла, затем нажми «Сохранить».';
    document.getElementById('todayCard').hidden = true;
  }
}

document.getElementById('saveStartBtn').addEventListener('click', ()=>{
  if (!startInput.value){ showToast('Выбери дату старта'); return; }
  localStorage.setItem(KEY_START_DATE, startInput.value);
  localStorage.setItem(KEY_START_INDEX, startIndexSelect.value);
  loadStart();
});

document.getElementById('resetStartBtn').addEventListener('click', ()=>{
  localStorage.removeItem(KEY_START_DATE);
  localStorage.removeItem(KEY_START_INDEX);
  loadStart();
});

document.getElementById('shareBtn').addEventListener('click', async ()=>{
  const url = location.href;
  if (navigator.share){
    try{ await navigator.share({ title:'Мой 8-дневный цикл', url }); }catch(e){}
  } else {
    try{
      await navigator.clipboard.writeText(url);
      showToast('Ссылка скопирована');
    }catch(e){}
  }
});

// init
renderGrid();
loadStart();
