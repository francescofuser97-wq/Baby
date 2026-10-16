"use strict";
(function () {
  const VERSION = "1.0.0";
  const app = document.getElementById("app");
  const sheet = document.getElementById("sheet");
  const sheetBackdrop = document.getElementById("sheetBackdrop");
  const DAY = 864e5;

  /* ---------------- Storage (solo su questo dispositivo) ---------------- */
  const S = {
    get(k, d) { try { const v = localStorage.getItem("pp." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("pp." + k, JSON.stringify(v)); } catch (e) { toast("Non riesco a salvare su questo dispositivo"); } }
  };
  const KEYS = ["settings", "foods", "favs", "ready", "done", "myEvents"];
  let settings = S.get("settings", null);
  let foods = S.get("foods", {});
  let favs = S.get("favs", {});
  let ready = S.get("ready", {});
  let done = S.get("done", {});
  let myEvents = S.get("myEvents", []);
  const ui = { rAge: "ora", rCat: "tutte", rSeason: false, rFav: false, rQ: "", aArea: "tutte", aAll: false, playTab: "giochi", evTab: "prossimi", fQ: "", openCats: {} };

  /* ---------------- Utility ---------------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const parseISO = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const daysBetween = (a, b) => Math.round((b - a) / DAY);
  function addMonths(d, n) {
    const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(d.getDate(), last));
    return r;
  }
  const fmt = (d, o) => d.toLocaleDateString("it-IT", o || { day: "numeric", month: "long" });
  const dayN = () => { const t = today0(); return Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY); };
  const pick = (arr, salt) => arr.length ? arr[(dayN() + (salt || 0)) % arr.length] : null;
  const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
  function season(d) {
    const m = (d || new Date()).getMonth();
    return m <= 1 || m === 11 ? "inverno" : m <= 4 ? "primavera" : m <= 7 ? "estate" : "autunno";
  }

  function age() {
    if (!settings || !settings.birth) return null;
    const b = parseISO(settings.birth), t = today0();
    if (b > t) return null;
    let m = (t.getFullYear() - b.getFullYear()) * 12 + t.getMonth() - b.getMonth();
    if (addMonths(b, m) > t) m--;
    const d = daysBetween(addMonths(b, m), t);
    const total = daysBetween(b, t);
    return { m, d, total, w: Math.floor(total / 7), birth: b, six: addMonths(b, 6) };
  }
  const ageM = () => { const a = age(); return a ? a.m : 6; };
  const name = () => (settings && settings.name ? esc(settings.name) : "Il tuo bimbo");
  function ageText(a) {
    if (!a) return "";
    if (a.m === 0) return plural(a.d, "giorno", "giorni");
    return plural(a.m, "mese", "mesi") + (a.d ? " e " + plural(a.d, "giorno", "giorni") : "");
  }

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  const mapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  /* ---------------- Sheet (pannello dal basso) ---------------- */
  function openSheet(html) {
    sheet.innerHTML = html; sheet.hidden = false; sheetBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    const f = sheet.querySelector("[autofocus]"); if (f) setTimeout(() => f.focus(), 50);
  }
  function closeSheet() {
    sheet.hidden = true; sheetBackdrop.hidden = true; sheet.innerHTML = ""; document.body.style.overflow = "";
  }
  sheetBackdrop.addEventListener("click", closeSheet);

  /* ---------------- Install (Android / iPhone) ---------------- */
  let deferredPrompt = null;
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; if (/oggi|impostazioni/.test(location.hash) || !location.hash) render(true); });
  window.addEventListener("appinstalled", () => { deferredPrompt = null; toast("App installata! 🎉"); });

  function installCard(force) {
    if (isStandalone()) return force ? `<div class="card tint-green"><b>✅ L'app è installata.</b></div>` : "";
    if (!force && S.get("installDismissed", false)) return "";
    let body;
    if (deferredPrompt) {
      body = `<p>Aggiungi Piccoli Passi alla schermata Home: si aprirà come un'app e funzionerà anche senza internet.</p>
        <div class="btn-row"><button class="btn" data-act="install">📲 Installa l'app</button>${force ? "" : `<button class="btn ghost" data-act="dismiss-install">Più tardi</button>`}</div>`;
    } else if (isIOS) {
      body = `<p><b>Su iPhone (Safari):</b> tocca il pulsante <b>Condividi</b> <span aria-hidden="true">⬆️</span> in basso, poi <b>«Aggiungi alla schermata Home»</b>.</p>
        ${force ? "" : `<button class="btn ghost small" data-act="dismiss-install">Ok, capito</button>`}`;
    } else {
      body = `<p><b>Su Android (Chrome):</b> apri il menu <b>⋮</b> in alto a destra e scegli <b>«Installa app»</b> o <b>«Aggiungi a schermata Home»</b>.</p>
        <p><b>Su iPhone (Safari):</b> pulsante <b>Condividi</b> ⬆️ → <b>«Aggiungi alla schermata Home»</b>.</p>
        ${force ? "" : `<button class="btn ghost small" data-act="dismiss-install">Ok, capito</button>`}`;
    }
    return `<div class="card tint-blue"><div class="card-kicker">📲 Installa sul telefono</div>${body}</div>`;
  }

  /* ---------------- Router ---------------- */
  const TITLES = { oggi: "Piccoli Passi", ricette: "Ricette", ricetta: "Ricetta", guida: "Guida allo svezzamento", sezione: "Guida", diario: "Diario dei cibi", giochi: "Giochi e crescita", attivita: "Gioco", eventi: "Eventi e luoghi", impostazioni: "Impostazioni" };
  const PARENT = { ricetta: "#/ricette", sezione: "#/guida", diario: "#/guida", attivita: "#/giochi", impostazioni: "#/oggi" };
  const TAB_OF = { ricetta: "ricette", sezione: "guida", diario: "guida", attivita: "giochi" };

  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, "");
    const [view, id] = h.split("/");
    return { view: view || "oggi", id: id ? decodeURIComponent(id) : null };
  }

  function viewHtml(r) {
    if (!settings) return viewWelcome();
    switch (r.view) {
      case "ricette": return viewRecipes();
      case "ricetta": return viewRecipe(r.id);
      case "guida": return viewGuide();
      case "sezione": return viewSection(r.id);
      case "diario": return viewDiary();
      case "giochi": return viewPlay();
      case "attivita": return viewActivity(r.id);
      case "eventi": return viewEvents();
      case "impostazioni": return viewSettings();
      default: return viewToday();
    }
  }

  // Aggiorna solo l'elenco dei risultati (serve per non chiudere la tastiera mentre si cerca)
  function renderResults() {
    const cur = app.querySelector("#results");
    if (!cur) return render(true);
    const tmp = document.createElement("div");
    tmp.innerHTML = viewHtml(parseRoute());
    const next = tmp.querySelector("#results");
    if (next) cur.replaceWith(next);
  }

  function render(keepScroll) {
    const r = parseRoute();
    const y = window.scrollY;
    app.innerHTML = viewHtml(r);
    const tab = TAB_OF[r.view] || r.view;
    document.querySelectorAll(".tabbar a").forEach(a => a.classList.toggle("on", settings != null && a.dataset.tab === tab));
    document.querySelector(".tabbar").hidden = !settings;
    document.getElementById("topTitle").textContent = TITLES[r.view] || "Piccoli Passi";
    document.getElementById("btnBack").hidden = !PARENT[r.view] || !settings;
    document.getElementById("brand").querySelector("img").hidden = !!PARENT[r.view];
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }

  document.getElementById("btnBack").addEventListener("click", () => {
    const r = parseRoute();
    if (sessionStorage.getItem("pp.nav")) history.back();
    else location.hash = PARENT[r.view] || "#/oggi";
  });
  window.addEventListener("hashchange", () => { sessionStorage.setItem("pp.nav", "1"); closeSheet(); render(false); });
  window.addEventListener("scroll", () => document.querySelector(".topbar").classList.toggle("scrolled", window.scrollY > 4), { passive: true });

  /* ---------------- Benvenuto ---------------- */
  function viewWelcome() {
    return `<div class="welcome">
      <img src="icons/icon.svg" alt="">
      <h1>Benvenuti in Piccoli Passi</h1>
      <p class="muted">Ricette e consigli per lo svezzamento, giochi per ogni età ed eventi a misura di bebè intorno a Montecchio Maggiore.</p>
    </div>
    <form class="card" id="welcomeForm">
      <label class="field"><span>Come si chiama il tuo bimbo?</span><input type="text" name="name" autocomplete="off" placeholder="Nome (facoltativo)"></label>
      <label class="field"><span>Quando è nato?</span><input type="date" name="birth" required max="${iso(today0())}"></label>
      <button class="btn block" type="submit">Iniziamo 🌱</button>
      <p class="small muted center" style="margin-top:12px">I dati restano solo su questo telefono.</p>
    </form>`;
  }

  /* ---------------- Oggi ---------------- */
  function phase(m) {
    if (m < 6) return { e: "🌱", t: "Quasi pronti per lo svezzamento", d: "Osserva i segnali di prontezza e parlane col pediatra al bilancio dei 6 mesi. Nel frattempo fallo sedere a tavola con voi: guardarvi mangiare è già una scoperta.", link: "#/sezione/quando" };
    if (m < 7) return { e: "🥄", t: "Primi assaggi", d: "Un pasto al giorno, consistenze lisce o morbidissime e qualche pezzo da esplorare con le mani. Introduci gli allergeni uno alla volta.", link: "#/sezione/misto" };
    if (m < 9) return { e: "🍴", t: "Nuove consistenze", d: "Schiaccia con la forchetta invece di frullare, aggiungi la cena e offri tanti pezzi morbidi.", link: "#/sezione/pezzi" };
    if (m < 12) return { e: "🍽️", t: "A tavola con la famiglia", d: "Tre pasti e uno o due spuntini, pezzetti piccoli da prendere con la pinza, i vostri stessi piatti senza sale.", link: "#/sezione/pezzi" };
    return { e: "👨‍👩‍👦", t: "Mangia con tutti", d: "Ora può mangiare quasi tutto ciò che mangiate voi, sempre con poco sale. Il latte vaccino può diventare una bevanda.", link: "#/guida" };
  }

  function recipesForAge(m) { return RECIPES.filter(r => r.m <= Math.max(6, m)); }
  function activitiesForAge(m) { return ACTIVITIES.filter(a => a.min <= m && a.max >= m); }
  function tipsForAge(m) { const mm = Math.max(4, m); return TIPS.filter(t => t.min <= mm && t.max >= mm); }

  function upcomingEvents() {
    const t = today0();
    const official = EVENTS.filter(e => e.start).map(e => Object.assign({ mine: false }, e));
    const mine = myEvents.map(e => Object.assign({ mine: true, e: "⭐" }, e));
    return official.concat(mine)
      .filter(e => e.start && parseISO(e.end || e.start) >= t)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  function viewToday() {
    const a = age();
    const m = ageM();
    const ph = phase(m);
    let progress = "";
    if (a && a.m < 6) {
      const left = daysBetween(today0(), a.six);
      const pct = Math.min(100, Math.round(a.total / daysBetween(a.birth, a.six) * 100));
      progress = `<div class="progress" aria-hidden="true"><i style="width:${pct}%"></i></div>
        <div class="small"><b>${left === 0 ? "Oggi compie 6 mesi! 🎉" : "Mancano " + plural(left, "giorno", "giorni") + " ai 6 mesi"}</b> · ${fmt(a.six)}</div>`;
    }
    const tip = pick(tipsForAge(m), 0);
    const recPool = recipesForAge(m);
    const seasonal = recPool.filter(r => !r.seasons.length || r.seasons.includes(season()));
    const rec = pick(seasonal.length ? seasonal : recPool, 3);
    const act = pick(activitiesForAge(m), 7);
    const evs = upcomingEvents().slice(0, 3);
    const tried = Object.keys(foods).length;
    const alDone = KEY_ALLERGENS.filter(k => allergenIntroduced(k)).length;

    let readiness = "";
    if (m < 7) {
      const nDone = READINESS.filter(x => ready[x.id]).length;
      readiness = `<div class="card">
        <div class="card-kicker">✅ È pronto? ${nDone}/${READINESS.length}</div>
        ${READINESS.map(x => `<label class="check"><input type="checkbox" data-act="ready" data-id="${x.id}" ${ready[x.id] ? "checked" : ""}><span>${esc(x.t)}</span></label>`).join("")}
        ${nDone === READINESS.length ? `<div class="note" style="margin-bottom:0">🎉 Sembra proprio pronto! Inizia con la <a href="#/ricetta/prima-pappa">prima pappa</a> e un bastoncino morbido da esplorare.</div>` : ""}
      </div>`;
    }

    return `
      <section class="hero">
        <div class="hello">Ciao! 👋</div>
        <h1>${name()} ha ${ageText(a)}</h1>
        <div class="small muted">${a ? plural(a.w, "settimana", "settimane") + " · nato il " + fmt(a.birth, { day: "numeric", month: "long", year: "numeric" }) : ""}</div>
        ${progress}
      </section>

      <a class="card tint-green" href="${ph.link}">
        <div class="card-kicker">${ph.e} Fase attuale</div>
        <h3>${ph.t}</h3>
        <p class="small">${ph.d}</p>
      </a>

      ${readiness}

      ${tip ? `<div class="card tint-yellow"><div class="card-kicker">💡 Consiglio del giorno · ${esc(tip.cat)}</div><p>${esc(tip.t)}</p></div>` : ""}

      ${installCard(false)}

      <div class="section-title"><h2>${m < 6 ? "Ricetta da provare presto" : "Ricetta del giorno"}</h2><a href="#/ricette">Tutte ›</a></div>
      ${rec ? recipeCard(rec) : ""}

      <div class="section-title"><h2>Gioco del giorno</h2><a href="#/giochi">Tutti ›</a></div>
      ${act ? activityCard(act) : ""}

      <div class="section-title"><h2>Prossimi eventi</h2><a href="#/eventi">Tutti ›</a></div>
      ${evs.length ? evs.map(eventMini).join("") : `<div class="card muted small">Nessun evento in calendario: dai un'occhiata ai <a href="#/eventi">luoghi e servizi</a>.</div>`}

      <div class="section-title"><h2>Diario dei cibi</h2><a href="#/diario">Apri ›</a></div>
      <a class="card list-card" href="#/diario">
        <div class="big-emoji">📒</div>
        <div class="grow"><h3>${plural(tried, "cibo provato", "cibi provati")}</h3>
        <div class="meta">Allergeni introdotti: ${alDone}/${KEY_ALLERGENS.length}</div></div>
      </a>
      <p class="disclaimer">Le informazioni di questa app non sostituiscono il parere del pediatra.</p>`;
  }

  /* ---------------- Ricette ---------------- */
  function allergenTags(al) {
    return al.map(k => ALLERGENS[k] ? `<span class="tag al">${ALLERGENS[k].e} ${ALLERGENS[k].n}</span>` : "").join("");
  }
  function recipeCard(r) {
    const fav = favs["r:" + r.id];
    return `<a class="card list-card" href="#/ricetta/${r.id}">
      <div class="big-emoji">${r.e}</div>
      <div class="grow"><h3>${esc(r.t)}</h3>
        <div class="meta">dai ${r.m} mesi · ${r.min} min · ${RECIPE_CATS[r.cat]}${fav ? " · ❤️" : ""}</div>
        ${r.al.length ? `<div>${allergenTags(r.al)}</div>` : ""}
      </div></a>`;
  }

  function viewRecipes() {
    const m = ageM();
    const s = season();
    let list = RECIPES.slice();
    if (ui.rAge === "ora") list = recipesForAge(m);
    else if (ui.rAge === "6") list = list.filter(r => r.m <= 6);
    else if (ui.rAge === "7-8") list = list.filter(r => r.m >= 7 && r.m <= 8);
    else if (ui.rAge === "9") list = list.filter(r => r.m >= 9);
    if (ui.rCat !== "tutte") list = list.filter(r => r.cat === ui.rCat);
    if (ui.rSeason) list = list.filter(r => !r.seasons.length || r.seasons.includes(s));
    if (ui.rFav) list = list.filter(r => favs["r:" + r.id]);
    if (ui.rQ) {
      const q = ui.rQ.toLowerCase();
      list = list.filter(r => (r.t + " " + r.ing.join(" ")).toLowerCase().includes(q));
    }
    const chip = (key, val, label) => `<button class="chip ${ui[key] === val ? "on" : ""}" data-act="set" data-k="${key}" data-v="${val}">${label}</button>`;
    const toggle = (key, label) => `<button class="chip ${ui[key] ? "on" : ""}" data-act="toggle" data-k="${key}">${label}</button>`;
    return `
      <input class="search" type="search" placeholder="Cerca per nome o ingrediente (es. zucca)" value="${esc(ui.rQ)}" data-input="rQ" aria-label="Cerca ricette">
      <div class="chips">
        ${chip("rAge", "ora", m < 6 ? "Per iniziare" : "Adatte ora")}${chip("rAge", "6", "6 mesi")}${chip("rAge", "7-8", "7-8 mesi")}${chip("rAge", "9", "9+ mesi")}${chip("rAge", "tutte", "Tutte le età")}
      </div>
      <div class="chips">
        ${toggle("rSeason", "🍂 Di stagione")}${toggle("rFav", "❤️ Preferite")}
        ${chip("rCat", "tutte", "Tutti i tipi")}${Object.keys(RECIPE_CATS).map(k => chip("rCat", k, RECIPE_CATS[k])).join("")}
      </div>
      <div id="results">
      <p class="small muted">${plural(list.length, "ricetta", "ricette")} · ogni ricetta ha la versione <b>pappa</b> 🥄 e quella <b>a pezzi</b> ✋</p>
      ${list.map(recipeCard).join("") || `<div class="empty"><b>🥣</b>Nessuna ricetta con questi filtri.</div>`}
      </div>
      <p class="disclaimer">Le quantità sono indicative: segui l'appetito del bambino e le indicazioni del pediatra.</p>`;
  }

  function viewRecipe(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return `<div class="empty"><b>🤔</b>Ricetta non trovata. <a href="#/ricette">Torna alle ricette</a></div>`;
    const fav = favs["r:" + r.id];
    const m = ageM();
    return `
      <div class="article-hero">
        <div class="emoji">${r.e}</div>
        <h1>${esc(r.t)}</h1>
        <div><span class="tag green">dai ${r.m} mesi</span><span class="tag">⏱ ${r.min} min</span><span class="tag">${RECIPE_CATS[r.cat]}</span>${r.seasons.length ? `<span class="tag peach">🍂 ${r.seasons.join(", ")}</span>` : ""}</div>
        ${r.al.length ? `<div style="margin-top:6px">${allergenTags(r.al)}</div>` : ""}
        <div class="btn-row" style="justify-content:center"><button class="btn ghost small" data-act="fav" data-id="r:${r.id}">${fav ? "❤️ Nei preferiti" : "🤍 Aggiungi ai preferiti"}</button></div>
      </div>
      ${r.m > m && m >= 6 ? `<div class="note">Questa ricetta è pensata dai ${r.m} mesi: tienila per più avanti.</div>` : ""}
      <div class="card"><h2>🛒 Ingredienti</h2><ul>${r.ing.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>
      <div class="card"><h2>👩‍🍳 Preparazione</h2><ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>
      <div class="card tint-peach"><div class="card-kicker">🥄 Versione pappa</div><p>${esc(r.pappa)}</p></div>
      <div class="card tint-green"><div class="card-kicker">✋ Versione a pezzi</div><p>${esc(r.pezzi)}</p></div>
      <div class="card tint-yellow"><div class="card-kicker">💡 Consiglio</div><p>${esc(r.tip)}</p></div>
      <div class="card"><div class="card-kicker">🧊 Conservazione</div><p>${esc(r.store)}</p></div>
      ${r.al.length ? `<div class="card small">Contiene allergeni: se è la prima volta, offrine poco, a pranzo, e osserva il bimbo. <a href="#/sezione/allergeni">Come introdurre gli allergeni ›</a></div>` : ""}
      <p class="disclaimer">Niente sale, zucchero o miele nel primo anno. Le quantità sono indicative.</p>`;
  }

  /* ---------------- Guida ---------------- */
  function viewGuide() {
    const tried = Object.keys(foods).length;
    return `
      <a class="card list-card tint-green" href="#/diario">
        <div class="big-emoji">📒</div>
        <div class="grow"><h3>Diario dei cibi e allergeni</h3><div class="meta">${plural(tried, "cibo provato", "cibi provati")} · segna assaggi e reazioni</div></div>
      </a>
      <div class="section-title"><h2>Svezzamento passo passo</h2></div>
      ${GUIDE.map(g => `<a class="card list-card" href="#/sezione/${g.id}">
        <div class="big-emoji">${g.e}</div>
        <div class="grow"><h3>${esc(g.t)}</h3><div class="meta">${esc(g.sub)}</div></div></a>`).join("")}
      <div class="card tint-blue small">
        <div class="card-kicker">📚 Fonti</div>
        Le indicazioni seguono le raccomandazioni di OMS, Ministero della Salute, Società Italiana di Pediatria ed ESPGHAN (società europea di gastroenterologia e nutrizione pediatrica).
        Ogni bambino è diverso: confrontati sempre con il tuo pediatra.
      </div>`;
  }

  function viewSection(id) {
    const i = GUIDE.findIndex(x => x.id === id);
    if (i < 0) return `<div class="empty"><b>🤔</b>Sezione non trovata. <a href="#/guida">Torna alla guida</a></div>`;
    const g = GUIDE[i], next = GUIDE[i + 1];
    let extra = "";
    if (g.id === "quando") {
      const a = age();
      if (a && a.m < 6) extra = `<div class="note">${name()} compirà 6 mesi il <b>${fmt(a.six)}</b>.</div>`;
    }
    return `
      <div class="article-hero"><div class="emoji">${g.e}</div><h1>${esc(g.t)}</h1><p class="muted">${esc(g.sub)}</p></div>
      ${extra}
      <div class="card prose">${g.html}</div>
      ${next ? `<a class="card list-card" href="#/sezione/${next.id}"><div class="big-emoji">${next.e}</div><div class="grow"><div class="meta">Prossima sezione</div><h3>${esc(next.t)}</h3></div><span class="muted">›</span></a>` : ""}
      <p class="disclaimer">Queste indicazioni non sostituiscono il parere del pediatra.</p>`;
  }

  /* ---------------- Diario ---------------- */
  const REACT = { si: ["😋", "Gli piace"], meh: ["😐", "Così così"], no: ["🙅", "Rifiutato"], reaz: ["⚠️", "Reazione"] };
  function allergenIntroduced(k) { return FOODS.some(f => f.al === k && foods[f.id]); }

  function viewDiary() {
    const tried = Object.keys(foods).length;
    const q = ui.fQ.toLowerCase();
    const groups = FOOD_CATS.map(c => {
      let items = FOODS.filter(f => f.cat === c.id);
      if (q) items = items.filter(f => f.n.toLowerCase().includes(q));
      if (!items.length) return "";
      const n = items.filter(f => foods[f.id]).length;
      return `<details class="group" ${q || ui.openCats[c.id] ? "open" : ""} data-cat="${c.id}">
        <summary><span>${c.e} ${c.n}</span><span class="small muted" style="margin-left:auto;margin-right:8px">${n}/${items.length}</span></summary>
        ${items.map(f => {
          const e = foods[f.id];
          return `<button class="food" data-act="food" data-id="${f.id}">
            <span class="st">${e ? REACT[e.r || "si"][0] : "⚪"}</span>
            <span class="grow">${esc(f.n)} ${f.al ? `<span class="tag al">${ALLERGENS[f.al].e}</span>` : ""}
              ${e ? `<span class="d">· ${fmt(parseISO(e.date), { day: "numeric", month: "short" })}${e.n > 1 ? " · " + e.n + " assaggi" : ""}</span>` : ""}</span>
            <span class="muted">›</span></button>`;
        }).join("")}
      </details>`;
    }).join("");
    const reactions = FOODS.filter(f => foods[f.id] && foods[f.id].r === "reaz");
    return `
      <div class="card tint-green">
        <div class="card-kicker">📒 Il diario di ${name()}</div>
        <h2 style="margin:0">${plural(tried, "cibo provato", "cibi provati")}</h2>
        <div class="allergen-grid">
          ${KEY_ALLERGENS.map(k => `<div class="allergen ${allergenIntroduced(k) ? "on" : ""}"><b>${ALLERGENS[k].e}</b>${ALLERGENS[k].n}</div>`).join("")}
        </div>
        <p class="small" style="margin:10px 0 0">I riquadri colorati sono gli allergeni già introdotti. <a href="#/sezione/allergeni">Come introdurli ›</a></p>
      </div>
      ${reactions.length ? `<div class="card" style="background:var(--danger-soft);border-color:transparent"><b>⚠️ Reazioni segnate:</b> ${reactions.map(f => esc(f.n)).join(", ")}. Parlane con il pediatra.</div>` : ""}
      <input class="search" type="search" placeholder="Cerca un cibo" value="${esc(ui.fQ)}" data-input="fQ" aria-label="Cerca un cibo">
      <div id="results">${groups || `<div class="empty"><b>🔎</b>Nessun cibo trovato.</div>`}</div>
      <p class="small muted center">Tocca un cibo per segnare quando l'ha assaggiato e come è andata.</p>`;
  }

  function openFood(id) {
    const f = FOODS.find(x => x.id === id); if (!f) return;
    const e = foods[id] || { date: iso(today0()), r: "si", note: "", n: 1 };
    openSheet(`
      <h2>${esc(f.n)} ${f.al ? `<span class="tag al">${ALLERGENS[f.al].e} ${ALLERGENS[f.al].n}</span>` : ""}</h2>
      <form id="foodForm" data-id="${id}">
        <label class="field"><span>Primo assaggio</span><input type="date" name="date" value="${e.date}" max="${iso(today0())}" required></label>
        <div class="field" style="font-weight:600;margin-bottom:6px">Com'è andata?</div>
        <div class="react-row">
          ${Object.keys(REACT).map(k => `<button type="button" class="${e.r === k ? "on" : ""}" data-act="react" data-r="${k}">${REACT[k][0]} ${REACT[k][1]}</button>`).join("")}
        </div>
        <input type="hidden" name="r" value="${e.r}">
        <div class="counter"><span style="font-weight:600">Assaggi</span>
          <button type="button" data-act="cnt" data-d="-1" aria-label="Meno">−</button><b id="cnt">${e.n || 1}</b><button type="button" data-act="cnt" data-d="1" aria-label="Più">+</button>
          <span class="small muted">possono servirne 8-15</span></div>
        <input type="hidden" name="n" value="${e.n || 1}">
        <label class="field"><span>Note</span><textarea name="note" placeholder="Es. preferisce a pezzi, un po' di rossore intorno alla bocca…">${esc(e.note)}</textarea></label>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button>
          ${foods[id] ? `<button class="btn danger" type="button" data-act="food-del" data-id="${id}">Rimuovi</button>` : ""}
          <button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }

  /* ---------------- Giochi ---------------- */
  function activityCard(a) {
    const ar = AREAS[a.area];
    const isDone = done[a.id] === iso(today0());
    return `<a class="card list-card" href="#/attivita/${a.id}">
      <div class="big-emoji">${a.e}</div>
      <div class="grow"><h3>${esc(a.t)}</h3>
        <div class="meta">${a.min}-${a.max} mesi · ${esc(a.dur)}${favs["a:" + a.id] ? " · ❤️" : ""}${isDone ? " · ✅ fatto oggi" : ""}</div>
        <span class="tag ${ar.c}">${ar.e} ${ar.n}</span></div></a>`;
  }

  function viewPlay() {
    const m = ageM();
    const seg = (v, label) => `<button class="${ui.playTab === v ? "on" : ""}" data-act="set" data-k="playTab" data-v="${v}">${label}</button>`;
    let body = "";
    if (ui.playTab === "giochi") {
      let list = ui.aAll ? ACTIVITIES.slice().sort((x, y) => x.min - y.min) : activitiesForAge(m);
      if (ui.aArea === "preferiti") list = list.filter(a => favs["a:" + a.id]);
      else if (ui.aArea !== "tutte") list = list.filter(a => a.area === ui.aArea);
      const todays = pick(activitiesForAge(m), 7);
      body = `
        <div class="chips">
          <button class="chip ${!ui.aAll ? "on" : ""}" data-act="set-bool" data-k="aAll" data-v="0">Adatti ora</button>
          <button class="chip ${ui.aAll ? "on" : ""}" data-act="set-bool" data-k="aAll" data-v="1">Tutte le età</button>
          <button class="chip ${ui.aArea === "preferiti" ? "on" : ""}" data-act="set" data-k="aArea" data-v="preferiti">❤️ Preferiti</button>
        </div>
        <div class="chips">
          <button class="chip ${ui.aArea === "tutte" ? "on" : ""}" data-act="set" data-k="aArea" data-v="tutte">Tutte le aree</button>
          ${Object.keys(AREAS).map(k => `<button class="chip ${ui.aArea === k ? "on" : ""}" data-act="set" data-k="aArea" data-v="${k}">${AREAS[k].e} ${AREAS[k].n}</button>`).join("")}
        </div>
        ${todays && !ui.aAll && ui.aArea === "tutte" ? `<div class="card-kicker" style="margin:6px 2px">⭐ Gioco del giorno</div>${activityCard(todays)}<div class="card-kicker" style="margin:14px 2px 6px">Tutti i giochi per questa età</div>` : ""}
        ${list.filter(a => ui.aAll || ui.aArea !== "tutte" || a !== todays).map(activityCard).join("") || `<div class="empty"><b>🧸</b>Nessun gioco con questi filtri.</div>`}`;
    } else if (ui.playTab === "tappe") {
      const cur = MILESTONES.find(x => m >= x.min && m < x.max) || MILESTONES[0];
      body = `<p class="small muted">Sono indicazioni medie: ogni bambino ha i suoi tempi, e anche alcune settimane o mesi di differenza sono normali. Se qualcosa ti preoccupa, parlane con il pediatra.</p>
        ${MILESTONES.map(x => `<div class="card ${x === cur ? "tint-green" : ""}">
          <div class="card-kicker">${x === cur ? "📍 Questa età · " : ""}${x.t}</div>
          <ul>${x.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}`;
    } else {
      const list = tipsForAge(m);
      const first = pick(list, 0);
      const ordered = first ? [first].concat(list.filter(t => t !== first)) : list;
      body = ordered.map((t, i) => `<div class="card ${i === 0 ? "tint-yellow" : ""}"><div class="card-kicker">${i === 0 ? "💡 Oggi · " : ""}${esc(t.cat)}</div><p>${esc(t.t)}</p></div>`).join("");
    }
    return `
      <div class="hero" style="padding:16px 18px">
        <div class="hello">${name()} · ${ageText(age())}</div>
        <p class="small" style="margin:4px 0 0">Bastano pochi minuti al giorno: il gioco più bello per un bimbo sei tu, a terra con lui.</p>
      </div>
      <div class="segmented">${seg("giochi", "🧸 Giochi")}${seg("tappe", "🌱 Tappe")}${seg("consigli", "💡 Consigli")}</div>
      ${body}`;
  }

  function viewActivity(id) {
    const a = ACTIVITIES.find(x => x.id === id);
    if (!a) return `<div class="empty"><b>🤔</b>Gioco non trovato. <a href="#/giochi">Torna ai giochi</a></div>`;
    const ar = AREAS[a.area];
    const fav = favs["a:" + a.id];
    const isDone = done[a.id] === iso(today0());
    return `
      <div class="article-hero"><div class="emoji">${a.e}</div><h1>${esc(a.t)}</h1>
        <div><span class="tag ${ar.c}">${ar.e} ${ar.n}</span><span class="tag green">${a.min}-${a.max} mesi</span><span class="tag">⏱ ${esc(a.dur)}</span></div>
        <div class="btn-row" style="justify-content:center">
          <button class="btn ${isDone ? "ghost" : ""} small" data-act="done" data-id="${a.id}">${isDone ? "✅ Fatto oggi" : "✔️ Segna come fatto"}</button>
          <button class="btn ghost small" data-act="fav" data-id="a:${a.id}">${fav ? "❤️ Preferito" : "🤍 Preferito"}</button>
        </div></div>
      <div class="card"><h2>🧺 Cosa serve</h2><ul>${a.mat.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>
      <div class="card"><h2>🎈 Come si fa</h2><ol class="steps">${a.how.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>
      <div class="card tint-blue"><div class="card-kicker">🌱 Perché fa bene</div><p>${esc(a.why)}</p></div>
      ${a.safe ? `<div class="card" style="background:var(--danger-soft);border-color:transparent"><div class="card-kicker">🛡️ Sicurezza</div><p>${esc(a.safe)}</p></div>` : ""}`;
  }

  /* ---------------- Eventi ---------------- */
  const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  function eventCard(ev) {
    const d = ev.start ? parseISO(ev.start) : null;
    let when = "";
    if (d) {
      when = fmt(d, { weekday: "long", day: "numeric", month: "long" });
      if (ev.end && ev.end !== ev.start) when = "dal " + fmt(d) + " al " + fmt(parseISO(ev.end), { day: "numeric", month: "long", year: "numeric" });
      if (ev.time) when += " · " + esc(ev.time);
    } else when = esc(ev.when || "Data da confermare");
    const place = [ev.place, ev.town].filter(Boolean).map(esc).join(", ");
    return `<div class="card"><div class="ev">
      ${d ? `<div class="datebox"><b>${d.getDate()}</b><small>${MONTHS[d.getMonth()]}</small></div>` : `<div class="datebox tbd">${ev.e || "📅"}</div>`}
      <div class="grow" style="min-width:0">
        <h3>${d ? (ev.e || "") + " " : ""}${esc(ev.t)}</h3>
        <div class="where">${when}${place ? "<br>📍 " + place : ""}${ev.km != null && ev.km !== "" ? " · " + (ev.km ? "~" + ev.km + " km" : "in paese") : ""}</div>
        ${ev.age ? `<span class="tag green">👶 ${esc(ev.age)}</span>` : ""}${ev.mine ? `<span class="tag purple">Aggiunto da te</span>` : ""}${ev.status ? `<span class="tag ${ev.status === "confermato" ? "green" : "yellow"}">${esc(ev.status)}</span>` : ""}
        ${ev.desc ? `<p class="small" style="margin:8px 0 0">${esc(ev.desc)}</p>` : ""}
        <div class="btn-row">
          ${ev.link ? `<a class="btn ghost small" href="${esc(ev.link)}" target="_blank" rel="noopener">🔗 Sito</a>` : ""}
          ${ev.q || place ? `<a class="btn ghost small" href="${mapsUrl(ev.q || place)}" target="_blank" rel="noopener">🗺️ Mappa</a>` : ""}
          ${d ? `<button class="btn ghost small" data-act="ics" data-id="${esc(ev.id)}">📅 Calendario</button>` : ""}
          ${ev.mine ? `<button class="btn danger small" data-act="ev-del" data-id="${esc(ev.id)}">Elimina</button>` : ""}
        </div>
      </div></div></div>`;
  }

  function eventMini(ev) {
    const d = parseISO(ev.start);
    const when = ev.end && ev.end !== ev.start ? "fino al " + fmt(parseISO(ev.end)) : fmt(d, { weekday: "long" }) + (ev.time ? " · " + esc(ev.time) : "");
    return `<a class="card list-card" href="#/eventi">
      <div class="datebox"><b>${d.getDate()}</b><small>${MONTHS[d.getMonth()]}</small></div>
      <div class="grow"><h3>${esc(ev.t)}</h3><div class="meta">${when}${ev.town || ev.place ? " · 📍 " + esc(ev.town || ev.place) : ""}</div></div></a>`;
  }

  function placeCard(p) {
    return `<div class="card"><div class="row" style="align-items:flex-start">
      <div class="big-emoji">${p.e}</div>
      <div class="grow"><h3 style="margin:0 0 2px">${esc(p.t)}</h3>
        <div class="small muted">${esc(p.addr)}${p.km ? " · ~" + p.km + " km" : ""}</div>
        <span class="tag">${esc(p.cat)}</span>
        <p class="small" style="margin:8px 0 0">${esc(p.desc)}</p>
        <div class="btn-row">
          ${p.tel ? `<a class="btn ghost small" href="tel:${p.tel.replace(/\s/g, "")}">📞 ${esc(p.tel)}</a>` : ""}
          <a class="btn ghost small" href="${mapsUrl(p.q || p.addr)}" target="_blank" rel="noopener">🗺️ Mappa</a>
          ${p.link ? `<a class="btn ghost small" href="${esc(p.link)}" target="_blank" rel="noopener">🔗 Sito</a>` : ""}
        </div></div></div></div>`;
  }

  function viewEvents() {
    const seg = (v, label) => `<button class="${ui.evTab === v ? "on" : ""}" data-act="set" data-k="evTab" data-v="${v}">${label}</button>`;
    let body = "";
    if (ui.evTab === "prossimi") {
      const up = upcomingEvents();
      const tbd = EVENTS.filter(e => !e.start);
      body = `
        <div class="note small">📌 Elenco aggiornato al ${fmt(parseISO(EVENTS_UPDATED), { day: "numeric", month: "long", year: "numeric" })}. Prima di andare <b>controlla sempre date e orari sul sito dell'organizzatore</b>.</div>
        ${up.map(eventCard).join("") || `<div class="empty"><b>📅</b>Nessun evento in arrivo con data certa.</div>`}
        ${tbd.length ? `<div class="section-title"><h2>In arrivo, date da confermare</h2></div>${tbd.map(eventCard).join("")}` : ""}
        <button class="btn ghost block" data-act="ev-add" style="margin-top:8px">➕ Aggiungi un evento che hai trovato</button>`;
    } else if (ui.evTab === "luoghi") {
      body = `<p class="small muted">Servizi, piscine, passeggiate e luoghi a misura di passeggino vicino a Montecchio Maggiore.</p>${PLACES.map(placeCard).join("")}`;
    } else {
      body = `<div class="card"><h2>🔎 Dove trovare nuovi eventi</h2>
        <p class="small muted">Questi siti pubblicano spesso iniziative per famiglie. Quando ne trovi una adatta, aggiungila con «➕» nella scheda Prossimi.</p>
        <ul>${EVENT_SOURCES.map(s => `<li><a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join("")}</ul></div>
        <div class="card tint-yellow small"><b>Consiglio:</b> chiedi in biblioteca e al consultorio se ci sono gruppi «mamme e bebè», letture per 0-3 anni o incontri sul massaggio neonatale. Spesso non sono pubblicizzati online.</div>`;
    }
    return `<div class="segmented">${seg("prossimi", "📅 Prossimi")}${seg("luoghi", "📍 Luoghi")}${seg("fonti", "🔎 Fonti")}</div>${body}`;
  }

  function icsFor(ev) {
    const d = s => s.replace(/-/g, "");
    const escI = s => String(s || "").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
    const endEx = iso(addDays(parseISO(ev.end || ev.start), 1));
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Piccoli Passi//IT", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + ev.id + "@piccolipassi", "DTSTAMP:" + stamp, "DTSTART;VALUE=DATE:" + d(ev.start), "DTEND;VALUE=DATE:" + d(endEx),
      "SUMMARY:" + escI(ev.t), "LOCATION:" + escI([ev.place, ev.town].filter(Boolean).join(", ")),
      "DESCRIPTION:" + escI([ev.time, ev.desc, ev.link].filter(Boolean).join("\n")), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }

  function openAddEvent() {
    openSheet(`<h2>➕ Nuovo evento</h2>
      <form id="evForm">
        <label class="field"><span>Titolo</span><input type="text" name="t" required autofocus placeholder="Es. Letture per piccolissimi"></label>
        <label class="field"><span>Data</span><input type="date" name="start" required value="${iso(today0())}"></label>
        <label class="field"><span>Orario (facoltativo)</span><input type="text" name="time" placeholder="Es. 10:30"></label>
        <label class="field"><span>Luogo</span><input type="text" name="place" placeholder="Es. Biblioteca, Arzignano"></label>
        <label class="field"><span>Link (facoltativo)</span><input type="url" name="link" placeholder="https://"></label>
        <label class="field"><span>Note</span><textarea name="desc"></textarea></label>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button><button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }

  /* ---------------- Impostazioni ---------------- */
  function viewSettings() {
    return `
      <form class="card" id="settingsForm">
        <h2>👶 Il tuo bimbo</h2>
        <label class="field"><span>Nome</span><input type="text" name="name" value="${esc(settings.name || "")}" autocomplete="off"></label>
        <label class="field"><span>Data di nascita</span><input type="date" name="birth" value="${esc(settings.birth || "")}" max="${iso(today0())}" required></label>
        <button class="btn" type="submit">Salva</button>
      </form>
      ${installCard(true)}
      <div class="card">
        <h2>💾 Backup e condivisione</h2>
        <p class="small">Diario, preferiti ed eventi sono salvati <b>solo su questo telefono</b>. Per passarli all'altro genitore o a un telefono nuovo: <b>esporta</b> il file, mandalo (per esempio su WhatsApp o per email) e <b>importalo</b> sull'altro telefono.</p>
        <div class="btn-row">
          <button class="btn ghost" data-act="export">⬇️ Esporta</button>
          <label class="btn ghost" style="cursor:pointer">⬆️ Importa<input type="file" accept="application/json,.json" data-act="import" hidden></label>
        </div>
      </div>
      <div class="card">
        <h2>ℹ️ Informazioni</h2>
        <p class="small">Piccoli Passi raccoglie indicazioni basate sulle raccomandazioni di OMS, Ministero della Salute, Società Italiana di Pediatria, ESPGHAN e del programma Nati per Leggere. <b>Non sostituisce il parere del pediatra</b>: per ogni dubbio sulla salute o sull'alimentazione del tuo bambino, rivolgiti a lui.</p>
        <p class="small"><b>In emergenza chiama il 112.</b></p>
        <p class="small muted">Versione ${VERSION}</p>
        <button class="btn danger small" data-act="reset">🗑️ Cancella tutti i dati</button>
      </div>`;
  }

  /* ---------------- Eventi UI ---------------- */
  document.addEventListener("click", async e => {
    const t = e.target.closest("[data-act]");
    if (!t || t.tagName === "INPUT" && t.type === "file") return;
    const act = t.dataset.act;
    switch (act) {
      case "set": ui[t.dataset.k] = t.dataset.v; render(true); break;
      case "set-bool": ui[t.dataset.k] = t.dataset.v === "1"; render(true); break;
      case "toggle": ui[t.dataset.k] = !ui[t.dataset.k]; render(true); break;
      case "fav": {
        e.preventDefault();
        const id = t.dataset.id;
        if (favs[id]) delete favs[id]; else favs[id] = true;
        S.set("favs", favs); toast(favs[id] ? "Aggiunto ai preferiti ❤️" : "Tolto dai preferiti"); render(true); break;
      }
      case "done": {
        const id = t.dataset.id, d = iso(today0());
        if (done[id] === d) delete done[id]; else { done[id] = d; toast("Bravissimi! 🎉"); }
        S.set("done", done); render(true); break;
      }
      case "ready": ready[t.dataset.id] = t.checked; S.set("ready", ready); render(true); break;
      case "food": openFood(t.dataset.id); break;
      case "react": {
        sheet.querySelectorAll(".react-row button").forEach(b => b.classList.toggle("on", b === t));
        sheet.querySelector("[name=r]").value = t.dataset.r; break;
      }
      case "cnt": {
        const inp = sheet.querySelector("[name=n]");
        const v = Math.max(1, Math.min(99, Number(inp.value) + Number(t.dataset.d)));
        inp.value = v; sheet.querySelector("#cnt").textContent = v; break;
      }
      case "food-del": delete foods[t.dataset.id]; S.set("foods", foods); closeSheet(); render(true); break;
      case "close": closeSheet(); break;
      case "install":
        if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; render(true); }
        break;
      case "dismiss-install": S.set("installDismissed", true); render(true); break;
      case "ics": {
        const ev = upcomingEvents().find(x => x.id === t.dataset.id) || EVENTS.find(x => x.id === t.dataset.id);
        if (ev) download(ev.id + ".ics", icsFor(ev), "text/calendar;charset=utf-8");
        break;
      }
      case "ev-add": openAddEvent(); break;
      case "ev-del":
        if (confirm("Eliminare questo evento?")) { myEvents = myEvents.filter(x => x.id !== t.dataset.id); S.set("myEvents", myEvents); render(true); }
        break;
      case "export": {
        const data = { app: "piccoli-passi", v: 1, exported: new Date().toISOString() };
        KEYS.forEach(k => { data[k] = S.get(k, null); });
        download("piccoli-passi-backup-" + iso(today0()) + ".json", JSON.stringify(data, null, 2), "application/json");
        break;
      }
      case "reset":
        if (confirm("Vuoi davvero cancellare tutti i dati (diario, preferiti, eventi)?")) {
          KEYS.concat(["installDismissed"]).forEach(k => { try { localStorage.removeItem("pp." + k); } catch (err) { /* ignore */ } });
          settings = null; foods = {}; favs = {}; ready = {}; done = {}; myEvents = [];
          location.hash = "#/oggi"; render(false);
        }
        break;
    }
  });

  document.addEventListener("input", e => {
    const k = e.target.dataset && e.target.dataset.input;
    if (!k) return;
    ui[k] = e.target.value;
    renderResults();
  });

  // Ricorda quali gruppi del diario sono aperti
  document.addEventListener("toggle", e => {
    const d = e.target;
    if (d.matches && d.matches("details.group") && !ui.fQ) ui.openCats[d.dataset.cat] = d.open;
  }, true);

  document.addEventListener("change", e => {
    if (e.target.dataset && e.target.dataset.act === "import" && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (data.app !== "piccoli-passi") throw new Error("formato");
          if (!confirm("Importare i dati? Quelli presenti su questo telefono verranno sostituiti.")) return;
          KEYS.forEach(k => { if (data[k] != null) S.set(k, data[k]); });
          settings = S.get("settings", settings); foods = S.get("foods", {}); favs = S.get("favs", {});
          ready = S.get("ready", {}); done = S.get("done", {}); myEvents = S.get("myEvents", []);
          toast("Dati importati ✅"); render(false);
        } catch (err) { toast("File non valido"); }
      };
      reader.readAsText(e.target.files[0]);
      e.target.value = "";
    }
  });

  document.addEventListener("submit", e => {
    const f = e.target;
    e.preventDefault();
    const fd = new FormData(f);
    if (f.id === "welcomeForm" || f.id === "settingsForm") {
      const birth = fd.get("birth");
      if (!birth) return;
      settings = Object.assign({}, settings || {}, { name: String(fd.get("name") || "").trim(), birth });
      S.set("settings", settings);
      if (f.id === "settingsForm") toast("Salvato ✅");
      location.hash = "#/oggi"; render(false);
    } else if (f.id === "foodForm") {
      foods[f.dataset.id] = { date: fd.get("date"), r: fd.get("r"), n: Number(fd.get("n")) || 1, note: String(fd.get("note") || "").trim() };
      S.set("foods", foods);
      closeSheet(); toast(fd.get("r") === "reaz" ? "Segnato. Se hai dubbi, senti il pediatra." : "Segnato nel diario ✅");
      render(true);
    } else if (f.id === "evForm") {
      const link = String(fd.get("link") || "").trim();
      myEvents.push({
        id: "mio-" + Date.now(), t: String(fd.get("t")).trim(), start: fd.get("start"), end: "", time: String(fd.get("time") || "").trim(),
        place: String(fd.get("place") || "").trim(), town: "", km: "", desc: String(fd.get("desc") || "").trim(),
        link: /^https?:\/\//i.test(link) ? link : ""
      });
      S.set("myEvents", myEvents); closeSheet(); toast("Evento aggiunto ⭐"); render(true);
    }
  });

  document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });

  /* ---------------- Avvio ---------------- */
  if (!location.hash) history.replaceState(null, "", "#/oggi");
  render(false);

  // Aggiorna la pagina "Oggi" se l'app resta aperta a cavallo della mezzanotte
  let lastDay = dayN();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && dayN() !== lastDay) { lastDay = dayN(); render(true); }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then(reg => {
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) toast("Nuova versione disponibile: riapri l'app per aggiornarla");
          });
        });
      }).catch(() => { /* offline non disponibile */ });
    });
  }
})();
