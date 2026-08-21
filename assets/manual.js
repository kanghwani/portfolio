/* ── 매뉴얼 월드 런타임 (공유) ─────────────────────────────────
   색판 휠 · 리프 알파 해법 · 장 표제 장치 · 포어엣지 탭 레일 · 복사 도장.
   index.html(개발) · design/(기획) · qa/(QA) 세 볼륨이 같은 파일을 읽는다.
   페이지가 정하는 것은 마크업의 data-c / data-title / data-sum 과
   body[data-book](각주 이름)뿐이다. */
(function(){
  "use strict";
  /* 아세테이트(흰 리프)를 색판 위에 합성한 상대 명도가 목표 밴드에 들도록
     알파를 이분 탐색해 --leaf-a로 발행한다. 손으로 고르지 않는다. */
  var WHEEL={1:"#CD6433",2:"#F0C81C",3:"#55A14C",4:"#2B9286",5:"#4058B7",6:"#7C55AE",7:"#976A46"};
  function hex(c){return [1,3,5].map(function(i){return parseInt(c.slice(i,i+2),16)/255})}
  function lum(rgb){
    var l=rgb.map(function(v){return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
    return .2126*l[0]+.7152*l[1]+.0722*l[2];
  }
  function solveAlpha(boardHex){
    var b=hex(boardHex), lo=0, hi=1, a, L;
    for(var i=0;i<24;i++){
      a=(lo+hi)/2;
      L=lum(b.map(function(v){return a*1+(1-a)*v}));
      if(L<.88) lo=a; else hi=a;
    }
    return Math.min(.97,Math.max(.55,a));
  }
  var book=document.body.dataset.book||"사용자 매뉴얼";
  /* 표시 번호는 색판 인덱스와 별개다 — 본문이 §01처럼 스스로 번호를 갖는 볼륨이 있다 */
  function no(s){return s.dataset.no||String(+s.dataset.c).padStart(2,"0")}
  var secs=[].slice.call(document.querySelectorAll(".board"));
  secs.forEach(function(s){
    var c=WHEEL[s.dataset.c];
    s.style.background=c;
    s.style.setProperty("--board-c",c);
    s.style.setProperty("--leaf-a",solveAlpha(c).toFixed(3));
    s.dataset.head=lum(hex(c))>.45?"dark":"light";
    var chap=s.querySelector(".chap");
    if(chap){
      var b=document.createElement("span"); b.className="big";
      b.textContent=no(s);
      chap.insertBefore(b,chap.firstChild);
      if(s.dataset.sum){
        var m=document.createElement("p"); m.className="sum";
        m.textContent=s.dataset.sum; chap.appendChild(m);
      }
      var rf=document.createElement("div"); rf.className="runfoot";
      rf.textContent=book+" · "+no(s)+" "+(s.dataset.title||"");
      s.appendChild(rf);
      var hs=s.querySelectorAll(".leaf h4");
      if(hs.length){
        var toc=document.createElement("ul"); toc.className="toc";
        toc.innerHTML='<span class="tt">이 장의 내용</span>';
        hs.forEach(function(h,j){
          var id=s.id+"-h"+j; h.id=id;
          var li=document.createElement("li");
          var a=document.createElement("a"); a.href="#"+id;
          a.textContent=h.textContent.replace(/^[0-9.]+\s*/,"");
          a.addEventListener("click",function(e){e.preventDefault();h.scrollIntoView();history.replaceState(null,"","#"+id)});
          li.appendChild(a); toc.appendChild(li);
        });
        chap.appendChild(toc);
      }
    }
  });

  /* ── 포어엣지 탭 레일: 높이∝분량, 현재 탭 돌출 ── */
  var rail=document.getElementById("rail");
  if(rail){
    secs.forEach(function(s){
      var a=document.createElement("a");
      a.href="#"+s.id;
      var c=WHEEL[s.dataset.c];
      a.style.setProperty("--tab-c",c);
      a.style.setProperty("--tab-ink",lum(hex(c))>.45?"#191714":"#F6F3EC");
      a.style.setProperty("--ext",Math.max(1,Math.round(s.offsetHeight/600)));
      a.innerHTML='<span class="num">'+no(s)+'</span><span class="lb">'+s.dataset.title+'</span>';
      a.addEventListener("click",function(e){e.preventDefault();s.scrollIntoView();history.replaceState(null,"","#"+s.id)});
      rail.appendChild(a);
    });
    var tabs=[].slice.call(rail.children);
    var markCur=function(){
      var y=window.scrollY+innerHeight*.35, idx=0;
      secs.forEach(function(s,i){if(s.offsetTop<=y)idx=i});
      tabs.forEach(function(t,i){t.classList.toggle("cur",i===idx)});
    };
    addEventListener("scroll",markCur,{passive:true}); markCur();
  }

  /* 메일 주소 복사 — mailto 클라이언트가 없어도 주소는 손에 남게 */
  var stamp=document.createElement("div"); stamp.id="stamp"; document.body.appendChild(stamp);
  var stT;
  document.querySelectorAll("[data-copy]").forEach(function(a){
    a.addEventListener("click",function(){
      var v=a.dataset.copy;
      (navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).catch(function(){});
      stamp.textContent=v+" — 복사되었습니다";
      stamp.classList.add("on"); clearTimeout(stT);
      stT=setTimeout(function(){stamp.classList.remove("on")},2200);
    });
  });
})();
