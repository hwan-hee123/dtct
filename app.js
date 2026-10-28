(function(){
// 360° 턴테이블: renders/turntable/TURNTABLE.107.1.webp ~ TURNTABLE.107.420.webp (원본 번호 유지, 투명 배경, 420장)
// (421번은 1번과 거의 같은 각도의 닫힘용 프레임이라 한 바퀴 계산에서 제외 — 파일은 그대로 보존)
// (이전 세트 renders/frames/frame_000~419.jpg 는 삭제하지 않고 보존)
const FRAMES = 420, PATH = i => `renders/turntable/TURNTABLE.107.${i + 1}.webp`;
const AUTO_FPS = 22;            // 자동회전 속도(프레임/초) — 한 바퀴 약 19초
const RESUME_MS = 3000;         // 마지막 조작 후 자동회전 재개까지 대기
const DRAG_FRAMES = 0.7;        // 뷰어 폭 전체 드래그 = 420 × 0.7 프레임
// 렌더 안에서 제품이 차지하는 영역(전 프레임 합집합, 1516×888 기준) — 항상 같은 위치·크기로 그리기 위한 기준
const SRC_W = 1516, SRC_H = 888, BOX = {cx: 758, cy: 444, w: 1495, h: 867};

const section = document.getElementById("top");
const viewer  = document.getElementById("viewer");
const canvas  = document.getElementById("stage");
const ctx     = canvas.getContext("2d");
const ac = new AbortController(), sig = {signal: ac.signal};   // 화면을 벗어나면 리스너 일괄 해제

/* ---------- 프레임 로딩 ---------- */
const imgs = [];
let framesRequested = false;
function loadFrames() {        // Photo 모드(기본)에서는 올리지 않고, 360° 보기를 처음 선택할 때 1→420 순서로 로딩한다 (동시 요청 8개 제한)
  if (framesRequested) return; framesRequested = true;
  let next = 0, inflight = 0;
  const pump = () => {
    while (inflight < 8 && next < FRAMES) {
      const i = next++, im = new Image(); imgs[i] = im; inflight++;
      const done = () => { inflight--; pump(); if (!rafId && state !== "auto") draw(); };
      im.onload = done; im.onerror = done; im.decoding = "async"; im.src = PATH(i);
    }
  };
  pump();
}
window.dtctLoadFrames = loadFrames;
const ready = i => { const m = imgs[((i % FRAMES) + FRAMES) % FRAMES]; return m && m.complete && m.naturalWidth ? m : null; };
const nearest = i => { for (let k = 0; k < FRAMES; k++) { const m = ready(i + k) || ready(i - k); if (m) return m; } return null; };

/* 디코딩된 프레임 창(window): 현재 프레임 주변 몇 장만 ImageBitmap 으로 미리 만들어 둔다(표시 크기로 축소 → 메모리 작음).
   프레임이 바뀔 때 메인 스레드에서 WebP 를 디코딩하느라 끊기는 문제를 막는다. 420장 전체를 메모리에 올리지 않는다. */
const bmp = new Map(); let bmpSerial = 0, lastPos = 0, dirSign = 1;
function feedBitmaps(f) {
  if (!window.createImageBitmap || !geo) return;
  const AHEAD = 24, BEHIND = 8, a = dirSign >= 0 ? AHEAD : BEHIND, b = dirSign >= 0 ? BEHIND : AHEAD, keep = new Set();
  for (let k = -b; k <= a; k++) keep.add(((f + k) % FRAMES + FRAMES) % FRAMES);
  for (const [k, v] of bmp) if (!keep.has(k)) { if (v !== "p" && v.close) v.close(); bmp.delete(k); }
  const bw = Math.max(1, Math.round(geo.dw * dpr)), bh = Math.max(1, Math.round(geo.dh * dpr)), serial = bmpSerial;
  let made = 0;
  for (let k = 0; k <= Math.max(a, b) && made < 4; k++) for (const idx of [(f + k) % FRAMES, ((f - k) % FRAMES + FRAMES) % FRAMES]) {
    if (!keep.has(idx) || bmp.has(idx)) continue;
    const im = ready(idx); if (!im) continue;
    bmp.set(idx, "p"); made++;
    createImageBitmap(im, {resizeWidth: bw, resizeHeight: bh, resizeQuality: "high"}).then(bm => {
      if (serial === bmpSerial && bmp.get(idx) === "p") bmp.set(idx, bm); else bm.close();
    }).catch(() => bmp.delete(idx));
  }
}
function clearBitmaps() { bmpSerial++; for (const v of bmp.values()) if (v !== "p" && v.close) v.close(); bmp.clear(); }

/* ---------- 레이아웃 / 배경 확장 ---------- */
let W = 0, H = 0, dpr = 1, geo = null;
const ext = document.createElement("canvas"), ectx = ext.getContext("2d");   // 왼쪽·위·아래로 확장된 배경(정지 레이어)
function computeGeo() {
  const s = section.getBoundingClientRect(), v = viewer.getBoundingClientRect();
  const rx = v.left - s.left, ry = v.top - s.top, rw = v.width, rh = v.height;
  // 제품 전체(회전 중 최대 폭)가 뷰어 안에 여유 있게 들어오도록 배율 결정 — 모든 프레임에서 동일
  const sc = Math.min(rw * 0.92 / BOX.w, rh * 0.74 / BOX.h);
  const dw = SRC_W * sc, dh = SRC_H * sc;
  const dx = rx + rw / 2 - BOX.cx * sc, dy = ry + rh / 2 - BOX.cy * sc;   // 제품 중심 = 뷰어 중심
  return {dx, dy, dw, dh, sc};
}
function buildExt(im) {
  // 렌더의 가장자리 줄을 늘려 쿨그레이 배경을 로고 뒤까지 이어 붙인다(제품은 포함되지 않음).
  // 좌우 띠는 렌더 바깥에만 정확히 이어 붙이고(겹침·페이드 없음), 위아래 띠만 렌더 안쪽 12%까지 깔아 페이드와 섞는다.
  ext.width = canvas.width; ext.height = canvas.height;
  const g = geo, d = dpr, x = g.dx * d, y = g.dy * d, w = g.dw * d, h = g.dh * d, iw = im.naturalWidth, ih = im.naturalHeight, S = 2;
  const cw = ext.width, ch = ext.height, py = h * 0.12;
  ectx.clearRect(0, 0, cw, ch);
  const L = x > 0, R = x + w < cw, T = y > 0, B = y + h < ch;
  const c = (sx, sy, dx, dy, dw, dh) => dw > 0 && dh > 0 && ectx.drawImage(im, sx, sy, S, S, dx, dy, dw, dh);
  if (L && T) c(0, 0, 0, 0, x + 1, y + 1);
  if (R && T) c(iw - S, 0, x + w - 1, 0, cw - x - w + 1, y + 1);
  if (L && B) c(0, ih - S, 0, y + h - 1, x + 1, ch - y - h + 1);
  if (R && B) c(iw - S, ih - S, x + w - 1, y + h - 1, cw - x - w + 1, ch - y - h + 1);
  if (T) ectx.drawImage(im, 0, 0, iw, S, x, 0, w, y + py);
  if (B) ectx.drawImage(im, 0, ih - S, iw, S, x, y + h - py, w, ch - y - h + py);
  if (L) ectx.drawImage(im, 0, 0, S, ih, 0, y, x + 1, h);
  if (R) ectx.drawImage(im, iw - S, 0, S, ih, x + w - 1, y, cw - x - w + 1, h);
}
function fit() {
  const r = section.getBoundingClientRect();
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = r.width; H = r.height;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  geo = computeGeo(); extReady = false; clearBitmaps(); draw();
}
let extReady = false;

/* ---------- 그리기 ---------- */
let pos = 0;
const idxOf = p => ((Math.round(p) % FRAMES) + FRAMES) % FRAMES;
const srcOf = f => { const b = bmp.get(f); return (b && b !== "p") ? b : ready(f); };
function draw(strict) {        // strict: 해당 프레임이 아직 준비되지 않았으면 그리지 않고 false (자동 회전 — 건너뛰지 않음)
  if (!geo) return false;
  const f = idxOf(pos);
  let src = srcOf(f);
  if (!src) { if (strict) return false; src = nearest(f); if (!src) return false; }   // 드래그 중에는 가장 가까운 준비된 프레임으로 즉시 반응
  const g = geo, d = dpr, w = Math.round(g.dw * d), h = Math.round(g.dh * d);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);          // 프레임이 투명 배경이므로 이전 프레임을 지운 뒤 그림
  ctx.drawImage(src, g.dx * d, g.dy * d, w, h);
  window.__dtctFrame = f + 1;                                  // 현재 프레임 번호(1~420) — 상단 정보 바 표시용
  const dl = pos - lastPos; if (dl) dirSign = dl > 0 ? 1 : -1; lastPos = pos;
  feedBitmaps(f);
  return true;
}

/* ---------- 상태: auto / dragging / idle ---------- */
let state = "auto", resumeTimer = null, rafId = 0, last = 0, visible = true, active = false;   // active: Turntable 모드일 때만 true (Photo 모드에서는 루프가 돌지 않음)
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function setState(s) {
  state = s; viewer.classList.toggle("dragging", s === "dragging");
  if (s === "auto") start(); else stop();
}
function clearResume() { if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; } }
function toIdle() {                      // 조작 종료 → 현재 각도 유지, 3초 대기
  setState("idle"); clearResume();
  resumeTimer = setTimeout(() => { resumeTimer = null; if (state === "idle" && !reduce()) setState("auto"); }, RESUME_MS);
}
function loop(t) {
  rafId = 0;
  if (state !== "auto" || !visible || !active || document.hidden) return;
  const dt = Math.min((t - last) / 1000, 0.05);       // 탭 복귀 등으로 시간이 크게 튀어도 프레임이 점프하지 않음 (경과 시간 기반 인덱스)
  last = t;
  let np = pos + dt * AUTO_FPS;
  const cap = Math.round(pos) + 1.4999; if (np > cap) np = cap;       // 한 번에 최대 1프레임만 진행 → 프레임을 건너뛰지 않음 (느린 기기에서는 회전만 느려짐)
  if (srcOf(idxOf(np)) || ready(idxOf(np))) { pos = np; draw(true); }   // 다음 프레임이 아직 로딩 전이면 현재 프레임에 머물렀다가 다음 루프에서 이어감(건너뛰지 않음)
  rafId = requestAnimationFrame(loop);
}
function start() { if (!rafId && active && visible && !document.hidden && !reduce()) { last = performance.now(); rafId = requestAnimationFrame(loop); } }
function stop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }

window.dtctSetActive = on => { active = !!on; if (on) { fit(); if (state === "auto") start(); } else stop(); };   // Photo ↔ Turntable 전환 시 레이아웃이 달라지므로 켤 때 위치·크기를 다시 계산

/* ---------- 드래그(마우스·터치·펜 공통) ---------- */
let pid = null, startX = 0, startPos = 0;
viewer.addEventListener("pointerdown", e => {
  if (pid !== null || (e.pointerType === "mouse" && e.button !== 0)) return;
  pid = e.pointerId; startX = e.clientX; startPos = pos;
  try { viewer.setPointerCapture(pid); } catch (_) {}
  clearResume(); setState("dragging");
}, sig);
viewer.addEventListener("pointermove", e => {
  if (e.pointerId !== pid) return;
  pos = startPos - (e.clientX - startX) / viewer.clientWidth * FRAMES * DRAG_FRAMES; draw();
}, sig);
function release(e) { if (e.pointerId !== pid) return; pid = null; toIdle(); }
["pointerup", "pointercancel", "lostpointercapture"].forEach(n => viewer.addEventListener(n, release, sig));
viewer.addEventListener("keydown", e => {              // 접근성: 화살표 키(보이는 버튼은 없음)
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault(); clearResume(); stop(); pos += e.key === "ArrowLeft" ? -2 : 2; draw(); toIdle();
}, sig);
viewer.addEventListener("dragstart", e => e.preventDefault(), sig);

/* ---------- 표시 여부 / 탭 전환 ---------- */
new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && state === "auto") start(); else if (!visible) stop(); }, {threshold: 0}).observe(section);
document.addEventListener("visibilitychange", () => { if (!document.hidden && state === "auto") start(); else stop(); }, sig);
matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => reduce() ? stop() : (state === "auto" && start()), sig);
new ResizeObserver(fit).observe(section);
addEventListener("pagehide", () => { stop(); clearResume(); ac.abort(); }, {once: true});

if (reduce()) state = "idle";
fit(); setState(reduce() ? "idle" : "auto");
})();
