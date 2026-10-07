"use strict";
/* Centum Path – XII Commerce study portal.
   Content lives in assets/data/content.json; all progress is kept in this browser (localStorage). */

const SUBJ = {
  com:{name:'Commerce', code:'COM', tag:'Theory', blurb:'Management, money market, marketing, consumer rights, business environment, sale of goods, negotiable instruments, entrepreneurship and company law.'},
  eco:{name:'Economics', code:'ECO', tag:'Theory', blurb:'Macro economics: national income, employment theories, money and banking, international trade, fiscal policy, environment, development and statistics.'},
  acc:{name:'Accountancy', code:'ACC', tag:'Problems + theory', blurb:'Incomplete records, not-for-profit accounts, partnership (goodwill, admission, retirement), company accounts, financial statement and ratio analysis, Tally.'},
  bm:{name:'Business Maths', code:'BMS', tag:'Problems + theory', blurb:'Matrices, integral calculus and its applications, differential equations, numerical methods, probability, sampling, applied statistics and operations research.'}
};
const ORDER = ['com','eco','acc','bm'];
let D = null;

/* ---------- icons ---------- */
const sv = p => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC = {
  home: sv('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  com: sv('<path d="M4 7h16v12H4z"/><path d="M9 7V5h6v2"/><path d="M4 12h16"/>'),
  eco: sv('<path d="M4 20V4"/><path d="M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>'),
  acc: sv('<path d="M6 3h12v18H6z"/><path d="M12 3v18"/><path d="M8 8h2M8 12h2M14 8h2M14 12h2M14 16h2"/>'),
  bm: sv('<path d="M17 5H7l6 7-6 7h10"/>'),
  plan: sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>'),
  mock: sv('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>'),
  bolt: sv('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
  me: sv('<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
  guide: sv('<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M8 9h8M8 13h6"/>'),
  fire: sv('<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4.3 3 7 7 7z"/>'),
  star: sv('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  moon: sv('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
  sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'),
  cards: sv('<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>')
};

/* ---------- storage (per-viewer only) ---------- */
const KEY = 'centum-path-v1';
let S = {read:{},mcq:{},learn:{},solved:{},plan:{},start:null,mocks:{},cards:{},daily:{},days:{},seen:{},name:'',theme:null,xp0:null};
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) {}
function persist(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

const dstr = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const todayStr = () => dstr(new Date());

/* save = persist + mark today active + celebrate XP, level-ups and new badges */
function save(quiet){
  S.days[todayStr()] = 1;
  const before = S.xp0 == null ? xpTotal() : S.xp0;
  const after = xpTotal();
  const lvBefore = levelOf(before).i, lvAfter = levelOf(after).i;
  S.xp0 = after;
  const fresh = BADGES.filter(b => b.test() && !S.seen[b.id]);
  fresh.forEach(b => S.seen[b.id] = 1);
  persist();
  renderTools();
  if (quiet) return;
  if (fresh.length) { toast('Badge unlocked: ' + fresh[0].name); confetti(); }
  else if (lvAfter > lvBefore) { toast('Level up! You are now a ' + LEVELS[lvAfter][1]); confetti(); }
  else if (after > before) toast('+' + (after - before) + ' XP');
}

/* ---------- XP, levels, streak, badges ---------- */
const LEVELS = [[0,'Rookie'],[200,'Explorer'],[600,'Learner'],[1200,'Scholar'],[2200,'Achiever'],[3600,'Topper'],[5500,'Star'],[8000,'Centum Champ']];
const cnt = o => Object.keys(o || {}).length;
function xpTotal(){
  let x = cnt(S.read)*20 + cnt(S.learn)*5 + cnt(S.solved)*5 + cnt(S.plan)*10 + cnt(S.cards)*2;
  for (const k in S.mcq) x += (S.mcq[k].best || 0) * 2;
  for (const k in S.daily) x += 10 + (S.daily[k].score || 0) * 3;
  for (const k in S.mocks) x += (S.mocks[k] || []).length * 30;
  return x;
}
function levelOf(x){
  let i = 0; while (i < LEVELS.length-1 && x >= LEVELS[i+1][0]) i++;
  const lo = LEVELS[i][0], hi = i < LEVELS.length-1 ? LEVELS[i+1][0] : null;
  return {i, name:LEVELS[i][1], lo, hi, pct: hi ? (x-lo)/(hi-lo) : 1};
}
function streak(){
  const d = new Date(); let n = 0;
  if (!S.days[dstr(d)]) d.setDate(d.getDate()-1);
  while (S.days[dstr(d)]) { n++; d.setDate(d.getDate()-1); }
  return n;
}
const perfectCount = () => Object.values(S.mcq).filter(m => m.best === m.total).length;
const BADGES = [
  {id:'start', mark:'1', name:'Day one', desc:'Start your 60-day plan', test:()=>!!S.start},
  {id:'read1', mark:'Rd', name:'First page', desc:'Mark your first chapter as read', test:()=>cnt(S.read)>=1},
  {id:'read10', mark:'10', name:'Bookworm', desc:'Read 10 chapters', test:()=>cnt(S.read)>=10},
  {id:'perfect', mark:'✓', name:'Full marks', desc:'Score 100% on a chapter’s 1-mark quiz', test:()=>perfectCount()>=1},
  {id:'perfect10', mark:'◎', name:'Sharpshooter', desc:'Full marks on 10 chapter quizzes', test:()=>perfectCount()>=10},
  {id:'write25', mark:'✎', name:'Answer writer', desc:'Tick “I can write this” on 25 answers', test:()=>cnt(S.learn)>=25},
  {id:'solve25', mark:'Σ', name:'Problem solver', desc:'Solve 25 practice problems', test:()=>cnt(S.solved)>=25},
  {id:'flash50', mark:'⧉', name:'Memory master', desc:'Know 50 flashcards', test:()=>cnt(S.cards)>=50},
  {id:'daily1', mark:'⚡', name:'Challenger', desc:'Finish a daily challenge', test:()=>cnt(S.daily)>=1},
  {id:'daily7', mark:'7⚡', name:'Habit builder', desc:'Finish 7 daily challenges', test:()=>cnt(S.daily)>=7},
  {id:'streak3', mark:'3', name:'On fire', desc:'Study 3 days in a row', test:()=>streak()>=3},
  {id:'streak7', mark:'7', name:'Unstoppable', desc:'Study 7 days in a row', test:()=>streak()>=7},
  {id:'subject', mark:'★', name:'Subject master', desc:'Read every chapter of one subject', test:()=>ORDER.some(s=>D[s].every((_,i)=>S.read[s+'-'+i]))},
  {id:'mock1', mark:'90', name:'Exam ready', desc:'Save a full mock paper score', test:()=>Object.values(S.mocks).some(a=>a.length)},
  {id:'mock80', mark:'80+', name:'Distinction', desc:'Score 80 or more in a mock paper', test:()=>Object.values(S.mocks).some(a=>a.some(r=>r.score>=80))},
  {id:'centum', mark:'100', name:'Centum mindset', desc:'Score 90 / 90 in a mock paper', test:()=>Object.values(S.mocks).some(a=>a.some(r=>r.score>=90))}
];

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function inline(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); }
function rowsToTable(rows){
  const cells = rows.map(r => r.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c => c.trim()));
  let h = '<div class="tbl"><table><thead><tr>' + cells[0].map(c => '<th>'+inline(c)+'</th>').join('') + '</tr></thead><tbody>';
  for (const r of cells.slice(1)) h += '<tr>' + r.map(c => '<td>'+inline(c)+'</td>').join('') + '</tr>';
  return h + '</tbody></table></div>';
}
function fmt(text){
  const lines = String(text).split('\n'); let out = '', i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (l.trim().startsWith('|')) { const g=[]; while (i<lines.length && lines[i].trim().startsWith('|')) { g.push(lines[i]); i++; } out += rowsToTable(g); continue; }
    if (/^\s*[-•]\s+/.test(l)) { out += '<ul>'; while (i<lines.length && /^\s*[-•]\s+/.test(lines[i])) { out += '<li>'+inline(lines[i].replace(/^\s*[-•]\s+/,''))+'</li>'; i++; } out += '</ul>'; continue; }
    if (/^\s*\d+\.\s+/.test(l)) { out += '<ol>'; while (i<lines.length && /^\s*\d+\.\s+/.test(lines[i])) { out += '<li>'+inline(lines[i].replace(/^\s*\d+\.\s+/,''))+'</li>'; i++; } out += '</ol>'; continue; }
    out += '<p>'+inline(l)+'</p>'; i++;
  }
  return out;
}
function ptsBlock(pts, isFormula){
  let out = '', i = 0;
  while (i < pts.length) {
    if (pts[i].trim().startsWith('|')) { const g=[]; while (i<pts.length && pts[i].trim().startsWith('|')) { g.push(pts[i]); i++; } out += rowsToTable(g); continue; }
    if (isFormula) { out += '<div class="fline">'+inline(pts[i])+'</div>'; i++; continue; }
    out += '<ul>'; while (i<pts.length && !pts[i].trim().startsWith('|')) { out += '<li>'+inline(pts[i])+'</li>'; i++; } out += '</ul>';
  }
  return out;
}
const chWord = s => s === 'acc' ? 'Unit' : 'Ch';
function chProgress(sub, i){
  const c = D[sub][i]; const id = sub+'-'+i;
  const qa = [...c.q2.map((_,k)=>id+'-q2-'+k), ...c.q3.map((_,k)=>id+'-q3-'+k), ...c.q5.map((_,k)=>id+'-q5-'+k)];
  const learned = qa.filter(k => S.learn[k]).length;
  const pr = c.problems.map((_,k)=>id+'-p-'+k); const solved = pr.filter(k => S.solved[k]).length;
  const best = S.mcq[id]; const mcqPct = best ? best.best/best.total : 0;
  const parts = [S.read[id]?1:0, c.mcq.length?mcqPct:null, qa.length?learned/qa.length:null, pr.length?solved/pr.length:null].filter(v => v !== null);
  return {learned, qa:qa.length, solved, pr:pr.length, best, read:!!S.read[id], pct: parts.reduce((a,b)=>a+b,0)/parts.length};
}
function subjProgress(sub){ const n = D[sub].length; let t = 0; for (let i=0;i<n;i++) t += chProgress(sub,i).pct; return t/n; }
function shuffle(a, rnd=Math.random){ a = a.slice(); for (let i=a.length-1;i>0;i--) { const j = Math.floor(rnd()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function seeded(str){ let h = 1779033703 ^ str.length; for (let i=0;i<str.length;i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  return function(){ h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }

/* ---------- toast + confetti ---------- */
let toastT = null;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }
function confetti(){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('#confetti'); cv.hidden = false; const ctx = cv.getContext('2d');
  const W = cv.width = innerWidth, H = cv.height = innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--c-com','--c-eco','--c-acc','--c-bm','--hl','--blue'].map(v => cs.getPropertyValue(v).trim() || '#2f5bd3');
  const ps = Array.from({length:140}, () => ({x:W/2+(Math.random()-.5)*W*.3, y:H*.35, vx:(Math.random()-.5)*14, vy:-Math.random()*14-4, s:5+Math.random()*6, r:Math.random()*6, vr:(Math.random()-.5)*.3, c:cols[Math.floor(Math.random()*cols.length)]}));
  const t0 = performance.now();
  (function f(t){
    ctx.clearRect(0,0,W,H);
    for (const p of ps) { p.vy += .45; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66); ctx.restore(); }
    if (t - t0 < 1900) requestAnimationFrame(f); else { ctx.clearRect(0,0,W,H); cv.hidden = true; }
  })(t0);
}

/* ---------- theme ---------- */
function applyTheme(){ if (S.theme) document.documentElement.setAttribute('data-theme', S.theme); else document.documentElement.removeAttribute('data-theme'); }
function isDark(){ const t = document.documentElement.getAttribute('data-theme'); if (t) return t === 'dark'; return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
applyTheme();

/* ---------- 60-day plan ---------- */
let PLAN = [];
function buildPlan(){
  const heavy = {acc:{1:2,2:2,3:2,5:2,6:2,7:2}, bm:{2:3,3:2,4:2,7:2,9:2}};
  const queues = {};
  for (const s of ORDER) {
    const q = []; const ch = D[s];
    if (s === 'com') { for (let i=0;i<ch.length;i+=2) { const b = ch.slice(i,i+2); q.push({s, chs:b.map((_,k)=>i+k), label:b.map((c,k)=>'Ch '+(i+k+1)+' '+c.title).join(' + '), kind:'learn'}); } }
    else { ch.forEach((c,i) => { const n = (heavy[s]||{})[i+1] || 1; for (let p=1;p<=n;p++) { q.push({s, chs:[i], label:(s==='acc'?'Unit ':'Ch ')+(i+1)+' '+c.title+(n>1?(p===1?' – notes & examples':p===n?' – practice problems':' – exercises part '+p):''), kind:'learn'}); } }); }
    queues[s] = q;
  }
  const pairs = [['acc','com'],['bm','eco'],['acc','bm'],['com','eco'],['acc','eco'],['bm','com']];
  const days = []; let pi = 0;
  for (let d=1; d<=42; d++) {
    if (d % 7 === 0) { days.push({d, phase:'test', items:ORDER.map(s => ({s, label:'Weekly test: 1-mark quiz of '+SUBJ[s].name+' chapters done so far + write 3 long answers', chs:[]}))}); continue; }
    const pr = pairs[pi % pairs.length]; pi++;
    const items = [];
    for (const s of pr) {
      const it = queues[s].shift();
      items.push(it || {s, label:'Revise '+SUBJ[s].name+': redo wrong 1-marks and unsolved practice', chs:[], kind:'rev'});
    }
    items.push({s:pr[0], label:'15 min: flip the flashcards for today\'s chapters', chs:[], kind:'mini'});
    days.push({d, phase:'learn', items});
  }
  const left = ORDER.flatMap(s => queues[s]);
  let d = 43;
  while (left.length) { days.push({d, phase:'learn', items:left.splice(0,3)}); d++; }
  const revSeq = [['com','acc'],['eco','bm'],['acc','com'],['bm','eco'],['com','eco'],['acc','bm']];
  let r = 0;
  while (d <= 50) { const p = revSeq[r % revSeq.length]; r++; days.push({d, phase:'rev', items:p.map(s => ({s, label:'Revision: '+SUBJ[s].name+' – all notes, formulas and book-back 2/3 marks', chs:[]}))}); d++; }
  const mockSeq = ['com','eco','acc','bm',null,'acc','bm','com','eco',null];
  for (let k=0; k<10; k++, d++) {
    const s = mockSeq[k];
    if (s) days.push({d, phase:'mock', items:[{s, label:'Full mock paper (3 hrs) – '+SUBJ[s].name+'. Then correct with the answers and note weak chapters', chs:[], kind:'mock'}]});
    else days.push({d, phase:'rev', items:ORDER.map(x => ({s:x, label:'Fix weak chapters in '+SUBJ[x].name+' found in mocks', chs:[]}))});
  }
  return days.slice(0,60);
}
function todayIndex(){ if (!S.start) return null; const st = new Date(S.start+'T00:00:00'); const now = new Date(); now.setHours(0,0,0,0); return Math.floor((now-st)/86400000)+1; }

/* ---------- router ---------- */
let state = {view:'home'};
function go(view, params={}, push=true){
  state = Object.assign({view}, params);
  render();
  const tok = [view, params.s, params.i != null ? params.i : null, params.tab].filter(x => x !== undefined && x !== null).join('-');
  if (push) { try { if (location.hash.slice(1) !== tok) history.pushState(null, '', '#'+tok); } catch (e) {} }
  window.scrollTo(0,0);
}
function fromHash(){
  const h = location.hash.slice(1); if (!h) { state = {view:'home'}; return; }
  const p = h.split('-'); const v = p[0];
  if (v === 'subject' && D[p[1]]) state = {view:'subject', s:p[1]};
  else if (v === 'chapter' && D[p[1]] && D[p[1]][+p[2]]) state = {view:'chapter', s:p[1], i:+p[2], tab:p[3] || 'learn'};
  else if (v === 'cards' && D[p[1]]) state = {view:'cards', s:p[1]};
  else if (['plan','mock','guide','home','daily','me'].includes(v)) state = {view:v, s:D[p[1]] ? p[1] : undefined};
  else state = {view:'home'};
}
window.addEventListener('popstate', () => { fromHash(); render(); });

/* ---------- chrome: nav, tools, tab bar ---------- */
function isOn(k){
  if (k === 'home') return state.view === 'home';
  if (k.startsWith('subject:')) return ['subject','chapter','cards'].includes(state.view) && state.s === k.split(':')[1];
  return state.view === k;
}
function navClick(k){ if (k.startsWith('subject:')) go('subject', {s:k.split(':')[1]}); else go(k); }
function renderNav(){
  const items = [['home','Home'], ...ORDER.map(s => ['subject:'+s, SUBJ[s].name]), ['daily','Daily Challenge'], ['plan','60-Day Plan'], ['mock','Mock Test'], ['guide','Exam Guide']];
  $('#nav').innerHTML = items.map(([k,l]) => `<button data-k="${k}" class="${isOn(k)?'on':''}">${l}</button>`).join('');
  $('#nav').querySelectorAll('button').forEach(b => b.onclick = () => navClick(b.dataset.k));
  const tb = [['home','Home',IC.home], ['daily','Daily',IC.bolt], ['plan','Plan',IC.plan], ['mock','Mock',IC.mock], ['me','Me',IC.me]];
  $('#tabbar').innerHTML = tb.map(([k,l,ic]) => `<button data-k="${k}" class="${isOn(k)||(k==='home'&&['subject','chapter','cards'].includes(state.view))?'on':''}">${ic}<span>${l}</span></button>`).join('');
  $('#tabbar').querySelectorAll('button').forEach(b => b.onclick = () => navClick(b.dataset.k));
}
function renderTools(){
  if (!D) return;
  const x = xpTotal(), st = streak();
  $('#tools').innerHTML = `<button class="pill fire" data-k="me" title="Study streak">${IC.fire}<span>${st}</span></button><button class="pill xp" data-k="me" title="Your XP">${IC.star}<span>${x} XP</span></button><button class="iconbtn" id="themebtn" aria-label="Switch to ${isDark()?'light':'dark'} theme">${isDark()?IC.sun:IC.moon}</button>`;
  $('#tools').querySelectorAll('[data-k]').forEach(b => b.onclick = () => go('me'));
  $('#themebtn').onclick = () => { S.theme = isDark() ? 'light' : 'dark'; applyTheme(); persist(); renderTools(); };
}
$('#brand').onclick = () => go('home');

/* ---------- views ---------- */
function render(){
  renderNav(); renderTools();
  const v = state.view; const app = $('#app');
  app.className = 'wrap fade' + (state.s && ['subject','chapter','cards','mock'].includes(v) ? ' s-'+state.s : '');
  if (v === 'home') app.innerHTML = viewHome();
  else if (v === 'subject') app.innerHTML = viewSubject(state.s);
  else if (v === 'chapter') app.innerHTML = viewChapter(state.s, state.i, state.tab);
  else if (v === 'cards') app.innerHTML = viewCards(state.s);
  else if (v === 'plan') app.innerHTML = viewPlan();
  else if (v === 'mock') app.innerHTML = viewMock();
  else if (v === 'guide') app.innerHTML = viewGuide();
  else if (v === 'daily') app.innerHTML = viewDaily();
  else if (v === 'me') app.innerHTML = viewMe();
  else if (v === 'search') app.innerHTML = viewSearch(state.q);
  bind();
}

function taskHtml(t, di, k){
  const id = 'p'+di+'-'+k; const done = !!S.plan[id];
  const link = t.chs && t.chs.length ? ` <button class="btn small ghost" data-open="${t.s}:${t.chs[0]}">Open</button>` : (t.kind === 'mock' ? ` <button class="btn small ghost" data-mock="${t.s}">Start</button>` : '');
  return `<div class="task"><input type="checkbox" id="${id}" data-plan="${id}" ${done?'checked':''} aria-label="Mark done"><div style="flex:1;min-width:0"><span class="tag s-${t.s}">${SUBJ[t.s].name}</span> <label for="${id}">${esc(t.label)}</label>${link}</div></div>`;
}

const QUOTES = [
  'Small steps every day add up to a centum.',
  'Write it once, remember it twice.',
  'You don’t have to be perfect. You have to be consistent.',
  'One chapter today is one less worry tomorrow.',
  'Practice the paper before the paper tests you.',
  'Every topper started as a beginner.',
  'Mistakes in practice are marks saved in the exam.'
];

function viewHome(){
  const ti = todayIndex();
  let today = '';
  if (ti === null) {
    today = `<div class="plain today"><div class="eyebrow">Your 60 days</div><h3 style="margin:6px 0 8px">Start the countdown</h3><p class="muted" style="margin-top:0">Pick the day you begin. Each day you get a short to-do list, from learning every chapter to full mock papers.</p><div class="row"><button class="btn blue" data-start="1">Start today</button><button class="btn ghost" data-go="plan">See the full plan</button></div></div>`;
  } else {
    const idx = Math.min(Math.max(ti,1),60); const day = PLAN[idx-1];
    const label = ti > 60 ? 'Plan complete – keep revising' : ti < 1 ? 'Starts soon' : 'Today is day';
    today = `<div class="plain today"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">${label}</div><div class="daynum">${ti>60?60:Math.max(ti,1)}<span style="font-size:20px;color:var(--ink-soft)"> / 60</span></div></div><div class="eyebrow phase-${day.phase}">${({learn:'Learn',test:'Weekly test',rev:'Revision',mock:'Mock exam'})[day.phase]}</div></div>
      <div style="margin-top:8px">${day.items.map((t,k) => taskHtml(t,idx-1,k)).join('')}</div>
      <div class="row" style="margin-top:10px"><button class="btn small ghost" data-go="plan">Full plan</button></div></div>`;
  }
  const dd = S.daily[todayStr()];
  const challenge = `<div class="challenge"><span class="sticker">${dd?'done ✓':'+40 XP'}</span><div class="eyebrow" style="color:inherit;opacity:.7">Daily challenge</div><h3>${dd?`You scored ${dd.score} / ${dd.total} today`:'10 questions. 5 minutes.'}</h3><p>${dd?'Come back tomorrow for a fresh set, or try today’s again.':'Mixed 1-mark questions from all four subjects. A new set every day.'}</p><button class="btn" data-go="daily">${IC.bolt} ${dd?'Try again':'Take today’s challenge'}</button></div>`;
  const cards = ORDER.map(s => { const p = Math.round(subjProgress(s)*100); const n = D[s].length;
    return `<button class="subj s-${s}" data-subj="${s}"><div class="top2"><span class="ico">${IC[s]}</span><span class="ring" style="--p:${p}"><span>${p}%</span></span></div><span class="code">${SUBJ[s].code} · ${SUBJ[s].tag}</span><h3>${SUBJ[s].name}</h3><span class="stat">${n} ${s==='acc'?'units':'chapters'} · ${D[s].reduce((a,c)=>a+c.mcq.length,0)} MCQs</span></button>`; }).join('');
  const totals = ORDER.reduce((a,s) => { for (const c of D[s]) { a.mcq += c.mcq.length; a.qa += c.q2.length+c.q3.length+c.q5.length; a.ex += c.examples.length+c.problems.length; a.t += c.terms.length; } return a; }, {mcq:0,qa:0,ex:0,t:0});
  const x = xpTotal(), lv = levelOf(x), st = streak(), nb = BADGES.filter(b => b.test()).length;
  const q = QUOTES[new Date().getDate() % QUOTES.length];
  const hi = S.name ? `Hi ${esc(S.name)}! Ready for today?` : `Hi there! What’s your name? <input id="nameIn" maxlength="24" placeholder="Type & press Enter" aria-label="Your name">`;
  return `
  <div class="hero">
    <div class="sheet">
      <div class="hi">${hi}</div>
      <div class="eyebrow" style="margin-top:10px">Tamil Nadu State Board · Class 12 · Commerce with Business Maths</div>
      <h1 style="margin:10px 0 12px">From zero to <em>centum</em> in 60 days.</h1>
      <p>Every chapter of your four textbooks, explained simply and turned into practice: notes, flashcards, book-back 1-mark questions with the official key, 2/3/5-mark answers written from the textbook, solved problems and full mock papers in the public exam pattern.</p>
      <p class="note">“${q}” — Your teacher</p>
      <div class="row" style="margin-top:6px"><span class="chip">${totals.mcq} one-mark questions</span><span class="chip">${totals.qa} written answers</span><span class="chip">${totals.ex} problems</span><span class="chip">${totals.t} flashcards</span></div>
    </div>
    <div class="stack">${challenge}${today}</div>
  </div>
  <div class="strip">
    <button class="stile" data-go="me"><span class="l">Level ${lv.i+1}</span><span class="v">${lv.name}</span><div class="lvlbar"><i style="width:${Math.round(lv.pct*100)}%"></i></div></button>
    <button class="stile" data-go="me"><span class="l">Total XP</span><span class="v" style="color:var(--blue)">${x}</span><span class="stat">${lv.hi?(lv.hi-x)+' XP to next level':'Top level reached'}</span></button>
    <button class="stile" data-go="me"><span class="l">Study streak</span><span class="v" style="color:var(--red)">${st} day${st===1?'':'s'}</span><span class="stat">${st?'Keep it going today':'Do one task to start'}</span></button>
    <button class="stile" data-go="me"><span class="l">Badges</span><span class="v" style="color:var(--amber)">${nb} / ${BADGES.length}</span><span class="stat">See what’s next</span></button>
  </div>
  <section><h2>Pick a subject</h2><div class="grid4">${cards}</div></section>
  <section class="two">
    <div class="plain"><h2 style="font-size:22px;margin-bottom:10px">How to study each chapter</h2>
      <ol class="steps">
        <li><b>Learn</b> – read the notes and key terms. Mark the chapter as read.</li>
        <li><b>Flashcards</b> – flip the key terms until you know every card.</li>
        <li><b>1-Mark</b> – attempt every MCQ. Aim for full marks before moving on.</li>
        <li><b>Q&amp;A</b> – read each answer, close it, write it in your notebook, then tick “I can write this”.</li>
        <li><b>Practice</b> – for Accountancy and Business Maths, solve the problems and check the book answers.</li>
      </ol></div>
    <div class="plain"><h2 style="font-size:22px;margin-bottom:8px">Public exam pattern (90 marks, 3 hours)</h2>
      <div class="tbl"><table><thead><tr><th>Part</th><th>Questions</th><th class="num">Marks</th></tr></thead><tbody>
      <tr><td>I</td><td>20 multiple choice (all compulsory)</td><td class="num">20 × 1 = 20</td></tr>
      <tr><td>II</td><td>Answer 7 of 10 (one compulsory)</td><td class="num">7 × 2 = 14</td></tr>
      <tr><td>III</td><td>Answer 7 of 10 (one compulsory)</td><td class="num">7 × 3 = 21</td></tr>
      <tr><td>IV</td><td>7 questions with either/or choice</td><td class="num">7 × 5 = 35</td></tr>
      <tr><th colspan="2">Theory exam + 10 internal = 100</th><th class="num">90</th></tr></tbody></table></div>
      <p class="muted" style="font-size:14px;margin:6px 0 0">Mock papers on this site follow this structure.</p></div>
  </section>
  <p class="foot">Answers for Commerce and Economics are taken from the Tamil Nadu textbooks (2024 edition). Questions marked <span class="badge extra">EXTRA</span> are teacher-added practice; <span class="badge book">BOOK</span> questions are from the book-back exercises. Where the book's answer key contains an error, a red teacher's note explains it. Your progress, XP and badges are saved in this browser only.</p>`;
}

function viewSubject(s){
  const ch = D[s]; const p = Math.round(subjProgress(s)*100);
  const nt = ch.reduce((a,c)=>a+c.terms.length,0);
  const rows = ch.map((c,i) => { const pr = chProgress(s,i);
    const chips = [pr.read ? '<span class="chip ok">Read</span>' : '<span class="chip">Not read</span>'];
    if (c.mcq.length) chips.push(`<span class="chip ${pr.best&&pr.best.best===pr.best.total?'ok':''}">1-mark ${pr.best?pr.best.best+'/'+pr.best.total:'–/'+c.mcq.length}</span>`);
    if (pr.qa) chips.push(`<span class="chip ${pr.learned===pr.qa?'ok':''}">Q&amp;A ${pr.learned}/${pr.qa}</span>`);
    if (pr.pr) chips.push(`<span class="chip ${pr.solved===pr.pr?'ok':''}">Solved ${pr.solved}/${pr.pr}</span>`);
    return `<button class="ch" data-open="${s}:${i}"><span class="n ${pr.pct>=1?'done':''}">${pr.pct>=1?'✓':i+1}</span><span style="min-width:0"><h3>${esc(c.title)}</h3><span class="u">${esc(c.unit)}</span></span><span class="chips">${chips.join('')}</span></button>`; }).join('');
  return `<div class="crumb"><button data-go="home">Home</button> / <span>${SUBJ[s].name}</span></div>
  <div class="shead"><div style="min-width:0"><div class="eyebrow" style="color:var(--sc)">${SUBJ[s].code} · ${SUBJ[s].tag}</div><h1 style="margin:6px 0">${SUBJ[s].name}</h1><p style="margin:0 0 12px;max-width:70ch">${SUBJ[s].blurb}</p>
    <div class="row"><button class="btn sc small" data-mock="${s}">${IC.mock} Take a mock test</button>${nt?`<button class="btn ghost small" data-cards="${s}">${IC.cards} ${nt} flashcards</button>`:''}</div></div>
    <span class="ring" style="--p:${p}"><span>${p}%</span></span></div>
  <div class="chlist">${rows}</div>`;
}

function tabsFor(c){
  const t = [['learn','Learn',null]];
  if (c.terms.length) t.push(['cards','Flashcards',c.terms.length]);
  if (c.formulas.length) t.push(['formulas','Formulas',null]);
  if (c.mcq.length) t.push(['mcq','1-Mark',c.mcq.length]);
  const qa = c.q2.length+c.q3.length+c.q5.length; if (qa) t.push(['qa','2/3/5 Marks',qa]);
  if (c.examples.length) t.push(['examples','Solved Examples',c.examples.length]);
  if (c.problems.length) t.push(['practice','Practice',c.problems.length]);
  if (c.tips.length) t.push(['tips','Teacher Tips',null]);
  return t;
}
function viewChapter(s, i, tab){
  const c = D[s][i]; const id = s+'-'+i; const tabs = tabsFor(c); if (!tabs.find(t => t[0] === tab)) tab = 'learn';
  let body = '';
  if (tab === 'learn') {
    body = `<div class="sheet"><p class="intro">${inline(c.intro)}</p><div class="notes">${c.notes.map(n => (n.h?`<h3>${inline(n.h)}</h3>`:'') + ptsBlock(n.pts,false)).join('')}</div>
    ${c.terms.length?`<h3 style="font-size:20px;color:var(--sc);margin:22px 0 4px">Key terms</h3><div class="terms">${c.terms.map(([t,m]) => `<div>${inline(t)}</div><div>${inline(m)}</div>`).join('')}</div>`:''}
    <div class="row" style="margin-top:18px"><button class="btn ${S.read[id]?'ghost':'sc'}" data-read="${id}">${S.read[id]?'Marked as read ✓':'Mark notes as read · +20 XP'}</button>${c.terms.length?`<button class="btn ghost" data-tab="cards">Next: flashcards</button>`:c.mcq.length?`<button class="btn ghost" data-tab="mcq">Next: 1-mark practice</button>`:''}</div></div>`;
  } else if (tab === 'cards') {
    body = cardsBlock(id, c.terms.map((t,k) => ({id:id+'-t'+k, t:t[0], m:t[1]})));
  } else if (tab === 'formulas') {
    body = `<div class="plain">${c.formulas.map(f => `<div class="fsec">${f.h?`<h3>${inline(f.h)}</h3>`:''}${ptsBlock(f.pts,true)}</div>`).join('')}</div>`;
  } else if (tab === 'mcq') {
    body = mcqBlock(c.mcq, id, true);
  } else if (tab === 'qa') {
    const f = state.f || 'all';
    const items = [];
    for (const [k,m] of [['q2',2],['q3',3],['q5',5]]) c[k].forEach((x,j) => items.push({x, m, key:id+'-'+k+'-'+j}));
    const shown = items.filter(o => f==='all' || (f==='book'&&o.x.b) || (f==='extra'&&!o.x.b) || String(o.m)===f || (f==='todo'&&!S.learn[o.key]));
    const fb = [['all','All'],['2','2 marks'],['3','3 marks'],['5','5 marks'],['book','Book-back'],['extra','Extra'],['todo','Not yet learned']].filter(([k]) => ['all','book','extra','todo'].includes(k) || items.some(o => String(o.m)===k));
    body = `<div class="filters">${fb.map(([k,l]) => `<button data-f="${k}" class="${f===k?'on':''}">${l}</button>`).join('')}<button data-showall="1">Show all answers</button></div>` +
      (shown.length ? shown.map((o,n) => `<div class="item"><div class="qh"><span class="qn">${n+1}.</span><span class="qt">${inline(o.x.q)}</span><span class="badge m">${o.m} M</span><span class="badge ${o.x.b?'book':'extra'}">${o.x.b?'BOOK':'EXTRA'}</span></div>
      <div class="ans" hidden id="a-${o.key}">${fmt(o.x.a)}</div>
      <div class="itembar"><button class="btn small ghost" data-reveal="a-${o.key}">Show answer</button><label><input type="checkbox" data-learn="${o.key}" ${S.learn[o.key]?'checked':''}> I can write this</label></div></div>`).join('') : '<p class="muted">Nothing here. Try another filter.</p>');
  } else if (tab === 'examples') {
    body = c.examples.map((e,n) => `<div class="item"><div class="qh"><span class="qn">${n+1}.</span><span class="qt">${fmt(e.q)}</span></div><div class="ans" hidden id="e-${id}-${n}">${fmt(e.s)}</div><div class="itembar"><button class="btn small ghost" data-reveal="e-${id}-${n}">Show solution</button></div></div>`).join('');
  } else if (tab === 'practice') {
    body = `<p class="muted" style="margin-top:0">Solve each problem in your notebook first, then check the answer.</p>` + c.problems.map((e,n) => { const k = id+'-p-'+n; return `<div class="item"><div class="qh"><span class="qn">${n+1}.</span><span class="qt" style="font-weight:400">${fmt(e.q)}</span></div><div class="ans" hidden id="pa-${k}"><p><b>Answer:</b> ${inline(e.s)}</p></div><div class="itembar"><button class="btn small ghost" data-reveal="pa-${k}">Show answer</button><label><input type="checkbox" data-solved="${k}" ${S.solved[k]?'checked':''}> Solved</label></div></div>`; }).join('');
  } else if (tab === 'tips') {
    body = `<div class="sheet"><div class="tips">${c.tips.map(t => `<div>${inline(t)}</div>`).join('')}</div></div>`;
  }
  const prev = i > 0 ? `<button class="btn small ghost" data-open="${s}:${i-1}">← ${i}. ${esc(D[s][i-1].title)}</button>` : '';
  const next = i < D[s].length-1 ? `<button class="btn small ghost" data-open="${s}:${i+1}">${i+2}. ${esc(D[s][i+1].title)} →</button>` : '';
  return `<div class="crumb"><button data-go="home">Home</button> / <button data-subj="${s}">${SUBJ[s].name}</button> / <span>${s==='acc'?'Unit':'Chapter'} ${i+1}</span></div>
  <div class="eyebrow" style="color:var(--sc)">${esc(c.unit)}</div><h1 style="font-size:clamp(26px,4vw,38px);margin:4px 0 0">${i+1}. ${esc(c.title)}</h1>
  <div class="tabs" role="tablist">${tabs.map(([k,l,n]) => `<button role="tab" data-tab="${k}" class="${k===tab?'on':''}">${l}${n?`<span class="c">${n}</span>`:''}</button>`).join('')}</div>
  ${body}
  <div class="row" style="justify-content:space-between;margin-top:22px">${prev}<span></span>${next}</div>`;
}

/* ---------- flashcards ---------- */
let FC = null;
function cardsBlock(key, all){
  if (!FC || FC.key !== key) FC = {key, all, order:all.map((_,k)=>k), idx:0, flip:false, only:false};
  const list = FC.order.map(k => FC.all[k]).filter(c => !FC.only || !S.cards[c.id]);
  const known = FC.all.filter(c => S.cards[c.id]).length;
  if (!list.length) return `<div class="plain" style="text-align:center"><h2 style="font-size:24px">You know all ${FC.all.length} cards!</h2><p class="muted">Great memory. Show every card again to keep them fresh.</p><button class="btn blue" data-fc="all">Show all cards</button></div>`;
  if (FC.idx >= list.length) FC.idx = 0;
  const c = list[FC.idx];
  return `<div class="fc-wrap">
    <div class="row" style="justify-content:center"><span class="stat">Card ${FC.idx+1} of ${list.length}</span><span class="chip ok">${known} / ${FC.all.length} known</span></div>
    <div class="bar" style="width:min(520px,100%)"><i style="width:${Math.round(known/FC.all.length*100)}%;background:var(--green)"></i></div>
    <button class="fc ${FC.flip?'flip':''}" id="fcard" aria-label="Flip card"><div class="fc-in">
      <div class="fc-face fc-front"><b>${inline(c.t)}</b>${c.src?`<span class="fc-src">${esc(c.src)}</span>`:''}<span class="fc-hint">Tap to flip</span></div>
      <div class="fc-face fc-back"><div>${inline(c.m)}</div>${S.cards[c.id]?'<span class="fc-hint" style="color:var(--green)">You know this one</span>':''}</div>
    </div></button>
    <div class="row" style="justify-content:center">
      <button class="btn ghost" data-fc="prev" aria-label="Previous card">←</button>
      <button class="btn ghost" data-fc="again">Still learning</button>
      <button class="btn" style="background:var(--green);border-color:var(--green)" data-fc="got">Got it ✓</button>
      <button class="btn ghost" data-fc="next" aria-label="Next card">→</button>
    </div>
    <div class="row" style="justify-content:center"><button class="btn small ghost" data-fc="shuffle">Shuffle</button><button class="btn small ghost" data-fc="only">${FC.only?'Show all cards':'Only cards I don’t know'}</button></div>
    <p class="stat" style="margin:0">Keyboard: Space flips, ← → move between cards.</p>
  </div>`;
}
function fcAction(a){
  const list = FC.order.map(k => FC.all[k]).filter(c => !FC.only || !S.cards[c.id]);
  const c = list[FC.idx];
  if (a === 'flip') { FC.flip = !FC.flip; const el = $('#fcard'); if (el) el.classList.toggle('flip', FC.flip); return; }
  if (a === 'next') { FC.idx = (FC.idx+1) % list.length; FC.flip = false; }
  if (a === 'prev') { FC.idx = (FC.idx-1+list.length) % list.length; FC.flip = false; }
  if (a === 'got' && c) { S.cards[c.id] = 1; save(); FC.flip = false; if (!FC.only) FC.idx = (FC.idx+1) % list.length; }
  if (a === 'again' && c) { delete S.cards[c.id]; save(true); FC.flip = false; FC.idx = (FC.idx+1) % list.length; }
  if (a === 'shuffle') { FC.order = shuffle(FC.order); FC.idx = 0; FC.flip = false; }
  if (a === 'only') { FC.only = !FC.only; FC.idx = 0; FC.flip = false; }
  if (a === 'all') { FC.only = false; FC.idx = 0; }
  render();
}
function viewCards(s){
  const all = D[s].flatMap((c,i) => c.terms.map((t,k) => ({id:s+'-'+i+'-t'+k, t:t[0], m:t[1], src:chWord(s)+' '+(i+1)+' · '+c.title})));
  return `<div class="crumb"><button data-go="home">Home</button> / <button data-subj="${s}">${SUBJ[s].name}</button> / <span>Flashcards</span></div>
  <h1 style="font-size:clamp(26px,4vw,38px);margin:4px 0 14px">${SUBJ[s].name} flashcards</h1>${cardsBlock('subj-'+s, all)}`;
}

/* ---------- MCQ block: chapter practice, daily challenge, mock tests ---------- */
let MQ = {};
function mcqBlock(list, id, trackBest){
  MQ[id] = {list, answers:{}, trackBest};
  return `<div class="scorebar"><span class="big" id="sc-${id}">0 / ${list.length}</span><span class="stat" id="sd-${id}">answered 0</span><span style="flex:1"></span>${trackBest&&S.mcq[id]?`<span class="stat">Best: ${S.mcq[id].best}/${S.mcq[id].total}</span>`:''}<button class="btn small ghost" data-mreset="${id}">Reset</button></div>` +
  list.map((m,n) => `<div class="item" id="m-${id}-${n}"><div class="qh"><span class="qn">${n+1}.</span><span class="qt">${inline(m.q)}</span>${m.b!==undefined?`<span class="badge ${m.b?'book':'extra'}">${m.b?'BOOK':'EXTRA'}</span>`:''}</div>
  <div class="opts">${m.o.map((o,k) => `<button class="opt" data-mq="${id}|${n}|${k}"><b>${'abcd'[k]})</b><span>${inline(o)}</span></button>`).join('')}</div><div class="fb" id="fb-${id}-${n}"></div></div>`).join('');
}
function answerMcq(id, n, k){
  const st = MQ[id]; if (!st || st.answers[n] !== undefined) return;
  const m = st.list[n]; st.answers[n] = k;
  const box = document.getElementById(`m-${id}-${n}`);
  box.querySelectorAll('.opt').forEach((b,j) => { b.disabled = true; if (j === m.a) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
  const ok = k === m.a;
  document.getElementById(`fb-${id}-${n}`).innerHTML = (ok ? `<span style="color:var(--green);font-weight:700">Correct!</span>` : `<span style="color:var(--red);font-weight:700">Not quite.</span> Correct answer: <b>${'abcd'[m.a]}) ${inline(m.o[m.a])}</b>`) + (m.note ? `<div class="tnote">Teacher's note: ${inline(m.note)}</div>` : '') + (m.src ? `<div class="stat">From: ${esc(m.src)}</div>` : '');
  const vals = Object.entries(st.answers); const score = vals.filter(([q,a]) => st.list[q].a === a).length;
  const sc = document.getElementById('sc-'+id); if (sc) sc.textContent = score+' / '+st.list.length;
  const sd = document.getElementById('sd-'+id); if (sd) sd.textContent = 'answered '+vals.length;
  if (vals.length === st.list.length) {
    if (st.trackBest) { const prev = S.mcq[id]; if (!prev || score > prev.best) { S.mcq[id] = {best:score, total:st.list.length}; save(); } }
    if (score === st.list.length && id !== 'mock') confetti();
  }
  if (st.onChange) st.onChange(score, vals.length);
}

/* ---------- daily challenge ---------- */
function dailySet(){
  const day = todayStr(); const rnd = seeded('centum-'+day);
  const take = {com:3, eco:3, acc:2, bm:2};
  const out = [];
  for (const s of ORDER) {
    const pool = D[s].flatMap((c,i) => c.mcq.map(m => Object.assign({}, m, {src:SUBJ[s].name+' · '+chWord(s)+' '+(i+1)+' '+c.title})));
    out.push(...shuffle(pool, rnd).slice(0, take[s]));
  }
  return shuffle(out, rnd);
}
function viewDaily(){
  const day = todayStr(); const dd = S.daily[day];
  const recent = Object.keys(S.daily).sort().slice(-7).reverse();
  return `<div class="crumb"><button data-go="home">Home</button> / <span>Daily Challenge</span></div>
  <div class="challenge" style="margin-bottom:16px"><span class="sticker">${new Date().toLocaleDateString(undefined,{day:'numeric',month:'short'})}</span><div class="eyebrow" style="color:inherit;opacity:.7">Daily challenge</div><h3 style="font-size:clamp(24px,4vw,32px)">10 mixed 1-mark questions</h3><p>3 Commerce, 3 Economics, 2 Accountancy, 2 Business Maths. Everyone gets the same set today, so you can compare scores with friends. Finishing earns 10 XP plus 3 XP for every right answer.</p>
  ${dd?`<p style="opacity:1"><b>Your best today: ${dd.score} / ${dd.total}</b></p>`:''}${recent.length?`<p style="font-size:14px">Recent: ${recent.map(d => `${d.slice(5)} → ${S.daily[d].score}/10`).join(' · ')}</p>`:''}</div>
  ${mcqBlock(dailySet(), 'daily', false)}`;
}

/* ---------- plan ---------- */
function viewPlan(){
  const ti = todayIndex();
  const done = PLAN.filter((d,di) => d.items.every((_,k) => S.plan['p'+di+'-'+k])).length;
  return `<div class="crumb"><button data-go="home">Home</button> / <span>60-Day Plan</span></div>
  <div class="plain" style="margin-bottom:16px"><h1 style="font-size:34px;margin-bottom:6px">Your 60-day plan</h1>
  <p style="max-width:72ch;margin:0 0 10px">Days 1–42: learn every chapter, two subjects a day, with a weekly test every 7th day. Days 43–50: full revision. Days 51–60: timed mock papers and fixing weak chapters. Study about 6 hours a day: 2 hours per session plus written practice. Every task you tick earns 10 XP.</p>
  <div class="bar" style="margin-bottom:10px"><i style="width:${Math.round(done/60*100)}%;background:var(--blue)"></i></div>
  <div class="row"><span class="stat">${done} of 60 days complete</span>${S.start?`<span class="stat">Started ${esc(S.start)}</span><button class="btn small ghost" data-reset-start="1">Change start date</button>`:`<button class="btn small blue" data-start="1">Start today</button>`}</div></div>
  <div class="row" style="margin-bottom:10px;gap:14px;font-size:13.5px"><span class="phase-learn"><b>■</b> Learn</span><span class="phase-test"><b>■</b> Weekly test</span><span class="phase-rev"><b>■</b> Revision</span><span class="phase-mock"><b>■</b> Mock exam</span></div>
  <div class="weeks">${PLAN.map((d,di) => { const all = d.items.every((_,k) => S.plan['p'+di+'-'+k]);
    return `<div class="day ${all?'done':''} ${ti===d.d?'now':''}"><div class="dh"><b>Day ${d.d}</b><span class="ph phase-${d.phase}">${({learn:'Learn',test:'Test',rev:'Revise',mock:'Mock'})[d.phase]}</span></div>${d.items.map((t,k) => taskHtml(t,di,k)).join('')}</div>`; }).join('')}</div>`;
}

/* ---------- mock test ---------- */
let MOCK = null;
function pick(arr, n){ return shuffle(arr).slice(0, n); }
function genMock(s){
  const ch = D[s]; const all = k => ch.flatMap((c,i) => c[k].map(x => Object.assign({}, x, {src:chWord(s)+' '+(i+1)+' '+c.title, ci:i})));
  const mcqBook = all('mcq').filter(m => m.b); const mcqAll = all('mcq');
  const mcq = pick(mcqBook.length >= 20 ? mcqBook : mcqAll, 20);
  const q2 = all('q2'), q3 = all('q3'), q5 = all('q5');
  const probs = ch.flatMap((c,i) => c.problems.map(x => ({q:x.q, a:'**Answer:** '+x.s, src:chWord(s)+' '+(i+1)+' '+c.title})));
  const exs = ch.flatMap((c,i) => c.examples.map(x => ({q:x.q, a:x.s, src:chWord(s)+' '+(i+1)+' '+c.title})));
  let p2, p3, p4;
  if (s === 'com' || s === 'eco') {
    p2 = pick(q2,10); p3 = pick(q3,10);
    const five = pick(q5.length >= 14 ? q5 : q5.concat(q3), 14); p4 = []; for (let k=0;k<7;k++) p4.push([five[2*k], five[2*k+1]]);
  } else {
    p2 = pick(q2.concat(pick(probs,6)),10); p3 = pick(q3.concat(pick(probs,8)),10);
    const big = pick(exs.concat(q5).concat(pick(probs,10)),14); p4 = []; for (let k=0;k<7;k++) p4.push([big[2*k], big[2*k+1]]);
  }
  return {s, mcq, p2, p3, p4, marks:{}, elapsed:0, running:false};
}
function viewMock(){
  const s = state.s;
  if (!s) {
    return `<div class="crumb"><button data-go="home">Home</button> / <span>Mock Test</span></div>
    <div class="plain"><h1 style="font-size:34px;margin-bottom:6px">Mock test</h1><p style="max-width:70ch">Each paper is built fresh from the question bank in the public exam pattern: 20 one-mark questions (auto-marked) and Parts II, III and IV with model answers. Write your answers on paper with the timer running, then reveal each answer and award yourself marks honestly. Saving a score earns 30 XP.</p>
    <div class="grid4" style="margin-top:12px">${ORDER.map(x => `<button class="subj s-${x}" data-mock="${x}"><div class="top2"><span class="ico">${IC[x]}</span></div><span class="code">${SUBJ[x].code}</span><h3>${SUBJ[x].name}</h3><span class="stat">${(S.mocks[x]||[]).length?'Last score: '+S.mocks[x][S.mocks[x].length-1].score+' / 90':'No mock taken yet'}</span></button>`).join('')}</div></div>`;
  }
  if (!MOCK || MOCK.s !== s) MOCK = genMock(s);
  const M = MOCK; const L = (q,key,marks) => `<div class="item"><div class="qh"><span class="qt">${fmt(q.q)}</span></div>${q.src?`<div class="stat">${esc(q.src)}</div>`:''}<div class="ans" hidden id="mk-${key}">${fmt(q.a)}</div><div class="itembar"><button class="btn small ghost" data-reveal="mk-${key}">Show model answer</button><label>My marks <select data-mark="${key}" data-max="${marks}">${Array.from({length:marks*2+1},(_,k)=>k/2).map(v => `<option value="${v}" ${M.marks[key]==v?'selected':''}>${v}</option>`).join('')}</select> / ${marks}</label></div></div>`;
  let n = 21;
  const hist = (S.mocks[s]||[]).slice(-5).map(r => `${r.score}`).join(', ');
  return `<div class="crumb"><button data-go="home">Home</button> / <button data-go="mock">Mock Test</button> / <span>${SUBJ[s].name}</span></div>
  <div class="scorebar"><span class="timer" id="timer">${fmtTime(M.elapsed)}</span><button class="btn small blue" data-timer="1">${M.running?'Pause':'Start 3-hour timer'}</button><span style="flex:1"></span><span class="big" id="mscore">${mockScore()} / 90</span><button class="btn small ghost" data-savemock="1">Save score</button><button class="btn small ghost" data-newmock="${s}">New paper</button></div>
  <div class="paper">
    <div class="eyebrow">Higher Secondary Second Year · Model paper · Time 3 hrs · Max marks 90</div>
    <h2 style="font-size:28px;margin:6px 0 4px">${SUBJ[s].name}</h2>${hist?`<p class="stat">Your recent scores: ${hist}</p>`:''}
    <h3>Part I</h3><div class="pi">Choose the correct answer. 20 × 1 = 20</div>
    ${mcqBlock(M.mcq,'mock',false).replace(/<div class="scorebar">[\s\S]*?<\/div>/,'')}
    <h3>Part II</h3><div class="pi">Answer any seven questions. Question 30 is compulsory. 7 × 2 = 14</div>
    ${M.p2.map((q,k) => `<div><b class="qn">${n++}.</b>${L(q,'p2-'+k,2)}</div>`).join('')}
    <h3>Part III</h3><div class="pi">Answer any seven questions. Question 40 is compulsory. 7 × 3 = 21</div>
    ${M.p3.map((q,k) => `<div><b class="qn">${n++}.</b>${L(q,'p3-'+k,3)}</div>`).join('')}
    <h3>Part IV</h3><div class="pi">Answer all the questions. Each has an either/or choice. 7 × 5 = 35</div>
    ${M.p4.map((pair,k) => `<div class="either"><b class="qn">${n++}. (a)</b>${L(pair[0],'p4-'+k+'a',5)}<div class="or">OR (b)</div>${pair[1]?L(pair[1],'p4-'+k+'b',5):''}</div>`).join('')}
  </div>
  <p class="muted" style="font-size:14px;margin-top:12px">Scoring: Part I is auto-marked. For Parts II–IV, the total counts your best 7 in Parts II and III and the higher of (a)/(b) in Part IV.</p>`;
}
function mockScore(){
  if (!MOCK) return 0;
  const st = MQ['mock']; let p1 = 0; if (st) p1 = Object.entries(st.answers).filter(([q,a]) => st.list[q].a === a).length;
  const v = k => +(MOCK.marks[k] || 0);
  const best7 = (pre,n) => Array.from({length:n},(_,k) => v(pre+k)).sort((a,b) => b-a).slice(0,7).reduce((a,b) => a+b, 0);
  let p4 = 0; for (let k=0;k<7;k++) p4 += Math.max(v('p4-'+k+'a'), v('p4-'+k+'b'));
  return p1 + best7('p2-',10) + best7('p3-',10) + p4;
}
function fmtTime(sec){ const h = Math.floor(sec/3600), m = Math.floor(sec%3600/60), s = Math.floor(sec%60); return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
let tick = null;
function toggleTimer(){
  if (!MOCK) return; MOCK.running = !MOCK.running;
  if (MOCK.running) { MOCK.t0 = Date.now()-MOCK.elapsed*1000; tick = setInterval(() => { MOCK.elapsed = (Date.now()-MOCK.t0)/1000; const t = $('#timer'); if (t) t.textContent = fmtTime(MOCK.elapsed); if (MOCK.elapsed >= 10800) { clearInterval(tick); MOCK.running = false; if (t) t.textContent = 'Time up – 3:00:00'; } }, 1000); }
  else clearInterval(tick);
  const b = document.querySelector('[data-timer]'); if (b) b.textContent = MOCK.running ? 'Pause' : 'Resume timer';
}

/* ---------- progress & badges ---------- */
function viewMe(){
  const x = xpTotal(), lv = levelOf(x), st = streak();
  const week = Array.from({length:7}, (_,k) => { const d = new Date(); d.setDate(d.getDate()-6+k); return {l:d.toLocaleDateString(undefined,{weekday:'short'}).slice(0,2), on:!!S.days[dstr(d)]}; });
  const subj = ORDER.map(s => { const p = Math.round(subjProgress(s)*100); return `<div class="s-${s}" style="display:grid;grid-template-columns:130px minmax(0,1fr) 44px;gap:10px;align-items:center"><b style="color:var(--sc)">${SUBJ[s].name}</b><div class="bar"><i style="width:${p}%"></i></div><span class="stat num">${p}%</span></div>`; }).join('');
  const nums = [['Chapters read',cnt(S.read)],['Answers learned',cnt(S.learn)],['Problems solved',cnt(S.solved)],['Perfect quizzes',perfectCount()],['Flashcards known',cnt(S.cards)],['Daily challenges',cnt(S.daily)],['Plan tasks done',cnt(S.plan)],['Mocks saved',Object.values(S.mocks).reduce((a,b)=>a+b.length,0)]];
  return `<div class="crumb"><button data-go="home">Home</button> / <span>My progress</span></div>
  <div class="two">
    <div class="plain"><div class="eyebrow">Level ${lv.i+1}${S.name?' · '+esc(S.name):''}</div><h1 style="font-size:clamp(30px,5vw,42px);margin:4px 0">${lv.name}</h1>
      <div class="lvlbar" style="height:10px"><i style="width:${Math.round(lv.pct*100)}%"></i></div>
      <p class="stat">${x} XP${lv.hi?` · ${lv.hi-x} XP to ${LEVELS[lv.i+1][1]}`:''}</p>
      <div class="levels">${LEVELS.map((l,k) => `<span class="${k===lv.i?'on':''}">${l[1]}</span>`).join('')}</div></div>
    <div class="plain"><div class="eyebrow">Study streak</div><h1 style="font-size:clamp(30px,5vw,42px);margin:4px 0;color:var(--red)">${st} day${st===1?'':'s'}</h1>
      <p class="stat" style="margin:0">Do at least one task a day (read, quiz, tick an answer or a flashcard) to keep your streak.</p>
      <div class="week">${week.map(w => `<div><i class="${w.on?'on':''}">${w.on?IC.fire:''}</i>${w.l}</div>`).join('')}</div></div>
  </div>
  <section><h2>Subjects</h2><div class="plain stack">${subj}</div></section>
  <section><h2>Your numbers</h2><div class="strip" style="margin-top:0">${nums.map(([l,v]) => `<div class="stile" style="cursor:default"><span class="l">${l}</span><span class="v">${v}</span></div>`).join('')}</div></section>
  <section><h2>Badges</h2><div class="badges">${BADGES.map(b => { const got = b.test(); return `<div class="bdg ${got?'got':''}"><span class="medal">${b.mark}</span><b>${b.name}</b><small>${b.desc}</small></div>`; }).join('')}</div></section>
  <section><h2>How you earn XP</h2><div class="plain"><div class="tbl"><table><thead><tr><th>Action</th><th class="num">XP</th></tr></thead><tbody>
    <tr><td>Mark a chapter’s notes as read</td><td class="num">20</td></tr><tr><td>Each right answer in your best chapter quiz score</td><td class="num">2</td></tr>
    <tr><td>Tick “I can write this” or “Solved”</td><td class="num">5</td></tr><tr><td>Know a flashcard</td><td class="num">2</td></tr>
    <tr><td>Tick a 60-day plan task</td><td class="num">10</td></tr><tr><td>Finish the daily challenge</td><td class="num">10 + 3 per right answer</td></tr>
    <tr><td>Save a mock paper score</td><td class="num">30</td></tr></tbody></table></div></div></section>`;
}

/* ---------- exam guide ---------- */
function viewGuide(){
  return `<div class="crumb"><button data-go="home">Home</button> / <span>Exam Guide</span></div>
  <div class="sheet"><div class="eyebrow">From your teacher and success coach</div><h1 style="font-size:34px;margin:6px 0 10px">How centum students write the paper</h1>
  <p class="note">Marks come from clear presentation as much as from knowledge.</p>
  <div class="notes">
  <h3>The 3 hours (plus 15 minutes reading time)</h3>
  <div class="tbl"><table><thead><tr><th>Time</th><th>What to do</th></tr></thead><tbody>
  <tr><td>15 min reading</td><td>Read the whole paper. Tick the 7 questions you will answer in Parts II and III and choose (a) or (b) in Part IV.</td></tr>
  <tr><td>20 min</td><td>Part I – 20 MCQs. Write the option letter and the answer in full, e.g. “(b) Real A/c”.</td></tr>
  <tr><td>30 min</td><td>Part II – 7 × 2 marks. 3–4 lines or one short calculation each. Do the compulsory question first.</td></tr>
  <tr><td>40 min</td><td>Part III – 7 × 3 marks. Points with headings or a short worked problem.</td></tr>
  <tr><td>75 min</td><td>Part IV – 7 × 5 marks. About 10 minutes each.</td></tr>
  <tr><td>15 min</td><td>Revise: question numbers, totals, units (₹, sq. units), underlines.</td></tr></tbody></table></div>
  <h3>Commerce and Economics</h3>
  <ul><li>Write answers in <b>points with bold headings</b>; underline key words with a pencil.</li>
  <li>2 marks = definition + one example. 3 marks = 3 points with a line each. 5 marks = intro + 5–6 headed points + conclusion.</li>
  <li>Add a <b>diagram or flow chart</b> wherever the book has one (circular flow, Keynes' cross, business cycle, channels of distribution).</li>
  <li>Quote the exact names, years and sections: Ragnar Frisch 1933, Keynes 1936, Section 2(34), Consumer Protection Act 2019.</li>
  <li>For “distinguish”, always use a table with a “Basis” column.</li></ul>
  <h3>Accountancy</h3>
  <ul><li>Draw every format with a ruler: Dr/Cr, Particulars, ₹. Show <b>working notes</b> separately – they carry marks.</li>
  <li>Write narrations for journal entries. Write formulas before substituting in ratio and goodwill problems.</li>
  <li>Check: balance sheet totals must agree; capital accounts must balance.</li></ul>
  <h3>Business Maths and Statistics</h3>
  <ul><li>Write the formula, substitute, simplify, box the answer. Never skip “+ c” in indefinite integrals.</li>
  <li>For rank and consistency, state the conclusion in words: “ρ(A) = ρ([A,B]) = 3, consistent with unique solution”.</li>
  <li>For hypothesis tests, always write H₀, H₁, level of significance, test statistic and conclusion.</li>
  <li>Keep the normal table values ready: 1.96, 2.58, 1.645, 2.33.</li></ul>
  <h3>The last 30 days</h3>
  <ul><li>Sleep 7 hours. Study in 50-minute blocks with 10-minute breaks.</li>
  <li>Every evening, take the daily challenge and do 20 one-mark questions from any subject.</li>
  <li>Write at least one full mock paper per subject under the timer before the exam.</li></ul>
  </div></div>`;
}

/* ---------- search ---------- */
function viewSearch(q){
  const t = q.trim().toLowerCase(); if (t.length < 3) return `<p class="muted">Type at least 3 letters.</p>`;
  const res = [];
  for (const s of ORDER) D[s].forEach((c,i) => {
    if (c.title.toLowerCase().includes(t)) res.push({s,i,tab:'learn',kind:'Chapter',text:c.title});
    c.terms.forEach(([a,b]) => { if ((a+' '+b).toLowerCase().includes(t)) res.push({s,i,tab:'learn',kind:'Key term',text:a+' – '+b}); });
    for (const k of ['q2','q3','q5']) c[k].forEach(x => { if (x.q.toLowerCase().includes(t)) res.push({s,i,tab:'qa',kind:k.slice(1)+'-mark question',text:x.q}); });
    c.mcq.forEach(x => { if (x.q.toLowerCase().includes(t)) res.push({s,i,tab:'mcq',kind:'1-mark',text:x.q}); });
    c.notes.forEach(n => n.pts.forEach(p => { if (p.toLowerCase().includes(t)) res.push({s,i,tab:'learn',kind:'Notes',text:p.replace(/\*\*/g,'')}); }));
  });
  const hl = s => esc(s).replace(new RegExp(esc(t).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'), m => '<mark>'+m+'</mark>');
  return `<h1 style="font-size:28px;margin-bottom:10px">Results for “${esc(q)}”</h1><p class="stat">${res.length} found${res.length>80?' – showing the first 80':''}</p><div class="results">${res.slice(0,80).map(r => `<button class="r" data-open="${r.s}:${r.i}:${r.tab}"><small>${SUBJ[r.s].name} · ${chWord(r.s)} ${r.i+1} ${esc(D[r.s][r.i].title)} · ${r.kind}</small><div>${hl(r.text.length>220?r.text.slice(0,220)+'…':r.text)}</div></button>`).join('') || '<p class="muted">No matches. Try a shorter word.</p>'}</div>`;
}
let sTimer = null;
$('#q').addEventListener('input', e => { clearTimeout(sTimer); const v = e.target.value; sTimer = setTimeout(() => { if (!D) return; if (v.trim().length >= 3) { state = {view:'search', q:v}; render(); } else if (state.view === 'search') go('home'); }, 250); });

/* ---------- events ---------- */
function bind(){
  const app = $('#app');
  const on = (sel, ev, fn) => app.querySelectorAll(sel).forEach(b => b[ev] = () => fn(b));
  on('[data-go]','onclick', b => go(b.dataset.go));
  on('[data-subj]','onclick', b => go('subject', {s:b.dataset.subj}));
  on('[data-cards]','onclick', b => go('cards', {s:b.dataset.cards}));
  on('[data-open]','onclick', b => { const [s,i,tab] = b.dataset.open.split(':'); go('chapter', {s, i:+i, tab:tab||'learn'}); });
  on('[data-tab]','onclick', b => go('chapter', {s:state.s, i:state.i, tab:b.dataset.tab}));
  on('[data-f]','onclick', b => { state.f = b.dataset.f; render(); });
  on('[data-showall]','onclick', () => { app.querySelectorAll('.ans').forEach(a => a.hidden = false); app.querySelectorAll('[data-reveal]').forEach(x => x.textContent = x.textContent.replace('Show','Hide')); });
  on('[data-reveal]','onclick', b => { const a = document.getElementById(b.dataset.reveal); a.hidden = !a.hidden; b.textContent = a.hidden ? b.textContent.replace('Hide','Show') : b.textContent.replace('Show','Hide'); });
  on('[data-read]','onclick', b => { const k = b.dataset.read; if (S.read[k]) delete S.read[k]; else S.read[k] = 1; save(); render(); });
  on('[data-learn]','onchange', b => { const k = b.dataset.learn; if (b.checked) S.learn[k] = 1; else delete S.learn[k]; save(!b.checked); });
  on('[data-solved]','onchange', b => { const k = b.dataset.solved; if (b.checked) S.solved[k] = 1; else delete S.solved[k]; save(!b.checked); });
  on('[data-plan]','onchange', b => { const k = b.dataset.plan; if (b.checked) S.plan[k] = 1; else delete S.plan[k]; save(!b.checked); if (state.view === 'plan') render(); });
  on('[data-start]','onclick', () => { S.start = todayStr(); save(); render(); });
  on('[data-reset-start]','onclick', () => { S.start = null; save(true); render(); });
  on('[data-mq]','onclick', b => { const [id,n,k] = b.dataset.mq.split('|'); answerMcq(id, +n, +k); });
  on('[data-mreset]','onclick', () => render());
  on('[data-mock]','onclick', b => { MOCK = null; clearInterval(tick); go('mock', {s:b.dataset.mock}); });
  on('[data-newmock]','onclick', () => { MOCK = null; clearInterval(tick); render(); window.scrollTo(0,0); });
  on('[data-timer]','onclick', toggleTimer);
  on('[data-mark]','onchange', b => { MOCK.marks[b.dataset.mark] = +b.value; const e = $('#mscore'); if (e) e.textContent = mockScore()+' / 90'; });
  on('[data-savemock]','onclick', b => { const s = MOCK.s; (S.mocks[s] = S.mocks[s] || []).push({score:mockScore(), date:todayStr()}); save(); b.textContent = 'Saved ✓'; });
  on('[data-fc]','onclick', b => fcAction(b.dataset.fc));
  const card = $('#fcard'); if (card) card.onclick = () => fcAction('flip');
  const ni = $('#nameIn'); if (ni) ni.onkeydown = e => { if (e.key === 'Enter' && ni.value.trim()) { S.name = ni.value.trim().slice(0,24); persist(); render(); toast('Nice to meet you, ' + S.name + '!'); } };
  if (MQ['mock']) MQ['mock'].onChange = () => { const e = $('#mscore'); if (e) e.textContent = mockScore()+' / 90'; };
  if (MQ['daily'] && state.view === 'daily') MQ['daily'].onChange = (score, answered) => {
    if (answered < MQ['daily'].list.length) return;
    const d = todayStr(); const prev = S.daily[d];
    if (!prev || score > prev.score) { S.daily[d] = {score, total:MQ['daily'].list.length}; save(); }
    else toast('Done! Your best today is still ' + prev.score + ' / 10');
  };
}
document.addEventListener('keydown', e => {
  if (!$('#fcard') || /input|select|textarea/i.test(e.target.tagName)) return;
  if (e.key === ' ' && e.target.tagName === 'BUTTON' && e.target.id !== 'fcard') return;
  if (e.key === ' ') { e.preventDefault(); fcAction('flip'); }
  else if (e.key === 'ArrowRight') fcAction('next');
  else if (e.key === 'ArrowLeft') fcAction('prev');
});

/* ---------- boot ---------- */
fetch('assets/data/content.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    D = data; PLAN = buildPlan();
    if (S.xp0 == null) { BADGES.forEach(b => { if (b.test()) S.seen[b.id] = 1; }); S.xp0 = xpTotal(); persist(); }
    fromHash(); render();
  })
  .catch(() => { $('#app').innerHTML = '<div class="plain" style="margin-top:30px"><h2>The study material didn’t load</h2><p class="muted">Check your internet connection and reload the page. If you opened index.html straight from your computer, run it through a local web server instead (see README).</p></div>'; });
