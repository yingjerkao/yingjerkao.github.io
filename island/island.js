import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GROUP, ISLANDS, BRIDGES } from "./data.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const app = $("#app");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const phone = () => innerWidth <= 760;
const byId = Object.fromEntries(ISLANDS.map((d) => [d.id, d]));
const num = (d) => String(ISLANDS.indexOf(d)).padStart(2, "0");
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

// ---------- geometry constants ----------
const R = 4;            // island hex radius
const SPACING = 5.75;   // axial-to-world scale; leaves water channels between islands
const TOP = 1;          // island surface height
const hexToWorld = (q, r) => new THREE.Vector3(SPACING * Math.sqrt(3) * (q + r / 2), 0, SPACING * 1.5 * r);

// deterministic random so islands look the same on every visit
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------- state ----------
const state = { selected: null, hover: null, names: true, bridges: true, frozen: reduced, tab: "islands", query: "", time: "day", lastInput: performance.now() };

// ---------- UI: index, card, dock ----------
const paperTotal = ISLANDS.reduce((n, d) => n + d.papers.length, 0);
$("#paper-count").textContent = paperTotal;
$("#bridge-count").textContent = BRIDGES.length;

function highlight(text, q) {
  const s = esc(text);
  if (!q) return s;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return s;
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
}

function renderTree() {
  const q = state.query.trim().toLowerCase();
  const tree = $("#tree");
  if (state.tab === "bridges") {
    const rows = BRIDGES.filter((b) => !q || [b.label, b.via, byId[b.a].title, byId[b.b].title].join(" ").toLowerCase().includes(q));
    tree.innerHTML = rows.length ? rows.map((b) => {
      const A = byId[b.a], B = byId[b.b];
      return `<button class="bridge-row" data-a="${b.a}" data-b="${b.b}" style="--ca:${A.color};--cb:${B.color}"><span class="ends"><span class="dot" style="--c:${A.color}"></span>${esc(A.title)}<i></i><span class="dot" style="--c:${B.color}"></span>${esc(B.title)}</span><span class="lbl">${highlight(b.label, q)} · ${highlight(b.via, q)}</span></button>`;
    }).join("") : `<p class="empty">No bridges match “${esc(state.query)}”.</p>`;
    tree.querySelectorAll(".bridge-row").forEach((el) => el.addEventListener("click", () => select(el.dataset.a)));
    return;
  }
  const rows = ISLANDS.map((d) => {
    const hay = [d.title, d.zh, d.blurb].join(" ").toLowerCase();
    const hits = q ? d.papers.filter((p) => (p.t + " " + p.v).toLowerCase().includes(q)) : [];
    return { d, show: !q || hay.includes(q) || hits.length, hits };
  }).filter((x) => x.show);
  tree.innerHTML = rows.length ? rows.map(({ d, hits }) => `
    <button class="node${state.selected === d.id ? " active" : ""}" data-id="${d.id}" style="--c:${d.color}">
      <span class="num">${num(d)}</span>
      <span><span class="t">${highlight(d.title, q)}</span><span class="z">${esc(d.zh)}</span></span>
      <span class="n">${d.papers.length ? d.papers.length + " ¶" : "hub"}</span>
    </button>${hits.length ? `<ul class="hits">${hits.map((p) => `<li>${highlight(p.t, q)}</li>`).join("")}</ul>` : ""}`).join("")
    : `<p class="empty">Nothing matches “${esc(state.query)}”. Try “tensor”, “Higgs” or “kagome”.</p>`;
  tree.querySelectorAll(".node").forEach((el) => el.addEventListener("click", () => select(el.dataset.id)));
}

function renderCard(d) {
  const bridges = BRIDGES.filter((b) => b.a === d.id || b.b === d.id);
  const others = d.kind === "hub" ? ISLANDS.filter((x) => x.kind !== "hub") : [];
  $("#card-content").innerHTML = `
    <div class="swatch" style="--c:${d.color}"></div>
    <div class="eyebrow">ISLAND ${num(d)}${d.kind === "hub" ? " · HARBOUR" : ""}</div>
    <h2>${esc(d.title)}</h2>
    <div class="zh">${esc(d.zh)}</div>
    <p class="blurb">${esc(d.blurb)}</p>
    ${d.links?.length ? `<div class="chips">${d.links.map((l) => `<a class="chip" href="${esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)} ↗</a>`).join("")}</div>` : ""}
    ${others.length ? `<h3>Set sail for</h3><div class="chips">${others.map((x) => `<button class="chip" data-go="${x.id}"><span class="dot" style="--c:${x.color}"></span>${esc(x.title)}</button>`).join("")}</div>` : ""}
    ${bridges.length ? `<h3>Bridges</h3><div class="chips">${bridges.map((b) => { const o = byId[b.a === d.id ? b.b : b.a]; return `<button class="chip" data-go="${o.id}" title="${esc(b.via)}"><span class="dot" style="--c:${o.color}"></span>${esc(b.label)}</button>`; }).join("")}</div>` : ""}
    ${d.papers.length ? `<h3>Selected papers</h3><ul class="papers">${d.papers.map((p) => `<li><a href="${esc(p.u)}" target="_blank" rel="noopener">${esc(p.t)}</a><span class="v">${esc(p.v)}</span></li>`).join("")}</ul>` : ""}
    ${d.kind !== "hub" ? `<h3>More</h3><div class="chips"><a class="chip" href="/research/">Research overview</a><a class="chip" href="/publications/">All publications</a></div>` : ""}`;
  $("#card-content").querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => select(el.dataset.go)));
  const card = $("#card");
  card.hidden = false;
  card.scrollTop = 0;
}

$("#dock").innerHTML = ISLANDS.map((d) => `<button data-id="${d.id}" style="--c:${d.color}" title="${esc(d.title)}" aria-label="${esc(d.title)}">${num(d)}</button>`).join("");
$$("#dock button").forEach((b) => b.addEventListener("click", () => select(b.dataset.id)));

$("#search").addEventListener("input", (e) => { state.query = e.target.value; renderTree(); });
for (const [id, tab] of [["#tab-islands", "islands"], ["#tab-bridges", "bridges"]]) {
  $(id).addEventListener("click", () => {
    state.tab = tab;
    $$(".side-tabs button").forEach((b) => { const on = b === $(id); b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
    if (tab === "bridges" && !state.bridges) setToggle("bridges", true);
    renderTree();
  });
}
function setSidebar(open) {
  app.classList.toggle("side-closed", !open);
  $("#sidebar-toggle").setAttribute("aria-expanded", open);
}
$("#sidebar-toggle").addEventListener("click", () => setSidebar(app.classList.contains("side-closed")));
$("#side-close").addEventListener("click", () => setSidebar(false));
$("#sheet-handle").addEventListener("click", () => setSidebar(app.classList.contains("side-closed")));
if (phone()) setSidebar(false);

// ---------- intro ----------
const INTRO = [
  ["Every island is a research theme", "Six hexagonal islands circle our harbour. Tap one — or use the Index on the right — to read what we work on and the papers behind it."],
  ["Bridges are where ideas travel", "Arcs between islands mark work that sits on both shores: tensor networks for gauge theories, machine learning on quantum hardware, algorithms that become open-source libraries."],
  ["Look around", "Drag to orbit, scroll or pinch to zoom, right-drag to pan. Switch the time of day at the bottom — the lab works late."],
];
let introStep = 0;
function showIntro(step = 0) {
  introStep = step;
  const [t, b] = INTRO[step];
  $("#intro-count").textContent = `HELLO, VISITOR / ${String(step + 1).padStart(2, "0")}`;
  $("#intro-title").textContent = t;
  $("#intro-body").textContent = b;
  $("#intro-next").textContent = step === INTRO.length - 1 ? "Start exploring" : "Next →";
  $("#intro").hidden = false;
  $("#intro-next").focus();
}
function closeIntro() { $("#intro").hidden = true; store.set("kao-island-intro", "1"); }
$("#intro-next").addEventListener("click", () => (introStep < INTRO.length - 1 ? showIntro(introStep + 1) : closeIntro()));
$("#intro-skip").addEventListener("click", closeIntro);
$("#help").addEventListener("click", () => showIntro(0));

renderTree();

// ---------- WebGL check ----------
function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}
if (!webglOK()) {
  app.classList.add("fallback");
  $("#loading").classList.add("done");
  $("#mascot-text").textContent = "3D view unavailable — browse the Index instead";
  setSidebar(true);
  throw new Error("WebGL unavailable");
}

// ---------- renderer / scene ----------
const stage = $("#stage");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#F4E9DA");
scene.fog = new THREE.Fog("#F4E9DA", 60, 140);

const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 9;
controls.maxDistance = 90;
controls.maxPolarAngle = Math.PI * 0.44;
controls.minPolarAngle = Math.PI * 0.08;
controls.autoRotateSpeed = 0.35;
controls.screenSpacePanning = false;

const hemi = new THREE.HemisphereLight("#FFF4E2", "#6E8C8E", 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight("#FFE7C4", 2.4);
sun.position.set(-22, 34, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 100 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.03;
scene.add(sun);

// ---------- materials ----------
const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...opts }));
  return matCache.get(key);
}
// emissive materials brighten at night; keep a list so time-of-day can drive them
const glowMats = [];
function glow(color, base = 0.15) {
  const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: base, flatShading: true, roughness: 0.5 });
  m.userData.base = base;
  glowMats.push(m);
  return m;
}
function mesh(geo, material, { x = 0, y = 0, z = 0, cast = true, receive = false } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}
const tint = (hex, toward, k) => "#" + new THREE.Color(hex).lerp(new THREE.Color(toward), k).getHexString();
const SAND = "#E9D3AE", EARTH = "#9C7B5B", CREAM = "#F7EEDF", TRUNK = "#7A5A3E";

// ---------- sea ----------
const seaGeo = new THREE.PlaneGeometry(260, 260, 90, 90);
seaGeo.rotateX(-Math.PI / 2);
const seaBase = seaGeo.attributes.position.array.slice();
const seaMat = new THREE.MeshStandardMaterial({ color: "#5DAFC0", flatShading: true, roughness: 0.35, metalness: 0.05, transparent: true, opacity: 0.88 });
const sea = new THREE.Mesh(seaGeo, seaMat);
sea.receiveShadow = true;
scene.add(sea);
const seabed = mesh(new THREE.CircleGeometry(200, 48), mat("#5E8F95"), { y: -2.2, cast: false, receive: true });
seabed.rotation.x = -Math.PI / 2;
scene.add(seabed);

const stars = (() => {
  const g = new THREE.BufferGeometry(), r = rng(7), pts = [];
  for (let i = 0; i < 600; i++) {
    const th = r() * Math.PI * 2, ph = r() * Math.PI * 0.42, d = 170;
    pts.push(d * Math.sin(ph) * Math.cos(th), d * Math.cos(ph) * 0.6 + 10, d * Math.sin(ph) * Math.sin(th));
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: "#FFF6E0", size: 0.9, transparent: true, opacity: 0, fog: false }));
  scene.add(p);
  return p;
})();

// ---------- islands ----------
const animators = [];   // (t) => void
const islandObjs = {};  // id -> { group, center, pick[] }

function tree(rand, x, z, scale = 1, leaf = "#6F9A5B") {
  const g = new THREE.Group();
  const h = (0.5 + rand() * 0.35) * scale;
  g.add(mesh(new THREE.CylinderGeometry(0.06 * scale, 0.09 * scale, h, 5), mat(TRUNK), { y: h / 2 }));
  const kind = rand();
  if (kind < 0.6) {
    g.add(mesh(new THREE.ConeGeometry(0.42 * scale, 0.9 * scale, 6), mat(leaf), { y: h + 0.35 * scale }));
    g.add(mesh(new THREE.ConeGeometry(0.32 * scale, 0.7 * scale, 6), mat(leaf), { y: h + 0.75 * scale }));
  } else {
    g.add(mesh(new THREE.IcosahedronGeometry(0.42 * scale, 0), mat(tint(leaf, "#C9B04E", 0.25)), { y: h + 0.3 * scale }));
  }
  g.position.set(x, TOP, z);
  g.rotation.y = rand() * Math.PI;
  return g;
}

function scatterTrees(group, rand, color, rMin, count) {
  const leaf = tint("#6F9A5B", color, 0.18);
  for (let i = 0, tries = 0; i < count && tries < 200; tries++) {
    const a = rand() * Math.PI * 2, d = rMin + rand() * (R * 0.86 - rMin);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    // stay inside the hexagon (inradius check against the nearest edge normal)
    const ang = Math.atan2(x, z), seg = Math.PI / 3;
    const local = ((ang % seg) + seg) % seg - seg / 2;
    if (d * Math.cos(local) > R * 0.82) continue;
    group.add(tree(rand, x, z, 0.7 + rand() * 0.5, leaf));
    i++;
  }
}

const DECOR = {
  hub(g, d) {
    const wall = mat(CREAM), roof = mat(d.color), win = glow("#FFD58A", 0.05);
    const body = mesh(new THREE.BoxGeometry(2.6, 1.5, 1.8), wall, { y: TOP + 0.75, receive: true });
    g.add(body);
    const r = mesh(new THREE.ConeGeometry(2.05, 1.0, 4), roof, { y: TOP + 2.0 });
    r.rotation.y = Math.PI / 4;
    r.scale.z = 0.72;
    g.add(r);
    for (let i = -2; i <= 2; i++) if (i) g.add(mesh(new THREE.BoxGeometry(0.28, 0.42, 0.04), win, { x: i * 0.5, y: TOP + 0.85, z: 0.92, cast: false }));
    g.add(mesh(new THREE.BoxGeometry(0.42, 0.7, 0.05), mat("#7A4A32"), { y: TOP + 0.35, z: 0.92, cast: false }));
    // clock tower
    g.add(mesh(new THREE.BoxGeometry(0.8, 2.9, 0.8), wall, { x: 1.7, y: TOP + 1.45, z: -0.4 }));
    g.add(mesh(new THREE.ConeGeometry(0.66, 0.9, 4), roof, { x: 1.7, y: TOP + 3.35, z: -0.4 }));
    g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16), win, { x: 1.7, y: TOP + 2.4, z: 0.01, cast: false }).rotateX(Math.PI / 2));
    // flag
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 5), mat("#5A4A3E"), { x: -1.8, y: TOP + 1.1, z: 0.9 }));
    const flagGeo = new THREE.PlaneGeometry(0.9, 0.5, 8, 1);
    const flagBase = flagGeo.attributes.position.array.slice();
    const flag = mesh(flagGeo, mat(d.color, { side: THREE.DoubleSide }), { x: -1.33, y: TOP + 1.95, z: 0.9 });
    g.add(flag);
    animators.push((t) => {
      const p = flagGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = flagBase[i * 3] + 0.45;
        p.setZ(i, Math.sin(t * 4 - x * 5) * 0.08 * x);
      }
      p.needsUpdate = true;
    });
    // path tiles
    for (let i = 0; i < 4; i++) g.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 0.4), mat("#D8C3A0"), { y: TOP + 0.02, z: 1.3 + i * 0.55, cast: false, receive: true }));
  },

  tensor(g, d) {
    // a 3x3 PEPS: tensors on posts, virtual bonds between them, physical legs into the ground
    const node = glow(d.color, 0.12), bond = mat(tint(d.color, "#2A2420", 0.35)), leg = mat("#5A4A3E");
    const H = TOP + 1.7, nodes = [];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const s = mesh(new THREE.IcosahedronGeometry(0.3, 1), node, { x: i * 1.15, y: H, z: j * 1.15 });
      g.add(s);
      g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, H - TOP, 5), leg, { x: i * 1.15, y: TOP + (H - TOP) / 2, z: j * 1.15 }));
      nodes.push(s);
    }
    for (let i = -1; i <= 1; i++) for (let j = -1; j < 1; j++) {
      const a = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.15, 6), bond, { x: i * 1.15, y: H, z: (j + 0.5) * 1.15 });
      a.rotation.x = Math.PI / 2;
      const b = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.15, 6), bond, { x: (j + 0.5) * 1.15, y: H, z: i * 1.15 });
      b.rotation.z = Math.PI / 2;
      g.add(a, b);
    }
    // open boundary legs
    for (let i = -1; i <= 1; i++) for (const s of [-1, 1]) {
      const a = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 6), bond, { x: i * 1.15, y: H, z: s * 1.5 });
      a.rotation.x = Math.PI / 2;
      const b = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 6), bond, { x: s * 1.5, y: H, z: i * 1.15 });
      b.rotation.z = Math.PI / 2;
      g.add(a, b);
    }
    // a contraction sweep rolls across the network
    animators.push((t) => nodes.forEach((n) => {
      const ph = Math.sin(t * 2 - (n.position.x + n.position.z) * 1.3);
      n.scale.setScalar(1 + Math.max(0, ph) * 0.18);
    }));
  },

  software(g, d) {
    const r = rng(11);
    const blocks = [[-1.3, -0.6, 1.1, 2.6], [0.1, -1.1, 1.0, 1.8], [1.35, -0.3, 0.9, 3.2], [-0.2, 0.7, 0.9, 1.2]];
    const win = glow("#BDF0C9", 0.08);
    for (const [x, z, w, h] of blocks) {
      g.add(mesh(new THREE.BoxGeometry(w, h, w), mat(tint(d.color, CREAM, 0.55 + r() * 0.2)), { x, y: TOP + h / 2, z, receive: true }));
      g.add(mesh(new THREE.BoxGeometry(w * 1.04, 0.08, w * 1.04), mat(tint(d.color, "#2A2420", 0.2)), { x, y: TOP + h + 0.04, z }));
      for (let k = 0.45; k < h - 0.2; k += 0.42) g.add(mesh(new THREE.BoxGeometry(w * 0.7, 0.16, 0.03), win, { x, y: TOP + k, z: z + w / 2 + 0.01, cast: false }));
    }
    // a stack of library "books"
    const cols = ["#DB6A41", "#3E7CB1", d.color, "#D19A2E"];
    cols.forEach((c, i) => {
      const b = mesh(new THREE.BoxGeometry(1.1, 0.22, 0.75), mat(c), { x: 1.2, y: TOP + 0.11 + i * 0.22, z: 1.4 });
      b.rotation.y = (i % 2 ? 0.18 : -0.1);
      g.add(b);
    });
    // terminal cursor blinking on the tallest tower
    const cursor = mesh(new THREE.BoxGeometry(0.16, 0.26, 0.04), glow("#FFFFFF", 0.6), { x: 1.35, y: TOP + 3.6, z: 0.16, cast: false });
    g.add(cursor);
    animators.push((t) => { cursor.visible = Math.floor(t * 1.6) % 2 === 0; });
  },

  gauge(g, d) {
    // 4x4 plaquettes whose "field" fluctuates; links and sites on top
    const N = 4, a = 0.85, off = (N - 1) / 2;
    const tiles = [];
    const plaq = mat(tint(d.color, CREAM, 0.45), { transparent: true, opacity: 0.95 });
    const link = mat(tint(d.color, "#2A2420", 0.3));
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const m = mesh(new THREE.BoxGeometry(a * 0.86, 1, a * 0.86), plaq, { x: (i - off) * a, z: (j - off) * a, receive: true });
      g.add(m);
      tiles.push(m);
    }
    const site = glow(d.color, 0.15);
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
      const x = (i - N / 2) * a, z = (j - N / 2) * a;
      g.add(mesh(new THREE.BoxGeometry(0.14, 0.9, 0.14), site, { x, y: TOP + 0.45, z }));
      if (i < N) g.add(mesh(new THREE.BoxGeometry(a, 0.06, 0.06), link, { x: x + a / 2, y: TOP + 0.85, z }));
      if (j < N) g.add(mesh(new THREE.BoxGeometry(0.06, 0.06, a), link, { x, y: TOP + 0.85, z: z + a / 2 }));
    }
    // Higgs "field" orbs
    const higgs = [];
    for (let k = 0; k < 2; k++) {
      const o = mesh(new THREE.IcosahedronGeometry(0.22, 1), glow("#F2C14E", 0.4), { y: TOP + 1.6 });
      g.add(o);
      higgs.push(o);
    }
    animators.push((t) => {
      tiles.forEach((m, k) => {
        const i = Math.floor(k / N), j = k % N;
        const h = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7 + j * 0.9) * Math.cos(t * 0.7 - j * 1.1));
        m.scale.y = h;
        m.position.y = TOP + h / 2;
      });
      higgs.forEach((o, k) => {
        const p = t * 0.6 + k * Math.PI;
        o.position.x = Math.cos(p) * 1.9;
        o.position.z = Math.sin(p) * 1.9;
        o.position.y = TOP + 1.5 + Math.sin(t * 2 + k) * 0.2;
      });
    });
  },

  quantum(g, d) {
    // a chip with qubits, plus a dilution-refrigerator chandelier
    g.add(mesh(new THREE.BoxGeometry(2.6, 0.18, 2.0), mat("#3A3F4A"), { x: -0.5, y: TOP + 0.09, z: 0.6, receive: true }));
    const qubits = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x = -1.3 + i * 0.8, z = 0.2 + j * 0.8;
      g.add(mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 8), mat("#C9A35A", { metalness: 0.6, roughness: 0.35 }), { x, y: TOP + 0.43, z }));
      const q = mesh(new THREE.IcosahedronGeometry(0.17, 1), glow(d.color, 0.3), { x, y: TOP + 0.82, z });
      q.material = q.material.clone();
      q.material.userData.base = 0.3;
      glowMats.push(q.material);
      g.add(q);
      qubits.push(q);
      if (i < 2) g.add(mesh(new THREE.BoxGeometry(0.8, 0.03, 0.05), mat("#C9A35A"), { x: x + 0.4, y: TOP + 0.2, z, cast: false }));
    }
    const gold = mat("#D4AF5F", { metalness: 0.7, roughness: 0.3 });
    const fx = 1.5, fz = -1.0;
    [[1.0, 2.9], [0.82, 2.3], [0.64, 1.75], [0.46, 1.25], [0.3, 0.8]].forEach(([r, y]) => g.add(mesh(new THREE.CylinderGeometry(r, r, 0.1, 18), gold, { x: fx, y: TOP + y, z: fz })));
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 5), gold, { x: fx + Math.cos(a) * 0.38, y: TOP + 1.9, z: fz + Math.sin(a) * 0.38 }));
    }
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.0, 6), mat("#5A4A3E"), { x: fx, y: TOP + 1.5, z: fz }));
    const c0 = new THREE.Color(d.color), c1 = new THREE.Color("#F2C14E");
    animators.push((t) => qubits.forEach((q, k) => {
      const s = 0.5 + 0.5 * Math.sin(t * 2.2 + k * 1.3);
      q.material.color.copy(c0).lerp(c1, s);
      q.material.emissive.copy(q.material.color);
      q.position.y = TOP + 0.82 + s * 0.08;
    }));
  },

  neural(g, d) {
    const layers = [3, 4, 4, 2], xs = [-1.9, -0.65, 0.65, 1.9];
    const pole = mat("#5A4A3E"), nodes = [], pos = [];
    layers.forEach((n, li) => {
      for (let k = 0; k < n; k++) {
        const z = (k - (n - 1) / 2) * 0.85, y = TOP + 1.4 + Math.abs(z) * -0.15;
        const m = mesh(new THREE.IcosahedronGeometry(0.22, 1), glow(d.color, 0.15), { x: xs[li], y, z });
        m.material = m.material.clone();
        m.material.userData.base = 0.15;
        glowMats.push(m.material);
        m.userData.layer = li;
        g.add(m);
        g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, y - TOP, 5), pole, { x: xs[li], y: TOP + (y - TOP) / 2, z }));
        nodes.push(m);
        pos.push(m.position);
      }
    });
    const seg = [];
    let start = 0;
    for (let li = 0; li < layers.length - 1; li++) {
      for (let a = 0; a < layers[li]; a++) for (let b = 0; b < layers[li + 1]; b++) {
        const p = pos[start + a], q = pos[start + layers[li] + b];
        seg.push(p.x, p.y, p.z, q.x, q.y, q.z);
      }
      start += layers[li];
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: tint(d.color, "#2A2420", 0.2), transparent: true, opacity: 0.55 })));
    // forward pass: activation sweeps layer by layer
    animators.push((t) => nodes.forEach((m) => {
      const ph = ((t * 0.9) % 1.6) * layers.length - m.userData.layer;
      const on = Math.max(0, 1 - Math.abs(ph - 0.5) * 1.6);
      m.material.emissiveIntensity = m.material.userData.base * nightBoost + on * 0.9;
      m.scale.setScalar(1 + on * 0.25);
    }));
  },

  kagome(g, d) {
    // corner-sharing triangles with precessing spins
    const s = 0.78, a1 = new THREE.Vector2(2 * s, 0), a2 = new THREE.Vector2(s, Math.sqrt(3) * s);
    const sites = [];
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
      const base = a1.clone().multiplyScalar(i).add(a2.clone().multiplyScalar(j));
      for (const o of [new THREE.Vector2(), a1.clone().multiplyScalar(0.5), a2.clone().multiplyScalar(0.5)]) {
        const p = base.clone().add(o);
        if (p.length() < 2.45) sites.push(p);
      }
    }
    const bondMat = mat(tint(d.color, "#2A2420", 0.25));
    for (let i = 0; i < sites.length; i++) for (let j = i + 1; j < sites.length; j++) {
      const dv = sites[j].clone().sub(sites[i]);
      if (Math.abs(dv.length() - s) > 0.05) continue;
      const m = mesh(new THREE.BoxGeometry(s, 0.07, 0.07), bondMat, { x: (sites[i].x + sites[j].x) / 2, y: TOP + 0.35, z: (sites[i].y + sites[j].y) / 2, cast: false });
      m.rotation.y = -Math.atan2(dv.y, dv.x);
      g.add(m);
    }
    const spins = [];
    const up = glow(d.color, 0.12), stem = mat(CREAM);
    sites.forEach((p, k) => {
      g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.35, 6), stem, { x: p.x, y: TOP + 0.17, z: p.y }));
      const spin = new THREE.Group();
      spin.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 5), stem, { y: 0.22 }));
      spin.add(mesh(new THREE.ConeGeometry(0.11, 0.26, 6), up, { y: 0.55 }));
      spin.position.set(p.x, TOP + 0.38, p.y);
      spin.userData.phase = (Math.round(p.x * 3 + p.y * 5) % 3) * (Math.PI * 2 / 3);
      g.add(spin);
      spins.push(spin);
    });
    animators.push((t) => spins.forEach((sp) => {
      sp.rotation.set(0.55, 0, 0);
      sp.rotation.order = "YXZ";
      sp.rotation.y = t * 0.8 + sp.userData.phase;
    }));
  },
};

for (const d of ISLANDS) {
  const group = new THREE.Group();
  const center = hexToWorld(d.q, d.r);
  group.position.copy(center);
  const rand = rng(d.id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const grass = tint(d.color, "#E8DDB8", 0.72);
  const base = mesh(new THREE.CylinderGeometry(R * 0.96, R * 0.62, 3.2, 6), mat(EARTH), { y: -1.6, receive: true });
  const shore = mesh(new THREE.CylinderGeometry(R * 1.06, R * 1.12, 0.6, 6), mat(SAND), { y: 0.1, receive: true });
  const top = mesh(new THREE.CylinderGeometry(R, R * 1.03, 0.75, 6), mat(grass), { y: TOP - 0.375, receive: true });
  const rim = mesh(new THREE.CylinderGeometry(R * 1.005, R * 1.005, 0.12, 6, 1, true), mat(d.color), { y: TOP - 0.06, cast: false });
  group.add(base, shore, top, rim);
  DECOR[d.kind](group, d);
  scatterTrees(group, rand, d.color, d.kind === "hub" ? 2.6 : 2.75, d.kind === "hub" ? 9 : 6);
  // rocks on the shore
  for (let k = 0; k < 5; k++) {
    const a = rand() * Math.PI * 2;
    const rock = mesh(new THREE.DodecahedronGeometry(0.2 + rand() * 0.25, 0), mat("#B7A68F"), { x: Math.cos(a) * R * 1.08, y: 0.25, z: Math.sin(a) * R * 1.08 });
    rock.rotation.set(rand(), rand(), rand());
    group.add(rock);
  }
  group.traverse((o) => { o.userData.island = d.id; });
  scene.add(group);
  islandObjs[d.id] = { group, center, pick: [base, shore, top], lift: 0 };
}

// ---------- bridges ----------
const bridgeGroup = new THREE.Group();
scene.add(bridgeGroup);
const bridgeObjs = BRIDGES.map((b, i) => {
  const A = islandObjs[b.a].center, B = islandObjs[b.b].center;
  const dir = B.clone().sub(A).setY(0).normalize();
  const p0 = A.clone().addScaledVector(dir, R * 0.55).setY(TOP + 0.6);
  const p2 = B.clone().addScaledVector(dir, -R * 0.55).setY(TOP + 0.6);
  const dist = p0.distanceTo(p2);
  const p1 = p0.clone().lerp(p2, 0.5).setY(TOP + 1.2 + dist * 0.42);
  const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
  const col = new THREE.Color(byId[b.a].color).lerp(new THREE.Color(byId[b.b].color), 0.5);
  const tubeMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.15, transparent: true, opacity: 0.75, roughness: 0.4 });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.09, 6), tubeMat);
  tube.userData.base = 0.75;
  bridgeGroup.add(tube);
  const runners = [0, 0.5].map((o) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), new THREE.MeshStandardMaterial({ color: "#FFF6E0", emissive: col, emissiveIntensity: 0.9 }));
    m.userData.offset = o + i * 0.13;
    bridgeGroup.add(m);
    return m;
  });
  return { b, curve, tube, runners };
});

// ---------- labels ----------
const labels = ISLANDS.map((d) => {
  const el = document.createElement("button");
  el.className = "lbl3d";
  el.innerHTML = `<span class="dot" style="--c:${d.color}"></span>${esc(d.title)} <small>${esc(d.zh)}</small>`;
  el.addEventListener("click", () => select(d.id));
  $("#labels").appendChild(el);
  return { d, el, anchor: islandObjs[d.id].center.clone().setY(d.kind === "hub" ? 5.2 : 4.4) };
});

// ---------- time of day ----------
const TIMES = {
  dawn:  { bg: "#F3D9C6", hemi: ["#FFE1CC", "#6D7C9A", 0.9], sun: ["#FFB98A", 1.8, [-34, 14, 10]], sea: "#8DB3C4", night: 0.4, stars: 0.15, exposure: 1.0 },
  day:   { bg: "#F4E9DA", hemi: ["#FFF4E2", "#6E8C8E", 1.1], sun: ["#FFE7C4", 2.4, [-22, 34, 18]], sea: "#5DAFC0", night: 0, stars: 0, exposure: 1.05 },
  dusk:  { bg: "#E9B79A", hemi: ["#FFC9A8", "#5C5E80", 0.8], sun: ["#FF9C6B", 1.6, [30, 12, -6]], sea: "#7C93AE", night: 0.7, stars: 0.25, exposure: 1.0 },
  night: { bg: "#1C2333", hemi: ["#8FA2D6", "#1A1F2C", 0.45], sun: ["#A9BDF5", 0.55, [18, 30, -20]], sea: "#2C4560", night: 1, stars: 1, exposure: 1.15 },
};
let nightBoost = 1;
const timeFrom = {}, timeTo = {};
let timeT = 1;
function snapshotTime(o) {
  o.bg = scene.background.clone(); o.sky = hemi.color.clone(); o.ground = hemi.groundColor.clone(); o.hemiI = hemi.intensity;
  o.sun = sun.color.clone(); o.sunI = sun.intensity; o.sunP = sun.position.clone(); o.sea = seaMat.color.clone();
  o.night = o.night ?? 0; o.stars = stars.material.opacity; o.exposure = renderer.toneMappingExposure;
}
function setTime(name, instant = false) {
  const T = TIMES[name];
  state.time = name;
  snapshotTime(timeFrom);
  timeFrom.night = timeTo.night ?? 0;
  Object.assign(timeTo, {
    bg: new THREE.Color(T.bg), sky: new THREE.Color(T.hemi[0]), ground: new THREE.Color(T.hemi[1]), hemiI: T.hemi[2],
    sun: new THREE.Color(T.sun[0]), sunI: T.sun[1], sunP: new THREE.Vector3(...T.sun[2]), sea: new THREE.Color(T.sea),
    night: T.night, stars: T.stars, exposure: T.exposure,
  });
  timeT = instant || reduced ? 1 : 0;
  if (timeT === 1) applyTime(1);
  $$(".seg [data-time]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.time === name));
  app.classList.toggle("night", name === "night");
  document.body.style.background = T.bg;
}
function applyTime(k) {
  const e = k * k * (3 - 2 * k), F = timeFrom, T = timeTo;
  scene.background.copy(F.bg).lerp(T.bg, e);
  scene.fog.color.copy(scene.background);
  hemi.color.copy(F.sky).lerp(T.sky, e); hemi.groundColor.copy(F.ground).lerp(T.ground, e);
  hemi.intensity = THREE.MathUtils.lerp(F.hemiI, T.hemiI, e);
  sun.color.copy(F.sun).lerp(T.sun, e); sun.intensity = THREE.MathUtils.lerp(F.sunI, T.sunI, e);
  sun.position.copy(F.sunP).lerp(T.sunP, e);
  seaMat.color.copy(F.sea).lerp(T.sea, e);
  stars.material.opacity = THREE.MathUtils.lerp(F.stars, T.stars, e);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(F.exposure, T.exposure, e);
  const n = THREE.MathUtils.lerp(F.night, T.night, e);
  nightBoost = 1 + n * 7;
  glowMats.forEach((m) => { m.emissiveIntensity = m.userData.base * nightBoost; });
  bridgeObjs.forEach(({ tube }) => { tube.material.emissiveIntensity = 0.15 + n * 0.6; });
}
$$(".seg [data-time]").forEach((b) => b.addEventListener("click", () => setTime(b.dataset.time)));

// ---------- toggles ----------
function setToggle(key, on) {
  state[key] = on;
  $(`.tg[data-toggle="${key}"]`).setAttribute("aria-pressed", on);
  if (key === "names") $("#labels").classList.toggle("off", !on);
  if (key === "bridges") bridgeGroup.visible = on;
  if (key === "freeze") state.frozen = on;
}
$$(".tg").forEach((b) => b.addEventListener("click", () => setToggle(b.dataset.toggle, b.getAttribute("aria-pressed") !== "true")));
if (reduced) setToggle("freeze", true);

// ---------- camera moves ----------
const tween = { active: false };
function overviewPose() {
  // the archipelago is ~38 units wide; back off far enough to fit it in narrow viewports
  const aspect = innerWidth / innerHeight;
  const d = Math.min(130, Math.max(55, 21 / (Math.tan(THREE.MathUtils.degToRad(19)) * aspect)));
  return { target: new THREE.Vector3(0, 0, 1.5), pos: new THREE.Vector3(0, d * 0.72, d * 0.78) };
}
function flyTo(target, pos, ms = 1100) {
  if (reduced) ms = 0;
  Object.assign(tween, { active: ms > 0, t0: performance.now(), ms, fromT: controls.target.clone(), fromP: camera.position.clone(), toT: target, toP: pos });
  if (!ms) { controls.target.copy(target); camera.position.copy(pos); }
}
function stepTween(now) {
  if (!tween.active) return;
  const k = Math.min(1, (now - tween.t0) / tween.ms), e = 1 - Math.pow(1 - k, 3);
  controls.target.lerpVectors(tween.fromT, tween.toT, e);
  camera.position.lerpVectors(tween.fromP, tween.toP, e);
  if (k >= 1) tween.active = false;
}

function select(id, { fly = true } = {}) {
  const d = byId[id];
  if (!d) return;
  state.selected = id;
  state.lastInput = performance.now();
  app.classList.add("focused");
  renderCard(d);
  renderTree();
  $$("#dock button").forEach((b) => b.classList.toggle("active", b.dataset.id === id));
  labels.forEach((l) => l.el.classList.toggle("dim", l.d.id !== id));
  $("#mascot-text").textContent = `ψ-bot · ${d.title}${d.papers.length ? ` — ${d.papers.length} papers on this island` : " — welcome to the harbour"}`;
  history.replaceState(null, "", "#" + id);
  if (phone()) setSidebar(false);
  if (fly) {
    const c = islandObjs[id].center;
    const away = camera.position.clone().sub(controls.target).setY(0);
    if (away.lengthSq() < 1) away.set(0, 0, 1);
    away.normalize();
    // on phones the card is a bottom sheet, so aim past the island to lift it into the top half
    const target = new THREE.Vector3(c.x, TOP + 0.8, c.z).addScaledVector(away, phone() ? 6.5 : 0);
    const dist = phone() ? 24 : 16;
    flyTo(target, target.clone().addScaledVector(away, dist * 0.78).setY(TOP + dist * 0.62));
  }
}
function clearSelection() {
  state.selected = null;
  $("#card").hidden = true;
  app.classList.remove("focused");
  $$("#dock button").forEach((b) => b.classList.remove("active"));
  labels.forEach((l) => l.el.classList.remove("dim"));
  $("#mascot-text").textContent = "ψ-bot · tap an island to start";
  history.replaceState(null, "", location.pathname + location.search);
  renderTree();
}
function home() {
  clearSelection();
  const p = overviewPose();
  flyTo(p.target, p.pos);
}
$("#home").addEventListener("click", home);
$("#card-close").addEventListener("click", home);
addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#intro").hidden) closeIntro();
  else if (state.selected) home();
});

// ---------- picking ----------
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
const pickables = Object.values(islandObjs).flatMap((o) => o.pick);
let downAt = null;
function islandAt(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  return ray.intersectObjects(pickables, false)[0]?.object.userData.island ?? null;
}
renderer.domElement.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; state.lastInput = performance.now(); tween.active = false; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  const id = islandAt(e);
  if (id) select(id);
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  const id = islandAt(e);
  state.hover = id;
  renderer.domElement.style.cursor = id ? "pointer" : "grab";
});
renderer.domElement.addEventListener("wheel", () => { state.lastInput = performance.now(); }, { passive: true });

// ---------- layout: keep the scene centred in the uncovered area ----------
let shift = 0;
function occludedShift() {
  if (phone()) return 0;
  const left = !$("#card").hidden ? 452 : 0;
  const right = app.classList.contains("side-closed") ? 0 : 360 + 32;
  return (left - right) / 2;
}
function resize() {
  renderer.setSize(innerWidth, innerHeight);
  applyView();
}
function applyView() {
  const w = innerWidth, h = innerHeight, a = Math.abs(shift);
  const W = w + 2 * a;
  camera.aspect = W / h;
  camera.setViewOffset(W, h, shift < 0 ? 2 * a : 0, 0, w, h);
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);

// ---------- loop ----------
const clock = new THREE.Clock();
let simT = 0;
const v = new THREE.Vector3();
function frame() {
  const now = performance.now();
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!state.frozen) simT += dt;
  const t = simT;

  if (timeT < 1) { timeT = Math.min(1, timeT + dt / 1.2); applyTime(timeT); }

  // sea swell
  if (!state.frozen) {
    const p = seaGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = seaBase[i * 3], z = seaBase[i * 3 + 2];
      p.setY(i, Math.sin(x * 0.18 + t * 0.9) * 0.14 + Math.cos(z * 0.22 + t * 0.7) * 0.12);
    }
    p.needsUpdate = true;
    seaGeo.computeVertexNormals();
    animators.forEach((f) => f(t));
  }

  // hover lift
  for (const [id, o] of Object.entries(islandObjs)) {
    const goal = id === state.hover || id === state.selected ? 0.35 : 0;
    o.lift += (goal - o.lift) * Math.min(1, dt * 8);
    o.group.position.y = o.lift + (state.frozen ? 0 : Math.sin(t * 0.8 + o.center.x * 0.3) * 0.05);
  }

  // bridge runners
  bridgeObjs.forEach(({ b, curve, tube, runners }) => {
    const lit = !state.selected || b.a === state.selected || b.b === state.selected;
    tube.material.opacity += ((lit ? 0.8 : 0.18) - tube.material.opacity) * Math.min(1, dt * 6);
    runners.forEach((m) => {
      m.visible = lit;
      const u = (t * 0.12 + m.userData.offset) % 1;
      curve.getPoint(u, m.position);
    });
  });

  // keep the view centred in the free area
  const goalShift = occludedShift();
  if (Math.abs(goalShift - shift) > 0.5) { shift += (goalShift - shift) * Math.min(1, dt * 6); applyView(); }

  // idle drift on the overview
  controls.autoRotate = !state.frozen && !state.selected && !tween.active && now - state.lastInput > 9000;
  stepTween(now);
  controls.update();

  // labels
  if (state.names) {
    const W = innerWidth, H = innerHeight;
    for (const l of labels) {
      v.copy(l.anchor);
      v.y += islandObjs[l.d.id].lift;
      v.project(camera);
      const vis = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      l.el.style.visibility = vis ? "visible" : "hidden";
      if (vis) l.el.style.transform = `translate(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * H}px) translate(-50%, -50%)`;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---------- start ----------
resize();
setTime(matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day", true);
const start = overviewPose();
camera.position.copy(start.pos).multiplyScalar(1.35);
controls.target.copy(start.target);
flyTo(start.target, start.pos, 1800);
requestAnimationFrame(frame);
requestAnimationFrame(() => {
  $("#loading").classList.add("done");
  const initial = location.hash.slice(1);
  if (byId[initial]) setTimeout(() => select(initial), 400);
  else if (!store.get("kao-island-intro")) setTimeout(() => showIntro(0), 900);
});
addEventListener("hashchange", () => { const id = location.hash.slice(1); if (byId[id] && id !== state.selected) select(id); });
