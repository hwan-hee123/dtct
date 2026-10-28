(function(){
const $=s=>document.querySelector(s);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* concept 큰 글자: 화면에 들어올 때마다 글자별 등장, 벗어나면 사라짐, 폭 자동 맞춤 */
const big=$("#bigWord");
"dtct.".split("").forEach((c,i)=>{const s=document.createElement("span");s.textContent=c;s.style.transitionDelay=(i*80)+"ms";big.appendChild(s);});
function fitBig(){big.style.fontSize="20vw";const w=big.scrollWidth,t=big.parentElement.clientWidth-parseFloat(getComputedStyle(big.parentElement).paddingLeft)*2;
  big.style.fontSize=(parseFloat(getComputedStyle(big).fontSize)*t/Math.max(w,1))+"px";}
fitBig();addEventListener("resize",fitBig);document.fonts&&document.fonts.ready.then(fitBig);
new IntersectionObserver(es=>es.forEach(e=>big.classList.toggle("in",e.isIntersecting)),{threshold:.35}).observe(big);

/* ===== CMF · Detail : 정적 그리드 (데이터 → 렌더). 이미지 경로는 index.html 기준 상대경로 ===== */
const CMF_ITEMS=[
 {no:"01",name:"Carbon Fiber",img:"public/cmf/01_carbon-fiber.png",desc:"프리미엄 자동차 및 모빌리티 제품에 사용되는 카본 파이버. 정교한 직조 패턴과 깊이 있는 블랙을 표현합니다."},
 {no:"02",name:"Gloss Black",img:"public/cmf/02_gloss-black.png",desc:"자동차용 하이글로시 피아노 블랙 도장. 매끄러운 표면과 깊은 반사감을 표현합니다."},
 {no:"03",name:"Anodized Titanium",img:"public/cmf/03_anodized-titanium.png",desc:"실버 및 건메탈 계열의 아노다이징 티타늄. 절제된 금속광과 정교한 표면 질감을 표현합니다."},
 {no:"04",name:"Orange Alcantara",img:"public/cmf/04_orange-alcantara.png",desc:"오렌지 컬러의 알칸타라. 섬세한 섬유 질감과 스포티한 포인트를 표현합니다."},
 {no:"05",name:"Frosted Glass",img:"public/cmf/05_frosted-glass.png",desc:"프로스트 글라스 계열의 LED 디퓨저 소재. 반투명 표면과 부드러운 빛 확산을 표현합니다."},
 {no:"06",name:"Amber LED",img:"public/cmf/06_amber-led.png",desc:"앰버 옐로 및 오렌지 계열의 LED 발광. 정교하고 절제된 발광을 표현합니다."}
];
/* Detail: 카테고리마다 a/b 두 뷰를 명시적으로 연결 (파일명 정렬에 의존하지 않음). 실제 파일명 그대로 사용 — front frame 은 파일명에 공백이 있음 */
const DETAIL_GROUPS=[
 {no:"01",name:"Front Frame",desc:"전면 프레임의 구조, 외곽 형상 및 소재의 연결 관계를 보여줍니다.",imgs:["public/detail/01_front frame_a.png","public/detail/01_front frame_b.png"]},
 {no:"02",name:"Steering Wheel",desc:"스티어링 휠의 형상, 조작 인터페이스, 그립 및 주요 디테일을 강조합니다.",imgs:["public/detail/02_steering-wheel_a.png","public/detail/02_steering-wheel_b.png","public/detail/02_steering-wheel_c.png"]},
 {no:"03",name:"Seat",desc:"시트의 형상, 사용자의 착좌 영역 및 구조적 디테일을 보여줍니다.",imgs:["public/detail/03_seat_a.png","public/detail/03_seat_b.png"]},
 {no:"04",name:"LED",desc:"LED 조명, 발광 디테일 및 빛의 표현을 강조합니다.",imgs:["public/detail/04_led_a.png","public/detail/04_led_b.png","public/detail/04_led_c.png","public/detail/04_led_d.png"]}
];
const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const frame=(src,alt)=>`<div class="mframe"><img src="${encodeURI(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" draggable="false"></div>`;
/* CMF: 3열 격자 (이미지·번호·이름·설명) */
$("#cmfGrid").innerHTML=CMF_ITEMS.map(c=>`<article class="mitem">${frame(c.img,c.name)}<div class="mtxt"><p class="mno">${c.no} —</p><h3>${esc(c.name)}</h3><p class="mdesc">${esc(c.desc)}</p></div></article>`).join("");
/* Detail: 부품별 머리글(번호·이름·설명) 아래에 해당 부품의 이미지를 3열 격자로 (a/b/c/d 순서 유지) */
$("#detailList").innerHTML=DETAIL_GROUPS.map(g=>`<article class="dgroup"><div class="dtxt"><p class="mno">${g.no} —</p><h3>${esc(g.name)}</h3><p class="mdesc">${esc(g.desc)}</p></div><div class="dgrid">${g.imgs.map((im,i)=>frame(im,g.name+" — view "+"ABCD"[i])).join("")}</div></article>`).join("");

/* ===== v13: 로고 폭 맞춤 · 하단 카테고리 내비 · 전환 ===== */
const logo=$("#logo"),showroom=$("#top");
function fitLogo(){ // 로고 가로폭을 왼쪽 영역에 맞춰 일정 비율(기본 약 42%)로 고정
  // 기준 폭: 왼쪽 영역(전체 폭의 40%) — 정적 모드에서 .brand 가 전체 폭으로 넓어져도 로고 크기가 달라지지 않도록 고정
  const sec=$("#top"),cs=getComputedStyle(sec),col=Math.min(logo.parentElement.clientWidth,(sec.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight))*.4);
  const target=1.8*Math.max(150,Math.min(col*.4,260));   // 히어로 대형 로고만 기존 대비 1.8배 (이 함수는 #logo 하나에만 적용)
  logo.style.fontSize="100px";
  const w=logo.scrollWidth||1;const fs=100*target/w;logo.style.fontSize="";sec.style.setProperty("--logo-fs",fs+"px");   // 크기는 CSS 변수로 적용 — Photo 모드에서는 CSS 가 이 값을 화면 높이 기준으로 제한
}
fitLogo();addEventListener("resize",fitLogo);document.fonts&&document.fonts.ready.then(fitLogo);

const page=$("#page"),nav=$("#catnav"),links=[...nav.querySelectorAll("a")];
const targets={top:$("#top"),concept:$("#concept"),cmf:$("#cmf"),detail:$("#detail"),contact:$("#contact")};
let busy=false;
function jump(id){
  const el=targets[id];if(!el)return;
  const go=()=>scrollTo({top:id==="top"?0:el.getBoundingClientRect().top+scrollY,behavior:"auto"});
  if(reduce||busy){go();return;}
  busy=true;page.classList.add("t-out");
  setTimeout(()=>{go();page.classList.remove("t-out");page.classList.add("t-pre");
    void page.offsetWidth;page.classList.remove("t-pre");page.classList.add("t-in");
    setTimeout(()=>{page.classList.remove("t-in");busy=false;},260);},150);
}
links.forEach(a=>a.addEventListener("click",e=>{e.preventDefault();jump(a.dataset.t);}));
const fadeEl=$(".fade");let navTick=false;
function navUpdate(){
  navTick=false;
  const y=scrollY+innerHeight-40;let cur="top";const probe=scrollY+innerHeight*.5;
  for(const k of ["concept","cmf","detail","contact"]){if(targets[k].getBoundingClientRect().top+scrollY<=probe)cur=k;}
  if(scrollY+innerHeight>=document.documentElement.scrollHeight-4)cur="contact";
  links.forEach(a=>a.classList.toggle("on",a.dataset.t===cur));
  const ft=fadeEl.getBoundingClientRect().top+scrollY,sp=targets.cmf.getBoundingClientRect().top+scrollY-ft;
  nav.classList.toggle("light",y>ft+sp*.55);
}
addEventListener("scroll",()=>{if(!navTick){navTick=true;requestAnimationFrame(navUpdate);}},{passive:true});
addEventListener("resize",navUpdate);navUpdate();
/* ===== 메인: 정적 렌더 ↔ 360° 뷰 전환 (app.js 무수정 — 표시 레이어만 전환) ===== */
(function(){
  const sec=document.getElementById("top"),vw=document.getElementById("viewer"),st=document.getElementById("heroStatic");
  const btns=[...document.querySelectorAll(".mode")];let lock=false;
  vw.inert=true;                                   // 정적 모드에서는 360° 뷰어가 입력을 받지 않음
  function set(m){
    const on=m==="360";
    if(lock||sec.classList.contains("is-360")===on)return;
    lock=true;setTimeout(()=>lock=false,240);
    sec.classList.toggle("is-360",on);vw.inert=!on;
    window.dtctSetActive&&window.dtctSetActive(on);window.dtctMeter&&window.dtctMeter(on);st.setAttribute("aria-hidden",on?"true":"false");
    btns.forEach(b=>{const a=b.dataset.mode===m;b.classList.toggle("on",a);b.setAttribute("aria-pressed",a);});
  }
  const warm=()=>window.dtctLoadFrames&&window.dtctLoadFrames();
  btns.forEach(b=>{b.addEventListener("click",()=>{if(b.dataset.mode==="360")warm();set(b.dataset.mode);});if(b.dataset.mode==="360"){b.addEventListener("pointerenter",warm);b.addEventListener("focus",warm);}});
})();

/* ===== Concept: 이미지 진입 연출 + 스크롤 진행에 따른 순차 설명 (드래그로도 더 빨리 열 수 있음, 한 번 나타난 설명은 유지) ===== */
(function(){
  const fig=$("#cfig"),col=$("#ccol"),stage=$("#cstage");if(!fig||!col)return;
  const notes=[...col.children];
  document.documentElement.classList.add("js");              // JS 가 동작할 때만 숨김 초기 상태 사용 → 미지원 환경에서는 설명이 그대로 보임
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){stage.classList.add("seen");io.disconnect();}},{threshold:.02});io.observe(fig);
  }else stage.classList.add("seen");
  // 컨셉 이미지는 매우 커서(디코딩 부하) 스크롤 중에 처음 디코딩되면 화면이 멈칫한다 → 첫 화면이 안정된 뒤 한가할 때 미리 불러와 디코딩해 둔다
  const img=fig.querySelector("img"),warmImg=()=>{img.loading="eager";img.decode&&img.decode().catch(()=>{});};
  addEventListener("load",()=>("requestIdleCallback" in window?requestIdleCallback(warmImg,{timeout:4000}):setTimeout(warmImg,2500)),{once:true});
  let shown=0,drag=0;
  const FIRST=6,STEP=80;
  function reveal(n){
    n=Math.min(notes.length,n);
    while(shown<n){const el=notes[shown];el.classList.add("in");requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add("on")));shown++;}
    if(shown)col.classList.add("has");
  }
  /* 스크롤 진행도: 이미지(스테이지)가 화면 60% 지점을 지나 70% 지나가는 동안 1→6개. 계산은 항상 현재 위치 기준이라 빠르게 스크롤해도 누락되지 않음 */
  function byScroll(){
    const s=stage.getBoundingClientRect(),t=(innerHeight*.6-s.top)/Math.max(1,s.height*.7);
    return t<=0?0:Math.min(notes.length,Math.ceil(t*notes.length));
  }
  const byDrag=()=>drag>FIRST?1+Math.floor((drag-FIRST)/STEP):0;
  function place(){
    if(!shown){col.style.transform="";return;}
    const s=stage.getBoundingClientRect(),h=col.offsetHeight,room=Math.max(0,s.height-h);let y;
    if(matchMedia("(max-width:1000px)").matches)y=innerHeight-14-h-s.top;     // 좁은 화면: 화면 하단 패널
    else y=Math.max(innerHeight*.16,80)-s.top;                                // 넓은 화면: 이미지 옆, 화면 상단 근처
    col.style.transform="translateY("+Math.round(Math.max(0,Math.min(room,y)))+"px)";
  }
  function follow(){requestAnimationFrame(()=>{const n=notes[shown-1];if(!n)return;const need=n.offsetTop+n.offsetHeight-col.clientHeight;if(need>col.scrollTop)col.scrollTo({top:need,behavior:"smooth"});});}
  function upd(){const fr=fig.getBoundingClientRect();if(fr.top<innerHeight&&fr.bottom>0)stage.classList.add("seen");const before=shown;reveal(Math.max(byScroll(),byDrag(),shown));place();if(shown!==before)follow();}
  let tk=false;const req=()=>{if(!tk){tk=true;requestAnimationFrame(()=>{tk=false;upd();});}};
  addEventListener("scroll",req,{passive:true});addEventListener("resize",req);addEventListener("load",req);req();
  // 드래그(마우스·터치) — 누적 이동 거리만큼 설명을 더 빨리 연다
  let d=null;
  fig.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&!e.button)d={x:e.clientX,y:e.clientY};});
  addEventListener("pointermove",e=>{if(!d)return;drag+=Math.hypot(e.clientX-d.x,e.clientY-d.y);d={x:e.clientX,y:e.clientY};upd();},{passive:true});
  addEventListener("pointerup",()=>{d=null;});addEventListener("pointercancel",()=>{d=null;});
  let t=null;
  fig.addEventListener("touchstart",e=>{const p=e.touches[0];t={x:p.clientX,y:p.clientY};},{passive:true});
  fig.addEventListener("touchmove",e=>{if(!t)return;const p=e.touches[0];drag+=Math.hypot(p.clientX-t.x,p.clientY-t.y);t={x:p.clientX,y:p.clientY};upd();},{passive:true});
  fig.addEventListener("touchend",()=>{t=null;});fig.addEventListener("touchcancel",()=>{t=null;});
  fig.addEventListener("keydown",e=>{if(["Enter"," ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){if(e.key.startsWith("Arrow")||e.key===" ")e.preventDefault();drag=Math.max(drag,FIRST+1)+(shown?STEP:0);upd();}});
})();

/* ===== 상단 정보 바 FPS / FRAME — Turntable 모드에서만 동작. FPS 는 실제 화면 갱신(requestAnimationFrame) 간격을
   0.5초 단위로 재고 최근 1초 평균을 표시한다. 표시 조건(모드)과 측정 로직은 분리되어 있다. ===== */
(function(){
  const fpsEl=$("#fps"),frEl=$("#frame");if(!fpsEl||!frEl)return;
  let raf=0,n=0,t0=0,tf=0,hist=[],want=false;
  function tick(t){
    raf=requestAnimationFrame(tick);
    if(!t0){t0=tf=t;return;}
    n++;
    if(t-t0>=500){hist.push(n*1000/(t-t0));if(hist.length>2)hist.shift();fpsEl.textContent="FPS: "+Math.round(hist.reduce((a,b)=>a+b,0)/hist.length)+" / CANVAS 2D";n=0;t0=t;}
    if(t-tf>=100){tf=t;frEl.textContent="FRAME: "+String(window.__dtctFrame||1).padStart(3,"0")+" / 420";}
  }
  function run(){if(want&&!document.hidden&&!raf){t0=0;n=0;hist=[];raf=requestAnimationFrame(tick);}}
  function halt(){if(raf){cancelAnimationFrame(raf);raf=0;}}
  window.dtctMeter=on=>{want=on;on?run():halt();};
  document.addEventListener("visibilitychange",()=>document.hidden?halt():run());
})();



})();
