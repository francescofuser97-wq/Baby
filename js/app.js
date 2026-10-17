"use strict";
(function () {
  const VERSION = "4.1.1";
  const app = document.getElementById("app");
  const sheet = document.getElementById("sheet");
  const sheetBackdrop = document.getElementById("sheetBackdrop");
  const DAY = 864e5;

  /* ---------------- Storage (solo su questo dispositivo) ---------------- */
  const raw = {
    get(k, d) { try { const v = localStorage.getItem("pp." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) {
      try { localStorage.setItem("pp." + k, JSON.stringify(v)); } catch (e) { toast("Non riesco a salvare su questo dispositivo"); }
      if (typeof onLocalChange === "function") onLocalChange(k);
    },
    del(k) { try { localStorage.removeItem("pp." + k); } catch (e) { /* ignore */ } }
  };
  // Dati di ogni figlio (salvati come "k.<id>.<chiave>") e dati in comune per la famiglia
  const KID_KEYS = ["foods", "ready", "done", "growth", "health", "appts", "questions"];
  const SHARED_KEYS = ["favs", "myEvents", "contacts", "evKm", "theme", "videos", "home"];
  let kids = raw.get("kids", null);
  let activeKid = raw.get("activeKid", null);
  if (!kids) {
    // Prima versione dell'app: un solo bambino. Diventa il primo profilo.
    kids = [];
    const old = raw.get("settings", null);
    if (old) {
      const id = "k1";
      kids.push(Object.assign({}, old, { id }));
      KID_KEYS.forEach(k => { const v = raw.get(k, null); if (v != null) raw.set("k." + id + "." + k, v); raw.del(k); });
      raw.del("settings");
      activeKid = id;
    }
    raw.set("kids", kids); raw.set("activeKid", activeKid);
  }
  if (!kids.some(k => k.id === activeKid)) activeKid = kids.length ? kids[0].id : null;

  const S = {
    get(k, d) {
      if (k === "settings") return kids.find(x => x.id === activeKid) || d || null;
      return raw.get(KID_KEYS.includes(k) ? "k." + activeKid + "." + k : k, d);
    },
    set(k, v) {
      if (k === "settings") {
        if (!kids.some(x => x.id === activeKid)) { activeKid = "k" + Date.now().toString(36); raw.set("activeKid", activeKid); }
        const obj = Object.assign({}, v, { id: activeKid });
        const i = kids.findIndex(x => x.id === activeKid);
        if (i >= 0) kids[i] = obj; else kids.push(obj);
        raw.set("kids", kids);
        settings = obj;
        return;
      }
      raw.set(KID_KEYS.includes(k) ? "k." + activeKid + "." + k : k, v);
    }
  };
  let settings, foods, ready, done, growth, health, appts, questions;
  function loadKid() {
    settings = S.get("settings", null);
    foods = S.get("foods", {}); ready = S.get("ready", {}); done = S.get("done", {});
    growth = S.get("growth", []); health = S.get("health", {}); appts = S.get("appts", []); questions = S.get("questions", []);
  }
  loadKid();
  let favs = S.get("favs", {});
  let myEvents = S.get("myEvents", []);
  let evKm = S.get("evKm", 50);
  let theme = S.get("theme", "auto");
  let contacts = S.get("contacts", {});
  let videos = S.get("videos", {});
  let home = S.get("home", null);
  function switchKid(id) {
    activeKid = id; raw.set("activeKid", id); loadKid();
  }
  const kidAge = k => { const keep = settings; settings = k; const a = age(); settings = keep; return a; };
  const ui = { apptScope: "kid", rAge: "ora", rCat: "tutte", rSeason: false, rFav: false, rQ: "", aArea: "tutte", aAll: false, playTab: "giochi", evTab: "prossimi", fQ: "", openCats: {}, healthTab: "agenda", gMetric: "weight" };

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
    if (a.m >= 24) { const y = Math.floor(a.m / 12), mm = a.m % 12; return plural(y, "anno", "anni") + (mm ? " e " + plural(mm, "mese", "mesi") : ""); }
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

  const segLabel = l => l.replace(/^(\S+)\s+/, '<span class="se" aria-hidden="true">$1</span>');
  const mapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  /* ---------------- Tema chiaro / scuro ---------------- */
  function applyTheme() {
    const root = document.documentElement;
    if (theme === "light" || theme === "dark") root.dataset.theme = theme; else delete root.dataset.theme;
    const dark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.setAttribute("content", dark ? "#1E1A18" : "#FFF8F1"); m.removeAttribute("media"); });
  }
  applyTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

  /* ---------------- Sheet (pannello dal basso) ---------------- */
  function openSheet(html) {
    sheet.innerHTML = html; sheet.hidden = false; sheetBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    const f = sheet.querySelector("[autofocus]"); if (f) setTimeout(() => f.focus(), 50);
  }
  function closeSheet() {
    sheet.hidden = true; sheetBackdrop.hidden = true; sheet.innerHTML = ""; document.body.style.overflow = "";
    if (pendingRender) { pendingRender = false; render(true); }
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
      body = `<p><b>Su iPhone:</b> tocca il pulsante <b>Condividi</b> <span aria-hidden="true">⬆️</span> (in Safari è in basso, in Chrome in alto a destra, nella barra dell'indirizzo), poi <b>«Aggiungi alla schermata Home»</b>.</p>
        ${force ? "" : `<button class="btn ghost small" data-act="dismiss-install">Ok, capito</button>`}`;
    } else {
      body = `<p><b>Su Android (Chrome):</b> apri il menu <b>⋮</b> in alto a destra e scegli <b>«Installa app»</b> o <b>«Aggiungi a schermata Home»</b>.</p>
        <p><b>Su iPhone (Safari o Chrome):</b> pulsante <b>Condividi</b> ⬆️ → <b>«Aggiungi alla schermata Home»</b>.</p>
        ${force ? "" : `<button class="btn ghost small" data-act="dismiss-install">Ok, capito</button>`}`;
    }
    return `<div class="card tint-blue"><div class="card-kicker">📲 Installa sul telefono</div>${body}</div>`;
  }

  /* ---------------- Router ---------------- */
  const TITLES = { oggi: "Piccoli Passi", ricette: "Ricette", ricetta: "Ricetta", guida: "Guida allo svezzamento", sezione: "Guida", diario: "Diario dei cibi", giochi: "Giochi e crescita", attivita: "Gioco", eventi: "Eventi e luoghi", impostazioni: "Impostazioni", allergeni: "Percorso allergeni", salute: "Salute", emergenze: "Emergenze", mese: "Mese per mese" };
  const PARENT = { ricetta: "#/ricette", sezione: "#/guida", diario: "#/guida", attivita: "#/giochi", impostazioni: "#/oggi", allergeni: "#/guida", emergenze: "#/salute", mese: "#/giochi" };
  const TAB_OF = { ricetta: "ricette", sezione: "guida", diario: "guida", attivita: "giochi", allergeni: "guida", emergenze: "salute", mese: "giochi" };

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
      case "allergeni": return viewAllergens();
      case "salute": return viewHealth();
      case "emergenze": return viewEmergency();
      case "mese": return viewMonth(r.id);
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
    hydratePhotos();
    const mc = app.querySelector("#monthChips"), mon = mc && mc.querySelector(".on");
    if (mon) mc.scrollLeft = mon.offsetLeft - mc.clientWidth / 2 + mon.offsetWidth / 2;
    const tab = TAB_OF[r.view] || r.view;
    document.querySelectorAll(".tabbar a").forEach(a => a.classList.toggle("on", settings != null && a.dataset.tab === tab));
    document.querySelector(".tabbar").hidden = !settings;
    const chip = document.getElementById("kidChip");
    chip.hidden = !settings;
    if (settings) {
      const n = settings.name || "Bimbo";
      chip.innerHTML = `<span class="kid-dot" style="background:${kidColor(settings.id)}">${esc(n.charAt(0).toUpperCase())}</span><span class="kid-name">${esc(n)}</span><span aria-hidden="true">▾</span>`;
      chip.setAttribute("aria-label", "Profilo: " + n + ". Cambia figlio");
    }
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

  /* ---------------- Profili dei figli ---------------- */
  const KID_COLORS = ["#D9654A", "#4E8A6E", "#3F72A8", "#7559B3", "#C0517A", "#B7860F"];
  const kidColor = id => KID_COLORS[Math.max(0, kids.findIndex(k => k.id === id)) % KID_COLORS.length];
  function kidRow(k) {
    const a = kidAge(k);
    const on = k.id === activeKid;
    return `<button class="food kid-row" data-act="kid-switch" data-id="${k.id}">
      <span class="kid-dot big" style="background:${kidColor(k.id)}">${esc((k.name || "B").charAt(0).toUpperCase())}</span>
      <span class="grow"><b>${esc(k.name || "Senza nome")}</b><br><span class="small muted">${a ? ageText(a) : ""}</span></span>
      ${on ? `<span class="tag green">attivo</span>` : `<span class="muted">›</span>`}</button>`;
  }
  function openKids() {
    openSheet(`<h2>👨‍👩‍👧‍👦 I vostri figli</h2>
      <div class="card" style="padding:0;overflow:hidden">${kids.map(kidRow).join("")}</div>
      <div class="btn-row"><button class="btn" data-act="kid-add" style="flex:1">➕ Aggiungi un figlio</button><button class="btn ghost" data-act="close">Chiudi</button></div>
      <p class="small muted" style="margin-top:12px">Diario, allergeni, crescita, agenda e domande sono separati per ogni figlio. Preferiti, eventi e numeri di emergenza sono in comune.</p>`);
  }
  function openAddKid() {
    openSheet(`<h2>➕ Nuovo figlio</h2>
      <form id="kidForm">
        <label class="field"><span>Nome</span><input type="text" name="name" autocomplete="off" required autofocus></label>
        <label class="field"><span>Data di nascita</span><input type="date" name="birth" required max="${iso(today0())}"></label>
        <label class="field"><span>Curve di crescita</span><select name="sex"><option value="m">Maschio</option><option value="f">Femmina</option></select></label>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Aggiungi</button><button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }
  document.getElementById("kidChip").addEventListener("click", openKids);

  /* ---------------- Benvenuto ---------------- */
  function viewWelcome() {
    return `<div class="welcome">
      <img src="icons/icon.svg" alt="">
      <h1>Benvenuti in Piccoli Passi</h1>
      <p class="muted">Ricette e consigli per lo svezzamento, giochi per ogni età, salute, ed eventi e servizi a misura di bebè vicino a casa tua.</p>
    </div>
    <form class="card" id="welcomeForm">
      <label class="field"><span>Come si chiama il tuo bimbo?</span><input type="text" name="name" autocomplete="off" placeholder="Nome (facoltativo)"></label>
      <label class="field"><span>Quando è nato?</span><input type="date" name="birth" required max="${iso(today0())}"></label>
      <label class="field"><span>Maschio o femmina? <small class="muted" style="display:inline;font-weight:400">(serve per le curve di crescita)</small></span><select name="sex"><option value="m">Maschio</option><option value="f">Femmina</option></select></label>
      <button class="btn block" type="submit">Iniziamo 🌱</button>
      <p class="small muted center" style="margin-top:12px">I dati restano solo su questo telefono.</p>
    </form>
    <div class="card center">
      <p class="small" style="margin-bottom:8px">Qualcuno della famiglia usa già Piccoli Passi e ti ha invitato?</p>
      <button class="btn ghost block" data-act="sync-join">👨‍👩‍👧 Ho un codice di invito</button>
    </div>`;
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

  /* ---------------- Comune, zona e distanze ---------------- */
  // Il comune scelto decide distanze, ricerche, siti e pacchetti di zona. Non c'è un comune predefinito.
  const homeOf = () => (home && home.lat != null ? home : null);
  function haversine(a, b) {
    const R = 6371, rad = x => x * Math.PI / 180;
    const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  // Pacchetti di zona (js/areas/*.js) che coprono il comune scelto
  function nearPacks() {
    const h = homeOf();
    return h ? (window.AREA_PACKS || []).filter(p => haversine([h.lat, h.lon], p.center) <= p.radiusKm) : [];
  }
  const isLocalArea = () => nearPacks().length > 0;
  const packList = k => nearPacks().reduce((all, p) => all.concat(p[k] || []), []);
  const areaUpdated = () => nearPacks().map(p => p.updated).filter(Boolean).sort()[0] || null;
  const allTowns = () => Object.assign({}, ...(window.AREA_PACKS || []).map(p => p.towns || {}));
  function coordsOf(x) {
    if (x.lat != null && x.lon != null) return [Number(x.lat), Number(x.lon)];
    const towns = allTowns(), txt = [x.town, x.addr, x.place].filter(Boolean).join(" ");
    const t = Object.keys(towns).find(name => txt.includes(name));
    return t ? towns[t] : null;
  }
  // Distanza indicativa su strada (linea d'aria × 1,2) dal comune scelto
  function distKm(x) {
    const c = coordsOf(x), h = homeOf();
    return c && h ? Math.round(haversine([h.lat, h.lon], c) * 1.2) : null;
  }
  const kmLabel = d => (d == null ? "" : d < 3 ? "vicino a te" : "~" + d + " km");
  const withinKm = e => { const d = distKm(e); return evKm === 0 || d == null || d <= evKm; };
  const homeWhere = () => (homeOf() ? homeOf().name : "me");          // per le ricerche «vicino a …»
  function homePrompt(text) {
    return `<button class="card list-card tint-blue" data-act="home-open"><div class="big-emoji">📍</div><div class="grow"><h3>Imposta il tuo comune</h3><div class="meta">${text}</div></div><span class="muted">›</span></button>`;
  }
  const googleUrl = q => "https://www.google.com/search?q=" + encodeURIComponent(q);
  function myAsl() {
    const h = homeOf();
    if (!h) return null;
    const a = (window.aslFor ? aslFor(h) : null) || { name: "la vostra azienda sanitaria (ASL)", certain: false, site: null };
    return Object.assign({}, a, { site: a.site || (a.certain && h.aslSite) || null });
  }
  const domainOf = url => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };

  // Scheda dell'azienda sanitaria del comune scelto, con le ricerche già pronte
  function aslCard() {
    const a = myAsl(), h = homeOf();
    if (!a) return homePrompt("Così l'app trova la vostra azienda sanitaria (ASL), il consultorio e i servizi vicini.");
    const n = a.certain ? a.name : "ASL " + h.name;
    const rows = [
      ["🌐", a.site ? "Sito ufficiale · " + domainOf(a.site) : "Sito ufficiale", a.site || googleUrl(n + " sito ufficiale")],
      ["🤱", "Consultorio familiare", mapsUrl("consultorio familiare vicino a " + h.name)],
      ["💉", "Vaccinazioni pediatriche", googleUrl(n + " vaccinazioni pediatriche " + h.name)],
      ["🌙", "Guardia medica (continuità assistenziale)", googleUrl("guardia medica " + h.name + " numero telefono")],
      ["📞", "CUP – prenotazioni", googleUrl(n + " CUP prenotazioni numero")],
      ["🍼", "Corsi e incontri per neogenitori", googleUrl(n + " incontri neogenitori svezzamento massaggio neonatale")]
    ];
    return `<div class="card"><div class="card-kicker">🏥 La vostra azienda sanitaria</div>
      <h3 style="margin:0 0 4px">${esc(a.name)}</h3>
      <p class="small muted" style="margin:0 0 6px">In base al comune: ${esc(h.name)}${a.certain ? "" : ". In questa zona ci sono più aziende: verifica qual è la vostra (la trovi sulla tessera sanitaria o chiedendo al pediatra)"}.</p>
      ${rows.map(([e, t, u]) => `<a class="food" href="${u}" target="_blank" rel="noopener"><span class="st">${e}</span><span class="grow">${esc(t)}</span><span class="muted">›</span></a>`).join("")}</div>`;
  }

  // Scheda del Comune scelto: sito ufficiale (da Wikidata) e ricerche sul sito
  function comuneCard() {
    const h = homeOf();
    if (!h) return "";
    const d = domainOf(h.site || ""), on = q => d ? googleUrl("site:" + d + " " + q) : googleUrl("Comune di " + h.name + " " + q);
    const rows = [
      ["🏛️", h.site ? "Sito del Comune · " + d : "Sito del Comune", h.site || googleUrl("Comune di " + h.name + " sito ufficiale")],
      ["🎈", "Eventi e iniziative per famiglie", on("eventi bambini famiglie")],
      ["📚", "Biblioteca comunale", on("biblioteca")],
      ["🏫", "Asilo nido e servizi 0-3 anni", on("asilo nido iscrizioni")],
      ["💶", "Bonus e contributi per le famiglie", on("contributi famiglie bambini bonus")],
      ["🩺", "Pediatri della zona", googleUrl("pediatri libera scelta " + h.name)]
    ];
    return `<div class="card"><div class="card-kicker">🏛️ Il Comune di ${esc(h.name)}</div>
      ${rows.map(([e, t, u]) => `<a class="food" href="${u}" target="_blank" rel="noopener"><span class="st">${e}</span><span class="grow">${esc(t)}</span><span class="muted">›</span></a>`).join("")}
      ${h.site ? "" : `<p class="small muted" style="margin:8px 0 0">${h.enriched ? "Non ho trovato in automatico il sito del Comune: uso le ricerche." : "Cerco il sito del Comune…"}</p>`}</div>`;
  }

  // Notizie automatiche sugli eventi della zona (tramite il servizio Google della famiglia)
  /* ---------------- Eventi automatici per qualsiasi comune ---------------- */
  // Fonte: Google News. Lo legge il servizio (centrale o di famiglia) se c'è; altrimenti due servizi pubblici
  // gratuiti che rendono il feed leggibile dal browser. In ogni caso parte solo il nome del comune.
  const newsServiceUrl = () => (window.PP_CONFIG && PP_CONFIG.serviceUrl) || (raw.get("sync", null) || {}).url || "";
  const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const EVENT_WORDS = /spettacol|teatr|laborator|lettur|letture|fiab|burattin|festa|feste|sagra|mercatin|concert|event|animazion|giochi|gioco|famigli|bambin|piccol|carneval|natale|befana|halloween|museo|mostra|bibliotec|circo|parco|weekend|domenica|sabato|cinema|musical|caccia al tesoro|presepe|luminarie/i;
  const NOT_EVENT = /incident|mort[oaie]\b|muore|decess|arrest|rapin|omicid|violenz|indagin|ferit|tragedi|polizia|carabinier|incendi|maltempo|allerta|furto|truff|processo|sentenz|denunc|sequestr|annegat|aggress|schianto|scontro|lutto|funerale|ricoverat/i;
  const normTxt = str => String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘`´]/g, "'");
  function feedQueries() {
    const h = homeOf(), m = today0().getMonth(), c = '"' + h.name + '"';
    const q = [c + " bambini (spettacolo OR laboratorio OR letture OR festa OR evento) when:21d",
      c + " famiglie (weekend OR domenica OR sabato) eventi when:14d",
      c + " biblioteca bambini when:45d"];
    if (m >= 10) q.push(c + " Natale bambini mercatini when:30d");
    else if (m <= 1) q.push(c + " Carnevale bambini when:30d");
    return q;
  }
  const parseNewsDate = d => { if (!d) return 0; const x = Date.parse(d); if (!isNaN(x)) return x; const y = Date.parse(String(d).replace(" ", "T") + "Z"); return isNaN(y) ? 0 : y; };
  function parseRss(xml) {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    return Array.from(doc.querySelectorAll("item")).map(it => ({
      t: (it.querySelector("title") || {}).textContent, l: (it.querySelector("link") || {}).textContent,
      d: (it.querySelector("pubDate") || {}).textContent, s: (it.querySelector("source") || {}).textContent || "",
      x: (it.querySelector("description") || {}).textContent || ""
    }));
  }
  async function fetchTimeout(url, opts, ms) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), ms || 9000);
    try { return await fetch(url, Object.assign({}, opts, { signal: ctl.signal })); } finally { clearTimeout(tm); }
  }
  async function fetchNews(queries) {
    const svc = newsServiceUrl();
    if (svc) {
      try {
        const res = await fetchTimeout(svc, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "news", q: queries }) }, 20000);
        const data = await res.json();
        // se il servizio non è riuscito a leggere Google News (errors e nessuna notizia) si prova con i lettori pubblici
        if (data && Array.isArray(data.items) && (data.items.length || !data.errors)) return { items: data.items, via: "servizio" };
      } catch (e) { /* si passa ai servizi pubblici */ }
    }
    const all = [];
    let via = "";
    for (const q of queries.slice(0, 4)) {
      const rss = "https://news.google.com/rss/search?q=" + encodeURIComponent(q) + "&hl=it&gl=IT&ceid=IT:it";
      let items = null;
      try {
        const j = await (await fetchTimeout("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rss))).json();
        if (j && j.status === "ok" && Array.isArray(j.items)) { items = j.items.map(i => ({ t: i.title, l: i.link, d: i.pubDate, s: i.author || "", x: i.description || "" })); via = via || "rss2json"; }
      } catch (e) { /* provo il secondo */ }
      if (!items) {
        try { items = parseRss(await (await fetchTimeout("https://api.allorigins.win/raw?url=" + encodeURIComponent(rss))).text()); via = via || "allorigins"; } catch (e) { /* niente */ }
      }
      if (items) all.push(...items);
    }
    if (!via) throw new Error("nessuna fonte raggiungibile");
    return { items: all, via };
  }
  // Data dell'evento ricavata dal testo: «sabato 25 ottobre», «dal 7 al 9 novembre», «25/10», «sabato e domenica».
  // Con strict i giorni della settimana da soli non bastano (servono per il titolo, non per il riassunto).
  function eventDateFrom(text, pubMs, strict) {
    const t = normTxt(text), pub = new Date(pubMs || Date.now());
    const base = new Date(pub.getFullYear(), pub.getMonth(), pub.getDate());
    const mesiN = MESI.map(normTxt), mesi = mesiN.join("|");
    const mk = (d, mo) => {
      let dt = new Date(pub.getFullYear(), mo, d);
      if (dt < addDays(base, -45)) dt = new Date(pub.getFullYear() + 1, mo, d);
      return dt;
    };
    const ok = d => d >= 1 && d <= 31;
    let m = t.match(new RegExp("\\b(\\d{1,2})°?\\s+(" + mesi + ")\\s*(?:al|-|–|fino al)\\s*(\\d{1,2})°?\\s+(" + mesi + ")\\b"));
    if (m && ok(+m[1]) && ok(+m[3])) {
      const st = mk(+m[1], mesiN.indexOf(m[2])); let en = new Date(st.getFullYear(), mesiN.indexOf(m[4]), +m[3]);
      if (en < st) en = new Date(st.getFullYear() + 1, en.getMonth(), en.getDate());
      return { start: iso(st), end: iso(en) };
    }
    m = t.match(new RegExp("\\b(\\d{1,2})°?(?:\\s*(?:e|al|-|–)\\s*(\\d{1,2}))?\\s+(" + mesi + ")\\b"));
    if (m && ok(+m[1])) {
      const mo = mesiN.indexOf(m[3]), a = +m[1], b = m[2] ? +m[2] : null, st = mk(a, mo);
      return { start: iso(st), end: b && b > a && b <= 31 ? iso(new Date(st.getFullYear(), mo, b)) : "" };
    }
    m = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b(?!\s*(?:anni|mesi|a\b))/);
    if (m && +m[2] >= 1 && +m[2] <= 12 && ok(+m[1])) return { start: iso(mk(+m[1], +m[2] - 1)), end: "" };
    if (strict) return null;
    const days = GIORNI.map(normTxt).map((g, wd) => new RegExp("\\b" + g + "\\b").test(t) ? addDays(base, (wd - base.getDay() + 7) % 7) : null).filter(Boolean)
      .concat(/\bweekend|fine settimana\b/.test(t) ? [6, 0].map(wd => addDays(base, (wd - base.getDay() + 7) % 7)) : []).sort((x, y) => x - y);
    if (!days.length) return null;
    const last = days[days.length - 1];
    return { start: iso(days[0]), end: daysBetween(days[0], last) > 0 && daysBetween(days[0], last) <= 3 ? iso(last) : "" };
  }
  let feedLoading = false;
  const FEED_V = 2;
  async function loadFeed(force) {
    const h = homeOf();
    if (!h || feedLoading) return;
    const cached = raw.get("feed", null);
    if (!force && cached && cached.v === FEED_V && cached.place === h.name && Date.now() - cached.at < (cached.ok ? 6 : 1) * 3600e3) return;
    feedLoading = true;
    try {
      const { items: rawItems, via } = await fetchNews(feedQueries());
      const seen = {}, limit = Date.now() - 45 * 864e5, place = normTxt(h.name);
      const items = rawItems.map(it => {
        // Google News mette la testata in fondo al titolo («… - Il Giornale di Vicenza»)
        const full = String(it.t || "").trim(), sm = full.match(/^(.*\S)\s+-\s+([^-]+)$/);
        const t = sm ? sm[1] : full, src = String(it.s || (sm ? sm[2] : "")).trim();
        let x = String(it.x || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
        // il riassunto di Google News spesso ripete solo titolo e testata: in quel caso non serve
        const rest = normTxt(x).replace(normTxt(t), "").replace(normTxt(src), "").replace(/[^a-z0-9]+/g, "");
        if (rest.length < 25) x = "";
        return { t, l: it.l, s: src, d: parseNewsDate(it.d), x };
      }).filter(it => {
        const all = normTxt(it.t + " " + it.x), key = normTxt(it.t);
        return it.t && /^https:\/\//.test(it.l || "") && it.d > limit && all.includes(place) && EVENT_WORDS.test(it.t) && !NOT_EVENT.test(it.t)
          && !seen[key] && (seen[key] = true);
      }).map(it => Object.assign(it, { ev: eventDateFrom(it.t, it.d) || (it.x ? eventDateFrom(it.x, it.d, true) : null) }))
        .sort((a, b) => b.d - a.d).slice(0, 20);
      raw.set("feed", { v: FEED_V, place: h.name, at: Date.now(), items, ok: true, via });
    } catch (err) {
      raw.set("feed", { v: FEED_V, place: h.name, at: Date.now(), items: (cached && cached.v === FEED_V && cached.place === h.name ? cached.items : []), ok: false, err: String(err && err.message || err) });
    } finally {
      feedLoading = false;
      if (/eventi|oggi/.test(location.hash) && sheet.hidden) render(true);
    }
  }
  // Eventi con data ricavati dalle notizie (entrano nel calendario insieme agli altri)
  function newsEvents() {
    const f = raw.get("feed", null), h = homeOf();
    if (!f || !h || f.v !== FEED_V || f.place !== h.name) return [];
    return (f.items || []).filter(it => it.ev && it.ev.start).map(it => ({
      id: "n-" + hashStr(it.l), t: it.t, e: "🗞️", start: it.ev.start, end: it.ev.end || "", time: "", place: "", town: h.name, lat: h.lat, lon: h.lon,
      desc: it.x ? it.x.slice(0, 220) + (it.x.length > 220 ? "…" : "") : "", link: it.l, status: "dalla stampa locale" + (it.s ? " · " + it.s : ""), news: true
    }));
  }
  function feedCard() {
    const h = homeOf();
    if (!h) return "";
    const f = raw.get("feed", null);
    if (!f || f.v !== FEED_V || f.place !== h.name) { loadFeed(false); return `<div class="card small muted">📰 Cerco eventi e notizie per bambini a ${esc(h.name)}…</div>`; }
    loadFeed(false);
    const undated = (f.items || []).filter(it => !it.ev || !it.ev.start);
    const dated = (f.items || []).length - undated.length;
    const head = `<div class="card-kicker">📰 Altre notizie su eventi a ${esc(h.name)}</div>`;
    if (!f.items.length) return `<div class="card"><div class="card-kicker">📰 Eventi trovati in automatico</div><p class="small muted" style="margin:0">${f.ok ? "Nelle ultime settimane non ho trovato notizie su eventi per bambini a " + esc(h.name) + ". Prova le ricerche qui sotto." : "Non riesco a leggere le notizie in questo momento: controlla la connessione."}</p>
      <button class="btn ghost small" data-act="feed-reload" style="margin-top:8px">🔄 Riprova</button></div>`;
    if (!undated.length) return `<p class="small muted">📰 ${plural(dated, "evento trovato", "eventi trovati")} in automatico nelle notizie di ${esc(h.name)}: sono in calendario qui sopra.</p>`;
    return `<div class="card">${head}
      ${undated.map(it => `<a class="food" href="${esc(it.l)}" target="_blank" rel="noopener"><span class="st">🗞️</span><span class="grow">${esc(it.t)}<br><span class="small muted">${esc(it.s)}${it.d ? " · " + fmt(new Date(it.d), { day: "numeric", month: "short" }) : ""}</span></span><span class="muted">›</span></a>`).join("")}
      <p class="small muted" style="margin:8px 0 0">Trovate in automatico da Google News. Senza una data nel titolo: apri l'articolo per i dettagli e, se ti interessa, aggiungilo con «➕».</p></div>`;
  }
  const isOngoing = e => e.start && e.end && parseISO(e.start) <= today0();

  function upcomingEvents() {
    const t = today0();
    const official = packList("events").filter(e => e.start).map(e => Object.assign({ mine: false }, e));
    const mine = myEvents.map(e => Object.assign({ mine: true, e: "⭐" }, e));
    return official.concat(mine, newsEvents())
      .filter(e => e.start && parseISO(e.end || e.start) >= t && withinKm(e))
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  function healthTodayCard() {
    const t = today0(), a = age();
    const ap = appts.filter(x => parseISO(x.date) >= t).sort((x, y) => x.date.localeCompare(y.date))[0];
    if (ap && daysBetween(t, parseISO(ap.date)) <= 14) {
      const n = daysBetween(t, parseISO(ap.date));
      return `<a class="card tint-blue" href="#/salute"><div class="card-kicker">📅 Prossimo appuntamento</div><h3>${esc(ap.t || APPT_TYPES[ap.type])}</h3>
        <p class="small">${n === 0 ? "Oggi" : n === 1 ? "Domani" : "Tra " + n + " giorni"} · ${fmt(parseISO(ap.date), { weekday: "long", day: "numeric", month: "long" })}${ap.time ? " alle " + esc(ap.time) : ""}</p></a>`;
    }
    if (!a) return "";
    const items = CHECKUPS.map(c => ({ id: "c:" + c.id, t: c.t, sub: c.d, m: c.m }))
      .concat(VACCINES.map(v => ({ id: "v:" + v.id, t: "Vaccinazioni: " + v.items.join(", "), sub: v.t, m: v.m })));
    const due = items.filter(i => !health[i.id]).map(i => Object.assign(i, { due: addMonths(a.birth, i.m) }))
      .filter(i => { const d = daysBetween(t, i.due); return d <= 30 && d >= -30; }).sort((x, y) => x.due - y.due)[0];
    if (!due) return "";
    return `<a class="card tint-blue" href="#/salute"><div class="card-kicker">🩺 In arrivo</div><h3>${esc(due.t)}</h3>
      <p class="small">Intorno al ${fmt(due.due, { day: "numeric", month: "long" })}. Prenota e segnalo nell'agenda: ${esc(due.sub)}</p></a>`;
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
    if (homeOf()) loadFeed(false);
    // In "Oggi" mostra prima le novità: salta le rassegne lunghe già iniziate
    const evs = upcomingEvents().filter(e => !(isOngoing(e) && daysBetween(parseISO(e.start), parseISO(e.end)) > 3)).slice(0, 3);
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
        <div class="small muted">${a ? plural(a.w, "settimana", "settimane") + " · " + (settings.sex === "f" ? "nata" : "nato") + " il " + fmt(a.birth, { day: "numeric", month: "long", year: "numeric" }) : ""}</div>
        ${progress}
      </section>

      <a class="card tint-green" href="${ph.link}">
        <div class="card-kicker">${ph.e} Fase attuale</div>
        <h3>${ph.t}</h3>
        <p class="small">${ph.d}</p>
      </a>
      ${monthTodayCard()}

      <div class="quick">
        <a href="#/salute"><span>🩺</span>Salute</a><a href="#/allergeni"><span>⚠️</span>Allergeni</a><a href="#/emergenze"><span>🆘</span>Emergenze</a>
      </div>

      ${homeOf() ? "" : homePrompt("Eventi, servizi, sito del Comune e azienda sanitaria (ASL) della tua zona.")}
      ${healthTodayCard()}
      ${allergenTodayCard()}
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
        <figure class="dish" data-photo="r:${r.id}">${window.dishArt ? dishArt(r.id) : `<div class="emoji">${r.e}</div>`}</figure>
        <p class="small muted dish-cap" data-photo-cap="r:${r.id}">Illustrazione indicativa: colore, consistenza e forma dei pezzi</p>
        <h1>${esc(r.t)}</h1>
        <div><span class="tag green">dai ${r.m} mesi</span><span class="tag">⏱ ${r.min} min</span><span class="tag">${RECIPE_CATS[r.cat]}</span>${r.seasons.length ? `<span class="tag peach">🍂 ${r.seasons.join(", ")}</span>` : ""}</div>
        ${r.al.length ? `<div style="margin-top:6px">${allergenTags(r.al)}</div>` : ""}
        <div class="btn-row" style="justify-content:center"><button class="btn ghost small" data-act="fav" data-id="r:${r.id}">${fav ? "❤️ Nei preferiti" : "🤍 Aggiungi ai preferiti"}</button>
          <label class="btn ghost small" style="cursor:pointer">📷 La tua foto<input type="file" accept="image/*" data-act="photo" data-key="r:${r.id}" hidden></label>
          <button class="btn ghost small" data-act="photo-del" data-key="r:${r.id}" hidden>🗑️ Togli foto</button></div>
      </div>
      ${r.m > m && m >= 6 ? `<div class="note">Questa ricetta è pensata dai ${r.m} mesi: tienila per più avanti.</div>` : ""}
      <div class="card"><h2>🛒 Ingredienti</h2><ul>${r.ing.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>
      <div class="card"><h2>👩‍🍳 Preparazione</h2><ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>
      <div class="card tint-peach"><div class="card-kicker">🥄 Versione pappa</div><p>${esc(r.pappa)}</p></div>
      <div class="card tint-green"><div class="card-kicker">✋ Versione a pezzi</div><p>${esc(r.pezzi)}</p></div>
      <div class="card tint-yellow"><div class="card-kicker">💡 Consiglio</div><p>${esc(r.tip)}</p></div>
      <div class="card"><div class="card-kicker">🧊 Conservazione</div><p>${esc(r.store)}</p></div>
      ${r.al.length ? `<div class="card small">Contiene allergeni: se è la prima volta, offrine poco, a pranzo, e osserva il bimbo. <a href="#/sezione/allergeni">Come introdurre gli allergeni ›</a></div>` : ""}
      ${videoBlock("r:" + r.id, r.videos, "ricetta svezzamento " + r.t.replace(/[«»()]/g, ""))}
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
      <a class="card list-card tint-peach" href="#/allergeni">
        <div class="big-emoji">⚠️</div>
        <div class="grow"><h3>Percorso allergeni</h3><div class="meta">Il prossimo da introdurre e quelli da riproporre</div></div>
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
        <p class="small" style="margin:10px 0 0">I riquadri colorati sono gli allergeni già introdotti. <a href="#/allergeni">Percorso allergeni ›</a></p>
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
        ${foods[id] ? `<p class="small muted" style="margin-top:-8px">Ultima volta: ${fmt(parseISO(foodLast(foods[id])), { day: "numeric", month: "long" })}</p>` : ""}
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
          ${foods[id] ? `<button class="btn ghost" type="button" data-act="food-again" data-id="${id}">🔁 Offerto di nuovo oggi</button><button class="btn danger" type="button" data-act="food-del" data-id="${id}">Rimuovi</button>` : ""}
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
    const seg = (v, label) => `<button class="${ui.playTab === v ? "on" : ""}" data-act="set" data-k="playTab" data-v="${v}">${segLabel(label)}</button>`;
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
        ${list.filter(a => ui.aAll || ui.aArea !== "tutte" || a !== todays).map(activityCard).join("") || `<div class="empty"><b>🧸</b>Nessun gioco con questi filtri.${m > 24 ? " I giochi dell'app sono pensati per i primi due anni: prova «Tutte le età»." : ""}</div>`}`;
    } else if (ui.playTab === "tappe") {
      const cur = MILESTONES.find(x => m >= x.min && m < x.max) || MILESTONES[m < 4 ? 0 : MILESTONES.length - 1];
      body = `<a class="card list-card tint-purple" href="#/mese"><div class="big-emoji">📆</div><div class="grow"><h3>Mese per mese</h3><div class="meta">Cosa aspettarsi e come affrontarlo: sonno, dentini, distacchi…</div></div><span class="muted">›</span></a>
        <p class="small muted">Sono indicazioni medie: ogni bambino ha i suoi tempi, e anche alcune settimane o mesi di differenza sono normali. Se qualcosa ti preoccupa, parlane con il pediatra.</p>
        ${MILESTONES.map(x => `<div class="card ${x === cur ? "tint-green" : ""}">
          <div class="card-kicker">${x === cur ? "📍 Questa età · " : ""}${x.t}</div>
          <ul>${x.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}`;
    } else if (ui.playTab === "libri") {
      body = viewBooks(m);
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
      <div class="segmented">${seg("giochi", "🧸 Giochi")}${seg("tappe", "🌱 Tappe")}${seg("consigli", "💡 Consigli")}${seg("libri", "📚 Libri")}</div>
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
      ${a.safe ? `<div class="card" style="background:var(--danger-soft);border-color:transparent"><div class="card-kicker">🛡️ Sicurezza</div><p>${esc(a.safe)}</p></div>` : ""}
      ${videoBlock("a:" + a.id, a.videos, a.t.replace(/[«»…]/g, "") + " gioco neonato")}`;
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
      ${d ? dateBox(ev) : `<div class="datebox tbd">${ev.e || "📅"}</div>`}
      <div class="grow" style="min-width:0">
        <h3>${d ? (ev.e || "") + " " : ""}${esc(ev.t)}</h3>
        <div class="where">${when}${place ? "<br>📍 " + place : ""}${distKm(ev) != null ? " · " + kmLabel(distKm(ev)) : ""}</div>
        ${ev.age ? `<span class="tag green">👶 ${esc(ev.age)}</span>` : ""}${ev.mine ? `<span class="tag purple">Aggiunto da te</span>` : ""}${ev.status ? `<span class="tag ${ev.status === "confermato" ? "green" : "yellow"}">${esc(ev.status)}</span>` : ""}
        ${ev.desc ? `<p class="small" style="margin:8px 0 0">${esc(ev.desc)}</p>` : ""}
        <div class="btn-row">
          ${ev.link ? `<a class="btn ghost small" href="${esc(ev.link)}" target="_blank" rel="noopener">${ev.news ? "🗞️ Articolo" : "🔗 Sito"}</a>` : ""}
          ${(ev.q || place) && !ev.news ? `<a class="btn ghost small" href="${mapsUrl(ev.q || place)}" target="_blank" rel="noopener">🗺️ Mappa</a>` : ""}
          ${d ? `<button class="btn ghost small" data-act="ics" data-id="${esc(ev.id)}">📅 Calendario</button>` : ""}
          ${ev.mine ? `<button class="btn danger small" data-act="ev-del" data-id="${esc(ev.id)}">Elimina</button>` : ""}
        </div>
      </div></div></div>`;
  }

  function dateBox(ev) {
    if (isOngoing(ev)) return `<div class="datebox live"><b>●</b><small>in corso</small></div>`;
    const d = parseISO(ev.start);
    return `<div class="datebox"><b>${d.getDate()}</b><small>${MONTHS[d.getMonth()]}${d.getFullYear() !== today0().getFullYear() ? " " + String(d.getFullYear()).slice(2) : ""}</small></div>`;
  }

  function eventMini(ev) {
    const d = parseISO(ev.start);
    const when = ev.end && ev.end !== ev.start ? "fino al " + fmt(parseISO(ev.end)) : fmt(d, { weekday: "long" }) + (ev.time ? " · " + esc(ev.time) : "");
    return `<a class="card list-card" href="#/eventi">
      ${dateBox(ev)}
      <div class="grow"><h3>${esc(ev.t)}</h3><div class="meta">${when}${ev.town || ev.place ? " · 📍 " + esc(ev.town || ev.place) : ""}</div></div></a>`;
  }

  function placeCard(p) {
    return `<div class="card"><div class="row" style="align-items:flex-start">
      <div class="big-emoji">${p.e}</div>
      <div class="grow"><h3 style="margin:0 0 2px">${esc(p.t)}</h3>
        <div class="small muted">${esc(p.addr)}${distKm(p) != null ? " · " + kmLabel(distKm(p)) : ""}</div>
        <span class="tag">${esc(p.cat)}</span>
        <p class="small" style="margin:8px 0 0">${esc(p.desc)}</p>
        <div class="btn-row">
          ${p.tel ? `<a class="btn ghost small" href="tel:${p.tel.replace(/\s/g, "")}">📞 ${esc(p.tel)}</a>` : ""}
          <a class="btn ghost small" href="${mapsUrl(p.q || p.addr)}" target="_blank" rel="noopener">🗺️ Mappa</a>
          ${p.link ? `<a class="btn ghost small" href="${esc(p.link)}" target="_blank" rel="noopener">🔗 Sito</a>` : ""}
        </div></div></div></div>`;
  }

  function viewEvents() {
    const seg = (v, label) => `<button class="${ui.evTab === v ? "on" : ""}" data-act="set" data-k="evTab" data-v="${v}">${segLabel(label)}</button>`;
    const tabs = `<div class="segmented">${seg("prossimi", "📅 Prossimi")}${seg("luoghi", "📍 Luoghi")}${seg("fonti", "🔎 Fonti")}</div>`;
    const h = homeOf();
    if (!h) {
      const mine = upcomingEvents();
      return `${tabs}${homePrompt("Eventi, luoghi, servizi e azienda sanitaria della tua zona, in automatico.")}
        ${mine.length ? `<div class="section-title"><h2>I tuoi eventi</h2></div>${mine.map(eventCard).join("")}` : ""}
        <button class="btn ghost block" data-act="ev-add" style="margin-top:8px">➕ Aggiungi un evento</button>`;
    }
    const kmChips = `<div class="chips">${[[15, "Entro 15 km"], [30, "Entro 30 km"], [50, "Entro 50 km"], [0, "Tutti"]]
      .map(([v, l]) => `<button class="chip ${evKm === v ? "on" : ""}" data-act="set-km" data-v="${v}">${l}</button>`).join("")}</div>`;
    const homeLine = `<div class="home-line small">📍 Nella zona di <b>${esc(h.name)}</b> <button class="link-btn" data-act="home-open">Cambia comune</button></div>`;
    const month = today0().getMonth(), d = domainOf(h.site || "");
    const searches = [
      ["🎈", "Eventi per bambini questo weekend", googleUrl("eventi bambini " + h.name + " questo weekend")],
      d ? ["🏛️", "Eventi sul sito del Comune", googleUrl("site:" + d + " eventi")] : null,
      ["📚", "Letture per piccolissimi in biblioteca", googleUrl("biblioteca " + h.name + " letture bambini 0-3 anni")],
      ["🎭", "Teatro per famiglie", googleUrl("teatro per famiglie bambini " + (h.prov || h.name))],
      month >= 10 || month === 0 ? ["🎄", "Mercatini e Natale", googleUrl("mercatini di Natale bambini " + h.name)] : ["🌳", "Feste e sagre", googleUrl("feste sagre " + h.name)]
    ].filter(Boolean);
    const searchCard = `<div class="card"><div class="card-kicker">🔎 Cerca nella zona di ${esc(h.name)}</div>
      ${searches.map(([e, t, u]) => `<a class="food" href="${u}" target="_blank" rel="noopener"><span class="st">${e}</span><span class="grow">${esc(t)}</span><span class="muted">›</span></a>`).join("")}
      <p class="small muted" style="margin:8px 0 0">Quando trovi qualcosa di adatto, aggiungilo con «➕ Aggiungi un evento».</p></div>`;
    const local = isLocalArea(), updated = areaUpdated();
    let body = "";
    if (ui.evTab === "prossimi") {
      const up = upcomingEvents();
      const tbd = packList("events").filter(e => !e.start && withinKm(e));
      const staleDays = updated ? daysBetween(parseISO(updated), today0()) : 0;
      body = `${homeLine}
        ${local ? kmChips : ""}
        ${local ? `<div class="note small">📌 Elenco curato della zona «${esc(nearPacks()[0].name)}», aggiornato al ${fmt(parseISO(updated), { day: "numeric", month: "long", year: "numeric" })}${staleDays > 30 ? ` (<b>più di un mese fa</b>)` : ""}. Prima di andare <b>controlla sempre date e orari sul sito dell'organizzatore</b>.</div>` : ""}
        ${up.length ? `<div class="section-title"><h2>In calendario</h2></div>${up.some(e => e.news) ? `<p class="small muted" style="margin:-4px 0 10px">🗞️ = trovato in automatico nelle notizie locali: la data è letta dal titolo, controlla i dettagli nell'articolo.</p>` : ""}${up.map(eventCard).join("")}` : (local ? `<div class="empty"><b>📅</b>Nessun evento in arrivo con data certa.</div>` : "")}
        ${tbd.length ? `<div class="section-title"><h2>In arrivo, date da confermare</h2></div>${tbd.map(eventCard).join("")}` : ""}
        ${feedCard()}
        <button class="btn ghost block" data-act="ev-add" style="margin:8px 0 14px">➕ Aggiungi un evento che hai trovato</button>
        ${searchCard}`;
    } else if (ui.evTab === "luoghi") {
      const places = packList("places").filter(withinKm).sort((a, b) => (distKm(a) || 0) - (distKm(b) || 0));
      const near = [
        ["🏥", "Pronto soccorso pediatrico", mapsUrl("pronto soccorso pediatrico vicino a " + h.name)],
        ["🏊", "Piscina con acquaticità neonatale", mapsUrl("piscina acquaticità neonatale vicino a " + h.name)],
        ["🛝", "Parchi giochi", mapsUrl("parco giochi " + h.name)],
        ["📚", "Biblioteca", mapsUrl("biblioteca " + h.name)],
        ["💊", "Farmacia di turno", googleUrl("farmacia di turno " + h.name)]
      ];
      body = `${homeLine}
        ${comuneCard()}
        ${aslCard()}
        <div class="card"><div class="card-kicker">🗺️ Vicino a te, sulla mappa</div>
          ${near.map(([e, t, u]) => `<a class="food" href="${u}" target="_blank" rel="noopener"><span class="st">${e}</span><span class="grow">${esc(t)}</span><span class="muted">›</span></a>`).join("")}</div>
        ${places.length ? `<div class="section-title"><h2>Luoghi consigliati</h2></div>${kmChips}${places.map(placeCard).join("")}` : ""}`;
    } else {
      const sources = packList("sources");
      body = `${homeLine}
        <div class="card"><h2>🔎 Dove trovare nuovi eventi</h2>
        <p class="small muted">Siti che pubblicano spesso iniziative per famiglie. Quando ne trovi una adatta, aggiungila con «➕» nella scheda Prossimi.</p>
        <ul>${h.site ? `<li><a href="${esc(h.site)}" target="_blank" rel="noopener">Sito del Comune di ${esc(h.name)}</a></li>` : ""}
          <li><a href="${googleUrl("eventi bambini " + h.name)}" target="_blank" rel="noopener">Eventi per bambini a ${esc(h.name)} (ricerca)</a></li>
          <li><a href="https://www.natiperleggere.it/" target="_blank" rel="noopener">Nati per Leggere</a></li>
          ${sources.map(s => `<li><a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join("")}</ul></div>
        <div class="card tint-yellow small"><b>Consiglio:</b> chiedi in biblioteca e al consultorio se ci sono gruppi «mamme e bebè», letture per 0-3 anni o incontri sul massaggio neonatale. Spesso non sono pubblicizzati online.</div>`;
    }
    return tabs + body;
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

  /* ---------------- Allergeni: percorso guidato ---------------- */
  const foodLast = e => (e.log && e.log.length ? e.log.reduce((a, b) => (a > b ? a : b)) : e.date);
  function allergenStatus(k) {
    const items = FOODS.filter(f => f.al === k && foods[f.id]);
    if (!items.length) return null;
    const first = items.map(f => foods[f.id].date).sort()[0];
    let lastFood = items[0].id, last = foodLast(foods[items[0].id]);
    items.forEach(f => { const l = foodLast(foods[f.id]); if (l > last) { last = l; lastFood = f.id; } });
    return { first, last, lastFood, days: daysBetween(parseISO(last), today0()), reaction: items.some(f => foods[f.id].r === "reaz") };
  }
  function allergenPlan() {
    const st = ALLERGEN_PLAN.map(p => Object.assign({}, p, { s: allergenStatus(p.k) }));
    const firsts = st.filter(p => p.s).map(p => p.s.first).sort();
    const waitUntil = firsts.length ? addDays(parseISO(firsts[firsts.length - 1]), 3) : null;
    return {
      st,
      next: st.find(p => !p.s),
      canNew: !waitUntil || waitUntil <= today0(),
      waitUntil,
      due: st.filter(p => p.s && !p.s.reaction && p.s.days >= 7).sort((a, b) => b.s.days - a.s.days),
      reactions: st.filter(p => p.s && p.s.reaction)
    };
  }
  function offerToday(id) {
    const t = iso(today0());
    const e = foods[id] || { date: t, r: "si", note: "", n: 0 };
    e.log = (e.log || [e.date]).filter(Boolean);
    if (!e.log.includes(t)) e.log.push(t);
    e.log = e.log.slice(-60);
    e.n = (e.n || 0) + 1;
    foods[id] = e; S.set("foods", foods);
  }
  const daysAgo = n => (n === 0 ? "oggi" : n === 1 ? "ieri" : n + " giorni fa");

  function allergenTodayCard() {
    if (ageM() < 6) return "";
    const p = allergenPlan();
    let body;
    if (p.reactions.length) body = `<b>⚠️ Reazione segnata con ${p.reactions.map(x => ALLERGENS[x.k].n).join(", ")}.</b> Sospendi e parlane con il pediatra prima di riproporlo.`;
    else if (p.due.length) body = `<b>Da riproporre:</b> ${p.due.map(x => `${ALLERGENS[x.k].e} ${ALLERGENS[x.k].n} (${daysAgo(x.s.days)})`).join(", ")}.`;
    else if (p.next && p.canNew) body = `<b>Oggi puoi introdurre:</b> ${ALLERGENS[p.next.k].e} ${ALLERGENS[p.next.k].n}. ${esc(p.next.how)}`;
    else if (p.next) body = `Prossimo allergene, ${ALLERGENS[p.next.k].e} ${ALLERGENS[p.next.k].n}, dal <b>${fmt(p.waitUntil, { weekday: "long", day: "numeric", month: "long" })}</b>.`;
    else body = "Tutti gli allergeni principali sono introdotti e offerti con regolarità. Bravissimi! 🎉";
    return `<a class="card tint-peach" href="#/allergeni"><div class="card-kicker">⚠️ Percorso allergeni</div><p class="small">${body}</p></a>`;
  }

  function viewAllergens() {
    const m = ageM();
    const p = allergenPlan();
    const a = age();
    const introduced = p.st.filter(x => x.s).length;
    const row = x => {
      const al = ALLERGENS[x.k];
      let status, tagc, btn = "";
      if (!x.s) { status = "Da introdurre"; tagc = ""; }
      else if (x.s.reaction) { status = "Reazione segnata: senti il pediatra"; tagc = "warn"; }
      else {
        status = "Ultima volta " + daysAgo(x.s.days);
        tagc = x.s.days >= 7 ? "peach" : x.s.days >= 4 ? "yellow" : "green";
        btn = `<button class="btn ghost small" data-act="al-offer" data-food="${x.s.lastFood}">✅ Offerto oggi</button>`;
      }
      return `<div class="card"><div class="row" style="align-items:flex-start"><div class="big-emoji">${al.e}</div>
        <div class="grow"><h3 style="margin:0">${al.n}</h3>
          <span class="tag ${tagc}">${status}</span>${x.s ? `<span class="tag">dal ${fmt(parseISO(x.s.first), { day: "numeric", month: "short" })}</span>` : ""}
          <p class="small" style="margin:6px 0 0">${esc(x.how)}${x.recipe ? ` <a href="#/ricetta/${x.recipe}">Ricetta ›</a>` : ""}</p>
          ${btn ? `<div class="btn-row">${btn}</div>` : ""}</div></div></div>`;
    };
    let nextCard = "";
    if (p.next) {
      const al = ALLERGEN_PLAN.find(x => x.k === p.next.k);
      const canAct = m >= 6 && p.canNew && !p.reactions.length;
      nextCard = `<div class="card tint-green"><div class="card-kicker">👉 Prossimo da introdurre</div>
        <h2 style="margin:0 0 6px">${ALLERGENS[al.k].e} ${ALLERGENS[al.k].n}</h2>
        <p class="small">${esc(al.how)}${al.recipe ? ` <a href="#/ricetta/${al.recipe}">Ricetta ›</a>` : ""}</p>
        ${m < 6 && a ? `<p class="small"><b>Quando inizierete lo svezzamento</b> (dopo il ${fmt(a.six)}, d'accordo con il pediatra).</p>` : ""}
        ${m >= 6 && !p.canNew ? `<p class="small">Aspetta fino a <b>${fmt(p.waitUntil, { weekday: "long", day: "numeric", month: "long" })}</b>: lascia 2-3 giorni tra un allergene nuovo e il successivo.</p>` : ""}
        ${canAct ? `<button class="btn" data-act="al-intro" data-food="${al.food}">🍽️ Segna: introdotto oggi</button>` : ""}</div>`;
    }
    return `
      <div class="article-hero"><div class="emoji">⚠️</div><h1>Percorso allergeni</h1>
        <p class="muted">${introduced}/${ALLERGEN_PLAN.length} introdotti · uno alla volta, poi regolarmente</p></div>
      ${p.reactions.length ? `<div class="card" style="background:var(--danger-soft);border-color:transparent"><b>⚠️ Reazione segnata</b> con ${p.reactions.map(x => ALLERGENS[x.k].n).join(", ")}. Non riproporlo e non introdurre altri allergeni finché non ne hai parlato con il pediatra.</div>` : ""}
      ${nextCard}
      ${p.due.length ? `<div class="card tint-yellow"><div class="card-kicker">🔁 Da riproporre questa settimana</div>
        <p class="small">Per mantenere la tolleranza, ogni allergene già introdotto andrebbe offerto 1-2 volte a settimana.</p>
        ${p.due.map(x => `<div class="row" style="margin-top:8px"><div class="grow">${ALLERGENS[x.k].e} <b>${ALLERGENS[x.k].n}</b> <span class="small muted">· ${daysAgo(x.s.days)}</span></div>
          <button class="btn ghost small" data-act="al-offer" data-food="${x.s.lastFood}">✅ Offerto oggi</button></div>`).join("")}</div>` : ""}
      <div class="section-title"><h2>Tutti gli allergeni</h2></div>
      ${p.st.map(row).join("")}
      <div class="card small">
        <b>Come funziona:</b> l'ordine è un suggerimento, potete cambiarlo con il pediatra. Il nuovo allergene si offre di mattina o a pranzo, in un giorno in cui il bimbo sta bene. Le date arrivano dal <a href="#/diario">Diario dei cibi</a>.
        <a href="#/sezione/allergeni">Guida completa ›</a>
      </div>`;
  }

  /* ---------------- Salute: agenda, crescita, domande ---------------- */
  const P_Z = [[3, -1.881], [15, -1.036], [50, 0], [85, 1.036], [97, 1.881]];
  const METRICS = { weight: { n: "Peso", u: "kg", k: "w", dec: 2 }, length: { n: "Lunghezza", u: "cm", k: "l", dec: 1 }, head: { n: "Circonferenza della testa", u: "cm", k: "h", dec: 1 } };
  const sexKey = () => (settings && settings.sex === "f" ? "girls" : "boys");
  function lmsAt(metric, months) {
    if (months < 0 || months > 24) return null;
    const tab = GROWTH[sexKey()][metric];
    const i = Math.min(23, Math.floor(months)), f = months - i;
    return tab[i].map((v, j) => v + (tab[i + 1][j] - v) * f);
  }
  const zScore = (x, [L, M, S]) => (Math.abs(L) < 1e-6 ? Math.log(x / M) / S : (Math.pow(x / M, L) - 1) / (L * S));
  const valueAtZ = (z, [L, M, S]) => (Math.abs(L) < 1e-6 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L));
  function normCdf(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const p = 0.3989423 * Math.exp(-z * z / 2) * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  const monthsAt = d => (settings && settings.birth ? daysBetween(parseISO(settings.birth), parseISO(d)) / 30.4375 : 0);
  function percentile(metric, date, value) {
    const lms = lmsAt(metric, monthsAt(date));
    if (!lms || !value) return null;
    const p = normCdf(zScore(value, lms)) * 100;
    return p < 1 ? "<1°" : p > 99 ? ">99°" : Math.round(p) + "°";
  }
  const num = (v, dec) => Number(v).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: dec });

  function growthChart(metric) {
    const mt = METRICS[metric];
    const pts = growth.filter(g => g[mt.k]).map(g => ({ x: monthsAt(g.date), y: g[mt.k], g })).filter(p => p.x >= 0 && p.x <= 24);
    const maxX = Math.min(24, Math.max(12, Math.ceil(Math.max(ageM() + 1, ...pts.map(p => p.x)) / 3) * 3 + 3));
    const W = 340, H = 240, L = 34, R = 30, T = 20, B = 26;
    const curve = z => { const a = []; for (let x = 0; x <= maxX + 1e-9; x += 0.25) a.push([x, valueAtZ(z, lmsAt(metric, x))]); return a; };
    let yMin = valueAtZ(-2.4, lmsAt(metric, 0)), yMax = valueAtZ(2.4, lmsAt(metric, maxX));
    pts.forEach(p => { yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y); });
    const span = yMax - yMin, step = span > 30 ? 10 : span > 12 ? 5 : span > 6 ? 2 : 1;
    yMin = Math.floor(yMin / step) * step; yMax = Math.ceil(yMax / step) * step;
    const sx = x => L + (x / maxX) * (W - L - R), sy = y => T + (1 - (y - yMin) / (yMax - yMin)) * (H - T - B);
    const path = arr => arr.map((p, i) => (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1)).join("");
    const band = (z1, z2) => path(curve(z1)) + path(curve(z2).reverse()).replace(/^M/, "L") + "Z";
    let grid = "";
    for (let y = yMin; y <= yMax + 1e-9; y += step) grid += `<line x1="${L}" x2="${W - R}" y1="${sy(y)}" y2="${sy(y)}" class="g-grid"/><text x="${L - 6}" y="${sy(y) + 3.5}" text-anchor="end" class="g-ax">${y}</text>`;
    for (let x = 0; x <= maxX; x += 3) grid += `<text x="${sx(x)}" y="${H - 8}" text-anchor="middle" class="g-ax">${x}</text>`;
    // etichette dei percentili a destra, distanziate per non sovrapporsi
    let prevY = -Infinity;
    const labels = P_Z.slice().reverse().map(([p, z]) => {
      const y = Math.max(sy(valueAtZ(z, lmsAt(metric, maxX))) + 3.5, prevY + 10);
      prevY = y;
      return `<text x="${W - R + 4}" y="${y}" class="g-ax">${p}°</text>`;
    }).join("");
    const line = pts.length > 1 ? `<path d="${path(pts.map(p => [p.x, p.y]))}" class="g-line"/>` : "";
    const dots = pts.map(p => {
      const pc = percentile(metric, p.g.date, p.y);
      const label = `${fmt(parseISO(p.g.date), { day: "numeric", month: "short" })} · ${num(p.y, mt.dec)} ${mt.u}${pc ? " · " + pc + " percentile" : ""}`;
      return `<g data-act="g-pt" data-label="${esc(label)}" style="cursor:pointer"><circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="13" fill="transparent"/><circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="4.5" class="g-dot"/><title>${esc(label)}</title></g>`;
    }).join("");
    return `<svg viewBox="0 0 ${W} ${H}" class="g-chart" role="img" aria-label="${mt.n} rispetto ai percentili OMS">
      ${grid}
      <path d="${band(-1.881, 1.881)}" class="g-band"/><path d="${band(-1.036, 1.036)}" class="g-band2"/>
      <path d="${path(curve(0))}" class="g-p50"/>
      ${labels}${line}${dots}
      <text x="${L - 6}" y="${H - 8}" text-anchor="end" class="g-ax">mesi</text>
      <text x="${L - 6}" y="9" text-anchor="end" class="g-ax">${mt.u}</text>
    </svg>`;
  }

  function viewGrowth() {
    const metric = ui.gMetric;
    const mt = METRICS[metric];
    const sorted = growth.slice().sort((a, b) => b.date.localeCompare(a.date));
    const last = k => sorted.find(g => g[k]);
    const summary = Object.keys(METRICS).map(mk => {
      const m = METRICS[mk], g = last(m.k);
      return `<div class="stat"><small>${m.n === "Circonferenza della testa" ? "Testa" : m.n}</small><b>${g ? num(g[m.k], m.dec) + " " + m.u : "–"}</b><small>${g && percentile(mk, g.date, g[m.k]) ? percentile(mk, g.date, g[m.k]) + " perc." : ""}</small></div>`;
    }).join("");
    const chip = (k, v, l, cur) => `<button class="chip ${cur === v ? "on" : ""}" data-act="${k}" data-v="${v}">${l}</button>`;
    return `
      <div class="chips">${chip("set-sex", "m", "Maschio", settings.sex === "f" ? "f" : "m")}${chip("set-sex", "f", "Femmina", settings.sex === "f" ? "f" : "m")}
        <span class="small muted" style="align-self:center">curve OMS</span></div>
      <div class="stats">${summary}</div>
      <div class="chips">${Object.keys(METRICS).map(k => `<button class="chip ${metric === k ? "on" : ""}" data-act="set" data-k="gMetric" data-v="${k}">${k === "head" ? "Testa" : METRICS[k].n}</button>`).join("")}</div>
      <div class="card">
        <div class="card-kicker">📈 ${mt.n} di ${name()}</div>
        ${growthChart(metric)}
        <p class="small muted" style="margin:6px 0 0">Fascia chiara: dal 3° al 97° percentile OMS · fascia scura: dal 15° all'85° · linea tratteggiata: 50°. Tocca un punto per vedere il valore.</p>
      </div>
      ${ageM() >= 24 ? `<div class="note small">Le curve OMS di questa sezione arrivano a 24 mesi: le misure successive restano nella tabella, senza percentile.</div>` : ""}
      <button class="btn block" data-act="g-add">➕ Aggiungi misurazione</button>
      <div class="section-title"><h2>Misurazioni</h2></div>
      ${sorted.length ? `<div class="card" style="padding:0;overflow-x:auto"><table class="tbl"><thead><tr><th>Data</th><th>Peso</th><th>Lungh.</th><th>Testa</th><th></th></tr></thead><tbody>
        ${sorted.map(g => `<tr><td>${fmt(parseISO(g.date), { day: "numeric", month: "short", year: "2-digit" })}</td>
          ${["weight", "length", "head"].map(k => { const v = g[METRICS[k].k]; return `<td>${v ? num(v, METRICS[k].dec) + `<br><small class="muted">${percentile(k, g.date, v) || ""}</small>` : "–"}</td>`; }).join("")}
          <td><button class="icon-btn" style="width:32px;height:32px;font-size:1rem" data-act="g-del" data-id="${g.id}" aria-label="Elimina">🗑️</button></td></tr>`).join("")}
      </tbody></table></div>` : `<div class="empty"><b>📏</b>Nessuna misurazione. Aggiungi quelle del libretto pediatrico o dell'ultima visita.</div>`}
      <p class="disclaimer">I percentili descrivono, non giudicano: conta soprattutto che la crescita segua la sua curva nel tempo. Le valutazioni le fa il pediatra.</p>`;
  }

  function openAddGrowth() {
    openSheet(`<h2>📏 Nuova misurazione</h2>
      <form id="growthForm">
        <label class="field"><span>Data</span><input type="date" name="date" value="${iso(today0())}" max="${iso(today0())}" min="${esc(settings.birth)}" required></label>
        <label class="field"><span>Peso (kg)</span><input type="text" inputmode="decimal" name="w" placeholder="Es. 7,45"></label>
        <label class="field"><span>Lunghezza (cm)</span><input type="text" inputmode="decimal" name="l" placeholder="Es. 66,5"></label>
        <label class="field"><span>Circonferenza della testa (cm)</span><input type="text" inputmode="decimal" name="h" placeholder="Es. 43"></label>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button><button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }

  const APPT_TYPES = { visita: "🩺 Visita dal pediatra", vaccino: "💉 Vaccinazione", bilancio: "📋 Bilancio di salute", altro: "📌 Altro" };
  function familyAppts() {
    return kids.flatMap(k => (k.id === activeKid ? appts : raw.get("k." + k.id + ".appts", [])).map(ap => Object.assign({}, ap, { kid: k })));
  }
  function apptCard(ap) {
    const d = parseISO(ap.date);
    const other = ap.kid && ap.kid.id !== activeKid;
    return `<div class="card"><div class="ev">${dateBox({ start: ap.date })}
      <div class="grow" style="min-width:0">${ap.kid && kids.length > 1 ? `<span class="tag" style="color:#fff;background:${kidColor(ap.kid.id)}">${esc(ap.kid.name || "Bimbo")}</span>` : ""}<h3>${esc(ap.t || APPT_TYPES[ap.type] || "Appuntamento")}</h3>
        <div class="where">${fmt(d, { weekday: "long", day: "numeric", month: "long" })}${ap.time ? " · ore " + esc(ap.time) : ""}${ap.place ? "<br>📍 " + esc(ap.place) : ""}</div>
        ${ap.note ? `<p class="small" style="margin:6px 0 0">${esc(ap.note)}</p>` : ""}
        <div class="btn-row"><button class="btn ghost small" data-act="ap-ics" data-id="${ap.id}">📅 Calendario</button>${other ? "" : `<button class="btn danger small" data-act="ap-del" data-id="${ap.id}">Elimina</button>`}</div>
      </div></div></div>`;
  }

  function viewAgenda() {
    const a = age();
    const t = today0();
    const fam = ui.apptScope === "family" && kids.length > 1;
    const list = fam ? familyAppts() : appts.map(ap => Object.assign({}, ap, { kid: settings }));
    const upcoming = list.filter(x => parseISO(x.date) >= t).sort((x, y) => (x.date + (x.time || "")).localeCompare(y.date + (y.time || "")));
    const past = list.length - upcoming.length;
    const item = (id, title, dueM, detail) => {
      const due = a ? addMonths(a.birth, dueM) : null;
      const d = health[id];
      const soon = !d && due && daysBetween(t, due) <= 45 && daysBetween(t, due) >= -60;
      return `<label class="check"><input type="checkbox" data-act="h-toggle" data-id="${id}" ${d ? "checked" : ""}>
        <span class="grow"><span class="title">${esc(title)}</span>
        ${due ? `<span class="when">${dueM < 72 ? "Intorno al " + fmt(due, { day: "numeric", month: "long", year: "numeric" }) : "Verso i 6 anni"}</span>` : ""}
        ${d ? `<span class="tag green">fatto · ${fmt(parseISO(d), { day: "numeric", month: "short" })}</span>` : soon ? `<span class="tag peach">in arrivo</span>` : ""}
        <span class="detail">${detail}</span></span></label>`;
    };
    // Le voci scadute da più di 2 mesi e non segnate finiscono in un gruppo chiuso
    const split = rows => {
      const old = rows.filter(r => a && !health[r.id] && daysBetween(addMonths(a.birth, r.m), t) > 60);
      const cur = rows.filter(r => !old.includes(r));
      return cur.map(r => r.html).join("") + (old.length ? `<details class="group" style="box-shadow:none;margin:10px 0 0"><summary>Già passati, non segnati (${old.length})</summary><div style="padding:0 12px">${old.map(r => r.html).join("")}</div></details>` : "");
    };
    return `
      <button class="btn block" data-act="ap-add">➕ Aggiungi appuntamento</button>
      <div class="section-title"><h2>Prossimi appuntamenti</h2></div>
      ${kids.length > 1 ? `<div class="chips"><button class="chip ${fam ? "" : "on"}" data-act="set" data-k="apptScope" data-v="kid">Solo ${name()}</button><button class="chip ${fam ? "on" : ""}" data-act="set" data-k="apptScope" data-v="family">👨‍👩‍👧‍👦 Tutta la famiglia</button></div>` : ""}
      ${upcoming.map(apptCard).join("") || `<div class="card small muted">Nessun appuntamento. Aggiungi visite e vaccinazioni: con «📅 Calendario» finiscono nel calendario del telefono, con il promemoria il giorno prima.</div>`}
      ${past ? `<p class="small muted">${plural(past, "appuntamento passato", "appuntamenti passati")} (eliminali quando vuoi).</p>${list.filter(x => parseISO(x.date) < t).map(apptCard).join("")}` : ""}
      <div class="section-title"><h2>📋 Bilanci di salute</h2></div>
      <div class="card">${split(CHECKUPS.map(c => ({ id: "c:" + c.id, m: c.m, html: item("c:" + c.id, c.t, c.m, esc(c.d)) })))}
        <p class="small muted" style="margin:10px 0 0">Età indicative: il calendario preciso lo concordi con il pediatra. Spunta quando l'avete fatto.</p></div>
      <div class="section-title"><h2>💉 Vaccinazioni</h2></div>
      <div class="card">${split(VACCINES.map(v => ({ id: "v:" + v.id, m: v.m, html: item("v:" + v.id, v.t, v.m, v.items.map(esc).join(" · ")) })))}
        <p class="small muted" style="margin:10px 0 0">Calendario indicativo nazionale. ${myAsl() && myAsl().certain ? "L'" + esc(myAsl().name) : "La vostra azienda sanitaria"} vi manda la lettera di invito con data e ora: quando arriva, aggiungila come appuntamento. Per dubbi chiedi al pediatra o al servizio vaccinazioni.</p></div>`;
  }

  function openAddAppt() {
    openSheet(`<h2>➕ Nuovo appuntamento</h2>
      <form id="apptForm">
        <label class="field"><span>Tipo</span><select name="type">${Object.keys(APPT_TYPES).map(k => `<option value="${k}">${APPT_TYPES[k]}</option>`).join("")}</select></label>
        <label class="field"><span>Titolo (facoltativo)</span><input type="text" name="t" placeholder="Es. Bilancio dei 6 mesi"></label>
        <label class="field"><span>Data</span><input type="date" name="date" value="${iso(today0())}" required></label>
        <label class="field"><span>Ora</span><input type="time" name="time"></label>
        <label class="field"><span>Luogo</span><input type="text" name="place" placeholder="Es. Studio pediatrico, ambulatorio vaccinale"></label>
        <label class="field"><span>Note</span><textarea name="note" placeholder="Es. portare il libretto"></textarea></label>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button><button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }

  function icsAppt(ap) {
    const escI = s => String(s || "").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
    const d = ap.date.replace(/-/g, "");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    let when;
    if (ap.time) {
      const [h, mi] = ap.time.split(":").map(Number);
      const end = new Date(2000, 0, 1, h + 1, mi);
      const hm = (x, y) => String(x).padStart(2, "0") + String(y).padStart(2, "0") + "00";
      when = ["DTSTART:" + d + "T" + hm(h, mi), "DTEND:" + d + "T" + (h >= 23 ? "235900" : hm(end.getHours(), end.getMinutes()))];
    } else when = ["DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + iso(addDays(parseISO(ap.date), 1)).replace(/-/g, "")];
    const title = ap.t || (APPT_TYPES[ap.type] || "Appuntamento").replace(/^\S+\s/, "");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Piccoli Passi//IT", "BEGIN:VEVENT", "UID:" + ap.id + "@piccolipassi", "DTSTAMP:" + stamp]
      .concat(when, ["SUMMARY:" + escI(title), "LOCATION:" + escI(ap.place), "DESCRIPTION:" + escI(ap.note),
        "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:" + escI("Domani: " + title), "END:VALARM", "END:VEVENT", "END:VCALENDAR"]).join("\r\n");
  }

  function viewQuestions() {
    const m = ageM();
    const ideas = QUESTION_IDEAS.filter(q => q.min <= m && q.max >= m && !questions.some(x => x.q === q.q));
    const open = questions.filter(q => !q.done), closed = questions.filter(q => q.done);
    const row = q => `<div class="check"><input type="checkbox" data-act="q-toggle" data-id="${q.id}" ${q.done ? "checked" : ""} aria-label="Fatta">
      <span class="grow" ${q.done ? 'style="text-decoration:line-through;opacity:.6"' : ""}>${esc(q.q)}</span>
      <button class="icon-btn" style="width:32px;height:32px;font-size:1rem" data-act="q-del" data-id="${q.id}" aria-label="Elimina">✕</button></div>`;
    return `
      <form class="card" id="qForm"><div class="card-kicker">❓ Domande per la prossima visita</div>
        <div class="row"><input type="text" name="q" placeholder="Scrivi una domanda…" class="grow" required><button class="btn" type="submit">Aggiungi</button></div></form>
      ${open.length ? `<div class="card">${open.map(row).join("")}</div>` : `<p class="small muted center">Segna qui i dubbi man mano che vengono: alla visita non dimenticherai niente.</p>`}
      ${ideas.length ? `<div class="section-title"><h2>💡 Idee per questa età</h2></div><div class="card">${ideas.map(q => `<button class="food" data-act="q-add" data-q="${esc(q.q)}"><span class="st">➕</span><span class="grow">${esc(q.q)}</span></button>`).join("")}</div>` : ""}
      ${closed.length ? `<div class="section-title"><h2>Già chieste</h2></div><div class="card">${closed.map(row).join("")}</div>` : ""}`;
  }

  function viewHealth() {
    const seg = (v, label) => `<button class="${ui.healthTab === v ? "on" : ""}" data-act="set" data-k="healthTab" data-v="${v}">${segLabel(label)}</button>`;
    const body = ui.healthTab === "crescita" ? viewGrowth() : ui.healthTab === "domande" ? viewQuestions() : ui.healthTab === "cura" ? viewCare() : viewAgenda() + aslCard();
    return `<a class="card list-card" href="#/emergenze" style="background:var(--danger-soft);border-color:transparent">
        <div class="big-emoji">🆘</div><div class="grow"><h3>Emergenze</h3><div class="meta">Numeri utili, soffocamento, febbre, pronto soccorso</div></div><span class="muted">›</span></a>
      <div class="segmented">${seg("agenda", "📅 Agenda")}${seg("crescita", "📈 Crescita")}${seg("domande", "❓ Domande")}${seg("cura", "🧴 Come si fa")}</div>${body}`;
  }

  /* ---------------- Emergenze ---------------- */
  function viewEmergency() {
    const callBtn = (t, sub, tel, show, e, main) => `<a class="card call ${main ? "sos" : ""}" href="tel:${esc(String(tel).replace(/[^\d+]/g, ""))}">
      <div class="big-emoji">${e}</div><div class="grow" style="min-width:0"><h3>${esc(t)}</h3>${sub ? `<div class="meta">${esc(sub)}</div>` : ""}<span class="num">${esc(show || tel)}</span></div>
      <span class="dial" aria-hidden="true">📞</span></a>`;
    const c = contacts;
    return `
      ${EMERGENCY_NUMBERS.filter(n => n.main).map(n => callBtn(n.t, n.sub, n.tel, n.show, n.e, true)).join("")}
      ${c.pedTel ? callBtn("Pediatra" + (c.pedName ? " – " + c.pedName : ""), "Il vostro pediatra", c.pedTel, c.pedTel, "🩺") : ""}
      ${c.gmTel ? callBtn("Guardia medica", "Notte, weekend e festivi", c.gmTel, c.gmTel, "🌙") : ""}
      ${c.otherTel ? callBtn(c.otherName || "Altro contatto", "", c.otherTel, c.otherTel, "👵") : ""}
      ${EMERGENCY_NUMBERS.filter(n => !n.main).map(n => callBtn(n.t, n.sub, n.tel, n.show, n.e)).join("")}
      <details class="group" ${c.pedTel ? "" : "open"}><summary>✏️ ${c.pedTel ? "Modifica i vostri numeri" : "Aggiungi pediatra e guardia medica"}</summary>
        <form id="contactsForm" style="padding:0 16px 16px">
          <label class="field"><span>Nome del pediatra</span><input type="text" name="pedName" value="${esc(c.pedName || "")}"></label>
          <label class="field"><span>Telefono del pediatra</span><input type="tel" name="pedTel" value="${esc(c.pedTel || "")}"></label>
          <label class="field"><span>Guardia medica (continuità assistenziale)</span><input type="tel" name="gmTel" value="${esc(c.gmTel || "")}">
            <small class="muted" style="font-weight:400">Il numero dipende dalla zona: ${homeOf() ? `<a href="${googleUrl("guardia medica " + homeOf().name + " numero telefono")}" target="_blank" rel="noopener">cercalo per ${esc(homeOf().name)}</a> (${esc(myAsl().name)})` : "imposta il tuo comune per cercarlo"} o chiedilo al pediatra.</small></label>
          <label class="field"><span>Altro contatto (es. nonni)</span><input type="text" name="otherName" value="${esc(c.otherName || "")}" placeholder="Nome"></label>
          <label class="field"><input type="tel" name="otherTel" value="${esc(c.otherTel || "")}" placeholder="Telefono"></label>
          <button class="btn" type="submit">Salva</button>
        </form></details>
      <div class="section-title"><h2>🏥 Pronto soccorso vicini</h2></div>
      ${packList("hospitals").filter(h => (distKm(h) ?? 0) <= 40).map(h => `<a class="card list-card" href="${mapsUrl(h.q)}" target="_blank" rel="noopener"><div class="big-emoji">🏥</div><div class="grow"><h3>${esc(h.t)}</h3><div class="meta">${kmLabel(distKm(h))} · apri nelle mappe</div></div><span class="muted">›</span></a>`).join("")}
      <a class="card list-card" href="${mapsUrl("pronto soccorso pediatrico vicino a " + homeWhere())}" target="_blank" rel="noopener"><div class="big-emoji">🗺️</div><div class="grow"><h3>Il pronto soccorso più vicino</h3><div class="meta">${homeOf() ? "Cerca sulla mappa nella zona di " + esc(homeOf().name) : "Cerca sulla mappa vicino a te"}</div></div><span class="muted">›</span></a>
      <div class="section-title"><h2>📖 Cosa fare</h2></div>
      ${videoBlock("emergenze", EMERGENCY_VIDEOS, "disostruzione pediatrica lattante croce rossa")}
      ${EMERGENCY_GUIDE.map((g, i) => `<details class="group" ${i === 0 ? "open" : ""}><summary>${g.e} ${esc(g.t)}</summary><div class="prose" style="padding:0 16px 14px">${g.html}</div></details>`).join("")}
      <div class="note small">Queste indicazioni sono un promemoria e <b>non sostituiscono un corso di disostruzione e rianimazione pediatrica</b>: fatelo, anche con i nonni. In caso di dubbio chiama sempre il <b>112</b>.</div>`;
  }

  /* ---------------- Libri e filastrocche ---------------- */
  function viewBooks(m) {
    const now = BOOKS.filter(b => b.min <= m && b.max >= m), later = BOOKS.filter(b => b.min > m);
    const bookCard = b => `<div class="card"><h3 style="margin:0">📘 ${esc(b.t)}</h3><div class="small muted">${esc(b.a)} · ${b.min}-${b.max} mesi</div><p class="small" style="margin:6px 0 0">${esc(b.d)}</p></div>`;
    const rhymes = RHYMES.filter(r => r.min <= Math.max(m, 0) + 6);
    return `<div class="note small">📚 Leggere ad alta voce ogni giorno, anche pochi minuti, fa bene al linguaggio e al legame tra voi. In biblioteca trovate questi libri e molti altri: la tessera è gratuita anche per lui.</div>
      <div class="section-title"><h2>Libri per questa età</h2></div>${now.map(bookCard).join("") || `<p class="small muted">Nessun libro in elenco per questa età.</p>`}
      ${later.length ? `<details class="group"><summary>Per più avanti (${later.length})</summary><div style="padding:0 12px 4px">${later.map(bookCard).join("")}</div></details>` : ""}
      <div class="section-title"><h2>🎵 Filastrocche e ninne nanne</h2></div>
      ${rhymes.map(r => `<details class="group"><summary>${esc(r.t)} <span class="small muted" style="margin-left:auto;margin-right:8px">${r.min}+ mesi</span></summary>
        <div style="padding:0 16px 14px"><p class="rhyme">${esc(r.txt)}</p><p class="small muted" style="margin:0">👐 ${esc(r.g)}</p></div></details>`).join("")}`;
  }

  /* ---------------- Mese per mese ---------------- */
  const monthEntry = m => MONTH_GUIDE.find(e => m >= e.m && m <= e.to) || MONTH_GUIDE[MONTH_GUIDE.length - 1];
  function monthTodayCard() {
    const a = age();
    if (!a || a.m > 24) return "";
    const e = monthEntry(a.m);
    return `<a class="card tint-purple" href="#/mese"><div class="card-kicker">📆 Il mese di ${name()} · ${esc(e.t)}</div>
      <p class="small" style="margin-bottom:6px">${esc(e.intro)}</p>
      <div>${e.items.map(it => `<span class="tag purple">${it.e} ${esc(it.t)}</span>`).join("")}</div></a>`;
  }
  function viewMonth(id) {
    const m = ageM();
    const cur = monthEntry(m);
    const idx = id != null && id !== "" ? Math.max(0, Math.min(MONTH_GUIDE.length - 1, Number(id))) : MONTH_GUIDE.indexOf(cur);
    const e = MONTH_GUIDE[idx];
    const prev = MONTH_GUIDE[idx - 1], next = MONTH_GUIDE[idx + 1];
    return `
      <div class="chips" id="monthChips">${MONTH_GUIDE.map((x, i) => `<a class="chip ${i === idx ? "on" : ""}" href="#/mese/${i}" style="text-decoration:none">${x === cur ? "📍 " : ""}${esc(x.t.replace("Il primo mese", "0 mesi"))}</a>`).join("")}</div>
      <div class="article-hero" style="padding-top:6px"><h1>${esc(e.t)}</h1><p class="muted">${esc(e.intro)}</p>
        ${e === cur ? `<span class="tag purple">📍 L'età di ${name()}</span>` : ""}</div>
      ${e.items.map(it => `<div class="card">
        <h2 style="margin-bottom:8px">${it.e} ${esc(it.t)}</h2>
        <div class="card-kicker">👀 Cosa aspettarsi</div><p>${esc(it.expect)}</p>
        <div class="card-kicker">🤝 Come affrontarlo</div><p>${esc(it.how)}</p></div>`).join("")}
      <div class="btn-row" style="justify-content:space-between">
        ${prev ? `<a class="btn ghost small" href="#/mese/${idx - 1}">‹ ${esc(prev.t)}</a>` : "<span></span>"}
        ${next ? `<a class="btn ghost small" href="#/mese/${idx + 1}">${esc(next.t)} ›</a>` : ""}
      </div>
      <p class="disclaimer">Sono tendenze medie: ogni bambino ha i suoi tempi. Per qualsiasi dubbio sul sonno, la crescita o lo sviluppo, parlane con il pediatra.</p>`;
  }

  /* ---------------- Foto delle ricette (salvate sul telefono) ---------------- */
  const PhotoDB = (() => {
    let dbp;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const rq = indexedDB.open("piccoli-passi", 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("photos");
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    }));
    const tx = (mode, fn) => open().then(db => new Promise((res, rej) => {
      const t = db.transaction("photos", mode);
      const rq = fn(t.objectStore("photos"));
      t.oncomplete = () => res(rq && rq.result);
      t.onerror = () => rej(t.error);
    }));
    return { get: k => tx("readonly", st => st.get(k)), set: (k, v) => tx("readwrite", st => st.put(v, k)), del: k => tx("readwrite", st => st.delete(k)) };
  })();
  let photoUrls = [];
  function hydratePhotos() {
    photoUrls.forEach(u => URL.revokeObjectURL(u)); photoUrls = [];
    app.querySelectorAll("[data-photo]").forEach(fig => {
      const key = fig.dataset.photo;
      PhotoDB.get(key).then(blob => {
        if (!blob || !fig.isConnected) return;
        const url = URL.createObjectURL(blob); photoUrls.push(url);
        fig.innerHTML = `<img src="${url}" alt="La vostra foto del piatto">`;
        const cap = app.querySelector(`[data-photo-cap="${key}"]`); if (cap) cap.textContent = "La vostra foto";
        const del = app.querySelector(`[data-act="photo-del"][data-key="${key}"]`); if (del) del.hidden = false;
      }).catch(() => { /* foto non disponibili */ });
    });
  }
  function resizeImage(file, max) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => (b ? res(b) : rej(new Error("foto"))), "image/jpeg", 0.82);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("foto")); };
      img.src = url;
    });
  }

  /* ---------------- Video (YouTube) ---------------- */
  // Estrae l'id di 11 caratteri da un link YouTube (watch, youtu.be, shorts, embed, live)
  function ytId(url) {
    const m = String(url || "").trim().match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([\w-]{11})/);
    return m ? m[1] : /^[\w-]{11}$/.test(String(url || "").trim()) ? String(url).trim() : null;
  }
  const ytSearch = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
  function videoBlock(key, curated, query) {
    const mine = videos[key] || [];
    const row = (v, own) => `<div class="vid-row">
      <button class="vid-thumb" data-act="play" data-id="${esc(v.id)}" data-t="${esc(v.t || "")}" aria-label="Guarda ${esc(v.t || "il video")}">
        <img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy"><span class="vid-play">▶</span></button>
      <div class="grow" style="min-width:0"><b class="small">${esc(v.t || "Video")}</b>${v.src ? `<div class="small muted">${esc(v.src)}</div>` : own ? `<div class="small muted">Aggiunto da te</div>` : ""}
        ${own ? `<button class="btn ghost small" style="margin-top:6px" data-act="vid-del" data-key="${esc(key)}" data-id="${esc(v.id)}">Rimuovi</button>` : ""}</div></div>`;
    return `<div class="card"><div class="card-kicker">🎬 Video</div>
      ${(curated || []).map(v => row(v, false)).join("")}${mine.map(v => row(v, true)).join("")}
      ${!(curated || []).length && !mine.length ? `<p class="small muted">Ancora nessun video. Cercane uno su YouTube e aggiungilo qui: poi lo guardi direttamente nell'app.</p>` : ""}
      <div class="btn-row">
        ${query ? `<a class="btn ghost small" href="${ytSearch(query)}" target="_blank" rel="noopener">🔎 Cerca su YouTube</a>` : ""}
        <button class="btn ghost small" data-act="vid-add" data-key="${esc(key)}">➕ Aggiungi un video</button>
      </div>
      ${(curated || []).length ? `<p class="small muted" style="margin:8px 0 0">I video sono di autori esterni: non sostituiscono i consigli del pediatra.</p>` : ""}</div>`;
  }
  function openVideo(id, title) {
    openSheet(`<h2 style="font-size:1rem">${esc(title || "Video")}</h2>
      <div class="vid-frame"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?rel=0&playsinline=1&modestbranding=1" title="${esc(title || "Video")}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>
      <p class="small muted">Serve la connessione a internet. Se il video non parte, alcuni autori non permettono di vederlo fuori da YouTube:</p>
      <div class="btn-row"><a class="btn ghost" href="https://www.youtube.com/watch?v=${esc(id)}" target="_blank" rel="noopener">▶️ Apri in YouTube</a><button class="btn" data-act="close" style="flex:1">Chiudi</button></div>`);
  }
  function openAddVideo(key) {
    openSheet(`<h2>➕ Aggiungi un video</h2>
      <form id="videoForm" data-key="${esc(key)}">
        <label class="field"><span>Link del video YouTube</span><input type="text" inputmode="url" autocapitalize="off" autocorrect="off" name="url" required autofocus placeholder="https://youtu.be/…"></label>
        <label class="field"><span>Titolo (facoltativo)</span><input type="text" name="t" placeholder="Es. Pancake di banana"></label>
        <p class="small muted">Su YouTube tocca <b>Condividi → Copia link</b> e incollalo qui.</p>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button><button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }

  function viewCare() {
    return `<p class="small muted">Piccole cure di tutti i giorni, spiegate passo passo.</p>
      ${CARE_GUIDES.map(g => `<details class="group"${ui.careOpen === g.id ? " open" : ""} data-care="${g.id}"><summary><span>${g.e} ${esc(g.t)}<br><span class="small muted" style="font-weight:500">${esc(g.sub)}</span></span></summary>
        <div style="padding:0 16px 14px"><div class="prose">${g.html}</div>${videoBlock("care:" + g.id, g.videos, g.q)}</div></details>`).join("")}`;
  }

  /* ---------------- Condivisione con la famiglia ---------------- */
  // Ogni dato diventa un «record» (chiave → valore). I telefoni si scambiano solo i record cambiati;
  // il servizio Google (sync/piccoli-passi-sync.gs) tiene, per ogni record, la modifica più recente.
  // "var" perché queste variabili servono già durante l'avvio (prima che il codice arrivi qui)
  var SYNC_KID_MAPS = ["foods", "ready", "done", "health"];
  var SYNC_KID_LISTS = ["growth", "appts", "questions"];
  var SYNC_LOCAL_ONLY = ["sync", "activeKid", "evKm", "theme", "installDismissed", "feed"];
  var syncing = false, syncTimer = null, applyingRemote = false, pendingRender = false;
  const hashStr = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return (h >>> 0).toString(36) + str.length.toString(36); };
  function onLocalChange(k) {
    if (applyingRemote || !SYNC_LOCAL_ONLY || SYNC_LOCAL_ONLY.includes(k) || !raw.get("sync", null)) return;
    clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(false), 2500);
  }
  function flatten() {
    const f = {};
    kids.forEach(k => {
      f["kid:" + k.id] = k;
      SYNC_KID_MAPS.forEach(n => { const o = raw.get("k." + k.id + "." + n, {}) || {}; Object.keys(o).forEach(id => { f["k:" + k.id + ":" + n + ":" + id] = o[id]; }); });
      SYNC_KID_LISTS.forEach(n => (raw.get("k." + k.id + "." + n, []) || []).forEach(x => { if (x && x.id) f["k:" + k.id + ":" + n + ":" + x.id] = x; }));
    });
    const fv = raw.get("favs", {}) || {}; Object.keys(fv).forEach(id => { f["favs:" + id] = fv[id]; });
    (raw.get("myEvents", []) || []).forEach(x => { if (x && x.id) f["myEvents:" + x.id] = x; });
    const vd = raw.get("videos", {}) || {}; Object.keys(vd).forEach(id => { f["videos:" + id] = vd[id]; });
    const ct = raw.get("contacts", {}) || {}; if (Object.keys(ct).length) f.contacts = ct;
    const hm = raw.get("home", null); if (hm) f.home = hm;
    return f;
  }
  function unflatten(f) {
    const ks = [], per = {}, fv = {}, ev = [], vd = {};
    let ct = {}, hm = null;
    Object.keys(f).forEach(key => {
      const v = f[key], p = key.split(":");
      if (p[0] === "kid") ks.push(v);
      else if (p[0] === "k") {
        const kid = p[1], n = p[2], id = p.slice(3).join(":");
        per[kid] = per[kid] || {};
        if (SYNC_KID_LISTS.includes(n)) (per[kid][n] = per[kid][n] || []).push(v);
        else (per[kid][n] = per[kid][n] || {})[id] = v;
      }
      else if (p[0] === "favs") fv[p.slice(1).join(":")] = v;
      else if (p[0] === "myEvents") ev.push(v);
      else if (p[0] === "videos") vd[p.slice(1).join(":")] = v;
      else if (key === "contacts") ct = v;
      else if (key === "home") hm = v;
    });
    applyingRemote = true;
    try {
      const old = kids.map(k => k.id);
      kids = ks.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      raw.set("kids", kids);
      old.filter(id => !kids.some(k => k.id === id)).forEach(id => KID_KEYS.forEach(n => raw.del("k." + id + "." + n)));
      kids.forEach(k => {
        const d = per[k.id] || {};
        SYNC_KID_MAPS.forEach(n => raw.set("k." + k.id + "." + n, d[n] || {}));
        SYNC_KID_LISTS.forEach(n => raw.set("k." + k.id + "." + n, (d[n] || []).sort((a, b) => String(a.id).localeCompare(String(b.id)))));
      });
      raw.set("favs", fv); raw.set("myEvents", ev); raw.set("videos", vd); raw.set("contacts", ct);
      if (hm) raw.set("home", hm); else raw.del("home");
    } finally { applyingRemote = false; }
    favs = fv; myEvents = ev; videos = vd; contacts = ct; home = hm;
    if (!kids.some(k => k.id === activeKid)) activeKid = kids.length ? kids[0].id : null;
    raw.set("activeKid", activeKid);
    loadKid();
  }
  /* --- Cifratura end-to-end: il servizio riceve solo dati cifrati e nomi irriconoscibili --- */
  const bytesToB64u = bytes => {
    let str = "";
    for (let i = 0; i < bytes.length; i += 0x8000) str += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const b64uToBytes = str => {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/")), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };
  let codecCache = null;
  async function getCodec(cfg) {
    // Spazi creati prima della cifratura (codici PP1-…): dati in chiaro, come prima
    if (cfg.v !== 2) return { space: cfg.key, keyFor: async n => n, nameFor: k => k, encode: async (n, v) => v, decode: async r => ({ n: r.k, v: r.v }) };
    if (codecCache && codecCache.secret === cfg.secret) return codecCache.codec;
    const te = new TextEncoder(), sha = async str => new Uint8Array(await crypto.subtle.digest("SHA-256", te.encode(str)));
    // Dal codice segreto si ricavano tre chiavi diverse: identificativo dello spazio, cifratura (AES-GCM) e nomi (HMAC)
    const aes = await crypto.subtle.importKey("raw", await sha("pp-enc|" + cfg.secret), "AES-GCM", false, ["encrypt", "decrypt"]);
    const mac = await crypto.subtle.importKey("raw", await sha("pp-mac|" + cfg.secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const names = new Map(), keys = new Map();
    const codec = {
      space: "s2-" + bytesToB64u(await sha("pp-space|" + cfg.secret)),
      async keyFor(n) {
        if (!keys.has(n)) {
          const k = "h" + bytesToB64u(new Uint8Array(await crypto.subtle.sign("HMAC", mac, te.encode(n)))).slice(0, 27);
          keys.set(n, k); names.set(k, n);
        }
        return keys.get(n);
      },
      nameFor: k => names.get(k),
      async encode(n, v) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, te.encode(JSON.stringify({ n, v }))));
        const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
        return bytesToB64u(out);
      },
      async decode(r) {
        try {
          const b = b64uToBytes(r.v);
          const o = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.subarray(0, 12) }, aes, b.subarray(12))));
          keys.set(o.n, r.k); names.set(r.k, o.n);
          return o;
        } catch (e) { return null; }
      }
    };
    codecCache = { secret: cfg.secret, codec };
    return codec;
  }

  async function syncNow(manual) {
    const cfg = raw.get("sync", null);
    if (!cfg || syncing) return false;
    syncing = true; clearTimeout(syncTimer);
    try {
      const codec = await getCodec(cfg);
      const cur = flatten(), meta = cfg.meta || {}, now = Date.now(), changes = [], startJson = {};
      Object.keys(cur).forEach(n => { startJson[n] = JSON.stringify(cur[n]); });
      for (const n of Object.keys(cur)) if (meta[n] !== hashStr(startJson[n])) changes.push({ k: await codec.keyFor(n), v: await codec.encode(n, cur[n]), t: now });
      for (const n of Object.keys(meta)) if (!(n in cur)) changes.push({ k: await codec.keyFor(n), v: null, t: now, d: true });
      const res = await fetch(cfg.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ key: codec.space, since: cfg.seq || 0, changes }) });
      const data = await res.json();
      if (!data || data.error || !Array.isArray(data.rec)) throw new Error((data && data.error) || "risposta non valida");
      let changed = false;
      for (const r of data.rec) {
        if (r.d) { const n = codec.nameFor(r.k); if (n && n in cur) { delete cur[n]; changed = true; } continue; }
        const o = await codec.decode(r);
        if (o && JSON.stringify(cur[o.n]) !== JSON.stringify(o.v)) { cur[o.n] = o.v; changed = true; }
      }
      // Modifiche fatte su questo telefono mentre la sincronizzazione era in corso: si tengono e partono al giro dopo
      const latest = flatten(), dirty = [];
      Object.keys(latest).forEach(n => { if (JSON.stringify(latest[n]) !== startJson[n]) { cur[n] = latest[n]; dirty.push(n); } });
      Object.keys(startJson).forEach(n => { if (!(n in latest)) { delete cur[n]; dirty.push(n); } });
      if (changed) unflatten(cur);
      const newMeta = {};
      Object.keys(cur).forEach(n => { newMeta[n] = hashStr(JSON.stringify(cur[n])); });
      dirty.forEach(n => { if (n in startJson) newMeta[n] = hashStr(startJson[n]); else delete newMeta[n]; });
      raw.set("sync", Object.assign({}, raw.get("sync", cfg), { seq: data.seq, meta: newMeta, last: Date.now(), err: "" }));
      if (dirty.length) syncTimer = setTimeout(() => syncNow(false), 1500);
      if (changed || manual || /impostazioni/.test(location.hash)) { if (sheet.hidden) render(true); else pendingRender = true; }
      if (manual) toast(changed ? "Dati aggiornati dalla famiglia ✅" : "Tutto sincronizzato ✅");
      return true;
    } catch (err) {
      const c = raw.get("sync", null);
      if (c) raw.set("sync", Object.assign(c, { err: String(err && err.message || err) }));
      if (manual) toast("Sincronizzazione non riuscita: controlla la connessione");
      return false;
    } finally { syncing = false; }
  }
  const b64u = str => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64u = str => decodeURIComponent(escape(atob(str.replace(/-/g, "+").replace(/_/g, "/"))));
  const centralUrl = () => (window.PP_CONFIG && PP_CONFIG.serviceUrl) || "";
  function inviteCode(c) {
    c = c || raw.get("sync", null);
    if (!c) return "";
    return c.v === 2 ? "PP2-" + b64u(JSON.stringify({ u: c.url, s: c.secret })) : "PP1-" + b64u(JSON.stringify({ u: c.url, k: c.key }));
  }
  function parseInvite(text) {
    const m = String(text || "").match(/PP([12])-[A-Za-z0-9_-]+/);
    if (!m) return null;
    try {
      const o = JSON.parse(unb64u(m[0].slice(4)));
      if (!o || !/^(https:\/\/|http:\/\/(127\.0\.0\.1|localhost)[:/])/.test(o.u)) return null;
      if (m[1] === "2") return String(o.s || "").length >= 20 ? { v: 2, url: o.u, secret: o.s } : null;
      return String(o.k || "").length >= 20 ? { url: o.u, key: o.k } : null;
    } catch (e) { return null; }
  }
  function randomKey() { const a = new Uint8Array(24); crypto.getRandomValues(a); return bytesToB64u(a); }
  // Crea un nuovo spazio cifrato sul servizio indicato e carica i dati di questo telefono
  async function startSpace(url) {
    raw.set("sync", { v: 2, url, secret: randomKey(), seq: 0, meta: {}, last: 0, err: "" });
    const ok = await syncNow(false);
    if (!ok) raw.del("sync");
    return ok;
  }

  function syncCard() {
    const c = raw.get("sync", null), central = centralUrl();
    if (!c) return `<div class="card tint-blue">
        <h2>👨‍👩‍👧 Condividi con la famiglia</h2>
        <p class="small">Tu e chi inviti (il partner, i nonni, la babysitter) vedete e modificate gli stessi dati: figli, diario, crescita, agenda, preferiti. I dati vengono <b>cifrati sul telefono</b> prima di partire: chi gestisce il servizio non può leggerli.</p>
        <div class="btn-row">${central ? `<button class="btn" data-act="sync-start">Attiva la condivisione</button>` : `<button class="btn" data-act="sync-setup">Attiva la condivisione</button>`}
          <button class="btn ghost" data-act="sync-join">Ho un codice di invito</button></div>
        ${central ? `<button class="link-btn small" data-act="sync-setup" style="margin-top:10px">Preferisci usare un tuo servizio Google?</button>` : ""}
      </div>`;
    const when = c.last ? new Date(c.last).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "mai";
    const own = c.url !== central;
    return `<div class="card tint-green">
        <h2>👨‍👩‍👧 Condivisione attiva</h2>
        <p class="small">${c.err ? `⚠️ Ultimo tentativo non riuscito (${esc(c.err)}). Riproverò da solo.` : "✅ Tutto collegato."} Ultima sincronizzazione: <b>${esc(when)}</b>.</p>
        <p class="small">${c.v === 2 ? "🔒 Dati cifrati sul telefono: " + (own ? "il vostro servizio Google" : "il servizio dell'app") + " conserva solo dati illeggibili." : "⚠️ Questo spazio è stato creato prima della cifratura: i dati sono leggibili nel Drive di chi ha creato il servizio."}</p>
        <div class="btn-row">
          <button class="btn" data-act="sync-invite">📨 Invita qualcuno</button>
          <button class="btn ghost" data-act="sync-now">🔄 Sincronizza ora</button>
        </div>
        ${c.v !== 2 ? `<button class="btn block" data-act="sync-encrypt" style="margin-top:10px">🔒 Passa alla cifratura</button>` : ""}
        <button class="btn ghost block" data-act="sync-newfamily" style="margin-top:10px">🏠 Crea uno spazio per un'altra famiglia</button>
        ${own ? `<button class="btn ghost block" data-act="sync-update" style="margin-top:8px">🛠️ Aggiorna il servizio Google</button>` : ""}
        <p class="small muted" style="margin:10px 0 0">Le foto dei piatti restano solo sul telefono che le ha scattate. Il codice di invito apre tutti i dati della famiglia: mandalo solo a persone di fiducia.</p>
        <button class="btn danger small" data-act="sync-leave" style="margin-top:8px">Scollega questo telefono</button>
      </div>`;
  }

  function openSyncSetup() {
    openSheet(`<h2>👨‍👩‍👧 Attiva la condivisione</h2>
      <p class="small">Si fa <b>una volta sola</b>, meglio dal computer (5 minuti). Crei un piccolo servizio gratuito sul tuo account Google che conserva i dati della famiglia nel tuo Drive.</p>
      <ol class="steps small">
        <li>Apri <a href="https://script.google.com/home/projects/create" target="_blank" rel="noopener">script.google.com</a> e crea un <b>nuovo progetto</b> (chiamalo «Piccoli Passi»).</li>
        <li>Cancella il codice che c'è e incolla questo: <button class="btn ghost small" data-act="sync-copy-script" type="button">📋 Copia il codice</button></li>
        <li>Premi <b>Esegui il deployment → Nuovo deployment</b>. Come tipo scegli <b>App web</b>, poi «Esegui come: <b>Me</b>» e «Chi ha accesso: <b>Chiunque</b>». Premi <b>Esegui il deployment</b>.</li>
        <li>Google chiede di <b>autorizzare</b> l'accesso al Drive: scegli il tuo account. Se compare «Google non ha verificato questa app», tocca <b>Avanzate → Vai a Piccoli Passi</b>: è normale, l'app sei tu.</li>
        <li>Copia l'<b>URL dell'app web</b> (finisce con <code>/exec</code>) e incollalo qui sotto.</li>
      </ol>
      <form id="syncSetupForm">
        <label class="field"><span>URL dell'app web</span><input type="text" inputmode="url" autocapitalize="off" autocorrect="off" name="url" required placeholder="https://script.google.com/macros/s/…/exec"></label>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Collega</button><button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }
  // Per chi ha pubblicato una versione precedente del servizio (serve per le notizie sugli eventi)
  function openSyncUpdate() {
    openSheet(`<h2>🛠️ Aggiorna il servizio Google</h2>
      <p class="small">Serve solo a chi ha creato il servizio (non a chi è stato invitato), quando l'app lo chiede. L'indirizzo non cambia e nessuno deve rifare l'invito.</p>
      <ol class="steps small">
        <li>Apri il progetto «Piccoli Passi» su <a href="https://script.google.com/home" target="_blank" rel="noopener">script.google.com</a>.</li>
        <li>Cancella il codice e incolla quello nuovo: <button class="btn ghost small" data-act="sync-copy-script" type="button">📋 Copia il codice</button></li>
        <li>Premi <b>Esegui il deployment → Gestisci deployment</b>, tocca la matita ✏️, in «Versione» scegli <b>Nuova versione</b> e premi <b>Esegui il deployment</b>.</li>
        <li>Se Google lo chiede, autorizza di nuovo: ora il servizio legge anche le notizie (Google News).</li>
      </ol>
      <div class="btn-row"><button class="btn" data-act="feed-reload" style="flex:1">Fatto, prova le notizie</button><button class="btn ghost" data-act="close">Chiudi</button></div>`);
  }
  function openSyncJoin(prefill) {
    openSheet(`<h2>👨‍👩‍👧 Unisciti alla famiglia</h2>
      <p class="small">Incolla il codice che hai ricevuto (inizia con <b>PP1-</b>), oppure tutto il messaggio di invito.</p>
      <form id="syncJoinForm">
        <label class="field"><span>Codice di invito</span><textarea name="code" required autocapitalize="off" autocorrect="off" placeholder="PP1-…">${esc(prefill || "")}</textarea></label>
        ${kids.length ? `<p class="small" style="color:var(--danger)">Attenzione: i dati già presenti su questo telefono verranno sostituiti da quelli condivisi.</p>` : ""}
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Unisciti</button><button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }
  function openInvite() {
    const code = inviteCode();
    const link = location.origin + location.pathname + "#/unisciti/" + code;
    const text = "Ti invito a seguire " + (kids.length === 1 && kids[0].name ? kids[0].name : "i nostri bimbi") + " con me su Piccoli Passi 🌱\n\n1) Apri l'app: " + location.origin + location.pathname +
      "\n2) Su iPhone aggiungila alla schermata Home e aprila da lì\n3) Tocca «Ho un codice di invito» e incolla questo codice:\n\n" + code + "\n\nOppure, se apri l'app nel browser, usa direttamente questo link: " + link;
    openSheet(`<h2>📨 Invita qualcuno</h2>
      <p class="small">Manda questo invito a chi vuoi far collaborare (per esempio su WhatsApp). Chi lo riceve vedrà e potrà modificare tutti i dati della famiglia.</p>
      <textarea readonly class="invite-box" id="inviteText">${esc(text)}</textarea>
      <div class="btn-row">${navigator.share ? `<button class="btn" data-act="sync-share" style="flex:1">📤 Condividi</button>` : ""}<button class="btn ghost" data-act="sync-copy-invite" style="flex:1">📋 Copia</button></div>
      <button class="btn ghost block" data-act="close" style="margin-top:8px">Chiudi</button>`);
    sheet.dataset.invite = text;
  }
  // Uno spazio nuovo e separato sullo stesso servizio Google: altro codice, altro file, nessun dato in comune
  function openNewFamily() {
    const c = raw.get("sync", null);
    if (!c) return;
    const code = inviteCode({ v: 2, url: c.url, secret: randomKey() });
    const link = location.origin + location.pathname;
    const text = "Ti ho preparato Piccoli Passi 🌱, un'app per seguire svezzamento, crescita e giochi del tuo bimbo.\n\n1) Apri l'app: " + link +
      "\n2) Su iPhone aggiungila alla schermata Home e aprila da lì\n3) Tocca «Ho un codice di invito» e incolla questo codice:\n\n" + code +
      "\n\nÈ uno spazio tutto vostro: non vedrete i nostri dati e noi non vedremo i vostri. Poi da Impostazioni potrai invitare anche il papà.";
    openSheet(`<h2>🏠 Spazio per un'altra famiglia</h2>
      <p class="small">Questo codice crea uno spazio <b>nuovo e separato</b>: chi lo usa parte da zero, non vede i vostri figli e voi non vedete i suoi. Poi potrà invitare a sua volta il partner o i nonni.</p>
      <p class="small muted">I dati di quella famiglia vengono salvati in un file separato nel <b>tuo</b> Google Drive. Se preferisci che restino solo loro, possono attivare la condivisione con il loro account Google.</p>
      <textarea readonly class="invite-box" id="inviteText">${esc(text)}</textarea>
      <div class="btn-row">${navigator.share ? `<button class="btn" data-act="sync-share" style="flex:1">📤 Condividi</button>` : ""}<button class="btn ghost" data-act="sync-copy-invite" style="flex:1">📋 Copia</button></div>
      <button class="btn ghost block" data-act="close" style="margin-top:8px">Chiudi</button>`);
    sheet.dataset.invite = text;
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) { /* ignore */ }
      ta.remove(); return ok;
    }
  }
  async function joinFamily(code) {
    const inv = parseInvite(code);
    if (!inv) { toast("Codice di invito non valido"); return; }
    if (kids.length && !confirm("Sostituire i dati di questo telefono con quelli condivisi dalla famiglia?")) return;
    applyingRemote = true;
    try { Object.keys(localStorage).filter(k => /^pp\.(k\.|kids$|favs$|myEvents$|videos$|contacts$|home$)/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignore */ }
    applyingRemote = false;
    kids = []; favs = {}; myEvents = []; videos = {}; contacts = {}; home = null; activeKid = null; raw.set("activeKid", null); loadKid();
    raw.set("sync", Object.assign({}, inv, { seq: 0, meta: {}, last: 0, err: "" }));
    closeSheet(); toast("Collegamento in corso…");
    const ok = await syncNow(false);
    location.hash = "#/oggi"; render(false);
    toast(ok ? (kids.length ? "Benvenuto in famiglia! 🎉" : "Collegato! Ora inserisci il tuo bimbo per iniziare 🌱") : "Non riesco a collegarmi: controlla la connessione e riprova da Impostazioni");
  }

  /* ---------------- Scelta del comune (OpenStreetMap + Wikidata) ---------------- */
  let homeResults = [];
  const placeName = a => a && (a.city || a.town || a.village || a.municipality || a.hamlet);
  const provOf = a => ((a && (a.county || a.state_district || a.province)) || "").replace(/^Provincia di /, "");
  async function searchComune(q) {
    const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=it&addressdetails=1&extratags=1&limit=10&accept-language=it&q=" + encodeURIComponent(q));
    const list = await r.json();
    const seen = {};
    return list.map(x => ({ name: placeName(x.address) || x.name, prov: provOf(x.address), region: (x.address && x.address.state) || "",
      lat: Number(x.lat), lon: Number(x.lon), wd: (x.extratags && x.extratags.wikidata) || "" }))
      .filter(x => x.name && !seen[x.name + x.prov] && (seen[x.name + x.prov] = true));
  }
  function setHome(h) {
    home = { name: h.name, prov: h.prov || "", region: h.region || "", lat: Number(Number(h.lat).toFixed(4)), lon: Number(Number(h.lon).toFixed(4)), wd: h.wd || "" };
    raw.del("feed");
    S.set("home", home); closeSheet(); toast("Comune impostato: " + home.name + " 📍"); render(true);
    enrichHome(true);
  }
  // Wikidata: sito ufficiale (P856) e codice ISTAT (P635) del Comune; sito dell'azienda sanitaria
  const WD_API = "https://www.wikidata.org/w/api.php?format=json&origin=*&";
  async function wdClaims(qid) {
    const j = await (await fetch(WD_API + "action=wbgetentities&props=claims&ids=" + encodeURIComponent(qid))).json();
    return (j.entities && j.entities[qid] && j.entities[qid].claims) || {};
  }
  const wdValue = (claims, p) => {
    const list = (claims[p] || []).filter(c => c.mainsnak && c.mainsnak.datavalue);
    const best = list.find(c => c.rank === "preferred") || list.find(c => c.rank !== "deprecated");
    return best ? best.mainsnak.datavalue.value : null;
  };
  async function findAslSite(aslName) {
    const j = await (await fetch(WD_API + "action=wbsearchentities&language=it&uselang=it&type=item&limit=5&search=" + encodeURIComponent(aslName))).json();
    for (const it of (j.search || [])) {
      if (!/sanitari|salute|ULSS|ASL|ATS|ASP|AUSL|USL/i.test((it.description || "") + " " + (it.label || ""))) continue;
      const site = wdValue(await wdClaims(it.id), "P856");
      if (site) return site;
    }
    return null;
  }
  let enriching = false;
  async function enrichHome(force) {
    const h = homeOf();
    if (!h || enriching || (!force && h.enriched && Date.now() - h.enriched < 30 * 864e5)) return;
    enriching = true;
    try {
      let qid = h.wd;
      if (!qid) {
        const found = (await searchComune(h.name + (h.prov ? ", " + h.prov : ""))).find(x => x.name === h.name);
        qid = found ? found.wd : "";
      }
      const upd = { enriched: Date.now(), wd: qid || "" };
      if (qid) {
        const cl = await wdClaims(qid);
        upd.site = wdValue(cl, "P856") || "";
        upd.istat = wdValue(cl, "P635") || "";
      }
      const a = window.aslFor ? aslFor(h) : null;
      if (a && a.certain && !a.site) upd.aslSite = await findAslSite(a.name) || "";
      if (homeOf() && homeOf().name === h.name) { home = Object.assign({}, home, upd); S.set("home", home); if (sheet.hidden) render(true); }
    } catch (e) { /* senza connessione si riprova la prossima volta */ }
    finally { enriching = false; }
  }
  function openHomePicker() {
    const h = homeOf();
    openSheet(`<h2>📍 Il tuo comune</h2>
      <p class="small">Serve per eventi e luoghi vicini, per trovare il sito del Comune e la vostra azienda sanitaria (ASL), e per il pronto soccorso più vicino.${h ? ` Ora: <b>${esc(h.name)}</b>.` : ""}</p>
      <form id="homeForm" class="row"><input type="search" name="q" class="grow" placeholder="Scrivi il nome del comune" required autofocus><button class="btn" type="submit">Cerca</button></form>
      <div id="homeResults"></div>
      <div class="btn-row"><button class="btn ghost" data-act="home-gps">📍 Usa la mia posizione</button><button class="btn ghost" data-act="close">Chiudi</button></div>
      <p class="small muted">Il nome viene cercato su OpenStreetMap e il sito del Comune su Wikidata, due servizi pubblici e gratuiti.</p>`);
  }
  function useMyPosition() {
    if (!navigator.geolocation) { toast("Questo telefono non permette di leggere la posizione"); return; }
    toast("Cerco la tua posizione…");
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      let name = "La tua zona", prov = "", region = "", wd = "";
      try {
        const r = await fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&extratags=1&accept-language=it&lat=" + lat + "&lon=" + lon);
        const j = await r.json();
        name = placeName(j.address) || name; prov = provOf(j.address); region = (j.address && j.address.state) || "";
        wd = (j.extratags && j.extratags.wikidata) || "";
      } catch (e) { /* senza connessione resta «La tua zona» */ }
      setHome({ name, prov, region, lat, lon, wd });
    }, () => toast("Non ho il permesso di leggere la posizione: cerca il comune per nome"), { timeout: 15000, maximumAge: 600000 });
  }

  /* ---------------- Impostazioni ---------------- */
  function viewSettings() {
    return `
      <form class="card" id="settingsForm">
        <h2>👶 Profilo di ${name()}</h2>
        <label class="field"><span>Nome</span><input type="text" name="name" value="${esc(settings.name || "")}" autocomplete="off"></label>
        <label class="field"><span>Data di nascita</span><input type="date" name="birth" value="${esc(settings.birth || "")}" max="${iso(today0())}" required></label>
        <label class="field"><span>Curve di crescita</span><select name="sex"><option value="m" ${settings.sex !== "f" ? "selected" : ""}>Maschio</option><option value="f" ${settings.sex === "f" ? "selected" : ""}>Femmina</option></select></label>
        <div class="btn-row" style="margin-top:0"><button class="btn" type="submit">Salva</button>
          ${kids.length > 1 ? `<button class="btn danger" type="button" data-act="kid-del">Elimina profilo</button>` : ""}</div>
      </form>
      <div class="card">
        <h2>👨‍👩‍👧‍👦 I vostri figli</h2>
        <div style="margin:0 -16px">${kids.map(kidRow).join("")}</div>
        <button class="btn ghost block" data-act="kid-add" style="margin-top:10px">➕ Aggiungi un figlio</button>
      </div>
      <div class="card">
        <h2>📍 Il tuo comune</h2>
        ${homeOf() ? `<p class="small" style="margin-bottom:4px"><b>${esc(homeOf().name)}</b>${homeOf().prov ? " (" + esc(homeOf().prov) + ")" : ""}</p>
          <p class="small muted">${myAsl() ? "Azienda sanitaria: " + esc(myAsl().name) + (myAsl().certain ? "" : " (da verificare)") : ""}${homeOf().site ? " · Sito del Comune: " + esc(domainOf(homeOf().site)) : ""}</p>`
          : `<p class="small">Non ancora impostato. Serve per eventi e luoghi vicini, il sito del Comune, l'azienda sanitaria e il pronto soccorso più vicino.</p>`}
        <div class="btn-row"><button class="btn" data-act="home-open">${homeOf() ? "Cambia comune" : "Imposta il comune"}</button></div>
      </div>
      <div class="card">
        <h2>🎨 Aspetto</h2>
        <div class="segmented" style="margin-bottom:0">
          ${[["auto", "📱 Automatico"], ["light", "☀️ Chiaro"], ["dark", "🌙 Scuro"]].map(([v, l]) => `<button class="${theme === v ? "on" : ""}" data-act="set-theme" data-v="${v}">${segLabel(l)}</button>`).join("")}
        </div>
        <p class="small muted" style="margin:8px 0 0">«Automatico» segue l'impostazione del telefono.</p>
      </div>
      ${installCard(true)}
      ${syncCard()}
      <div class="card">
        <h2>💾 Backup</h2>
        <p class="small">Salva una copia di tutti i dati in un file, da conservare o da importare su un telefono nuovo. Le foto dei piatti non sono incluse.</p>
        <div class="btn-row">
          <button class="btn ghost" data-act="export">⬇️ Esporta</button>
          <label class="btn ghost" style="cursor:pointer">⬆️ Importa<input type="file" accept="application/json,.json" data-act="import" hidden></label>
        </div>
      </div>
      <div class="card">
        <h2>🔐 Dove sono i tuoi dati</h2>
        <ul class="small">
          <li><b>Sul telefono:</b> profili, diario, crescita, agenda, preferiti e foto restano in questa app.</li>
          <li><b>Condivisione (se attiva):</b> i dati partono già <b>cifrati</b> con il codice di famiglia; il servizio li conserva senza poterli leggere. Le foto non vengono mai inviate.</li>
          <li><b>Comune:</b> il nome viene cercato su OpenStreetMap e il sito del Comune o dell'ASL su Wikidata. Non viene inviato nient'altro.</li>
          <li><b>Notizie sugli eventi:</b> per cercarle su Google News si invia solo il nome del comune, al servizio dell'app oppure, se non c'è, ai lettori pubblici di notizie rss2json.com e allorigins.win.</li>
          <li><b>Video:</b> YouTube riceve la richiesta solo quando premi play.</li>
        </ul>
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
      case "kid-switch":
        if (t.dataset.id !== activeKid) { switchKid(t.dataset.id); toast("Ora vedi " + (settings.name || "il profilo selezionato")); }
        closeSheet(); render(false); break;
      case "kid-add": openAddKid(); break;
      case "kid-del":
        if (kids.length > 1 && confirm("Eliminare il profilo di " + (settings.name || "questo bimbo") + " con diario, crescita e agenda? Non si può annullare.")) {
          const id = activeKid;
          KID_KEYS.forEach(k => raw.del("k." + id + "." + k));
          kids = kids.filter(k => k.id !== id); raw.set("kids", kids);
          switchKid(kids[0].id); toast("Profilo eliminato"); location.hash = "#/oggi"; render(false);
        }
        break;
      case "play": openVideo(t.dataset.id, t.dataset.t); break;
      case "sync-setup": openSyncSetup(); break;
      case "sync-start":
        toast("Attivo la condivisione…");
        if (await startSpace(centralUrl())) { toast("Condivisione attiva ✅ Ora puoi invitare qualcuno"); render(true); openInvite(); }
        else toast("Non riesco a collegarmi al servizio: riprova più tardi");
        break;
      case "sync-encrypt": {
        const old = raw.get("sync", null);
        if (!old || !confirm("Creo un nuovo spazio cifrato con tutti i dati di questo telefono. Dopo dovrai mandare il nuovo invito agli altri membri della famiglia. Procedo?")) break;
        toast("Creo lo spazio cifrato…");
        if (await startSpace(old.url)) { toast("Fatto 🔒 Ora manda il nuovo invito alla famiglia"); render(true); openInvite(); }
        else { raw.set("sync", old); toast("Non riesco a collegarmi: riprova più tardi"); }
        break;
      }
      case "home-gps": useMyPosition(); break;
      case "home-open": openHomePicker(); break;
      case "home-pick": { const hh = homeResults[Number(t.dataset.i)]; if (hh) setHome(hh); break; }
      case "sync-join": openSyncJoin(""); break;
      case "sync-now": syncNow(true); break;
      case "sync-invite": openInvite(); break;
      case "sync-newfamily": openNewFamily(); break;
      case "sync-update": openSyncUpdate(); break;
      case "feed-reload": closeSheet(); toast("Cerco le notizie…"); loadFeed(true); break;
      case "sync-copy-script": toast(await copyText(SYNC_SCRIPT) ? "Codice copiato 📋 Incollalo in Apps Script" : "Non riesco a copiare: lo trovi nel file sync/piccoli-passi-sync.gs"); break;
      case "sync-copy-invite": toast(await copyText(sheet.dataset.invite || "") ? "Invito copiato 📋" : "Seleziona il testo e copialo"); break;
      case "sync-share":
        try { await navigator.share({ title: "Piccoli Passi", text: sheet.dataset.invite || "" }); } catch (err) { /* annullato */ }
        break;
      case "sync-leave":
        if (confirm("Scollegare questo telefono? I dati restano qui, ma non si aggiorneranno più con quelli della famiglia.")) { raw.del("sync"); toast("Telefono scollegato"); render(true); }
        break;
      case "photo-del":
        if (confirm("Togliere la vostra foto e tornare all'illustrazione?")) PhotoDB.del(t.dataset.key).then(() => render(true)).catch(() => toast("Non riesco a togliere la foto"));
        break;
      case "vid-add": openAddVideo(t.dataset.key); break;
      case "vid-del":
        videos[t.dataset.key] = (videos[t.dataset.key] || []).filter(v => v.id !== t.dataset.id);
        if (!videos[t.dataset.key].length) delete videos[t.dataset.key];
        S.set("videos", videos); render(true); break;
      case "set-theme": theme = t.dataset.v; S.set("theme", theme); applyTheme(); render(true); break;
      case "set-km": evKm = Number(t.dataset.v); S.set("evKm", evKm); render(true); break;
      case "set-sex": settings.sex = t.dataset.v; S.set("settings", settings); render(true); break;
      case "al-offer": offerToday(t.dataset.food); toast("Segnato ✅ Alla prossima settimana!"); render(true); break;
      case "al-intro": openFood(t.dataset.food); break;
      case "food-again": offerToday(t.dataset.id); closeSheet(); toast("Segnato ✅"); render(true); break;
      case "g-pt": toast(t.dataset.label); break;
      case "g-add": openAddGrowth(); break;
      case "g-del":
        if (confirm("Eliminare questa misurazione?")) { growth = growth.filter(g => g.id !== t.dataset.id); S.set("growth", growth); render(true); }
        break;
      case "ap-add": openAddAppt(); break;
      case "ap-del":
        if (confirm("Eliminare questo appuntamento?")) { appts = appts.filter(x => x.id !== t.dataset.id); S.set("appts", appts); render(true); }
        break;
      case "ap-ics": { const ap = familyAppts().find(x => x.id === t.dataset.id); if (ap) download(ap.id + ".ics", icsAppt(ap), "text/calendar;charset=utf-8"); break; }
      case "h-toggle":
        if (t.checked) health[t.dataset.id] = iso(today0()); else delete health[t.dataset.id];
        S.set("health", health); render(true); break;
      case "q-toggle": { const q = questions.find(x => x.id === t.dataset.id); if (q) { q.done = t.checked; S.set("questions", questions); render(true); } break; }
      case "q-del": questions = questions.filter(x => x.id !== t.dataset.id); S.set("questions", questions); render(true); break;
      case "q-add": questions.push({ id: "q" + Date.now(), q: t.dataset.q, done: false }); S.set("questions", questions); render(true); break;
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
        const ev = upcomingEvents().find(x => x.id === t.dataset.id) || packList("events").find(x => x.id === t.dataset.id);
        if (ev) download(ev.id + ".ics", icsFor(ev), "text/calendar;charset=utf-8");
        break;
      }
      case "ev-add": openAddEvent(); break;
      case "ev-del":
        if (confirm("Eliminare questo evento?")) { myEvents = myEvents.filter(x => x.id !== t.dataset.id); S.set("myEvents", myEvents); render(true); }
        break;
      case "export": {
        const data = { app: "piccoli-passi", v: 2, exported: new Date().toISOString(), kids, activeKid, kidData: {} };
        SHARED_KEYS.forEach(k => { data[k] = raw.get(k, null); });
        kids.forEach(k => { data.kidData[k.id] = {}; KID_KEYS.forEach(key => { data.kidData[k.id][key] = raw.get("k." + k.id + "." + key, null); }); });
        download("piccoli-passi-backup-" + iso(today0()) + ".json", JSON.stringify(data, null, 2), "application/json");
        break;
      }
      case "reset":
        if (confirm("Vuoi davvero cancellare tutti i dati (diario, preferiti, eventi)?")) {
          try { Object.keys(localStorage).filter(k => k.startsWith("pp.")).forEach(k => localStorage.removeItem(k)); } catch (err) { /* ignore */ }
          kids = []; raw.set("kids", kids); switchKid(null);
          favs = {}; myEvents = []; contacts = {}; videos = {};
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
    if (d.matches && d.matches("details.group") && !ui.fQ && d.dataset.cat) ui.openCats[d.dataset.cat] = d.open;
    if (d.matches && d.matches("details[data-care]") && d.open) ui.careOpen = d.dataset.care;
  }, true);

  document.addEventListener("change", e => {
    if (e.target.dataset && e.target.dataset.act === "photo" && e.target.files[0]) {
      const key = e.target.dataset.key, file = e.target.files[0];
      e.target.value = "";
      toast("Salvo la foto…");
      resizeImage(file, 1000).then(b => PhotoDB.set(key, b)).then(() => { toast("Foto salvata 📷"); render(true); })
        .catch(() => toast("Non riesco a leggere questa foto"));
      return;
    }
    if (e.target.dataset && e.target.dataset.act === "import" && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (data.app !== "piccoli-passi") throw new Error("formato");
          if (!confirm("Importare i dati? Quelli presenti su questo telefono verranno sostituiti.")) return;
          let newKids, kidData;
          if (data.v >= 2) { newKids = data.kids || []; kidData = data.kidData || {}; }
          else {
            // backup della prima versione: un solo bambino
            newKids = data.settings ? [Object.assign({}, data.settings, { id: "k1" })] : [];
            kidData = { k1: {} }; KID_KEYS.forEach(k => { kidData.k1[k] = data[k]; });
          }
          try { Object.keys(localStorage).filter(k => k.startsWith("pp.k.")).forEach(k => localStorage.removeItem(k)); } catch (err) { /* ignore */ }
          kids = newKids; raw.set("kids", kids);
          newKids.forEach(k => KID_KEYS.forEach(key => { const v = (kidData[k.id] || {})[key]; if (v != null) raw.set("k." + k.id + "." + key, v); }));
          SHARED_KEYS.forEach(k => { if (data[k] != null) raw.set(k, data[k]); });
          switchKid(kids.some(k => k.id === data.activeKid) ? data.activeKid : (kids[0] || {}).id || null);
          favs = raw.get("favs", {}); myEvents = raw.get("myEvents", []); contacts = raw.get("contacts", {}); videos = raw.get("videos", {});
          evKm = raw.get("evKm", 50); theme = raw.get("theme", "auto"); applyTheme();
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
      if (fd.get("sex")) settings.sex = fd.get("sex");
      S.set("settings", settings);
      if (f.id === "welcomeForm") switchKid(activeKid);
      if (f.id === "settingsForm") toast("Salvato ✅");
      location.hash = "#/oggi"; render(false);
    } else if (f.id === "homeForm") {
      const q = String(fd.get("q") || "").trim();
      if (!q) return;
      toast("Cerco…");
      searchComune(q).then(list => {
        homeResults = list;
        const box = sheet.querySelector("#homeResults");
        if (!box) return;
        box.innerHTML = list.length ? `<div class="card" style="padding:0;overflow:hidden;margin-top:10px">
          ${list.map((x, i) => `<button class="food" data-act="home-pick" data-i="${i}"><span class="st">📍</span><span class="grow"><b>${esc(x.name)}</b><br><span class="small muted">${esc([x.prov, x.region].filter(Boolean).join(" · "))}</span></span><span class="muted">›</span></button>`).join("")}</div>`
          : `<p class="small" style="margin-top:10px">Nessun comune trovato con questo nome.</p>`;
      }).catch(() => toast("Serve la connessione a internet per cercare il comune"));
    } else if (f.id === "syncSetupForm") {
      const url = String(fd.get("url") || "").trim();
      if (!/^https:\/\/script\.google(usercontent)?\.com\/.+\/exec/.test(url)) { toast("L'indirizzo deve iniziare con https://script.google.com e finire con /exec"); return; }
      toast("Collegamento in corso…");
      startSpace(url).then(ok => {
        if (ok) { closeSheet(); toast("Condivisione attiva ✅ Ora puoi invitare qualcuno"); render(true); openInvite(); }
        else toast("Non riesco a collegarmi: controlla l'URL e che l'accesso sia «Chiunque»");
      });
    } else if (f.id === "syncJoinForm") {
      joinFamily(fd.get("code"));
    } else if (f.id === "videoForm") {
      const id = ytId(fd.get("url"));
      if (!id) { toast("Non riconosco il link: copialo da YouTube con «Condividi»"); return; }
      const key = f.dataset.key;
      videos[key] = (videos[key] || []).filter(v => v.id !== id).concat([{ id, t: String(fd.get("t") || "").trim() }]);
      S.set("videos", videos); closeSheet(); toast("Video aggiunto 🎬"); render(true);
    } else if (f.id === "kidForm") {
      activeKid = null;
      S.set("settings", { name: String(fd.get("name") || "").trim(), birth: fd.get("birth"), sex: fd.get("sex") || "m" });
      switchKid(activeKid);
      closeSheet(); toast("Benvenuto " + settings.name + "! 🎉"); location.hash = "#/oggi"; render(false);
    } else if (f.id === "foodForm") {
      const prev = foods[f.dataset.id];
      const date = fd.get("date");
      const log = (prev && prev.log ? prev.log : [date]).filter(x => x >= date);
      if (!log.includes(date)) log.unshift(date);
      foods[f.dataset.id] = { date, r: fd.get("r"), n: Number(fd.get("n")) || 1, note: String(fd.get("note") || "").trim(), log };
      S.set("foods", foods);
      closeSheet(); toast(fd.get("r") === "reaz" ? "Segnato. Se hai dubbi, senti il pediatra." : "Segnato nel diario ✅");
      render(true);
    } else if (f.id === "growthForm") {
      const n = k => { const v = parseFloat(String(fd.get(k) || "").replace(",", ".")); return v > 0 ? v : null; };
      const g = { id: "g" + Date.now(), date: fd.get("date"), w: n("w"), l: n("l"), h: n("h") };
      if (g.w && g.w > 30) g.w = g.w / 1000; // scritto in grammi
      if (!g.w && !g.l && !g.h) { toast("Inserisci almeno una misura"); return; }
      growth.push(g); S.set("growth", growth); closeSheet(); toast("Misurazione salvata 📏"); render(true);
    } else if (f.id === "apptForm") {
      appts.push({ id: "ap" + Date.now(), type: fd.get("type"), t: String(fd.get("t") || "").trim(), date: fd.get("date"),
        time: String(fd.get("time") || ""), place: String(fd.get("place") || "").trim(), note: String(fd.get("note") || "").trim() });
      S.set("appts", appts); closeSheet(); toast("Appuntamento salvato 📅"); render(true);
    } else if (f.id === "qForm") {
      const q = String(fd.get("q") || "").trim();
      if (q) { questions.push({ id: "q" + Date.now(), q, done: false }); S.set("questions", questions); render(true); }
    } else if (f.id === "contactsForm") {
      contacts = {};
      ["pedName", "pedTel", "gmTel", "otherName", "otherTel"].forEach(k => { const v = String(fd.get(k) || "").trim(); if (v) contacts[k] = v; });
      S.set("contacts", contacts); toast("Numeri salvati ✅"); render(true);
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
  function handleInviteLink() {
    const m = location.hash.match(/^#\/unisciti\/(.+)$/);
    if (!m) return false;
    history.replaceState(null, "", "#/oggi");
    setTimeout(() => openSyncJoin(decodeURIComponent(m[1])), 300);
    return true;
  }
  window.addEventListener("hashchange", handleInviteLink);
  if (!location.hash) history.replaceState(null, "", "#/oggi");
  handleInviteLink();
  render(false);
  enrichHome(false);
  if (raw.get("sync", null)) {
    syncNow(false);
    setInterval(() => { if (document.visibilityState === "visible") syncNow(false); }, 60000);
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && raw.get("sync", null)) syncNow(false); });

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
