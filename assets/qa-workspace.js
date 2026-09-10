(()=>{'use strict';
const conditions=[['현상 재현','카메라 분리 · 약 5초 후 복구','라이언크레스트 망루 옥상 + 대형 오크통 + 회피. 해당 조건에서 5/5 재현.'],['정상 관측','카메라 추적 유지','같은 망루 옥상에서 운반물을 밀포대로 바꾸면 정상. 장소만으로 발생하지 않았습니다.'],['정상 관측','카메라 추적 유지','대형 오크통은 유지하고 필드 평지로 장소를 바꾸면 정상. 오브젝트만으로 발생하지 않았습니다.']];
document.querySelectorAll('[data-condition]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-condition]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const row=conditions[Number(button.dataset.condition)];['status','result','detail'].forEach((key,i)=>document.getElementById('observation-'+key).textContent=row[i]);}));
const reports=[...document.querySelectorAll('.report')],links=[...document.querySelectorAll('.report-index a')];
function select(id){if(!reports.some(r=>r.id===id))return;reports.forEach(r=>r.hidden=r.id!==id);links.forEach(a=>{const active=a.hash==='#'+id;a.classList.toggle('selected',active);if(active)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}
document.documentElement.classList.add('enhanced');select(reports.some(r=>r.id===location.hash.slice(1))?location.hash.slice(1):'bug001');
links.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();select(a.hash.slice(1));history.replaceState(null,'',a.hash);const target=document.querySelector(a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});if(matchMedia('(max-width:680px)').matches)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}));
addEventListener('hashchange',()=>select(location.hash.slice(1)));
// Static perspective preserves volume without moving a button under the pointer.
})();
