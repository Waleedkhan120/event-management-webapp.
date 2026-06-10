'use strict';

/* ── Starfield ── */
(function(){
  const c=document.getElementById('starfield');
  if(!c||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const x=c.getContext('2d');let s=[];
  const resize=()=>{c.width=c.offsetWidth;c.height=c.offsetHeight};
  const make=n=>{s=Array.from({length:n},()=>({
    x:Math.random()*c.width,y:Math.random()*c.height,
    r:Math.random()*1.4+.2,a:Math.random(),
    sp:Math.random()*.007+.002,d:Math.random()>.5?1:-1,
    h:[255,200,180][Math.floor(Math.random()*3)]
  }))};
  const draw=()=>{
    x.clearRect(0,0,c.width,c.height);
    for(const t of s){
      t.a+=t.sp*t.d;if(t.a>1||t.a<.08)t.d*=-1;
      x.beginPath();x.arc(t.x,t.y,t.r,0,Math.PI*2);
      x.fillStyle=`rgba(${t.h},${t.h},255,${t.a*.9})`;x.fill();
    }
    requestAnimationFrame(draw);
  };
  window.addEventListener('resize',()=>{resize();make(140)});
  resize();make(140);draw();
})();

/* ── Data & helpers ── */
let events=[
  {id:uid(),name:'Annual Tech Summit',date:'2025-08-15',desc:'A flagship gathering of innovators, engineers, and tech enthusiasts for three days of keynotes, workshops, and networking.'},
  {id:uid(),name:'Design Thinking Workshop',date:'2025-09-22',desc:'An intensive one-day workshop exploring human-centred design methods led by industry veterans from top design studios.'},
  {id:uid(),name:'Startup Pitch Night',date:'2025-10-10',desc:'Ten early-stage startups pitch live to a panel of investors. Open to the public — come network and get inspired.'},
  {id:uid(),name:'AI & Society Conference',date:'2026-07-18',desc:'Exploring the ethical, social, and economic implications of artificial intelligence through panel discussions and research presentations.'},
  {id:uid(),name:'Photography Masterclass',date:'2026-08-03',desc:'Half-day session on composition, lighting, and post-processing with award-winning photographer Amara Reyes.'},
  {id:uid(),name:'Robotics Expo 2026',date:'2026-09-14',desc:'See cutting-edge robotics demonstrations from universities and startups across Asia. Interactive exhibits and live challenges.'}
];

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
const today=()=>new Date().toISOString().slice(0,10);
const isPast=d=>d<today();
const isToday=d=>d===today();
function fmt(s){if(!s)return'';const[y,m,d]=s.split('-');const mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return`${mn[+m-1]} ${+d}, ${y}`}
const sort=a=>[...a].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ── DOM ── */
const $=id=>document.getElementById(id);
const eList=$('eventList'),eCnt=$('eventCount'),eEmpty=$('emptyState'),eNone=$('noResults');
const fWarn=$('formWarning'),wTxt=$('warningText');
const iName=$('eventName'),iDate=$('eventDate'),iDesc=$('eventDesc');
const btnAdd=$('addEventBtn'),btnClr=$('clearFormBtn');
const sIn=$('searchInput'),sClr=$('searchClear');
const stT=$('statTotal'),stU=$('statUpcoming'),stP=$('statPast');

$('footerYear').textContent=new Date().getFullYear();

/* ── Render ── */
let q='';
function render(){
  const sorted=sort(events);
  const fil=q?sorted.filter(e=>e.name.toLowerCase().includes(q)||e.date.includes(q)||fmt(e.date).toLowerCase().includes(q)):sorted;
  eCnt.textContent=events.length;
  const past=events.filter(e=>isPast(e.date)).length;
  stT.textContent=events.length;stU.textContent=events.length-past;stP.textContent=past;
  eEmpty.hidden=events.length>0;
  eNone.hidden=!(events.length>0&&fil.length===0);
  eList.hidden=fil.length===0;
  if(!fil.length){eList.innerHTML='';return}
  eList.innerHTML='';
  fil.forEach((ev,i)=>{
    const p=isPast(ev.date),td=isToday(ev.date);
    const card=document.createElement('article');
    card.className=`event-card ${p?'event-card--past':'event-card--upcoming'}`;
    card.setAttribute('role','listitem');card.dataset.id=ev.id;
    card.style.animationDelay=`${i*55}ms`;
    const sl=td?'Today':p?'Past':'Upcoming';
    const sc=td?'card-status--today':'';
    card.innerHTML=`
      <div class="card-top">
        <h3 class="card-name">${esc(ev.name)}</h3>
        <span class="card-status ${sc}">${sl}</span>
      </div>
      <div class="card-date"><span aria-hidden="true">📅</span><time datetime="${esc(ev.date)}">${fmt(ev.date)}</time></div>
      <p class="card-desc">${esc(ev.desc)}</p>
      <div class="card-divider" aria-hidden="true"></div>
      <button class="btn-delete" data-id="${ev.id}" aria-label="Delete ${esc(ev.name)}">✕ Delete</button>`;
    eList.appendChild(card);
  });
}

/* ── Add ── */
btnAdd.addEventListener('click',()=>{
  const n=iName.value.trim(),d=iDate.value.trim(),dc=iDesc.value.trim();
  if(!n&&!d&&!dc){warn('All fields are required.');iName.focus();return}
  if(!n){warn('Event name is required.');iName.focus();return}
  if(!d){warn('Event date is required.');iDate.focus();return}
  if(!dc){warn('Event description is required.');iDesc.focus();return}
  hideWarn();
  events.push({id:uid(),name:n,date:d,desc:dc});
  iName.value=iDate.value=iDesc.value='';
  render();
  eList.scrollIntoView({behavior:'smooth',block:'start'});
});

/* ── Delete ── */
eList.addEventListener('click',e=>{
  const b=e.target.closest('.btn-delete');if(!b)return;
  const card=b.closest('.event-card');
  card.style.transition='opacity .2s,transform .2s';
  card.style.opacity='0';card.style.transform='scale(.94) translateY(6px)';
  setTimeout(()=>{events=events.filter(ev=>ev.id!==b.dataset.id);render()},210);
});

/* ── Search ── */
sIn.addEventListener('input',()=>{q=sIn.value.toLowerCase();sClr.style.display=q?'flex':'none';render()});
sClr.addEventListener('click',()=>{sIn.value='';q='';sClr.style.display='none';sIn.focus();render()});

/* ── Clear form ── */
btnClr.addEventListener('click',()=>{iName.value=iDate.value=iDesc.value='';hideWarn()});

/* ── Warn ── */
function warn(m){wTxt.textContent=m;fWarn.hidden=false}
function hideWarn(){fWarn.hidden=true}
[iName,iDate,iDesc].forEach(el=>{
  el.addEventListener('input',hideWarn);
  el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();btnAdd.click()}});
});

render();