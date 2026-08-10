const CENTER = { x: 150, y: 150 };

// raggi di confine delle 10 zone di punteggio (10 = centro, 1 = bordo esterno)
// + raggio della X interna (mezzo raggio della zona 10)
const RING_RADII = [7, 14, 28, 42, 56, 70, 84, 98, 112, 126, 140];
const RING_SCORES = [10, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

let hits = [];

function scoreForDistance(dist) {
  for (let i = 0; i < RING_RADII.length; i++) {
    if (dist <= RING_RADII[i]) {
      return { value: RING_SCORES[i], isX: i === 0 };
    }
  }
  return null; // fuori dal bersaglio
}

function svgPointFromEvent(svg, evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return pt.matrixTransform(ctm.inverse());
}

function registraTiro(evt) {
  const svg = document.getElementById("target");
  const p = svgPointFromEvent(svg, evt);
  if (!p) return;

  const dx = p.x - CENTER.x;
  const dy = p.y - CENTER.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const result = scoreForDistance(dist);
  if (!result) return; // click fuori dal bersaglio, ignorato

  hits.push({ x: p.x, y: p.y, value: result.value, isX: result.isX });
  disegnaImpatto(p.x, p.y, result.isX);
  aggiornaStatistiche();
  notificaGenitore();
}

function disegnaImpatto(x, y, isX) {
  const impacts = document.getElementById("impacts");
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", 4.5);
  circle.setAttribute("class", isX ? "impact impact-x" : "impact");
  impacts.appendChild(circle);
}

function aggiornaStatistiche() {
  const count = hits.length;
  const total = hits.reduce((sum, h) => sum + h.value, 0);
  const avg = count ? total / count : 0;

  document.getElementById("stat-count").textContent = count;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-avg").textContent = avg.toFixed(1);

  const log = document.getElementById("hitsLog");
  log.innerHTML = "";
  hits.forEach((h) => {
    const chip = document.createElement("span");
    chip.className = "hit-chip" + (h.isX ? " chip-x" : "");
    chip.textContent = h.isX ? "X" : h.value;
    log.appendChild(chip);
  });
}

function annullaUltimo() {
  if (!hits.length) return;
  hits.pop();
  const impacts = document.getElementById("impacts");
  if (impacts.lastElementChild) {
    impacts.removeChild(impacts.lastElementChild);
  }
  aggiornaStatistiche();
  notificaGenitore();
}

function resetBersaglio() {
  hits = [];
  document.getElementById("impacts").innerHTML = "";
  aggiornaStatistiche();
  notificaGenitore();
}

function salvaBersaglio() {
  // A differenza di notificaGenitore() (che sincronizza soltanto lo stato),
  // questo chiede esplicitamente al genitore di persistere i tiri sul database.
  if (window.parent === window) return; // aperto standalone, nessun genitore
  const btn = document.getElementById("btnSalvaBersaglio");
  const status = document.getElementById("bersaglioStatus");
  if (btn) btn.disabled = true;
  if (status) {
    status.textContent = "Salvataggio…";
    status.style.color = "#888";
  }
  window.parent.postMessage({ type: "bersaglio-salva", hits }, "*");
}

// ─── Comunicazione con la pagina Segnapunti che incorpora questo widget ───

function notificaGenitore() {
  if (window.parent === window) return; // aperto standalone, nessun genitore
  window.parent.postMessage({ type: "bersaglio-hits", hits }, "*");
}

function caricaHitsSalvati(hitsSalvati) {
  hits = Array.isArray(hitsSalvati) ? hitsSalvati.slice() : [];
  document.getElementById("impacts").innerHTML = "";
  hits.forEach((h) => disegnaImpatto(h.x, h.y, h.isX));
  aggiornaStatistiche();
}

window.addEventListener("message", (evt) => {
  if (evt.data && evt.data.type === "bersaglio-load") {
    caricaHitsSalvati(evt.data.hits);
  }
  if (evt.data && evt.data.type === "bersaglio-salvato") {
    const btn = document.getElementById("btnSalvaBersaglio");
    const status = document.getElementById("bersaglioStatus");
    if (btn) btn.disabled = false;
    if (status) {
      status.textContent = "Salvato ✓";
      status.style.color = "#2ecc71";
    }
  }
  if (evt.data && evt.data.type === "bersaglio-errore-salvataggio") {
    const btn = document.getElementById("btnSalvaBersaglio");
    const status = document.getElementById("bersaglioStatus");
    if (btn) btn.disabled = false;
    if (status) {
      status.textContent = "Errore nel salvataggio";
      status.style.color = "#c0392b";
    }
  }
});

document.getElementById("target").addEventListener("click", registraTiro);
