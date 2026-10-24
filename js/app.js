"use strict";
(function () {
  const VERSION = "5.5.0";
  const app = document.getElementById("app");
  const sheet = document.getElementById("sheet");
  const sheetBackdrop = document.getElementById("sheetBackdrop");
  const DAY = 864e5;

  /* ---------------- Storage (solo su questo dispositivo) ---------------- */
  let toastTimer;   // qui in alto: raw.set può già mostrare un avviso durante l'avvio
  const raw = {
    get(k, d) { try { const v = localStorage.getItem("pp." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) {
      try { localStorage.setItem("pp." + k, JSON.stringify(v)); } catch (e) { toast("Non riesco a salvare su questo dispositivo"); }
      if (typeof onLocalChange === "function") onLocalChange(k);
    },
    del(k) { try { localStorage.removeItem("pp." + k); } catch (e) { /* ignore */ } }
  };
  // Dati di ogni figlio (salvati come "k.<id>.<chiave>") e dati in comune per la famiglia
  const KID_KEYS = ["foods", "ready", "done", "growth", "health", "appts", "questions", "diary", "plan", "ms", "rem", "remDone"];
  const SHARED_KEYS = ["favs", "myEvents", "contacts", "evKm", "theme", "videos", "home", "shop"];
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
  let settings, foods, ready, done, growth, health, appts, questions, diary, plan, ms, rem, remDone;
  function loadKid() {
    settings = S.get("settings", null);
    foods = S.get("foods", {}); ready = S.get("ready", {}); done = S.get("done", {});
    growth = S.get("growth", []); health = S.get("health", {}); appts = S.get("appts", []); questions = S.get("questions", []);
    diary = S.get("diary", []); plan = S.get("plan", {}); ms = S.get("ms", {}); rem = S.get("rem", []); remDone = S.get("remDone", {});
  }
  loadKid();
  let favs = S.get("favs", {});
  let myEvents = S.get("myEvents", []);
  let evKm = S.get("evKm", 50);
  let theme = S.get("theme", "auto");
  let contacts = S.get("contacts", {});
  let videos = S.get("videos", {});
  let home = S.get("home", null);
  let shop = S.get("shop", []);
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
  const dayPrep = (dt, p) => ([8, 11].includes(dt.getDate()) ? { il: "l'", al: "all'", dal: "dall'" }[p] : p + " ");
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
  const ofName = () => (settings && settings.name ? esc(settings.name) : "tuo figlio");   // dopo «di», «per», «a»
  function ageText(a) {
    if (!a) return "";
    if (a.m === 0) return plural(a.d, "giorno", "giorni");
    if (a.m >= 24) { const y = Math.floor(a.m / 12), mm = a.m % 12; return plural(y, "anno", "anni") + (mm ? " e " + plural(mm, "mese", "mesi") : ""); }
    return plural(a.m, "mese", "mesi") + (a.d ? " e " + plural(a.d, "giorno", "giorni") : "");
  }

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
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; if (settings && sheet.hidden && !editing() && (/oggi|impostazioni/.test(location.hash) || !location.hash)) render(true); });
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
  const TITLES = { oggi: "Piccoli Passi", ricette: "Pappa", ricetta: "Ricetta", guida: "Pappa", sezione: "Guida", diario: "Diario", cibi: "Pappa", settimana: "Pappa", spesa: "Pappa", giochi: "Scopri", attivita: "Gioco", eventi: "Scopri", impostazioni: "Impostazioni", allergeni: "Pappa", salute: "Salute", emergenze: "Emergenze", mese: "Scopri" };
  const PARENT = { ricetta: "#/ricette", sezione: "#/guida", attivita: "#/giochi", impostazioni: "#/oggi", emergenze: "#/salute" };
  // Cinque sezioni: Oggi, Diario, Pappa (ricette, guida, cibi, allergeni), Salute, Scopri (giochi, mese per mese, eventi)
  const TAB_OF = { ricette: "pappa", ricetta: "pappa", guida: "pappa", sezione: "pappa", cibi: "pappa", allergeni: "pappa", settimana: "pappa", spesa: "pappa", giochi: "scopri", attivita: "scopri", mese: "scopri", eventi: "scopri", emergenze: "salute" };
  const HUBS = {
    pappa: [["ricette", "🥣 Ricette"], ["settimana", "🗓️ Settimana"], ["spesa", "🛒 Spesa"], ["guida", "📖 Guida"], ["cibi", "📒 Cibi provati"], ["allergeni", "⚠️ Allergeni"]],
    scopri: [["giochi", "🧸 Giochi"], ["mese", "📆 Mese per mese"], ["eventi", "📍 Eventi"]]
  };
  const hubNav = view => {
    const h = HUBS[TAB_OF[view]];
    return h && h.some(([v]) => v === view) ? `<nav class="hubnav" aria-label="Sottosezioni">${h.map(([v, l]) => `<a href="#/${v}" class="${v === view ? "on" : ""}">${l}</a>`).join("")}</nav>` : "";
  };

  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, "");
    const [view, id] = h.split("/");
    return { view: view || "oggi", id: id ? decodeURIComponent(id) : null };
  }

  function viewHtml(r) {
    if (!settings) return viewWelcome();
    return hubNav(r.view) + viewPage(r);
  }
  function viewPage(r) {
    switch (r.view) {
      case "ricette": return viewRecipes();
      case "ricetta": return viewRecipe(r.id);
      case "guida": return viewGuide();
      case "sezione": return viewSection(r.id);
      case "diario": return viewDiary();
      case "cibi": return viewFoods();
      case "settimana": return viewWeek();
      case "spesa": return viewShop();
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
    if (next) { cur.replaceWith(next); hydratePhotos(); wireCarousel(app); }
  }

  function render(keepScroll) {
    const r = parseRoute();
    const y = window.scrollY;
    app.innerHTML = viewHtml(r);
    hydratePhotos();
    hydrateDiaryPhotos(app);
    wireCarousel(app);
    // scheda ricetta a tutto schermo: immagine in alto con i pulsanti sopra, senza barra superiore
    document.body.classList.toggle("immersive", r.view === "ricetta" && settings != null);
    const mc = app.querySelector("#monthChips"), mon = mc && mc.querySelector(".on");
    if (mon) mc.scrollLeft = mon.offsetLeft - mc.clientWidth / 2 + mon.offsetWidth / 2;
    const hn = app.querySelector(".hubnav"), hon = hn && hn.querySelector(".on");
    if (hon && hon.offsetLeft + hon.offsetWidth > hn.clientWidth - 16) hn.scrollLeft = hon.offsetLeft - hn.clientWidth / 2 + hon.offsetWidth / 2;
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
    updateNetChip();
    document.getElementById("btnBack").hidden = !PARENT[r.view] || !settings;
    document.getElementById("brand").querySelector("img").hidden = !!PARENT[r.view];
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }

  function goBack() {
    const r = parseRoute();
    let nav = null;
    try { nav = sessionStorage.getItem("pp.nav"); } catch (e) { /* memoria bloccata */ }
    if (nav) history.back();
    else location.hash = PARENT[r.view] || "#/oggi";
  }
  document.getElementById("btnBack").addEventListener("click", goBack);
  window.addEventListener("hashchange", () => { try { sessionStorage.setItem("pp.nav", "1"); } catch (e) { /* memoria bloccata */ } closeSheet(); if (cook) closeCook(); render(false); });
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
    // Invito già usato ma dati non ancora arrivati: niente modulo (creerebbe un secondo bimbo), si aspetta il collegamento
    const c = raw.get("sync", null);
    if (c && !c.last) return `<div class="welcome">
      <img src="icons/icon.svg" alt="">
      <h1>Ti stai collegando alla famiglia</h1>
      <p class="muted">${c.err ? "Il servizio non ha ancora risposto (" + esc(c.err) + "). Riprovo da solo: puoi lasciare l'app aperta." : "Sto scaricando i dati condivisi: di solito servono pochi secondi, a volte fino a un minuto."}</p>
    </div>
    <div class="card center">
      <button class="btn block" data-act="sync-now">🔄 Riprova adesso</button>
      <p class="small muted" style="margin:12px 0 0">Chi ti ha invitato deve aver già attivato la condivisione sul suo telefono.</p>
      <button class="btn ghost block" data-act="sync-check" style="margin-top:12px">🔍 Verifica il collegamento</button>
      <button class="link-btn small" data-act="sync-leave" style="margin-top:12px">Annulla e inizia senza condivisione</button>
    </div>`;
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
  // parole che nel titolo indicano un evento (sul testo normalizzato: minuscolo, senza accenti)
  const EVENT_WORDS = /spettacol|teatr|laborator|letture|lettura|fiab|burattin|\bfest[ae]\b|festival|festeggiament|\bsagr[ae]\b|mercatin|concert|\bevent[oi]\b|animazion|carneval|natale|befana|halloween|\bmuse[oi]\b|\bmostr[ae]\b|bibliotec|circo|cinema|musical|caccia al tesoro|presepe|luminarie|rassegna|appuntament|\bgiornat[ae]\b|\bfiera\b|passeggiat|camminata|visite guidate|cosa fare|weekend|fine settimana|manifestazion|sfilata|parata/;
  const NOT_EVENT = /incident|mort[oaie]\b|muore|decess|arrest|rapin|omicid|violenz|indagin|ferit|tragedi|polizia|carabinier|incendi|maltempo|allerta|allarme|furto|truff|processo|sentenz|denunc|sequestr|annegat|aggress|schianto|scontro|lutto|funeral|ricoverat|\briss[ae]\b|caos|droga|spaccio|degrado|vandal|malore|malattia|tumor|ospedal|laurea|prezz|rincar|costo della vita|bollett|sciopero|calcio|serie [abcd]\b|partita|stadio|tifosi|elezion/;
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
    const mesiN = MESI.map(normTxt), mesi = "(" + mesiN.join("|") + ")";
    const WD = "(?:(?:" + GIORNI.map(normTxt).join("|") + ")\\s+)?", N = "(\\d{1,2})°?", CONN = "\\s*(?:fino all'|fino al|all'|al|a|ed|e|-|–)\\s*(?:il\\s+|l')?";
    const mk = (d, mo) => {
      let dt = new Date(pub.getFullYear(), mo, d);
      if (dt < addDays(base, -45)) dt = new Date(pub.getFullYear() + 1, mo, d);
      else if (dt > addDays(base, 300)) dt = new Date(pub.getFullYear() - 1, mo, d);   // «20 dicembre» letto a gennaio
      return dt;
    };
    const ok = d => d >= 1 && d <= 31;
    // «dal 31 ottobre al 2 novembre», «sabato 31 ottobre e domenica 1 novembre»
    let m = t.match(new RegExp("\\b" + WD + N + "\\s+" + mesi + CONN + WD + N + "\\s+" + mesi + "\\b"));
    if (m && ok(+m[1]) && ok(+m[3])) {
      const st = mk(+m[1], mesiN.indexOf(m[2])); let en = new Date(st.getFullYear(), mesiN.indexOf(m[4]), +m[3]);
      if (en < st) en = new Date(st.getFullYear() + 1, en.getMonth(), en.getDate());
      return { start: iso(st), end: iso(en) };
    }
    // «25 ottobre», «dal 7 al 9 novembre», «da sabato 17 a domenica 25 ottobre», «dal 9 all'11 ottobre», «il 17 e il 18 ottobre»
    m = t.match(new RegExp("\\b" + WD + N + "(?:" + CONN + WD + N + ")?\\s+" + mesi + "\\b"));
    if (m && ok(+m[1])) {
      const mo = mesiN.indexOf(m[3]), a = +m[1], b = m[2] ? +m[2] : null, st = mk(a, mo);
      return { start: iso(st), end: b && b > a && b <= 31 ? iso(new Date(st.getFullYear(), mo, b)) : "" };
    }
    m = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b(?!\s*(?:anni|mesi|a\b))/);
    if (m && +m[2] >= 1 && +m[2] <= 12 && ok(+m[1])) return { start: iso(mk(+m[1], +m[2] - 1)), end: "" };
    if (strict) return null;
    if (/\bdomani\b/.test(t)) return { start: iso(addDays(base, 1)), end: "" };
    if (/\b(?:oggi|stasera|stanotte)\b/.test(t)) return { start: iso(base), end: "" };
    const days = GIORNI.map(normTxt).map((g, wd) => new RegExp("\\b" + g + "\\b").test(t) ? addDays(base, (wd - base.getDay() + 7) % 7) : null).filter(Boolean)
      .concat(/\bweekend|fine settimana\b/.test(t) ? [6, 0].map(wd => addDays(base, (wd - base.getDay() + 7) % 7)) : []).sort((x, y) => x - y);
    if (!days.length) return null;
    const last = days[days.length - 1];
    return { start: iso(days[0]), end: daysBetween(days[0], last) > 0 && daysBetween(days[0], last) <= 3 ? iso(last) : "" };
  }
  // Nomi con cui i giornali citano il comune: «Bassano del Grappa» → anche «Bassano»
  function placeKeys(name) {
    const n = normTxt(name), short = n.split(/\s+(?:del|della|delle|dei|degli|di|d'|nell'|nella|sul|sulla|in|al|alla|terme|maggiore|minore|superiore|inferiore)\b/)[0].trim();
    return short.length >= 4 && short !== n ? [n, short] : [n];
  }
  const reEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mentions = (txt, keys) => keys.some(k => new RegExp("(^|[^a-z0-9])" + reEsc(k) + "([^a-z0-9]|$)").test(txt));
  // Parole significative di un titolo, per riconoscere la stessa notizia data da testate diverse
  const STOPW = new Set(MESI.concat(GIORNI).map(normTxt).concat(["questo", "questa", "della", "delle", "degli", "dalla", "dalle", "nella", "nelle", "alla", "alle", "sono", "tutti", "tutte", "anche", "come", "dove", "ecco", "oltre", "torna", "tornano"]));
  const titleWords = (t, keys) => new Set(normTxt(t).split(/[^a-z0-9@]+/).filter(w => w.length >= 4 && !/^\d+$/.test(w) && !STOPW.has(w) && !keys.some(k => k.split(" ").includes(w))));
  function sameNews(a, b) {
    if (normTxt(a.t) === normTxt(b.t)) return true;
    let n = 0;
    a.w.forEach(x => { if (b.w.has(x)) n++; });
    return n >= 2 && n / Math.min(a.w.size, b.w.size) >= 0.6 && (!a.ev || !b.ev || a.ev.start === b.ev.start);
  }
  let feedLoading = false;
  const FEED_V = 3;
  async function loadFeed(force) {
    const h = homeOf();
    if (!h || feedLoading) return;
    const cached = raw.get("feed", null);
    if (!force && cached && cached.v === FEED_V && cached.place === h.name && Date.now() - cached.at < (cached.ok ? 6 : 1) * 3600e3) return;
    feedLoading = true;
    try {
      const { items: rawItems, via } = await fetchNews(feedQueries());
      const limit = Date.now() - 45 * 864e5, keys = placeKeys(h.name);
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
        const tt = normTxt(it.t), src = normTxt(it.s);
        // il comune deve essere nel titolo, oppure la notizia viene dal Comune stesso (o da biblioteca e pro loco)
        const here = mentions(normTxt(it.t + " " + it.x), keys) || (/^(?:comune|citta|biblioteca|pro loco)\b/.test(src) && mentions(src, keys));
        return it.t && /^https:\/\//.test(it.l || "") && it.d > limit && here && EVENT_WORDS.test(tt) && !NOT_EVENT.test(tt);
      }).map(it => Object.assign(it, { ev: eventDateFrom(it.t, it.d) || (it.x ? eventDateFrom(it.x, it.d, true) : null) }))
        // senza data restano solo le notizie delle ultime 3 settimane
        .filter(it => it.ev || it.d > Date.now() - 21 * 864e5)
        // prima quelle con la data, poi le più recenti; i doppioni (stessa notizia, altre testate) si scartano
        .sort((a, b) => (b.ev ? 1 : 0) - (a.ev ? 1 : 0) || b.d - a.d)
        .reduce((kept, it) => { it.w = titleWords(it.t, keys); if (!kept.some(k => sameNews(k, it))) kept.push(it); return kept; }, [])
        .map(it => { delete it.w; return it; })
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
    const dated = (f.items || []).filter(it => it.ev && it.ev.start && (it.ev.end || it.ev.start) >= iso(today0())).length;
    const head = `<div class="card-kicker">📰 Altre notizie su eventi a ${esc(h.name)}</div>`;
    if (!f.items.length) return `<div class="card"><div class="card-kicker">📰 Eventi trovati in automatico</div><p class="small muted" style="margin:0">${f.ok ? "Nelle ultime settimane non ho trovato notizie su eventi per bambini a " + esc(h.name) + ". Prova le ricerche qui sotto." : "Non riesco a leggere le notizie in questo momento: controlla la connessione."}</p>
      <button class="btn ghost small" data-act="feed-reload" style="margin-top:8px">🔄 Riprova</button></div>`;
    if (!undated.length) return dated ? `<p class="small muted">📰 ${plural(dated, "evento trovato", "eventi trovati")} in automatico nelle notizie di ${esc(h.name)}: ${dated === 1 ? "è" : "sono"} in calendario qui sopra.</p>` : `<p class="small muted">📰 Per ora nelle notizie di ${esc(h.name)} non ci sono altri eventi in arrivo.</p>`;
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
      <p class="small">Intorno ${dayPrep(due.due, "al")}${fmt(due.due, { day: "numeric", month: "long" })}. Prenota e segnalo nell'agenda: ${esc(due.sub)}</p></a>`;
  }

  function viewToday() {
    const a = age();
    const m = ageM();
    const ph = phase(m);
    // Avanzamento verso il prossimo mese compiuto (prima dei 6 mesi: verso l'inizio dello svezzamento)
    let progress = "";
    if (a) {
      const from = addMonths(a.birth, a.m), to = addMonths(a.birth, a.m + 1), left = daysBetween(today0(), to);
      const pct = Math.min(100, Math.round(daysBetween(from, today0()) / Math.max(1, daysBetween(from, to)) * 100));
      progress = `<div class="small muted">${a.m + 1 === 6 ? (left === 1 ? "Manca " : "Mancano ") + plural(left, "giorno", "giorni") + " ai 6 mesi: si avvicina lo svezzamento" : "Tra " + plural(left, "giorno", "giorni") + " compie " + ageText({ m: a.m + 1, d: 0 })} · ${fmt(to)}</div>
        <div class="progress" aria-hidden="true"><i style="width:${pct}%"></i></div>`;
    }
    const tip = pick(tipsForAge(m), 0);
    const recPool = recipesForAge(m);
    const seasonal = recPool.filter(r => !r.seasons.length || r.seasons.includes(season()));
    const weaning = m < 24, kn = weaning ? knownBy(iso(today0()), "pranzo") : null, fits = weaning ? seasonal.filter(r => recipeFit(r, kn).fit !== "no") : seasonal;
    const rec = pick(fits.length ? fits : seasonal.length ? seasonal : recPool, 3);
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
      ${a ? `<div class="mh-wrap"><a class="mh-card" href="#/mese" aria-label="Apri l'aggiornamento del mese">
        <figure>${window.babyArt ? babyArt(a.m) : ""}${settings.photo ? `<img class="mh-photo" data-ph="${esc(settings.photo)}" alt="${name()}">` : ""}</figure>
        <span class="mh-name">${name()}</span>
        <span class="mh-day">Giorno ${a.total + 1}</span>
        ${a.m <= 24 ? `<span class="mh-badge"><b>${a.m}</b><small>${a.m === 1 ? "mese" : "mesi"}</small></span>` : ""}
        <span class="mh-body">
          <b class="mh-age">${name()} ha ${ageText(a)}</b>
          <span class="small muted">${plural(a.w, "settimana", "settimane")} · ${settings.sex === "f" ? "nata" : "nato"} ${dayPrep(a.birth, "il")}${fmt(a.birth, { day: "numeric", month: "long", year: "numeric" })}</span>
          ${progress}
          <span class="mh-foot"><span>${a.m <= 24 ? "📆 Il tuo aggiornamento del mese" : "📆 Mese per mese"}</span><span class="mh-open">Apri <i>▶</i></span></span>
        </span>
      </a><label class="mh-cam" aria-label="${settings.photo ? "Cambia la foto" : "Aggiungi una foto"}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.2" r="3.4"/></svg><input type="file" accept="image/*" data-act="kid-photo" hidden></label></div>` : ""}

      ${sleepLiveCard()}
      ${todayDiaryCard()}
      ${remTodayCard()}
      ${healthTodayCard()}
      ${weaning ? allergenTodayCard() : ""}
      ${readiness}

      <a class="card tint-green" href="${ph.link}">
        <div class="card-kicker">${ph.e} Fase attuale</div>
        <h3>${ph.t}</h3>
        <p class="small">${ph.d}</p>
      </a>

      ${tip ? `<div class="card tint-yellow"><div class="card-kicker">💡 Consiglio del giorno · ${esc(tip.cat)}</div><p>${esc(tip.t)}</p></div>` : ""}

      ${installCard(false)}

      <div class="section-title"><h2>${m < 6 ? "Ricetta da provare presto" : "Ricetta del giorno"}</h2><a href="#/ricette">Tutte ›</a></div>
      ${rec ? recipeCard(rec) : ""}

      ${act ? `<div class="section-title"><h2>Gioco del giorno</h2><a href="#/giochi">Tutti ›</a></div>${activityCard(act)}` : ""}

      <div class="section-title"><h2>Prossimi eventi</h2><a href="#/eventi">Tutti ›</a></div>
      ${evs.length ? evs.map(eventMini).join("") : `<div class="card muted small">Nessun evento in calendario: dai un'occhiata ai <a href="#/eventi">luoghi e servizi</a>.</div>`}

      <div class="section-title"><h2>Cibi provati</h2><a href="#/cibi">Apri ›</a></div>
      <a class="card list-card" href="#/cibi">
        <div class="big-emoji">📒</div>
        <div class="grow"><h3>${plural(tried, "cibo provato", "cibi provati")}</h3>
        <div class="meta">Allergeni introdotti: ${alDone}/${KEY_ALLERGENS.length}</div></div>
      </a>
      ${homeOf() ? "" : homePrompt("Eventi, servizi, sito del Comune e azienda sanitaria (ASL) della tua zona.")}
      <p class="disclaimer">Le informazioni di questa app non sostituiscono il parere del pediatra.</p>`;
  }

  /* ---------------- Ricette ---------------- */
  const BIMBY = window.BIMBY || {};
  let cookMode = raw.get("cookMode", "classica");   // «classica» o «bimby»: preferenza di questo telefono
  const bimbyOn = () => cookMode === "bimby";
  const hasBimby = r => bimbyOn() && !!BIMBY[r.id];
  function allergenTags(al) {
    return al.map(k => ALLERGENS[k] ? `<span class="tag al">${ALLERGENS[k].e} ${ALLERGENS[k].n}</span>` : "").join("");
  }
  const recipeArt = (r, opts) => (window.dishArt ? dishArt(r.id, opts) : "") || `<div class="emoji">${r.e}</div>`;
  const BOOKMARK = on => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.3-6.5 4.3v-16a1 1 0 0 1 1-1z" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const recipeMeta = r => `dai ${r.m} mesi · ${r.min} min${hasBimby(r) ? " · Bimby" : ""}`;
  // Riga compatta (pagina Oggi)
  function recipeCard(r) {
    return `<a class="card r-row" href="#/ricetta/${r.id}">
      <figure class="r-thumb" data-photo="r:${r.id}">${recipeArt(r, { tile: true })}</figure>
      <div class="grow"><h3>${esc(r.t)}</h3><div class="meta">${recipeMeta(r)}${favs["r:" + r.id] ? " · ❤️" : ""}</div>
        ${r.al.length ? `<div>${allergenTags(r.al)}</div>` : ""}</div></a>`;
  }
  // Riquadro con foto e titolo sovrapposto; la griglia alterna riquadri alti e bassi su due colonne
  function recipeTile(r, i) {
    return `<a class="r-tile${i % 4 === 0 || i % 4 === 3 ? " tall" : ""}" href="#/ricetta/${r.id}">
      <figure data-photo="r:${r.id}">${recipeArt(r, { tile: true, plate: r.cat === "pezzi" })}</figure>
      ${hasBimby(r) ? `<span class="r-badge">Bimby</span>` : ""}${favs["r:" + r.id] ? `<span class="r-fav">${BOOKMARK(true)}</span>` : ""}
      <span class="r-tile-txt"><b>${esc(r.t)}</b><small>dai ${r.m} mesi · ${r.min} min</small></span></a>`;
  }
  function tileGrid(list) {
    const tiles = list.map(recipeTile);
    return `<div class="r-grid"><div>${tiles.filter((_, i) => i % 2 === 0).join("")}</div><div>${tiles.filter((_, i) => i % 2 === 1).join("")}</div></div>`;
  }
  function recipeSlide(r) {
    const fav = favs["r:" + r.id];
    return `<div class="r-slide">
      <figure class="r-slide-img" data-photo="r:${r.id}">${recipeArt(r, { fill: true })}</figure>
      <div class="r-slide-card"><h3>${esc(r.t)}</h3><div class="r-slide-meta">${recipeMeta(r)}</div></div>
      <a class="r-slide-link" href="#/ricetta/${r.id}" aria-label="${esc(r.t)}"></a>
      <span class="r-slide-badge" aria-hidden="true">${r.e}</span>
      <button class="r-bm${fav ? " on" : ""}" data-act="fav" data-id="r:${r.id}" aria-label="${fav ? "Togli dai preferiti" : "Salva nei preferiti"}">${BOOKMARK(fav)}</button>
    </div>`;
  }
  // Carosello: i pallini seguono lo scorrimento e la posizione resta dopo un aggiornamento della pagina
  function wireCarousel(root) {
    const car = root.querySelector("#rCarousel"), dots = root.querySelectorAll(".r-dots i");
    if (!car) return;
    car.scrollLeft = ui.carX || 0;
    const upd = () => {
      ui.carX = car.scrollLeft;
      const i = Math.round(car.scrollLeft / Math.max(1, car.firstElementChild.offsetWidth + 12));
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
    };
    car.addEventListener("scroll", upd, { passive: true }); upd();
  }

  function viewRecipes() {
    const m = ageM();
    const s = season();
    let list = RECIPES.slice();
    if (ui.rAge === "ora") list = recipesForAge(m);
    else if (ui.rAge === "6") list = list.filter(r => r.m <= 6);
    else if (ui.rAge === "7-8") list = list.filter(r => r.m >= 7 && r.m <= 8);
    else if (ui.rAge === "9") list = list.filter(r => r.m >= 9);
    if (ui.rCat !== "tutte") list = list.filter(r => String(ui.rCat).split(",").includes(r.cat));
    if (ui.rSeason) list = list.filter(r => !r.seasons.length || r.seasons.includes(s));
    if (ui.rFav) list = list.filter(r => favs["r:" + r.id]);
    if (ui.rQ) {
      // cerca anche negli allergeni, così «pesce» trova orata, platessa e trota
      const q = normTxt(ui.rQ.trim());
      list = list.filter(r => normTxt(r.t + " " + r.ing.join(" ") + " " + r.al.map(a => (window.ALLERGENS[a] || {}).n).join(" ")).includes(q));
    }
    const chip = (key, val, label) => `<button class="chip ${ui[key] === val ? "on" : ""}" data-act="set" data-k="${key}" data-v="${val}">${label}</button>`;
    const toggle = (key, label) => `<button class="chip ${ui[key] ? "on" : ""}" data-act="toggle" data-k="${key}">${label}</button>`;
    const home = ui.rAge === "ora" && ui.rCat === "tutte" && !ui.rSeason && !ui.rFav && !ui.rQ;
    let body;
    if (home) {
      // In evidenza: le ricette adatte all'età e di stagione, a rotazione ogni giorno
      const pool = list.filter(r => !r.seasons.length || r.seasons.includes(s));
      const day = Math.floor(today0().getTime() / 864e5), n = Math.min(6, pool.length);
      const picks = Array.from({ length: n }, (_, i) => pool[(day * 5 + i * 7) % pool.length]).filter((r, i, a) => a.indexOf(r) === i);
      const section = (title, items, act) => items.length ? `<div class="section-title"><h2>${title}</h2>${act}</div>${tileGrid(items.slice(0, 6))}` : "";
      const more = (k, v) => `<button class="link-btn" data-act="set" data-k="${k}" data-v="${v}">Tutte ›</button>`;
      const byCat = (...cats) => list.filter(r => cats.includes(r.cat)).sort((a, b) => b.m - a.m);
      body = `<div class="r-carousel" id="rCarousel">${picks.map(recipeSlide).join("")}</div>
        <div class="r-dots" aria-hidden="true">${picks.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
        ${section("Di stagione", list.filter(r => r.seasons.includes(s)), `<button class="link-btn" data-act="toggle" data-k="rSeason">Tutte ›</button>`)}
        ${section("Pappe", byCat("pappa", "base"), more("rCat", "pappa,base"))}
        ${section("Da prendere con le mani", byCat("pezzi"), more("rCat", "pezzi"))}
        ${section("Colazione e merenda", byCat("colazione", "merenda"), more("rCat", "colazione,merenda"))}
        ${section("Con tutta la famiglia", byCat("famiglia"), more("rCat", "famiglia"))}`;
    } else {
      body = `<p class="small muted">${plural(list.length, "ricetta", "ricette")}</p>
        ${list.length ? tileGrid(list) : `<div class="empty"><b>🥣</b>Nessuna ricetta con questi filtri.</div>`}`;
    }
    return `
      <input class="search" type="search" placeholder="Cerca ricetta o ingrediente" value="${esc(ui.rQ)}" data-input="rQ" aria-label="Cerca ricette">
      <div class="chips">
        ${chip("rAge", "ora", m < 6 ? "Per iniziare" : "Adatte ora")}${chip("rAge", "6", "6 mesi")}${chip("rAge", "7-8", "7-8 mesi")}${chip("rAge", "9", "9+ mesi")}${chip("rAge", "tutte", "Tutte le età")}
      </div>
      <div class="chips">
        <button class="chip ${bimbyOn() ? "on" : ""}" data-act="cook-mode" data-v="${bimbyOn() ? "classica" : "bimby"}">Ho il Bimby</button>
        ${toggle("rSeason", "🍂 Di stagione")}${toggle("rFav", "❤️ Preferite")}
        ${chip("rCat", "tutte", "Tutti i tipi")}${Object.keys(RECIPE_CATS).map(k => chip("rCat", k, RECIPE_CATS[k])).join("")}
      </div>
      <div id="results">${body}</div>
      <p class="disclaimer">Ogni ricetta ha la versione <b>pappa</b> 🥄 e quella <b>a pezzi</b> ✋. Le quantità sono indicative: segui l'appetito del bambino e le indicazioni del pediatra.</p>`;
  }

  // Icona per ogni ingrediente (la prima parola chiave che corrisponde)
  const ING_ICONS = [[/niente sale|senza sale/, "🚫"], [/arachid/, "🥜"], [/verdure/, "🥗"], [/brodo/, "🍲"], [/patata dolce|batata/, "🍠"], [/zucchin/, "🥒"], [/zucca/, "🎃"],
    [/carot/, "🥕"], [/patat/, "🥔"], [/broccol/, "🥦"], [/spinaci|verza/, "🥬"], [/pomodor|passata/, "🍅"], [/pisell/, "🫛"], [/lenticch|fagiol|ceci/, "🫘"],
    [/cipoll|porro/, "🧅"], [/sedano|prezzemolo|basilico|rosmarino/, "🌿"], [/avocado/, "🥑"], [/banana/, "🍌"], [/mela/, "🍎"], [/pera\b/, "🍐"], [/caco|cachi/, "🧡"],
    [/limone/, "🍋"], [/salmone|merluzz|nasello|pesce/, "🐟"], [/tacchino|pollo|vitello|macinato|carne/, "🍗"], [/uov/, "🥚"], [/parmigian|ricotta|formaggio/, "🧀"],
    [/yogurt/, "🥛"], [/latte/, "🍼"], [/olio/, "🫒"], [/mais|polenta/, "🌽"], [/riso|vialone/, "🍚"], [/pasta|pastina|fusilli|penne|ditalini|stelline/, "🍝"],
    [/pangrattato|pane/, "🍞"], [/avena|farina|semolino|lievito/, "🌾"], [/tahina|sesamo|cannella/, "🌰"], [/acqua/, "💧"]];
  function ingRow(txt) {
    const t = normTxt(txt), ic = (ING_ICONS.find(([re]) => re.test(t)) || [0, "🥄"])[1];
    const m = txt.match(/^(.*?)\s*\((.*)\)\s*$/);
    return `<li><span class="rd-ic" aria-hidden="true">${ic}</span><span><b>${esc(m ? m[1] : txt)}</b>${m ? `<small>${esc(m[2])}</small>` : ""}</span></li>`;
  }
  const cookidooUrl = r => googleUrl("site:cookidoo.it " + r.t.replace(/[«»()]/g, "").replace(/\s*:.*$/, ""));
  function recipeSteps(r) {
    const useB = hasBimby(r);
    return { useB, steps: useB ? BIMBY[r.id] : r.steps.map(t => [t, ""]) };
  }

  function viewRecipe(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return `<div class="empty"><b>🤔</b>Ricetta non trovata. <a href="#/ricette">Torna alle ricette</a></div>`;
    const fav = favs["r:" + r.id];
    const m = ageM(), bb = !!BIMBY[r.id], { useB, steps } = recipeSteps(r), ver = ui.rVer || "pappa";
    const chips = [`dai ${r.m} mesi`, RECIPE_CATS[r.cat]].concat(r.seasons.length ? ["🍂 " + (r.seasons.length > 1 ? r.seasons.slice(0, -1).join(", ") + " e " + r.seasons[r.seasons.length - 1] : r.seasons[0])] : [], useB ? ["TM31", "TM5", "TM6", "TM7"] : []);
    const seg = (act, k, v, label, on) => `<button class="${on ? "on" : ""}" data-act="${act}"${k ? ` data-k="${k}"` : ""} data-v="${v}">${label}</button>`;
    return `
      <div class="rd-hero">
        <figure data-photo="r:${r.id}">${recipeArt(r, { fill: true })}</figure>
        <div class="rd-float">
          <button class="rd-btn" data-act="back" aria-label="Indietro">‹</button>
          <span class="grow"></span>
          <button class="rd-btn" data-act="recipe-more" data-id="${r.id}" aria-label="Foto, copia e condividi">⋯</button>
          <button class="rd-btn${fav ? " on" : ""}" data-act="fav" data-id="r:${r.id}" aria-label="${fav ? "Togli dai preferiti" : "Salva nei preferiti"}">${BOOKMARK(fav)}</button>
        </div>
      </div>
      <p class="small muted rd-cap" data-photo-cap="r:${r.id}">Illustrazione indicativa: colore, consistenza e forma dei pezzi</p>
      <div class="rd-chips">${chips.map(c => `<span>${esc(c)}</span>`).join("")}</div>
      <h1 class="rd-title">${esc(r.t)}</h1>
      <div class="rd-meta"><span>⏱ ${r.min} min</span><span>🥄 pappa</span><span>✋ a pezzi</span></div>
      ${r.al.length ? `<div class="rd-al">${allergenTags(r.al)}</div>` : ""}
      <div class="btn-row rd-ctas"><button class="btn rd-cook" data-act="cook" data-id="${r.id}" style="flex:1">👩‍🍳 Cucina passo passo</button><button class="btn ghost rd-cook" data-act="plan-recipe" data-id="${r.id}" aria-label="Aggiungi alla settimana">🗓️</button></div>
      ${r.m > m && m >= 6 ? `<div class="note">Questa ricetta è pensata dai ${r.m} mesi: tienila per più avanti.</div>` : ""}
      ${bb ? `<h2 class="rd-h">Come la prepari</h2><div class="segmented rd-seg">${seg("cook-mode", "", "classica", "🍳 Pentola e forno", !useB)}${seg("cook-mode", "", "bimby", "Bimby®", useB)}</div>` : ""}
      <h2 class="rd-h">Ingredienti</h2>
      <ul class="rd-ing">${r.ing.map(ingRow).join("")}</ul>
      <h2 class="rd-h">Procedimento${useB ? " con il Bimby" : ""}</h2>
      <ol class="rd-steps">${steps.map(([t, set], i) => `<li><span class="rd-n">${i + 1}</span><div>${esc(t)}${set ? `<div class="rd-set">${esc(set)}</div>` : ""}</div></li>`).join("")}</ol>
      ${useB ? `<div class="card tint-green small"><div class="card-kicker">Con il Bimby</div><ul>${(window.BIMBY_NOTES || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      <h2 class="rd-h">Per il tuo bimbo</h2>
      <div class="segmented rd-seg">${seg("set", "rVer", "pappa", "🥄 Pappa", ver === "pappa")}${seg("set", "rVer", "pezzi", "✋ A pezzi", ver === "pezzi")}</div>
      <div class="card ${ver === "pappa" ? "tint-peach" : "tint-green"}"><p>${esc(ver === "pappa" ? r.pappa : r.pezzi)}</p></div>
      <div class="card tint-yellow"><div class="card-kicker">💡 Consiglio</div><p>${esc(r.tip)}</p></div>
      <div class="card"><div class="card-kicker">🧊 Conservazione</div><p>${esc(r.store)}</p></div>
      ${r.al.length ? `<div class="card small">Contiene allergeni: se è la prima volta, offrine poco, a pranzo, e osserva il bimbo. <a href="#/sezione/allergeni">Come introdurre gli allergeni ›</a></div>` : ""}
      ${videoBlock("r:" + r.id, r.videos, "ricetta svezzamento " + r.t.replace(/[«»()]/g, ""))}
      <div class="btn-row"><button class="btn ghost" data-act="recipe-copy" data-id="${r.id}">📋 Copia la ricetta</button>
        ${bb ? `<a class="btn ghost" href="${cookidooUrl(r)}" target="_blank" rel="noopener">🔎 Simili su Cookidoo</a>` : ""}</div>
      <p class="disclaimer">Niente sale, zucchero o miele nel primo anno. Le quantità sono indicative.${bb ? " Bimby® è un marchio di Vorwerk: Piccoli Passi non è collegata a Vorwerk." : ""}</p>`;
  }
  function recipeText(r) {
    const { useB, steps } = recipeSteps(r);
    return [r.t, "", "Ingredienti:"].concat(r.ing.map(i => "- " + i), ["", "Preparazione" + (useB ? " con il Bimby" : "") + ":"],
      steps.map(([t, set], i) => (i + 1) + ". " + t + (set ? " [" + set + "]" : "")),
      ["", "Versione pappa: " + r.pappa, "Versione a pezzi: " + r.pezzi, "", "Da Piccoli Passi"]).join("\n");
  }
  function openRecipeMenu(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return;
    openSheet(`<h2>${esc(r.t)}</h2>
      <div class="card" style="padding:0;overflow:hidden">
        <label class="food" style="cursor:pointer"><span class="st">📷</span><span class="grow">Aggiungi la tua foto del piatto</span><input type="file" accept="image/*" data-act="photo" data-key="r:${r.id}" hidden></label>
        <button class="food" data-act="photo-del" data-key="r:${r.id}" id="menuPhotoDel" hidden><span class="st">🗑️</span><span class="grow">Togli la tua foto</span></button>
        <button class="food" data-act="recipe-copy" data-id="${r.id}"><span class="st">📋</span><span class="grow">Copia la ricetta</span></button>
        ${navigator.share ? `<button class="food" data-act="recipe-share" data-id="${r.id}"><span class="st">📤</span><span class="grow">Condividi</span></button>` : ""}
        ${BIMBY[r.id] ? `<a class="food" href="${cookidooUrl(r)}" target="_blank" rel="noopener"><span class="st">🔎</span><span class="grow">Cerca ricette simili su Cookidoo</span><span class="muted">›</span></a>` : ""}
      </div>
      <button class="btn ghost block" data-act="close">Chiudi</button>`);
    PhotoDB.get("r:" + r.id).then(b => { const x = document.getElementById("menuPhotoDel"); if (b && x) x.hidden = false; }).catch(() => { /* niente foto */ });
  }

  /* Cucina passo passo: un passo alla volta, schermo sempre acceso, timer per le cotture */
  let cook = null, wakeLock = null, cookTimer = null, audio = null;
  async function keepAwake(on) {
    try {
      if (on && "wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
      else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* non supportato o negato */ }
  }
  document.addEventListener("visibilitychange", () => { if (cook && document.visibilityState === "visible") keepAwake(true); });
  function openCook(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return;
    cook = Object.assign({ r, i: -1 }, recipeSteps(r));
    let el = document.getElementById("cook");
    if (!el) {
      el = document.createElement("section"); el.id = "cook"; el.className = "cook";
      el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); document.body.appendChild(el);
    }
    el.hidden = false; document.body.style.overflow = "hidden";
    keepAwake(true); drawCook();
  }
  function closeCook() {
    const el = document.getElementById("cook");
    if (el) { el.hidden = true; el.innerHTML = ""; }
    document.body.style.overflow = ""; cook = null; stopTimer(); keepAwake(false);
  }
  // Minuti di cottura scritti nel passo («cuoci per 15-20 minuti»): il timer parte dal valore più basso
  function stepMinutes(t) {
    const m = String(t).match(/(\d+)(?:\s*-\s*\d+)?\s*minut/);
    return m && +m[1] >= 2 ? +m[1] : 0;
  }
  function drawCook() {
    const el = document.getElementById("cook"), c = cook;
    if (!el || !c) return;
    const n = c.steps.length, atIng = c.i < 0, end = c.i >= n;
    let main;
    if (atIng) main = `<div class="cook-kicker">Prima di iniziare</div><h2>Prepara gli ingredienti</h2><ul class="rd-ing">${c.r.ing.map(ingRow).join("")}</ul>`;
    else if (end) main = `<div class="cook-done">🎉</div><h2>Fatto!</h2><p><b>🥄 Pappa:</b> ${esc(c.r.pappa)}</p><p><b>✋ A pezzi:</b> ${esc(c.r.pezzi)}</p><p class="small muted">Controlla sempre la temperatura sul dorso della mano prima di servire.</p>`;
    else {
      const [t, set] = c.steps[c.i], mins = stepMinutes(t);
      main = `<div class="cook-kicker">Passo ${c.i + 1} di ${n}</div><p class="cook-text">${esc(t)}</p>
        ${set ? `<div class="cook-set">${esc(set)}</div>` : ""}
        ${mins ? `<button class="btn ghost" data-act="cook-timer" data-m="${mins}">⏲️ Timer ${mins} minuti</button>` : ""}`;
    }
    const pct = atIng ? 0 : Math.min(100, Math.round(Math.min(c.i + 1, n) / n * 100));
    el.innerHTML = `<header class="cook-top"><button class="rd-btn" data-act="cook-close" aria-label="Chiudi">✕</button>
        <div class="grow"><b>${esc(c.r.t)}</b><div class="small muted">${c.useB ? "Con il Bimby" : "Pentola e forno"}</div></div>
        <button class="cook-timer" id="cookTimer" data-act="cook-timer-stop" hidden></button></header>
      <div class="progress"><i style="width:${pct}%"></i></div>
      <div class="cook-main">${main}</div>
      <footer class="cook-nav">${atIng ? "" : `<button class="btn ghost" data-act="cook-prev">‹ Indietro</button>`}
        ${end ? `<button class="btn" data-act="cook-close">Chiudi</button>` : `<button class="btn" data-act="cook-next">${atIng ? "Iniziamo" : c.i === n - 1 ? "Fine" : "Avanti ›"}</button>`}</footer>`;
    tickTimer();
  }
  function startTimer(mins) {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch (e) { audio = null; }
    stopTimer();
    cookTimer = { end: Date.now() + mins * 60e3, iv: setInterval(tickTimer, 1000) };
    tickTimer(); toast("Timer avviato: " + mins + " minuti");
  }
  function stopTimer() { if (cookTimer) clearInterval(cookTimer.iv); cookTimer = null; tickTimer(); }
  function tickTimer() {
    const b = document.getElementById("cookTimer");
    if (!cookTimer) { if (b) b.hidden = true; return; }
    const left = Math.max(0, Math.round((cookTimer.end - Date.now()) / 1000));
    if (b) { b.hidden = false; b.textContent = "⏲️ " + Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0"); b.setAttribute("aria-label", "Timer: tocca per fermarlo"); }
    if (!left) { clearInterval(cookTimer.iv); cookTimer = null; ring(); if (b) b.textContent = "⏰ Tempo!"; toast("⏰ Tempo scaduto: controlla la cottura"); }
  }
  function ring() {
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
    if (!audio) return;
    try {
      [0, 0.45, 0.9].forEach(d => {
        const o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime + d;
        o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
        g.gain.setValueAtTime(0.3, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35); o.start(t0); o.stop(t0 + 0.4);
      });
    } catch (e) { /* audio non disponibile */ }
  }

  /* ---------------- Guida ---------------- */
  function viewGuide() {
    const tried = Object.keys(foods).length;
    return `
      <a class="card list-card tint-green" href="#/cibi">
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
      if (a && a.m < 6) extra = `<div class="note">${name()} compirà 6 mesi ${dayPrep(a.six, "il")}<b>${fmt(a.six)}</b>.</div>`;
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

  function viewFoods() {
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
        <div class="card-kicker">📒 Il diario di ${ofName()}</div>
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

  /* ---------------- Diario: calendario della giornata ---------------- */
  // Ogni voce: { id, date, time, type, ... }. Le voci eliminate restano con del: true: così un telefono con una
  // versione vecchia dell'app (che non conosce il diario) non può cancellarle dagli altri telefoni della famiglia.
  const LOG_TYPES = {
    pasto: { e: "🥣", n: "Pappa", c: "peach" },
    latte: { e: "🍼", n: "Latte", c: "blue" },
    sonno: { e: "😴", n: "Nanna", c: "purple" },
    pannolino: { e: "🧷", n: "Pannolino", c: "yellow" },
    misure: { e: "📏", n: "Peso e misure", c: "green" },
    salute: { e: "🌡️", n: "Salute", c: "pink" },
    traguardo: { e: "⭐", n: "Prima volta", c: "yellow" },
    nota: { e: "📝", n: "Nota", c: "gray" },
    foto: { e: "📷", n: "Foto", c: "gray" }
  };
  const ADD_ORDER = ["pasto", "latte", "sonno", "pannolino", "foto", "misure", "salute", "traguardo", "nota"];
  const FIRST_TIMES = ["Primo sorriso", "Si gira da solo", "Sta seduto", "Primo dentino", "Gattona", "Prima pappa", "Prima parola", "Si alza in piedi", "Primi passi", "Dice «mamma» o «papà»"];
  const MOODS = ["😊", "😄", "😐", "😢", "😴", "🤒"];
  const nowHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const toMin = t => { const p = String(t || "0:0").split(":").map(Number); return (p[0] || 0) * 60 + (p[1] || 0); };
  const durTxt = m => (m >= 60 ? Math.floor(m / 60) + " h" + (m % 60 ? " " + String(m % 60).padStart(2, "0") : "") : Math.max(0, m) + " min");
  const diaryAll = () => (diary || []).filter(x => x && !x.del);
  const sleeping = () => diaryAll().find(x => x.type === "sonno" && !x.end);
  function sleepMin(x) {
    if (!x.end) {
      const st = parseISO(x.date); st.setHours(0, toMin(x.time), 0, 0);
      return Math.max(0, Math.round((Date.now() - st) / 60000));
    }
    let d = toMin(x.end) - toMin(x.time);
    if (x.endDate && x.endDate !== x.date) d += 1440 * daysBetween(parseISO(x.date), parseISO(x.endDate));
    else if (d < 0) d += 1440;
    return d;
  }
  // Voci di un giorno: diario + misure (stanno nelle curve di crescita) + appuntamenti in agenda
  function dayItems(d) {
    const xs = diaryAll().filter(x => x.date === d)
      .concat(growth.filter(g => g.date === d).map(g => Object.assign({ type: "misure", time: g.time || "", growth: true }, g)));
    return xs.sort((a, b) => String(a.time || "99").localeCompare(String(b.time || "99")));
  }
  function daySummary(d) {
    const s = { sonno: 0, latte: 0, ml: 0, pasto: 0, pannolino: 0, foto: 0 };
    diaryAll().filter(x => x.date === d).forEach(x => {
      if (x.type === "sonno") s.sonno += sleepMin(x);
      else if (x.type === "latte") { s.latte++; s.ml += Number(x.ml) || 0; }
      else if (x.type === "foto") s.foto += (x.photos || []).length;
      else if (s[x.type] != null) s[x.type]++;
    });
    return s;
  }
  function summaryChips(s) {
    const c = [];
    if (s.sonno) c.push(`😴 ${durTxt(s.sonno)}`);
    if (s.latte) c.push(`🍼 ${s.latte}${s.ml ? " · " + s.ml + " ml" : ""}`);
    if (s.pasto) c.push(`🥣 ${s.pasto}`);
    if (s.pannolino) c.push(`🧷 ${s.pannolino}`);
    if (s.foto) c.push(`📷 ${s.foto}`);
    return c.map(x => `<span class="tag">${x}</span>`).join("");
  }
  const foodName = id => (FOODS.find(f => f.id === id) || { n: id }).n;
  // Cacca: [chiave, etichetta del pulsante, testo nel diario, da segnalare al pediatra]
  const POO_CONS = [["liquida", "💧 Liquida", "liquida"], ["molle", "Molle", "molle"], ["morbida", "Morbida", "morbida"], ["formata", "Formata", "formata"], ["dura", "Dura, a palline", "dura"]];
  const POO_COL = [["gialla", "🟡 Gialla", "gialla"], ["verde", "🟢 Verde", "verde"], ["marrone", "🟤 Marrone", "marrone"], ["nera", "⚫ Nera", "nera", 1], ["rossa", "🔴 Con sangue", "con sangue", 1], ["bianca", "⚪ Bianca o grigia", "bianca o grigia", 1]];
  function logTitle(x) {
    switch (x.type) {
      case "pasto": return (x.foods || []).map(foodName).join(", ") || "Pappa";
      case "latte": return x.kind === "biberon" ? "Biberon" + (x.ml ? " · " + x.ml + " ml" : "") : "Seno" + (x.side ? " " + ({ sx: "sinistro", dx: "destro", entrambi: "entrambi" })[x.side] : "") + (x.min ? " · " + x.min + " min" : "");
      case "sonno": return x.end ? "Nanna di " + durTxt(sleepMin(x)) : "Sta dormendo da " + durTxt(sleepMin(x));
      case "pannolino": {
        const cons = (POO_CONS.find(c => c[0] === x.cons) || [])[2], col = POO_COL.find(c => c[0] === x.col);
        return [({ pipi: "Pipì", cacca: "Cacca", entrambi: "Pipì e cacca" })[x.kind] || "Pannolino", cons, col ? col[2] + (col[3] ? " ⚠️" : "") : ""].filter(Boolean).join(" · ");
      }
      case "misure": return [x.w ? String(x.w).replace(".", ",") + " kg" : "", x.l ? String(x.l).replace(".", ",") + " cm" : "", x.h ? "testa " + String(x.h).replace(".", ",") + " cm" : ""].filter(Boolean).join(" · ");
      case "salute": return [x.temp ? String(x.temp).replace(".", ",") + " °C" : "", x.sym || "", x.med ? "💊 " + x.med : ""].filter(Boolean).join(" · ") || "Salute";
      case "traguardo": return x.t || "Una prima volta";
      case "nota": return (x.mood ? x.mood + " " : "") + (x.t || "Nota");
      case "foto": return x.t || plural((x.photos || []).length, "foto", "foto");
    }
    return "";
  }
  function logSub(x) {
    const bits = [];
    if (x.time) bits.push(x.type === "sonno" && x.end ? x.time + "–" + x.end : x.time);
    if (x.type === "pasto") { if (x.q) bits.push(({ poco: "ne ha mangiato poco", meta: "circa metà", tutto: "tutto" })[x.q]); if (x.r && REACT[x.r]) bits.push(REACT[x.r][0] + " " + REACT[x.r][1]); }
    if (x.note) bits.push(x.note);
    if (x.by && raw.get("sync", null)) bits.push("✍️ " + x.by);
    return bits.join(" · ");
  }
  const phImg = id => `<img data-ph="${esc(id)}" alt="Foto" loading="lazy">`;
  function logItem(x) {
    const T = LOG_TYPES[x.type] || LOG_TYPES.nota;
    return `<button class="lg-item" data-act="${x.growth ? "g-edit" : "log-edit"}" data-id="${esc(x.id)}">
      <span class="lg-ic lc-${T.c}">${T.e}</span>
      <span class="grow"><b>${esc(logTitle(x))}</b>${logSub(x) ? `<small>${esc(logSub(x))}</small>` : ""}
        ${x.type === "foto" && (x.photos || []).length ? `<span class="lg-photos">${x.photos.map(phImg).join("")}</span>` : ""}</span>
      ${x.type === "sonno" && !x.end ? `<span class="tag purple">in corso</span>` : ""}</button>`;
  }
  const addButtons = d => `<div class="lg-add">${ADD_ORDER.map(k => `<button data-act="log-add" data-type="${k}" data-d="${d}"><span class="lg-ic lc-${LOG_TYPES[k].c}">${LOG_TYPES[k].e}</span>${LOG_TYPES[k].n}</button>`).join("")}</div>`;
  function sleepLiveCard() {
    const x = sleeping();
    if (!x) return "";
    return `<div class="card lg-live"><span class="lg-ic lc-purple">😴</span><div class="grow"><b>${name()} sta dormendo</b><div class="small muted"><span class="nw">dalle ${esc(x.time)}${x.date !== iso(today0()) ? " di ieri" : ""}</span> · <span class="nw">${durTxt(sleepMin(x))}</span></div></div>
      <button class="btn small" data-act="sleep-stop" data-id="${esc(x.id)}">Si è svegliato</button></div>`;
  }
  // In «Oggi»: aggiunta rapida al diario e riepilogo della giornata
  function todayDiaryCard() {
    const d = iso(today0()), items = dayItems(d), s = daySummary(d);
    const q = [["pasto", "Pappa"], ["latte", "Latte"], ["sonno", "Nanna"], ["pannolino", "Pannolino"], ["foto", "Foto"], ["misure", "Peso"], ["salute", "Salute"]], zz = sleeping();
    return `<div class="card lg-today">
      <div class="section-title" style="margin:0 0 8px"><h2>Il diario di oggi</h2><a href="#/diario">Calendario ›</a></div>
      <div class="lg-quick">${q.map(([k, l]) => k === "sonno"
        ? (zz ? `<button data-act="sleep-stop" data-id="${esc(zz.id)}"><span class="lg-ic lc-purple">☀️</span>Sveglio</button>` : `<button data-act="sleep-start"><span class="lg-ic lc-purple">😴</span>${l}</button>`)
        : `<button data-act="log-add" data-type="${k}" data-d="${d}"><span class="lg-ic lc-${LOG_TYPES[k].c}">${LOG_TYPES[k].e}</span>${l}</button>`).join("")}
        <a href="#/diario" class="lg-more"><span class="lg-ic lc-gray">＋</span>Altro</a></div>
      ${summaryChips(s) ? `<div style="margin-top:10px">${summaryChips(s)}</div>` : ""}
      ${items.length ? `<div class="lg-list" style="margin-top:8px">${items.slice(-3).reverse().map(logItem).join("")}</div>` : `<p class="small muted" style="margin:10px 0 0">Tocca un'icona per segnare pappe, poppate, nanne, pannolini o una foto: tutto finisce nel calendario${raw.get("sync", null) ? " e lo vede anche la famiglia" : ""}.</p>`}
    </div>`;
  }
  function ageAt(d) {
    if (!settings || !settings.birth) return null;
    const b = parseISO(settings.birth), t = parseISO(d);
    if (t < b) return null;
    let m = (t.getFullYear() - b.getFullYear()) * 12 + t.getMonth() - b.getMonth();
    if (addMonths(b, m) > t) m--;
    return { m, d: daysBetween(addMonths(b, m), t), total: daysBetween(b, t) };
  }

  function viewDiary() {
    const today = iso(today0());
    const tab = ui.dTab || "cal";
    const seg = (v, label) => `<button class="${tab === v ? "on" : ""}" data-act="set" data-k="dTab" data-v="${v}">${segLabel(label)}</button>`;
    let body;
    if (tab === "foto") body = viewMemories();
    else if (tab === "trend") body = viewTrends();
    else {
      const sel = ui.dSel || today, mon = ui.dMon || sel.slice(0, 7) + "-01";
      const first = parseISO(mon), y = first.getFullYear(), mo = first.getMonth();
      const lead = (first.getDay() + 6) % 7, nDays = new Date(y, mo + 1, 0).getDate();
      const byDay = {};
      diaryAll().forEach(x => { if (x.date.startsWith(mon.slice(0, 7))) (byDay[x.date] = byDay[x.date] || []).push(x); });
      growth.forEach(g => { if (g.date && g.date.startsWith(mon.slice(0, 7))) (byDay[g.date] = byDay[g.date] || []).push({ type: "misure" }); });
      const apptDays = new Set(appts.map(a => a.date));
      const cells = [];
      for (let i = 0; i < lead; i++) cells.push(`<span class="cal-d off"></span>`);
      for (let n = 1; n <= nDays; n++) {
        const d = iso(new Date(y, mo, n)), xs = byDay[d] || [];
        const types = [...new Set(xs.map(x => x.type))].slice(0, 4);
        const ph = xs.find(x => x.type === "foto" && (x.photos || []).length);
        const before = settings.birth && d < settings.birth;
        cells.push(`<button class="cal-d${d === sel ? " sel" : ""}${d === today ? " today" : ""}${d > today || before ? " dim" : ""}${ph ? " has-ph" : ""}" data-act="cal-day" data-d="${d}" aria-label="${fmt(parseISO(d), { weekday: "long", day: "numeric", month: "long" })}">
          ${ph ? phImg(ph.photos[0]) : ""}<b>${n}</b>
          <span class="cal-dots">${types.map(t => `<i class="lc-${LOG_TYPES[t].c}"></i>`).join("")}${apptDays.has(d) ? `<i class="lc-appt"></i>` : ""}</span></button>`);
      }
      const items = dayItems(sel), ap = appts.filter(a => a.date === sel), a = ageAt(sel);
      const s = daySummary(sel);
      body = `
        <div class="cal-head">
          <button class="rd-btn" data-act="cal-mon" data-d="-1" aria-label="Mese precedente">‹</button>
          <h2>${fmt(first, { month: "long", year: "numeric" })}</h2>
          <button class="rd-btn" data-act="cal-mon" data-d="1" aria-label="Mese successivo">›</button>
        </div>
        <div class="cal-grid">${["L", "M", "M", "G", "V", "S", "D"].map(w => `<span class="cal-w">${w}</span>`).join("")}${cells.join("")}</div>
        ${sel !== today ? `<button class="link-btn small" data-act="cal-day" data-d="${today}" style="margin:6px 0 0">↩︎ Torna a oggi</button>` : ""}
        <div class="lg-day">
          <h2>${sel === today ? "Oggi" : fmt(parseISO(sel), { weekday: "long", day: "numeric", month: "long" })}</h2>
          ${a ? `<div class="small muted">${name()} ${sel === today ? "ha" : "aveva"} ${ageText(a)}</div>` : ""}
          ${summaryChips(s) ? `<div style="margin-top:8px">${summaryChips(s)}</div>` : ""}
        </div>
        ${sel === today ? sleepLiveCard() : ""}
        ${ap.map(x => `<a class="lg-item" href="#/salute"><span class="lg-ic lc-appt">📅</span><span class="grow"><b>${esc(x.t || APPT_TYPES[x.type])}</b><small>${esc(x.time || "")}${x.place ? " · " + esc(x.place) : ""}</small></span></a>`).join("")}
        ${items.length ? `<div class="lg-list">${items.map(logItem).join("")}</div>` : `<p class="small muted">${sel > today ? "È un giorno futuro: puoi già segnare un appuntamento in Salute." : "Ancora niente in questo giorno. Aggiungi qualcosa qui sotto."}</p>`}
        ${sel <= today ? `<div class="section-title"><h2>Aggiungi</h2></div>${addButtons(sel)}` : ""}`;
    }
    return `<div class="segmented">${seg("cal", "📅 Calendario")}${seg("foto", "📷 Ricordi")}${seg("trend", "📊 Andamento")}</div>${body}`;
  }
  function viewMemories() {
    const xs = diaryAll().filter(x => x.type === "foto" && (x.photos || []).length).sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || "")));
    if (!xs.length) return `<div class="empty"><b>📷</b>Ancora nessuna foto. Aggiungine una dal calendario: resterà nel diario del giorno.</div>
      <button class="btn block" data-act="log-add" data-type="foto" data-d="${iso(today0())}">📷 Aggiungi una foto</button>`;
    const groups = {};
    xs.forEach(x => { const k = x.date.slice(0, 7); (groups[k] = groups[k] || []).push(x); });
    const share = raw.get("sync", null) ? (raw.get("photoShare", 0) ? `<p class="small muted">Le foto per ora restano su questo telefono: per vederle anche sugli altri telefoni della famiglia va aggiornato il servizio Google (versione 5).</p>` : `<p class="small muted">Le foto vengono cifrate e condivise con la famiglia.</p>`) : "";
    return share + Object.keys(groups).map(k => {
      const a = ageAt(k + "-15");
      const lbl = fmt(parseISO(k + "-01"), { month: "long", year: "numeric" });
      return `<div class="section-title"><h2>${lbl.charAt(0).toUpperCase() + lbl.slice(1)}</h2><span class="small muted">${a ? plural(a.m, "mese", "mesi") : ""}</span></div>
        <div class="ph-grid">${groups[k].flatMap(x => x.photos.map(id => `<button data-act="photo-open" data-id="${esc(id)}" data-e="${esc(x.id)}">${phImg(id)}</button>`)).join("")}</div>`;
    }).join("");
  }
  function viewTrends() {
    const days = Array.from({ length: 14 }, (_, i) => iso(addDays(today0(), i - 13)));
    const data = days.map(d => Object.assign({ d }, daySummary(d)));
    const bars = (k, fmtV, unit) => {
      const max = Math.max(1, ...data.map(x => x[k]));
      return `<div class="tr-bars">${data.map(x => `<span title="${fmtV(x[k])}"><i style="height:${Math.round(x[k] / max * 100)}%"></i><small>${parseISO(x.d).getDate()}</small></span>`).join("")}</div>
        <p class="small muted" style="margin:6px 0 0">Media: <b>${fmtV(Math.round(data.filter(x => x[k]).reduce((a, x) => a + x[k], 0) / Math.max(1, data.filter(x => x[k]).length)))}</b>${unit} nei giorni segnati</p>`;
    };
    const any = data.some(x => x.sonno || x.latte || x.pannolino || x.pasto);
    if (!any) return `<div class="empty"><b>📊</b>Qui vedrai l'andamento di nanne, poppate e pannolini delle ultime due settimane, man mano che li segni nel diario.</div>`;
    return `<div class="card"><h2>😴 Sonno al giorno</h2>${bars("sonno", durTxt, "")}</div>
      <div class="card"><h2>🍼 Poppate e biberon</h2>${bars("latte", v => String(v), " al giorno")}</div>
      <div class="card"><h2>🥣 Pappe</h2>${bars("pasto", v => String(v), " al giorno")}</div>
      <div class="card"><h2>🧷 Pannolini</h2>${bars("pannolino", v => String(v), " al giorno")}</div>
      <p class="disclaimer">Ogni bambino ha i suoi ritmi: l'andamento serve a voi e al pediatra per capire le abitudini, non è un voto.</p>`;
  }

  // Modulo per aggiungere o modificare una voce
  let pendingPhotos = [], resizing = 0;
  // Allattamento scelto nelle impostazioni: seno, artificiale (biberon) o misto (come l'ultima poppata segnata)
  function defaultMilk() {
    if (settings.feed === "artificiale") return "biberon";
    if (settings.feed === "misto") { const last = diaryAll().filter(x => x.type === "latte" && x.kind).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || ""))).pop(); return last ? last.kind : "seno"; }
    return "seno";
  }
  function openLog(type, date, id) {
    const x = id ? diary.find(v => v.id === id) : null;
    type = x ? x.type : type;
    if (type === "misure") { openAddGrowth(date); return; }
    const T = LOG_TYPES[type], v = x || {}, d = date || (x && x.date) || iso(today0());
    pendingPhotos = [];
    const pick = (nm, opts, cur) => `<div class="lg-pick" data-name="${nm}">${opts.map(([k, l]) => `<button type="button" class="${cur === k ? "on" : ""}" data-act="lg-pick" data-v="${k}">${l}</button>`).join("")}</div><input type="hidden" name="${nm}" value="${esc(cur || "")}">`;
    const time = (nm, label, val) => `<label class="field"><span>${label}</span><input type="time" name="${nm}" value="${esc(val || "")}"></label>`;
    const note = `<label class="field"><span>Note</span><textarea name="note" placeholder="Facoltative">${esc(v.note || "")}</textarea></label>`;
    let f = "";
    if (type === "pasto") {
      const sel = new Set(v.foods || []);
      const recent = Object.keys(foods).sort((a, b) => foodLast(foods[b]).localeCompare(foodLast(foods[a]))).slice(0, 12);
      const list = [...new Set([...sel, ...recent, ...FOODS.map(fd => fd.id)])];
      f = time("time", "Ora", v.time || (d === iso(today0()) ? nowHM() : "12:30")) + `
        <div class="field"><span>Che cosa ha mangiato?</span></div>
        <input class="search" type="search" id="lgFoodQ" placeholder="Cerca un cibo (zucca, mela…)" autocomplete="off">
        <div class="lg-foods" id="lgFoods">${list.map((fid, i) => `<button type="button" class="chip ${sel.has(fid) ? "on" : ""}" data-act="lg-food" data-id="${fid}" data-n="${esc(normTxt(foodName(fid)))}" ${i >= 18 && !sel.has(fid) ? "hidden" : ""}>${esc(foodName(fid))}${foods[fid] ? "" : " ✨"}</button>`).join("")}</div>
        <p class="small muted" style="margin:-4px 0 10px">✨ = prima volta: verrà segnato anche tra i cibi provati.</p>
        <input type="hidden" name="foods" value="${esc([...sel].join(","))}">
        <div class="field"><span>Quanto?</span></div>${pick("q", [["poco", "Poco"], ["meta", "Metà"], ["tutto", "Tutto"]], v.q || "")}
        <div class="field"><span>Com'è andata?</span></div>${pick("r", Object.keys(REACT).map(k => [k, REACT[k][0] + " " + REACT[k][1]]), v.r || "si")}` + note;
    } else if (type === "latte") {
      const kind = v.kind || defaultMilk();
      f = time("time", "Ora", v.time || nowHM()) + `<div class="field"><span>Come?</span></div>${pick("kind", [["seno", "🤱 Seno"], ["biberon", "🍼 Biberon"]], kind)}
        <div id="lgSide"${kind === "seno" ? "" : " hidden"}><div class="field"><span>Lato</span></div>${pick("side", [["sx", "Sinistro"], ["dx", "Destro"], ["entrambi", "Entrambi"]], v.side || "")}</div>
        <div class="cols"><label class="field"><span>Quantità (ml)</span><input type="number" inputmode="numeric" name="ml" min="0" max="400" value="${esc(v.ml || "")}" placeholder="Biberon"></label>
        <label class="field"><span>Durata (min)</span><input type="number" inputmode="numeric" name="min" min="0" max="120" value="${esc(v.min || "")}" placeholder="Seno"></label></div>` + note;
    } else if (type === "sonno") {
      f = `<div class="cols">${time("time", "Si è addormentato alle", v.time || nowHM())}${time("end", "Si è svegliato alle", v.end || "")}</div>
        <p class="small muted" style="margin-top:-6px">Lascia vuoto «svegliato» se sta ancora dormendo: lo segni dopo con un tocco. Se si sveglia dopo mezzanotte, va bene lo stesso.</p>
        <div class="field"><span>Tipo</span></div>${pick("kind", [["nanna", "☀️ Nanna di giorno"], ["notte", "🌙 Notte"]], v.kind || (toMin(nowHM()) > 19 * 60 || toMin(nowHM()) < 6 * 60 ? "notte" : "nanna"))}` + note;
    } else if (type === "pannolino") {
      const poo = ["cacca", "entrambi"].includes(v.kind);
      f = time("time", "Ora", v.time || nowHM()) + `<div class="field"><span>Com'era?</span></div>${pick("kind", [["pipi", "💧 Pipì"], ["cacca", "💩 Cacca"], ["entrambi", "Entrambi"]], v.kind || "pipi")}
        <div id="lgPoo"${poo ? "" : " hidden"}>
          <div class="field"><span>Consistenza</span></div>${pick("cons", POO_CONS.map(([k, l]) => [k, l]), v.cons || "")}
          <div class="field"><span>Colore</span></div>${pick("col", POO_COL.map(([k, l]) => [k, l]), v.col || "")}
          <p class="small muted" style="margin:-4px 0 12px">Gialla, verde o marrone sono tutte normali, e cambiano con la pappa. ⚠️ <b>Bianca o grigia, nera</b> (dopo i primi giorni di vita) <b>o con sangue</b>: senti subito il pediatra.</p>
        </div>` + note;
    } else if (type === "salute") {
      f = time("time", "Ora", v.time || nowHM()) + `<div class="cols"><label class="field"><span>Temperatura (°C)</span><input type="text" inputmode="decimal" name="temp" value="${esc(v.temp || "")}" placeholder="Es. 37,8"></label>
        <label class="field"><span>Farmaco e dose</span><input type="text" name="med" value="${esc(v.med || "")}" placeholder="Es. paracetamolo 2,5 ml"></label></div>
        <label class="field"><span>Sintomi</span><input type="text" name="sym" value="${esc(v.sym || "")}" placeholder="Es. raffreddore, tosse, dentini"></label>` + note +
        `<p class="small muted">Per dosi e farmaci segui sempre le indicazioni del pediatra. In emergenza chiama il 112.</p>`;
    } else if (type === "traguardo") {
      f = `<label class="field"><span>Che cosa ha fatto per la prima volta?</span><input type="text" name="t" required value="${esc(v.t || "")}" placeholder="Es. ha riso a crepapelle"></label>
        <div class="chips" style="margin-top:-6px">${FIRST_TIMES.map(m => `<button type="button" class="chip" data-act="lg-fill" data-v="${esc(m)}">${esc(m)}</button>`).join("")}</div>` + time("time", "Ora (facoltativa)", v.time || "") + note;
    } else if (type === "nota") {
      f = `<div class="field"><span>Com'è andata la giornata?</span></div>${pick("mood", MOODS.map(m => [m, m]), v.mood || "")}
        <label class="field"><span>Nota</span><textarea name="t" required placeholder="Una cosa da ricordare, un dubbio per il pediatra…">${esc(v.t || "")}</textarea></label>` + time("time", "Ora (facoltativa)", v.time || "");
    } else if (type === "foto") {
      f = `<label class="btn ghost block" style="cursor:pointer">📷 Scegli o scatta le foto<input type="file" accept="image/*" multiple data-act="lg-photo" hidden></label>
        <div class="lg-photos big" id="lgPrev">${(v.photos || []).map(id => `<span data-keep="${esc(id)}">${phImg(id)}<button type="button" data-act="lg-unphoto" aria-label="Togli">✕</button></span>`).join("")}</div>
        <label class="field"><span>Didascalia</span><input type="text" name="t" value="${esc(v.t || "")}" placeholder="Es. la prima volta al parco"></label>` + time("time", "Ora (facoltativa)", v.time || nowHM());
    }
    openSheet(`<h2>${T.e} ${x ? "Modifica · " : ""}${T.n}</h2>
      <p class="small muted" style="margin-top:-6px">${fmt(parseISO(d), { weekday: "long", day: "numeric", month: "long" })}</p>
      <form id="logForm" data-type="${type}" data-id="${esc(id || "")}" data-date="${d}">${f}
        ${x || type === "traguardo" ? `<label class="field"><span>Giorno</span><input type="date" name="date" value="${d}" max="${iso(today0())}"${settings.birth ? ` min="${esc(settings.birth)}"` : ""} required></label>` : ""}
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button>
          ${x ? `<button class="btn danger" type="button" data-act="log-del" data-id="${esc(id)}">Elimina</button>` : ""}
          <button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
    hydrateDiaryPhotos(sheet);
    const q = sheet.querySelector("#lgFoodQ");
    if (q) q.addEventListener("input", () => {
      const t = normTxt(q.value), btns = sheet.querySelectorAll("#lgFoods [data-act=lg-food]");
      let shown = 0;
      btns.forEach(b => {
        const on = b.classList.contains("on"), show = on || ((t ? b.dataset.n.includes(t) : true) && shown < (t ? 40 : 18));
        b.hidden = !show; if (show && !on) shown++;
      });
    });
  }
  function saveLog(f, fd) {
    const type = f.dataset.type, id = f.dataset.id, d = String(fd.get("date") || "") || f.dataset.date, old = id ? diary.find(v => v.id === id) : null;
    const g = k => String(fd.get(k) || "").trim();
    const x = Object.assign({}, old || {}, { id: id || "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: d, type, time: g("time") });
    if (!old && me()) x.by = me();
    if (fd.has("note")) x.note = g("note");
    if (type === "pasto") {
      x.foods = g("foods").split(",").filter(Boolean); x.q = g("q"); x.r = g("r") || "si";
      if (!x.foods.length) { toast("Scegli almeno un cibo"); return false; }
      // il diario dei cibi provati si aggiorna da solo
      const before = old && old.type === "pasto" ? old.foods || [] : [];
      unlogFoods(before.filter(fid => !x.foods.includes(fid) || old.date !== d), old);
      x.foods.forEach(fid => {
        const e = foods[fid];
        if (!e) foods[fid] = { date: d, r: x.r, n: 1, note: "", log: [d], src: x.id };
        else if (!before.includes(fid) || old.date !== d) { e.log = (e.log || [e.date]).filter(Boolean); if (!e.log.includes(d)) e.log.push(d); e.log = e.log.slice(-60); e.n = (e.n || 0) + 1; }
        if (x.r === "reaz") foods[fid].r = "reaz";
      });
      S.set("foods", foods);
    } else if (type === "latte") { x.kind = g("kind"); x.side = g("side"); x.ml = Number(g("ml")) || ""; x.min = Number(g("min")) || ""; }
    else if (type === "sonno") {
      x.kind = g("kind"); x.end = g("end") || null;
      if (!x.time) { toast("Indica quando si è addormentato"); return false; }
      x.endDate = x.end ? (toMin(x.end) < toMin(x.time) ? iso(addDays(parseISO(d), 1)) : d) : null;
    }
    else if (type === "pannolino") {
      x.kind = g("kind");
      if (["cacca", "entrambi"].includes(x.kind)) { x.cons = g("cons"); x.col = g("col"); } else { delete x.cons; delete x.col; }
    }
    else if (type === "salute") { x.temp = g("temp").replace(",", "."); x.med = g("med"); x.sym = g("sym"); if (!x.temp && !x.med && !x.sym && !x.note) { toast("Scrivi almeno una cosa"); return false; } }
    else if (type === "traguardo") x.t = g("t");
    else if (type === "nota") { x.t = g("t"); x.mood = g("mood"); }
    else if (type === "foto") {
      const keep = [...sheet.querySelectorAll("#lgPrev [data-keep]")].map(e => e.dataset.keep);
      x.t = g("t");
      if (!keep.length && !pendingPhotos.length) { toast("Aggiungi almeno una foto"); return false; }
      const fresh = pendingPhotos.slice();
      x.photos = keep.concat(fresh.map(p => p.id));
      (old && old.photos || []).filter(pid => !keep.includes(pid)).forEach(dropPhoto);
      toast("Salvo le foto…");
      Promise.all(fresh.map(p => PhotoDB.set("d:" + p.id, p.blob))).then(() => {
        raw.set("photoQueue", (raw.get("photoQueue", []) || []).concat(fresh.map(p => p.id)));
        uploadPhotos(); render(true);
      }).catch(() => toast("Non riesco a salvare le foto sul telefono"));
    }
    if (old) diary = diary.map(v => (v.id === x.id ? x : v)); else diary.push(x);
    S.set("diary", diary);
    const mk = Object.keys(ms).find(k => ms[k] && ms[k].log === x.id);
    if (mk && ms[mk].date !== x.date) { ms[mk] = Object.assign({}, ms[mk], { date: x.date }); S.set("ms", ms); }
    return true;
  }
  function dropPhoto(pid) {
    PhotoDB.del("d:" + pid).catch(() => { /* già tolta */ });
    const cfg = raw.get("sync", null);
    raw.set("photoQueue", (raw.get("photoQueue", []) || []).filter(x => x !== pid));
    if (cfg) getCodec(cfg).then(c => postSync(cfg.url, { action: "blob-del", key: c.space, id: pid })).catch(() => { /* resta sul servizio */ });
  }
  // Toglie dal diario dei cibi gli assaggi segnati con una pappa (voce cancellata, cibo tolto o giorno cambiato)
  function unlogFoods(fids, entry) {
    if (!entry) return;
    fids.forEach(fid => {
      const e = foods[fid];
      if (!e) return;
      if (e.src === entry.id && (e.n || 1) <= 1) { delete foods[fid]; return; }
      const same = diary.some(v => v.id !== entry.id && !v.del && v.type === "pasto" && v.date === entry.date && (v.foods || []).includes(fid));
      if (!same) e.log = (e.log || []).filter(v => v !== entry.date);
      e.n = Math.max(1, (e.n || 1) - 1);
    });
  }
  function deleteLog(id) {
    const x = diary.find(v => v.id === id);
    if (!x) return;
    if (x.type === "pasto") { unlogFoods(x.foods || [], x); S.set("foods", foods); }
    Object.keys(ms || {}).forEach(k => { if (ms[k] && ms[k].log === id) { ms[k] = null; S.set("ms", ms); } });
    (x.photos || []).forEach(dropPhoto);
    diary = diary.map(v => (v.id === id ? { id, del: true, date: x.date, type: x.type } : v));
    S.set("diary", diary);
  }
  function openPhoto(pid, eid) {
    const x = diary.find(v => v.id === eid);
    openSheet(`<div class="ph-big">${phImg(pid)}</div>
      ${x ? `<p><b>${esc(x.t || "")}</b></p><p class="small muted">${fmt(parseISO(x.date), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${x.time ? " · " + esc(x.time) : ""}${ageAt(x.date) ? " · " + name() + " aveva " + ageText(ageAt(x.date)) : ""}</p>` : ""}
      <div class="btn-row"><button class="btn ghost" data-act="photo-save" data-id="${esc(pid)}">⬇️ Salva</button>
        ${x ? `<button class="btn ghost" data-act="log-edit" data-id="${esc(eid)}">✏️ Modifica</button>` : ""}
        <button class="btn ghost" data-act="close">Chiudi</button></div>`);
    hydrateDiaryPhotos(sheet);
  }

  /* Foto del diario: sul telefono in IndexedDB; con la condivisione attiva vengono cifrate e salvate sul servizio,
     così le vedono anche gli altri telefoni della famiglia */
  const phUrls = new Map(), phTried = new Map();
  async function photoUrl(pid) {
    if (phUrls.has(pid)) return phUrls.get(pid);
    let blob = await PhotoDB.get("d:" + pid).catch(() => null);
    if (!blob) blob = await fetchSharedPhoto(pid);
    if (!blob) return null;
    const u = URL.createObjectURL(blob); phUrls.set(pid, u); return u;
  }
  function hydrateDiaryPhotos(root) {
    (root || app).querySelectorAll("img[data-ph]").forEach(img => {
      photoUrl(img.dataset.ph).then(u => { if (u) img.src = u; else img.classList.add("missing"); }).catch(() => img.classList.add("missing"));
    });
  }
  var photoBusy = false;
  async function uploadPhotos() {
    const cfg = raw.get("sync", null), q = raw.get("photoQueue", []) || [];
    // servizio senza foto: si riprova ogni 6 ore (o subito con «Sincronizza ora»), magari nel frattempo è stato aggiornato
    if (!cfg || !q.length || photoBusy || Date.now() - (Number(raw.get("photoShare", 0)) || 0) < 6 * 3600e3) return;
    photoBusy = true;
    try {
      const codec = await getCodec(cfg);
      for (const pid of q) {
        const blob = await PhotoDB.get("d:" + pid).catch(() => null);
        if (blob) {
          const data = await codec.seal(new Uint8Array(await blob.arrayBuffer()));
          const res = await postSync(cfg.url, { action: "blob-put", key: codec.space, id: pid, data });
          // un servizio più vecchio risponde come a una sincronizzazione: le foto restano su questo telefono
          if (!res || !res.ok) { if (res && Array.isArray(res.rec)) { raw.set("photoShare", Date.now()); if (/diario/.test(location.hash) && sheet.hidden) render(true); } break; }
        }
        raw.set("photoQueue", (raw.get("photoQueue", []) || []).filter(v => v !== pid));
      }
    } catch (e) { /* si riprova alla prossima sincronizzazione */ } finally { photoBusy = false; }
  }
  async function fetchSharedPhoto(pid) {
    const cfg = raw.get("sync", null);
    if (!cfg || Date.now() - (phTried.get(pid) || 0) < 60000) return null;
    phTried.set(pid, Date.now());
    try {
      const codec = await getCodec(cfg), res = await postSync(cfg.url, { action: "blob-get", key: codec.space, id: pid });
      if (!res || !res.data) return null;
      const blob = new Blob([await codec.open(res.data)], { type: "image/jpeg" });
      await PhotoDB.set("d:" + pid, blob).catch(() => { /* spazio pieno */ });
      return blob;
    } catch (e) { return null; }
  }

  /* ---------------- Promemoria ---------------- */
  // Un'app web non può suonare a un orario preciso quando è chiusa: i promemoria si aggiungono al calendario del
  // telefono (che avvisa sempre), compaiono in «Oggi» e, con l'app aperta, arriva anche una notifica.
  const REM_PRESETS = [
    { t: "Vitamina D", e: "☀️", kind: "daily", time: "09:00", note: "Le gocce consigliate dal pediatra" },
    { t: "Farmaco", e: "💊", kind: "every", time: "08:00", every: 6, days: 3, note: "Dose indicata dal pediatra" },
    { t: "Lavaggi nasali", e: "💧", kind: "every", time: "08:00", every: 8, days: 5 },
    { t: "Prossimo allergene", e: "⚠️", kind: "once", time: "11:30" },
    { t: "Altro", e: "🔔", kind: "once", time: "10:00" }
  ];
  const remAll = () => (rem || []).filter(r => r && !r.del);
  const atTime = (d, t) => { const x = parseISO(d); x.setHours(0, toMin(t), 0, 0); return x; };
  const hm = dt => String(dt.getHours()).padStart(2, "0") + ":" + String(dt.getMinutes()).padStart(2, "0");
  // Momenti in cui suona un promemoria in un giorno
  function remTimes(r, d) {
    if (r.kind === "once") return r.start === d ? [r.time] : [];
    const end = r.days ? iso(addDays(parseISO(r.start), r.days - 1)) : null;
    if (d < r.start || (end && d > end)) return [];
    if (r.kind === "daily") return [r.time];
    const out = [], first = atTime(r.start, r.time), stop = atTime(end || d, "23:59"), day0 = parseISO(d), day1 = addDays(day0, 1);
    for (let x = new Date(first); x <= stop && out.length < 400; x = new Date(x.getTime() + r.every * 3600e3)) if (x >= day0 && x < day1) out.push(hm(x));
    return out;
  }
  // Scadenze automatiche: bilanci e vaccinazioni non ancora segnati, appuntamenti in agenda
  function autoReminders() {
    const a = age(), t = today0(), out = [];
    if (a) {
      CHECKUPS.forEach(c => { if (!health["c:" + c.id]) out.push({ id: "c:" + c.id, e: "📋", t: c.t, date: addMonths(a.birth, c.m), sub: c.d }); });
      VACCINES.forEach(v => { if (!health["v:" + v.id]) out.push({ id: "v:" + v.id, e: "💉", t: "Vaccinazioni: " + v.items.join(", "), date: addMonths(a.birth, v.m), sub: v.t }); });
    }
    appts.forEach(ap => out.push({ id: "a:" + ap.id, e: "📅", t: ap.t || APPT_TYPES[ap.type], date: parseISO(ap.date), time: ap.time, sub: ap.place || "", appt: true }));
    return out.filter(x => daysBetween(t, x.date) >= -7 && daysBetween(t, x.date) <= 75).sort((x, y) => x.date - y.date);
  }
  const escI = s => String(s || "").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  const icsDT = dt => dt.getFullYear() + String(dt.getMonth() + 1).padStart(2, "0") + String(dt.getDate()).padStart(2, "0") + "T" + String(dt.getHours()).padStart(2, "0") + String(dt.getMinutes()).padStart(2, "0") + "00";
  // File .ics con avvisi: il calendario del telefono suona anche ad app chiusa
  function icsFile(events) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Piccoli Passi//IT", "CALSCALE:GREGORIAN"];
    events.forEach(ev => {
      lines.push("BEGIN:VEVENT", "UID:" + ev.uid + "@piccolipassi", "DTSTAMP:" + stamp);
      if (ev.allDay) lines.push("DTSTART;VALUE=DATE:" + iso(ev.start).replace(/-/g, ""), "DTEND;VALUE=DATE:" + iso(addDays(ev.start, 1)).replace(/-/g, ""));
      else lines.push("DTSTART:" + icsDT(ev.start), "DTEND:" + icsDT(new Date(ev.start.getTime() + (ev.min || 15) * 60000)));
      if (ev.rrule) lines.push("RRULE:" + ev.rrule);
      lines.push("SUMMARY:" + escI(ev.t), "DESCRIPTION:" + escI(ev.desc || "Da Piccoli Passi"));
      (ev.alarms || [0]).forEach(m => lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + escI(ev.t), "TRIGGER:" + (m ? "-PT" + m + "M" : "PT0M"), "END:VALARM"));
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }
  function remIcs(r) {
    const who = settings.name ? " – " + settings.name : "";
    if (r.kind === "once") return icsFile([{ uid: r.id, start: atTime(r.start, r.time), t: r.t + who, desc: r.note, alarms: [0] }]);
    if (r.kind === "daily") {
      const until = r.days ? ";UNTIL=" + iso(addDays(parseISO(r.start), r.days - 1)).replace(/-/g, "") + "T235900" : "";
      return icsFile([{ uid: r.id, start: atTime(r.start, r.time), rrule: "FREQ=DAILY" + until, t: r.t + who, desc: r.note, alarms: [0] }]);
    }
    const evs = [], end = atTime(iso(addDays(parseISO(r.start), (r.days || 1) - 1)), "23:59");
    for (let x = atTime(r.start, r.time), i = 0; x <= end && i < 60; x = new Date(x.getTime() + r.every * 3600e3), i++) evs.push({ uid: r.id + "-" + i, start: x, t: r.t + who, desc: r.note, alarms: [0] });
    return icsFile(evs);
  }
  function autoIcs(x) {
    const at = x.time ? atTime(iso(x.date), x.time) : null;
    return icsFile([at ? { uid: x.id.replace(/:/g, "-"), start: at, min: 30, t: x.t, desc: x.sub, alarms: [24 * 60, 60] }
      : x.appt ? { uid: x.id.replace(/:/g, "-"), start: x.date, allDay: true, t: x.t, desc: x.sub, alarms: [15 * 60] }
      : { uid: x.id.replace(/:/g, "-"), start: x.date, allDay: true, t: x.t + " (da prenotare)", desc: x.sub + "\nIndicativo: prenota con il pediatra o il centro vaccinale.", alarms: [7 * 24 * 60 - 9 * 60] }]);
  }
  const remKey = (r, d, t) => r.id + "|" + d + "|" + t;
  // Promemoria di oggi (per «Oggi» e per le notifiche)
  function todayRems() {
    const d = iso(today0());
    return remAll().flatMap(r => remTimes(r, d).map(t => ({ r, t, key: remKey(r, d, t), done: !!remDone[remKey(r, d, t)] }))).sort((a, b) => a.t.localeCompare(b.t));
  }
  function remTodayCard() {
    const xs = todayRems(), autos = autoReminders().filter(x => daysBetween(today0(), x.date) === 0 && x.appt);
    if (!xs.length && !autos.length) return "";
    return `<div class="card"><div class="section-title" style="margin:0 0 6px"><h2>🔔 Promemoria di oggi</h2><a href="#/salute" data-act="set" data-k="healthTab" data-v="promemoria">Tutti ›</a></div>
      ${autos.map(x => `<div class="food"><span class="st">${x.e}</span><span class="grow">${esc(x.t)}<br><span class="small muted">${esc(x.time || "")} ${esc(x.sub)}</span></span></div>`).join("")}
      ${xs.map(x => `<button class="food" data-act="rem-done" data-key="${esc(x.key)}"><span class="st">${x.done ? "✅" : "⏰"}</span><span class="grow"><span style="${x.done ? "text-decoration:line-through;opacity:.6" : ""}">${esc(x.r.e || "🔔")} ${esc(x.r.t)}</span><br><span class="small muted">${x.t}${x.r.note ? " · " + esc(x.r.note) : ""}</span></span><span class="small muted">${x.done ? "fatto" : "segna"}</span></button>`).join("")}</div>`;
  }
  function viewReminders() {
    const auto = autoReminders(), mine = remAll();
    const kindTxt = r => (r.kind === "once" ? fmt(parseISO(r.start), { day: "numeric", month: "short" }) + " alle " + r.time
      : r.kind === "daily" ? "Ogni giorno alle " + r.time + (r.days ? " per " + plural(r.days, "giorno", "giorni") : "")
      : "Ogni " + (Number(r.every) === 1 ? "ora" : r.every + " ore") + " dalle " + r.time + " per " + plural(r.days || 1, "giorno", "giorni"));
    const perm = "Notification" in window ? Notification.permission : "unsupported";
    return `
      <div class="card tint-blue small">🔔 <b>Come funzionano.</b> Tocca <b>📅 Aggiungi al calendario</b>: il calendario del telefono ti avvisa anche con l'app chiusa. I promemoria compaiono anche in «Oggi»${perm === "granted" ? " e, con l'app aperta, arriva una notifica" : ""}.
        ${perm === "default" ? `<div style="margin-top:8px"><button class="btn ghost small" data-act="notif-on">Attiva le notifiche (con l'app aperta)</button></div>` : ""}</div>
      <div class="section-title"><h2>I tuoi promemoria</h2></div>
      ${mine.length ? mine.map(r => `<div class="card list-card"><div class="big-emoji">${esc(r.e || "🔔")}</div><div class="grow"><h3>${esc(r.t)}</h3><div class="meta">${esc(kindTxt(r))}${r.note ? " · " + esc(r.note) : ""}</div>
        <div class="btn-row" style="margin-top:6px"><button class="btn ghost small" data-act="rem-ics" data-id="${esc(r.id)}">📅 Aggiungi al calendario</button><button class="btn ghost small" data-act="rem-edit" data-id="${esc(r.id)}">Modifica</button></div></div></div>`).join("")
        : `<p class="small muted">Per esempio le gocce di vitamina D ogni mattina o un farmaco ogni 6 ore.</p>`}
      <div class="chips">${REM_PRESETS.map((p, i) => `<button class="chip" data-act="rem-add" data-i="${i}">${p.e} ${p.t}</button>`).join("")}</div>
      <div class="section-title"><h2>Scadenze in arrivo</h2></div>
      ${auto.length ? auto.map(x => { const n = daysBetween(today0(), x.date); return `<div class="card list-card"><div class="big-emoji">${x.e}</div><div class="grow"><h3>${esc(x.t)}</h3>
        <div class="meta">${n === 0 ? "Oggi" : n === 1 ? "Domani" : n < 0 ? "Da " + plural(-n, "giorno", "giorni") : "Tra " + plural(n, "giorno", "giorni")} · ${fmt(x.date, { day: "numeric", month: "long" })}${x.time ? " alle " + esc(x.time) : x.appt ? "" : " (indicativo)"}</div>
        <div class="btn-row" style="margin-top:6px"><button class="btn ghost small" data-act="auto-ics" data-id="${esc(x.id)}">📅 Aggiungi al calendario</button></div></div></div>`; }).join("")
        : `<p class="small muted">Nessuna scadenza nei prossimi due mesi.</p>`}
      <p class="disclaimer">Le date di bilanci e vaccinazioni sono indicative: fa fede la chiamata del vostro centro vaccinale e del pediatra.</p>`;
  }
  function openRem(preset, id) {
    const r = id ? rem.find(x => x.id === id) : Object.assign({ start: iso(today0()) }, REM_PRESETS[preset] || REM_PRESETS[4]);
    if (!id && r.kind === "every") r.time = nowHM(); // la prima dose: adesso
    if (!r) return;
    const k = r.kind;
    openSheet(`<h2>${esc(r.e || "🔔")} ${id ? "Modifica promemoria" : "Nuovo promemoria"}</h2>
      <form id="remForm" data-id="${esc(id || "")}" data-e="${esc(r.e || "🔔")}">
        <label class="field"><span>Che cosa</span><input type="text" name="t" required value="${esc(r.t)}"></label>
        <div class="field"><span>Quando</span></div>
        <div class="lg-pick" data-name="kind">${[["once", "Una volta"], ["daily", "Ogni giorno"], ["every", "Ogni tot ore"]].map(([v, l]) => `<button type="button" class="${k === v ? "on" : ""}" data-act="lg-pick" data-v="${v}">${l}</button>`).join("")}</div><input type="hidden" name="kind" value="${k}">
        <div class="cols"><label class="field"><span>Dal giorno</span><input type="date" name="start" value="${esc(r.start)}" required></label>
          <label class="field"><span>Alle</span><input type="time" name="time" value="${esc(r.time)}" required></label></div>
        <div class="cols"><label class="field"><span>Ogni quante ore (solo «ogni tot ore»)</span><input type="number" name="every" min="1" max="24" value="${esc(r.every || 6)}"></label>
          <label class="field"><span>Per quanti giorni (vuoto = sempre)</span><input type="number" name="days" min="1" max="365" value="${esc(r.days || "")}"></label></div>
        <label class="field"><span>Nota</span><input type="text" name="note" value="${esc(r.note || "")}" placeholder="Es. 2,5 ml"></label>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button>${id ? `<button class="btn danger" type="button" data-act="rem-del" data-id="${esc(id)}">Elimina</button>` : ""}<button class="btn ghost" type="button" data-act="close">Annulla</button></div>
      </form>`);
  }
  function saveRem(f, fd) {
    const g = k => String(fd.get(k) || "").trim();
    const r = { id: f.dataset.id || "r" + Date.now().toString(36), e: f.dataset.e, t: g("t"), kind: g("kind") || "once", start: g("start"), time: g("time"), every: Number(g("every")) || 6, days: Number(g("days")) || null, note: g("note") };
    if (r.kind === "every" && !r.days) r.days = 3;
    rem = rem.filter(x => x.id !== r.id).concat(r); S.set("rem", rem);
    return r;
  }
  // Notifiche con l'app aperta (o appena tornati all'app): una sola volta per ogni promemoria
  function checkNotify() {
    if (!("Notification" in window) || Notification.permission !== "granted" || !settings) return;
    const now = hm(new Date()), sent = raw.get("notified", {}) || {}, d = iso(today0());
    // promemoria di tutti i figli, non solo di quello aperto ora
    kids.flatMap(k => {
      const mine = k.id === activeKid, rs = (mine ? rem : raw.get("k." + k.id + ".rem", [])) || [], dn = (mine ? remDone : raw.get("k." + k.id + ".remDone", {})) || {};
      return rs.filter(r => r && !r.del).flatMap(r => remTimes(r, d).map(t => ({ r, t, kid: k, key: remKey(r, d, t), done: !!dn[remKey(r, d, t)] })));
    }).filter(x => !x.done && x.t <= now && toMin(now) - toMin(x.t) < 60 && !sent[x.key]).forEach(x => {
      sent[x.key] = 1;
      const title = (x.r.e || "🔔") + " " + x.r.t + (kids.length > 1 && x.kid.name ? " · " + x.kid.name : "");
      const opts = { body: x.t + (x.r.note ? " · " + x.r.note : ""), icon: "icons/icon-192.png", tag: x.key };
      navigator.serviceWorker && navigator.serviceWorker.ready ? navigator.serviceWorker.ready.then(reg => reg.showNotification(title, opts)).catch(() => { /* niente */ }) : new Notification(title, opts);
    });
    Object.keys(sent).forEach(k => { if (!k.includes("|" + d + "|")) delete sent[k]; });
    raw.set("notified", sent);
  }
  setInterval(checkNotify, 30000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkNotify(); });

  /* ---------------- Settimana delle pappe e lista della spesa ---------------- */
  const MEALS = [["pranzo", "☀️ Pranzo"], ["cena", "🌙 Cena"]];
  const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
  // Nel fine settimana si pianifica la settimana che arriva
  const weekStart = () => (ui.wStart ? parseISO(ui.wStart) : addDays(mondayOf(today0()), [0, 6].includes(today0().getDay()) ? 7 : 0));
  const recipeById = id => RECIPES.find(r => r.id === id);
  const foodById = id => FOODS.find(f => f.id === id) || {};
  const NEW_EVERY = 3;   // un cibo nuovo ogni 3 giorni, sempre a pranzo: se c'è una reazione si capisce da cosa
  const FIRST_FOODS = ["zucchina", "carota", "patata", "zucca", "finocchio", "riso", "mais", "tapioca"];   // dolci e digeribili: le prime da proporre

  // Cibi di una ricetta. Per ogni ingrediente (esclusi i facoltativi) si sceglie l'alternativa
  // («tacchino o pollo», «crema di riso o di pastina») con meno cibi ancora da provare.
  function recipeNeeds(r, known) {
    const use = new Set();
    r.ing.filter(i => !/facoltativ/i.test(i)).forEach(line => {
      // le alternative senza cibi («zucca (delica o mantovana)», «acqua o brodo») non tolgono il cibo dalla riga
      const alts = normTxt(line).replace(/\((o|oppure) /g, " o ").replace(/[()]/g, " ").split(/\s(?:o|oppure)\s/)
        .map(alt => FOODS.filter(f => FOOD_KEYS[f.id] && FOOD_KEYS[f.id].test(alt)).map(f => f.id)).filter(ids => ids.length);
      let best = null;
      alts.forEach(ids => {
        const miss = ids.filter(id => !known.has(id)).length;
        if (!best || miss < best.miss || (miss === best.miss && ids.length < best.ids.length)) best = { ids, miss };
      });
      if (best) best.ids.forEach(id => use.add(id));
    });
    const ids = [...use], idAl = ids.map(id => foodById(id).al).filter(Boolean), optAl = new Set(), without = [];
    // un allergene che compare solo negli ingredienti facoltativi non blocca la ricetta: si prepara senza
    r.ing.filter(i => /facoltativ/i.test(i)).forEach(l => FOODS.forEach(f => {
      if (!f.al || !FOOD_KEYS[f.id] || !FOOD_KEYS[f.id].test(normTxt(l))) return;
      optAl.add(f.al);
      if (!idAl.includes(f.al) && !alOk(f.al) && !without.includes(f.id)) without.push(f.id);
    }));
    return { ids, without, fresh: ids.filter(id => !known.has(id)), al: [...new Set(r.al.filter(a => idAl.includes(a) || !optAl.has(a)).concat(idAl))] };
  }
  // Allergene introdotto e senza reazioni
  const alOk = a => allergenIntroduced(a) && !FOODS.some(f => f.al === a && foods[f.id] && foods[f.id].r === "reaz");
  // Si può proporre? «ok»: solo cibi già provati; «nuovo»: un solo cibo nuovo, non un allergene nuovo; «no»: con il motivo
  function recipeFit(r, known) {
    const n = recipeNeeds(r, known);
    const reac = n.ids.filter(id => foods[id] && foods[id].r === "reaz");
    if (reac.length) return Object.assign(n, { fit: "no", why: "ha avuto una reazione: " + reac.map(foodName).join(", ").toLowerCase() });
    const alNo = n.al.filter(a => !alOk(a));
    if (alNo.length) return Object.assign(n, { fit: "no", why: "allergene non ancora introdotto: " + alNo.map(a => (ALLERGENS[a] || { n: a }).n.toLowerCase()).join(", ") });
    if (!n.fresh.length) return Object.assign(n, { fit: "ok", why: "cibi già provati" });
    if (n.fresh.length === 1) return Object.assign(n, { fit: "nuovo", why: "cibo nuovo: " + foodName(n.fresh[0]).toLowerCase() });
    return Object.assign(n, { fit: "no", why: n.fresh.length + " cibi nuovi insieme: " + n.fresh.map(foodName).join(", ").toLowerCase() });
  }
  // Cibi che avrà già assaggiato il giorno d (e al pasto m): quelli del diario più quelli delle pappe in programma prima
  function knownBy(d, m) {
    const k = new Set(Object.keys(foods).filter(id => foods[id])), t = iso(today0());
    Object.keys(plan).filter(x => x >= t && x <= d).sort().forEach(x => MEALS.forEach(([mm]) => {
      if (x === d && (m !== "cena" || mm !== "pranzo")) return;
      const r = plan[x] && plan[x][mm] && recipeById(plan[x][mm]);
      if (r) recipeNeeds(r, k).ids.forEach(id => k.add(id));
    }));
    return k;
  }
  // Pappe al giorno: quelle scelte da voi, altrimenti solo il pranzo fino ai 7 mesi
  const mealsOn = d => settings.meals || ((ageAt(d) || { m: 6 }).m >= 7 ? 2 : 1);
  // Primo giorno delle proposte: oggi, oppure i 6 mesi se non ha ancora assaggiato niente
  function planFrom() {
    const t = iso(today0());
    if (Object.keys(foods).some(id => foods[id]) || !settings.birth) return t;
    const six = iso(addMonths(parseISO(settings.birth), 6));
    return six > t ? six : t;
  }
  const hashNum = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };

  function viewWeek() {
    const start = weekStart(), days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const t = iso(today0()), end = addDays(start, 6);
    const planned = days.reduce((n, d) => n + MEALS.filter(([k]) => (plan[iso(d)] || {})[k]).length, 0);
    const auto = days.some(d => (plan[iso(d)] || {}).auto);
    const tried = Object.keys(foods).filter(id => foods[id]).length, alIn = KEY_ALLERGENS.filter(alOk).length;
    const meals = settings.meals || 0, from = planFrom();
    return `
      <div class="cal-head">
        <button class="rd-btn" data-act="week-move" data-d="-7" aria-label="Settimana prima">‹</button>
        <h2>${fmt(start, { day: "numeric", month: "short" })} – ${fmt(end, { day: "numeric", month: "short" })}</h2>
        <button class="rd-btn" data-act="week-move" data-d="7" aria-label="Settimana dopo">›</button>
      </div>
      <div class="small muted">Pappe al giorno</div>
      <div class="segmented wk-meals">${[[0, "Secondo l'età"], [1, "Solo pranzo"], [2, "Pranzo e cena"]].map(([v, l]) => `<button class="${meals === v ? "on" : ""}" data-act="set-meals" data-v="${v}">${l}</button>`).join("")}</div>
      ${from > iso(end) ? `<div class="card wk-info" style="margin:0 0 12px"><p class="small" style="margin:0">🥄 Le pappe partono intorno ai 6 mesi: per ${ofName()} dal <b>${fmt(parseISO(from), { weekday: "long", day: "numeric", month: "long" })}</b>. «Proponi» prepara la prima settimana, un cibo nuovo alla volta.</p></div>` : ""}
      <div class="btn-row" style="margin:0 0 12px"><button class="btn small" data-act="plan-auto">✨ ${auto ? "Proponi di nuovo" : "Proponi la settimana"}</button>
        ${planned ? `<button class="btn ghost small" data-act="shop-add-plan">🛒 Ingredienti nella spesa</button><button class="btn ghost small" data-act="plan-clear">Svuota</button>` : ""}</div>
      ${days.map(d => {
        const k = iso(d), p = plan[k] || {};
        return `<div class="wk-day${k === t ? " today" : ""}${k < t ? " past" : ""}"><div class="wk-d"><b>${fmt(d, { weekday: "short" })}</b><small>${d.getDate()}</small></div>
          <div class="wk-slots">${MEALS.map(([m, l]) => {
            const r = p[m] && recipeById(p[m]);
            const f = r && k >= t ? recipeFit(r, knownBy(k, m)) : null;
            const note = (f && f.fit === "nuovo" ? `<em class="wk-new">✨ ${esc(foodName(f.fresh[0]))}</em>` : f && f.fit === "no" ? `<em class="wk-warn">⚠️ ${esc(f.why)}</em>` : "")
              + (f && f.fit !== "no" && f.without.length ? `<em class="wk-warn">senza ${esc(f.without.map(foodName).join(", ").toLowerCase())}</em>` : "");
            const milk = !r && (k < from || (m === "cena" && mealsOn(k) < 2));
            return `<button class="wk-slot${r ? " full" : ""}${milk ? " milk" : ""}" data-act="plan-slot" data-d="${k}" data-m="${m}">${r ? `<span class="wk-e">${r.e}</span><span class="grow"><small>${l}</small><b>${esc(r.t)}</b>${note}</span>` : `<span class="grow"><small>${l}</small><span class="muted">${milk ? "🍼 Latte" : "＋ Scegli"}</span></span>`}</button>`;
          }).join("")}</div></div>`;
      }).join("")}
      <div class="card wk-info"><p class="small" style="margin:0">Le proposte usano solo i <b>cibi già provati (${tried})</b> e gli <b>allergeni già introdotti (${alIn} di ${KEY_ALLERGENS.length})</b>. Un cibo nuovo alla volta, a pranzo, ogni ${NEW_EVERY} giorni (✨): se c'è una reazione si capisce subito da cosa.</p>
        <p class="small muted" style="margin:8px 0 0">I cibi provati si aggiornano da soli quando segni la pappa nel <a href="#/diario">diario</a>; gli allergeni si introducono uno alla volta dal <a href="#/allergeni">percorso allergeni</a>. La pappa la sceglie ${name()}: segui il suo appetito.</p></div>`;
  }
  function openPlanSlot(d, m) {
    const cur = (plan[d] || {})[m], known = knownBy(d, m), s0 = season(parseISO(d));
    const rank = { ok: 0, nuovo: 1, no: 2 };
    const list = recipesForAge((ageAt(d) || { m: 6 }).m).filter(r => r.id !== "brodo-vegetale").map(r => ({ r, f: recipeFit(r, known) }))
      .sort((a, b) => rank[a.f.fit] - rank[b.f.fit] || (b.r.seasons.includes(s0) ? 1 : 0) - (a.r.seasons.includes(s0) ? 1 : 0));
    const head = { ok: "✅ Con i cibi già provati", nuovo: "✨ Con un cibo nuovo", no: "⚠️ Non ancora: contengono cibi o allergeni da introdurre" };
    let last = "";
    openSheet(`<h2>${MEALS.find(x => x[0] === m)[1]} · ${fmt(parseISO(d), { weekday: "long", day: "numeric", month: "long" })}</h2>
      <input class="search" type="search" id="wkQ" placeholder="Cerca una ricetta" autocomplete="off">
      <div class="card" style="padding:0;overflow:hidden" id="wkList">
        ${cur ? `<button class="food" data-act="plan-set" data-d="${d}" data-m="${m}" data-id=""><span class="st">✕</span><span class="grow">Lascia libero</span></button>` : ""}
        ${list.map(({ r, f }) => (f.fit !== last ? `<div class="wk-sep" data-sep="${(last = f.fit)}">${head[f.fit]}</div>` : "") +
          `<button class="food" data-act="plan-set" data-d="${d}" data-m="${m}" data-id="${r.id}" data-n="${esc(normTxt(r.t + " " + r.ing.join(" ")))}"><span class="st">${r.e}</span><span class="grow">${esc(r.t)}<br><span class="small muted">dai ${r.m} mesi · ${r.min} min${f.fit !== "ok" ? " · " + esc(f.why) : ""}${f.fit !== "no" && f.without.length ? " · senza " + esc(f.without.map(foodName).join(", ").toLowerCase()) : ""}</span></span>${r.id === cur ? "✅" : ""}</button>`).join("")}
      </div><button class="btn ghost block" data-act="close" style="margin-top:10px">Chiudi</button>`);
    const q = sheet.querySelector("#wkQ");
    q.addEventListener("input", () => {
      const v = normTxt(q.value);
      sheet.querySelectorAll("#wkList [data-n]").forEach(b => { b.hidden = v && !b.dataset.n.includes(v); });
      sheet.querySelectorAll("#wkList [data-sep]").forEach(s => { s.hidden = !!v; });
    });
  }
  // Una pappa scelta a mano non viene più cambiata da «Proponi di nuovo»
  function setPlan(d, m, id) {
    const p = Object.assign({ pranzo: null, cena: null }, plan[d] || {}, { [m]: id || null });
    if (p.auto) { p.auto = Object.assign({}, p.auto); delete p.auto[m]; if (!Object.keys(p.auto).length) delete p.auto; }
    p.skip = Object.assign({}, p.skip || {}); if (id) delete p.skip[m]; else p.skip[m] = 1;
    if (!Object.keys(p.skip).length) delete p.skip;
    plan[d] = p;
    S.set("plan", plan);
  }
  // Proposta della settimana: rifà solo le proposte automatiche da oggi in poi, lasciando le pappe scelte da voi.
  // Usa i cibi già provati e gli allergeni già introdotti; un solo cibo nuovo a pranzo ogni NEW_EVERY giorni;
  // varia le ricette, preferisce quelle di stagione e ripropone 1-2 volte a settimana gli allergeni già introdotti.
  function autoPlan() {
    const from = planFrom();
    let start = weekStart(), moved = false;
    if (iso(addDays(start, 6)) < from) { start = mondayOf(parseISO(from)); ui.wStart = iso(start); moved = true; }
    const days = Array.from({ length: 7 }, (_, i) => iso(addDays(start, i))).filter(d => d >= from);
    const seed = String((ui.planSeed = (ui.planSeed || 0) + 1));
    days.forEach(d => {
      const p = plan[d];
      if (p && p.auto) { const q = Object.assign({}, p); Object.keys(p.auto).forEach(m => { q[m] = null; }); delete q.auto; plan[d] = q; }
    });
    const known = knownBy(days[0] || from, "pranzo");
    let lastNew = Object.keys(foods).filter(id => foods[id] && foods[id].date).map(id => foods[id].date).sort().pop() || null;
    const manualNew = days.filter(d => MEALS.some(([m]) => { const r = plan[d] && plan[d][m] && recipeById(plan[d][m]); return r && recipeNeeds(r, knownBy(d, m)).fresh.length; }));
    const used = {}, alWeek = {}, recent = [], fresh = [];
    let n = 0, empty = 0;
    days.forEach(d => {
      const age0 = (ageAt(d) || { m: 6 }).m, s0 = season(parseISO(d));
      const pool = recipesForAge(age0).filter(r => ["pappa", "base", "famiglia", "pezzi"].includes(r.cat) && r.id !== "brodo-vegetale");
      const want = mealsOn(d) === 2 ? ["pranzo", "cena"] : ["pranzo"];
      const p = plan[d] = Object.assign({ pranzo: null, cena: null }, plan[d] || {});
      MEALS.forEach(([m]) => {
        const mine = p[m] && recipeById(p[m]);
        if (mine) {
          const nm = recipeNeeds(mine, known);
          if (nm.fresh.length) lastNew = d;
          nm.ids.forEach(id => known.add(id)); used[mine.id] = (used[mine.id] || 0) + 1; recent.push(mine.id); return;
        }
        if (!want.includes(m) || (p.skip && p.skip[m])) return;
        const canNew = m === "pranzo" && (!lastNew || daysBetween(parseISO(lastNew), parseISO(d)) >= NEW_EVERY)
          && !manualNew.some(x => x !== d && Math.abs(daysBetween(parseISO(x), parseISO(d))) < NEW_EVERY);
        let best = null;
        pool.forEach(r => {
          const f = recipeFit(r, known);
          if (f.fit === "no" || (f.fit === "nuovo" && !canNew)) return;
          let sc = hashNum(seed + d + m + r.id) * 2;
          if (f.fit === "nuovo") {
            // nei giorni del cibo nuovo, meglio una pappa semplice con il nuovo cibo ben riconoscibile
            const cat = foodById(f.fresh[0]).cat;
            sc += 10 - f.ids.length + (cat === "verdura" ? 2 : cat === "cereali" ? 1 : cat === "proteine" && known.size >= 4 ? 1.5 : 0);
            if (known.size < 8 && FIRST_FOODS.includes(f.fresh[0])) sc += 3;
          }
          if (r.seasons.length) sc += r.seasons.includes(s0) ? 2 : -6;
          sc -= 4 * (used[r.id] || 0);
          if (recent.slice(-2).includes(r.id)) sc -= 6;
          f.al.forEach(a => { sc += !alWeek[a] ? 2 : alWeek[a] >= 2 ? -2 : 0; });
          if (age0 >= 8 && ["pezzi", "famiglia"].includes(r.cat)) sc += 1;
          if (!best || sc > best.sc) best = { r, f, sc };
        });
        if (!best) { empty++; return; }
        p[m] = best.r.id;
        p.auto = Object.assign({}, p.auto || {}, { [m]: 1 });
        best.f.ids.forEach(id => known.add(id));
        if (best.f.fit === "nuovo") { lastNew = d; fresh.push([d, best.f.fresh[0]]); }
        best.f.al.forEach(a => { alWeek[a] = (alWeek[a] || 0) + 1; });
        used[best.r.id] = (used[best.r.id] || 0) + 1; recent.push(best.r.id); n++;
      });
    });
    S.set("plan", plan);
    return { n, empty, fresh, moved: moved && from > iso(today0()), from };
  }
  // Lista della spesa condivisa con la famiglia
  const shopAll = () => (shop || []).filter(x => x && !x.del);
  function addShop(t, src) {
    const key = normTxt(t);
    if (!key || shopAll().some(x => !x.done && normTxt(x.t) === key)) return false;
    shop.push({ id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t, src: src || "", done: false, by: me() || undefined });
    return true;
  }
  function viewShop() {
    const xs = shopAll(), todo = xs.filter(x => !x.done), got = xs.filter(x => x.done);
    const row = x => `<div class="shop-row${x.done ? " done" : ""}"><button class="shop-chk" data-act="shop-toggle" data-id="${esc(x.id)}" aria-label="${x.done ? "Da riprendere" : "Preso"}">${x.done ? "✓" : ""}</button>
      <span class="grow">${esc(x.t)}${x.src || (x.by && raw.get("sync", null)) ? `<small>${esc([x.src, x.by && raw.get("sync", null) ? "✍️ " + x.by : ""].filter(Boolean).join(" · "))}</small>` : ""}</span>
      <button class="shop-del" data-act="shop-del" data-id="${esc(x.id)}" aria-label="Togli">✕</button></div>`;
    return `
      <form id="shopForm" class="shop-add"><input type="text" name="t" placeholder="Aggiungi (es. pannolini)" autocomplete="off" required><button class="btn" type="submit">＋</button></form>
      <div class="btn-row" style="margin:0 0 12px"><button class="btn ghost small" data-act="shop-add-plan">🗓️ Ingredienti della settimana</button>
        ${got.length ? `<button class="btn ghost small" data-act="shop-clear">Togli i presi (${got.length})</button>` : ""}</div>
      ${todo.length ? `<div class="card" style="padding:4px 0">${todo.map(row).join("")}</div>` : `<div class="empty"><b>🛒</b>La lista è vuota.${raw.get("sync", null) ? " È condivisa con la famiglia: quello che aggiungi lo vedono anche loro." : ""}</div>`}
      ${got.length ? `<div class="section-title"><h2>Presi</h2></div><div class="card" style="padding:4px 0">${got.map(row).join("")}</div>` : ""}`;
  }
  function planIngredientsToShop() {
    const start = weekStart();
    let n = 0;
    // solo i giorni che devono ancora venire, senza gli ingredienti facoltativi
    for (let k = 0; k < 7; k++) {
      if (iso(addDays(start, k)) < iso(today0())) continue;
      const p = plan[iso(addDays(start, k))] || {};
      MEALS.forEach(([m]) => {
        const r = p[m] && recipeById(p[m]);
        if (r) r.ing.filter(i => !/^(niente|acqua|1 litro d'acqua)/i.test(i) && !/facoltativ/i.test(i)).forEach(i => { if (addShop(i.replace(/\s*\(.*\)\s*$/, ""), r.t)) n++; });
      });
    }
    S.set("shop", shop);
    return n;
  }

  /* ---------------- Primo avvio: le sezioni in quattro schermate ---------------- */
  const TOUR = [
    { e: "🏠", t: "Oggi", d: "Ogni giorno: l'età e il mese che sta vivendo, il diario della giornata a portata di tocco, appuntamenti, promemoria e un consiglio, una ricetta e un gioco adatti a lui." },
    { e: "📅", t: "Diario", d: "Un calendario dove segnare pappe, poppate, nanne, pannolini, peso, febbre, prime volte e foto. In «Ricordi» trovi tutte le foto mese per mese, in «Andamento» sonno e poppate delle ultime settimane." },
    { e: "🥣", t: "Pappa", d: "Ricette per lo svezzamento (anche con il Bimby), la settimana delle pappe con la lista della spesa, la guida, i cibi provati e il percorso degli allergeni." },
    { e: "🩺", t: "Salute e Scopri", d: "Agenda, promemoria, curve di crescita e guide pratiche; poi giochi, tappe dello sviluppo, mese per mese ed eventi vicino a casa. Dalla croce rossa in alto, sempre, le emergenze." },
    { e: "👨‍👩‍👧", t: "Con la famiglia", d: "Dall'ingranaggio in alto (Impostazioni) puoi condividere tutto con il partner (o in sola lettura con i nonni): i dati partono cifrati e restano solo vostri." }
  ];
  function openTour(i) {
    const x = TOUR[i], last = i === TOUR.length - 1;
    openSheet(`<div class="tour"><div class="tour-e">${x.e}</div><h2>${esc(x.t)}</h2><p>${esc(x.d)}</p>
      <div class="r-dots">${TOUR.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("")}</div>
      <div class="btn-row">${i ? `<button class="btn ghost" data-act="tour" data-i="${i - 1}">‹ Indietro</button>` : `<button class="btn ghost" data-act="tour-end">Salta</button>`}
        <button class="btn" style="flex:1" data-act="${last ? "tour-end" : "tour"}" data-i="${i + 1}">${last ? "Iniziamo 🌱" : "Avanti ›"}</button></div></div>`);
  }

  /* ---------------- Tappe dello sviluppo spuntabili ---------------- */
  // Segnali per cui è bene parlarne con il pediatra (indicazioni generali, per fascia di età delle tappe)
  const WATCH_FLAGS = [
    ["Non segue con lo sguardo le persone o gli oggetti che si muovono", "Non sorride alle persone", "Non regge la testa quando sta a pancia in giù", "Non si gira verso i suoni o non si spaventa per un rumore forte"],
    ["Verso i 9 mesi non sta seduto, nemmeno con un appoggio", "Non risponde quando lo si chiama per nome", "Non fa versi o lallazioni", "Non mostra interesse per giochi e persone"],
    ["A 12 mesi non si sposta in nessun modo (né gattona né striscia)", "Non sta in piedi con un appoggio", "Non indica e non fa «ciao» con la mano", "Non dice sillabe come «ma-ma» o «pa-pa»"],
    ["A 18 mesi non cammina", "Non dice almeno qualche parola", "Non indica per mostrarvi qualcosa", "Non imita i gesti degli adulti"],
    ["A 24 mesi non mette insieme due parole", "Non sa a cosa servono oggetti comuni (spazzola, cucchiaio, telefono)", "Non segue richieste semplici", "Non imita azioni o parole"]
  ];
  const msKey = t => "m" + hashStr(t);
  const msOf = t => { const v = ms[msKey(t)]; return v && v.date ? v : null; };
  function toggleMilestone(k) {
    const item = MILESTONES.flatMap(x => x.items).find(i => msKey(i) === k);
    if (!item) return;
    const cur = ms[k];
    if (cur && cur.date) {
      if (!confirm("Togliere la spunta? Sparisce anche dal diario.")) return;
      if (cur.log) deleteLog(cur.log);
      ms[k] = null;
      toast("Spunta tolta");
    } else {
      const d = iso(today0()), id = "l" + Date.now().toString(36);
      diary.push({ id, date: d, type: "traguardo", time: nowHM(), t: item, by: me() || undefined }); S.set("diary", diary);
      ms[k] = { date: d, log: id };
      toast("Bravissimo! ⭐ Segnato nel diario (puoi cambiare la data da lì)");
    }
    S.set("ms", ms); render(true);
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
        <p class="small"><b>Tocca una tappa</b> quando ${name()} la raggiunge: finisce nel diario come «prima volta», con la data.</p>
        ${MILESTONES.map((x, xi) => { const done = x.items.filter(i => msOf(i)).length; return `<div class="card ${x === cur ? "tint-green" : ""}">
          <div class="card-kicker">${x === cur ? "📍 Questa età · " : ""}${x.t}<span style="margin-left:auto">${done}/${x.items.length}</span></div>
          ${x.items.map(i => { const d = msOf(i); return `<button class="ms-row${d ? " on" : ""}" data-act="ms-toggle" data-k="${msKey(i)}"><span class="ms-chk">${d ? "✓" : ""}</span><span class="grow">${esc(i)}${d ? `<small>il ${fmt(parseISO(d.date), { day: "numeric", month: "long" })}</small>` : ""}</span></button>`; }).join("")}
          ${(window.MILESTONE_GEAR || [])[xi] ? `<details class="ms-gear"${x === cur ? " open" : ""}><summary>🧰 Cosa può servire in questa fase</summary><ul>${MILESTONE_GEAR[xi].map(w => `<li>${esc(w)}</li>`).join("")}</ul></details>` : ""}
          ${WATCH_FLAGS[xi] ? `<details class="ms-watch"><summary>🩺 Quando parlarne con il pediatra</summary><ul>${WATCH_FLAGS[xi].map(w => `<li>${esc(w)}</li>`).join("")}</ul></details>` : ""}
          ${x === cur ? `<button class="link-btn small" data-act="set" data-k="playTab" data-v="giochi" style="margin-top:8px">🧸 Giochi per accompagnarlo in questa fase ›</button>` : ""}
        </div>`; }).join("")}
        <p class="small muted">Perdere capacità che aveva già è, a qualsiasi età, un motivo per sentire il pediatra.</p>`;
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
    const placeRaw = [ev.place, ev.town].filter(Boolean).join(", "), place = esc(placeRaw);
    return `<div class="card"><div class="ev">
      ${d ? dateBox(ev) : `<div class="datebox tbd">${ev.e || "📅"}</div>`}
      <div class="grow" style="min-width:0">
        <h3>${d ? (ev.e || "") + " " : ""}${esc(ev.t)}</h3>
        <div class="where">${when}${place ? "<br>📍 " + place : ""}${distKm(ev) != null ? " · " + kmLabel(distKm(ev)) : ""}</div>
        ${ev.age ? `<span class="tag green">👶 ${esc(ev.age)}</span>` : ""}${ev.mine ? `<span class="tag purple">Aggiunto da te</span>` : ""}${ev.status ? `<span class="tag ${ev.status === "confermato" ? "green" : "yellow"}">${esc(ev.status)}</span>` : ""}
        ${ev.desc ? `<p class="small" style="margin:8px 0 0">${esc(ev.desc)}</p>` : ""}
        <div class="btn-row">
          ${ev.link ? `<a class="btn ghost small" href="${esc(ev.link)}" target="_blank" rel="noopener">${ev.news ? "🗞️ Articolo" : "🔗 Sito"}</a>` : ""}
          ${(ev.q || place) && !ev.news ? `<a class="btn ghost small" href="${mapsUrl(ev.q || placeRaw)}" target="_blank" rel="noopener">🗺️ Mappa</a>` : ""}
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
        ${m < 6 && a ? `<p class="small"><b>Quando inizierete lo svezzamento</b> (dopo ${dayPrep(a.six, "il")}${fmt(a.six)}, d'accordo con il pediatra).</p>` : ""}
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
        <b>Come funziona:</b> l'ordine è un suggerimento, potete cambiarlo con il pediatra. Il nuovo allergene si offre di mattina o a pranzo, in un giorno in cui il bimbo sta bene. Le date arrivano dai <a href="#/cibi">Cibi provati</a> e dal <a href="#/diario">Diario</a>.
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
    const pts = growth.filter(g => g[mt.k]).map(g => ({ x: monthsAt(g.date), y: g[mt.k], g })).filter(p => p.x >= 0 && p.x <= 24).sort((a, b) => a.x - b.x);
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
        <div class="card-kicker">📈 ${mt.n} di ${ofName()}</div>
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

  function openAddGrowth(date, id) {
    const g = (id && growth.find(x => x.id === id)) || {}, num = v => (v ? String(v).replace(".", ",") : "");
    openSheet(`<h2>📏 ${id ? "Modifica la misurazione" : "Nuova misurazione"}</h2>
      <form id="growthForm" data-id="${esc(id || "")}">
        <label class="field"><span>Data</span><input type="date" name="date" value="${esc(g.date || date || iso(today0()))}" max="${iso(today0())}" min="${esc(settings.birth)}" required></label>
        <label class="field"><span>Peso (kg)</span><input type="text" inputmode="decimal" name="w" placeholder="Es. 7,45" value="${num(g.w)}"></label>
        <label class="field"><span>Lunghezza (cm)</span><input type="text" inputmode="decimal" name="l" placeholder="Es. 66,5" value="${num(g.l)}"></label>
        <label class="field"><span>Circonferenza della testa (cm)</span><input type="text" inputmode="decimal" name="h" placeholder="Es. 43" value="${num(g.h)}"></label>
        <p class="small muted">Le misure finiscono anche nelle curve di crescita, in Salute.</p>
        <div class="btn-row"><button class="btn" type="submit" style="flex:1">Salva</button>${id ? `<button class="btn danger" type="button" data-act="g-del" data-id="${esc(id)}">Elimina</button>` : ""}<button class="btn ghost" type="button" data-act="close">Annulla</button></div>
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
        ${due ? `<span class="when">${dueM < 72 ? "Intorno " + dayPrep(due, "al") + fmt(due, { day: "numeric", month: "long", year: "numeric" }) : "Verso i 6 anni"}</span>` : ""}
        ${d ? `<span class="tag green">fatto · ${fmt(parseISO(d), { day: "numeric", month: "short" })}</span>` : soon ? (daysBetween(t, due) < 0 ? `<span class="tag yellow">da segnare</span>` : `<span class="tag peach">in arrivo</span>`) : ""}
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
    const body = ui.healthTab === "crescita" ? viewGrowth() : ui.healthTab === "domande" ? viewQuestions() : ui.healthTab === "cura" ? viewCare() : ui.healthTab === "promemoria" ? viewReminders() : viewAgenda() + aslCard();
    return `<a class="card list-card" href="#/emergenze" style="background:var(--danger-soft);border-color:transparent">
        <div class="big-emoji">🆘</div><div class="grow"><h3>Emergenze</h3><div class="meta">Numeri utili, soffocamento, febbre, pronto soccorso</div></div><span class="muted">›</span></a>
      <div class="segmented">${seg("agenda", "📅 Agenda")}${seg("promemoria", "🔔 Promemoria")}${seg("crescita", "📈 Crescita")}${seg("domande", "❓ Domande")}${seg("cura", "🧴 Cure")}</div>${body}`;
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
      <div class="section-title"><h2>📖 Per mamma e papà</h2></div>
      <p class="small muted" style="margin-top:-4px">Letture consigliate su pappa, sonno, sviluppo ed educazione. Si trovano in biblioteca o in libreria; prendile come spunti, non come regole.</p>
      ${(window.PARENT_BOOKS || []).map(g => `<details class="group"><summary>${esc(g.cat)} <span class="small muted" style="margin-left:auto;margin-right:8px">${g.items.length}</span></summary><div style="padding:0 16px 8px">${g.items.map(b => `<div class="pb-row"><b>${esc(b.t)}</b><div class="small muted">${esc(b.a)}</div><p class="small" style="margin:4px 0 0">${esc(b.d)}</p><a class="small" href="https://www.google.com/search?q=${encodeURIComponent(b.t + " " + b.a + " libro")}" target="_blank" rel="noopener">Cerca il libro ›</a></div>`).join("")}</div></details>`).join("")}
      <div class="section-title"><h2>🎵 Filastrocche e ninne nanne</h2></div>
      ${rhymes.map(r => `<details class="group"><summary>${esc(r.t)} <span class="small muted" style="margin-left:auto;margin-right:8px">${r.min}+ mesi</span></summary>
        <div style="padding:0 16px 14px"><p class="rhyme">${esc(r.txt)}</p><p class="small muted" style="margin:0">👐 ${esc(r.g)}</p></div></details>`).join("")}`;
  }

  /* ---------------- Mese per mese ---------------- */
  const monthEntry = m => MONTH_GUIDE.find(e => m >= e.m && m <= e.to) || MONTH_GUIDE[MONTH_GUIDE.length - 1];
  // Peso e lunghezza del mese: l'ultima misura del bimbo se recente, altrimenti la mediana OMS per età e sesso
  function monthStats(e, isCur) {
    const g = (window.GROWTH || {})[settings && settings.sex === "f" ? "girls" : "boys"] || {}, mo = Math.min(24, e.m);
    const med = k => (g[k] && g[k][mo] ? g[k][mo][1] : null);
    let w = med("weight"), l = med("length"), src = "valori medi OMS " + (mo ? "a " + plural(mo, "mese", "mesi") : "alla nascita");
    if (isCur) {
      const last = growth.slice().sort((x, y) => y.date.localeCompare(x.date));
      const lw = last.find(x => x.w), ll = last.find(x => x.l), recent = x => x && daysBetween(parseISO(x.date), today0()) <= 45;
      if (recent(lw) || recent(ll)) { if (recent(lw)) w = lw.w; if (recent(ll)) l = ll.l; src = "le misure di " + name(); }
    }
    const num = (v, d) => (v == null ? "–" : v.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d }));
    return { w: num(w, w != null && w < 10 ? 2 : 1), l: num(l, 1), src };
  }
  function viewMonth(id) {
    const m = ageM();
    const cur = monthEntry(m);
    const idx = id != null && id !== "" ? Math.max(0, Math.min(MONTH_GUIDE.length - 1, Number(id))) : MONTH_GUIDE.indexOf(cur);
    const e = MONTH_GUIDE[idx], isCur = e === cur;
    const prev = MONTH_GUIDE[idx - 1], next = MONTH_GUIDE[idx + 1];
    const st = monthStats(e, isCur);
    const label = x => (x.m === x.to ? String(x.m) : x.m + "-" + x.to);
    const acts = activitiesForAge(e.m).slice(0, 8);
    return `
      <nav class="mt-tabs" id="monthChips" aria-label="Mesi">${MONTH_GUIDE.map((x, i) => `<a class="${i === idx ? "on" : ""}${x === cur ? " cur" : ""}" href="#/mese/${i}"><b>${label(x)}</b>${i === idx ? `<small>${x.to === 1 && x.m === 1 ? "MESE" : "MESI"}</small>` : ""}</a>`).join("")}</nav>
      <div class="mt-tiles">
        <div class="mt-img">${window.babyArt ? babyArt(e.m) : ""}</div>
        <button class="mt-stats" data-act="go-growth" aria-label="Apri le curve di crescita">
          <span class="mt-arrow">›</span>
          <span class="mt-v">${st.w}<small> kg</small></span><span class="mt-k">Peso</span>
          <span class="mt-v">${st.l}<small> cm</small></span><span class="mt-k">Lunghezza</span>
          <span class="mt-src">${esc(st.src)}</span>
        </button>
      </div>
      <h1 class="mt-title">${e.m === 0 ? "Il primo mese di vita" : esc(e.t) + " di vita"}</h1>
      ${isCur ? `<span class="tag purple">📍 L'età di ${ofName()}</span>` : ""}
      <p class="mt-intro">${esc(e.intro)}</p>
      ${e.items.map(it => `<h3 class="mt-h">${it.e} ${esc(it.t)}</h3>
        <p class="mt-p"><b>Cosa aspettarsi.</b> ${esc(it.expect)}</p>
        <p class="mt-p"><b>Come affrontarlo.</b> ${esc(it.how)}</p>`).join("")}
      <h3 class="mt-h">Nota finale</h3>
      <p class="mt-p">Sono tendenze medie: ogni bambino ha i suoi tempi, e qualche settimana di anticipo o di ritardo è normale. Per qualsiasi dubbio sul sonno, la crescita o lo sviluppo, parlane con il pediatra.</p>
      ${acts.length ? `<h2 class="mt-h2">I giochi di questo mese</h2>
        <div class="mt-acts">${acts.map(x => `<a href="#/attivita/${x.id}"><span class="mt-ae">${x.e}</span><b>${esc(x.t)}</b><small>${esc(x.dur)}</small></a>`).join("")}</div>` : ""}
      <div class="btn-row" style="justify-content:space-between">
        ${prev ? `<a class="btn ghost small" href="#/mese/${idx - 1}">‹ ${esc(prev.t)}</a>` : "<span></span>"}
        ${next ? `<a class="btn ghost small" href="#/mese/${idx + 1}">${esc(next.t)} ›</a>` : ""}
      </div>`;
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
        fig.parentElement.classList.add("has-photo");
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
  var SYNC_KID_MAPS = ["foods", "ready", "done", "health", "plan", "ms", "remDone"];
  var SYNC_KID_LISTS = ["growth", "appts", "questions", "diary", "rem"];
  var SYNC_LOCAL_ONLY = ["sync", "activeKid", "evKm", "theme", "installDismissed", "feed", "cookMode", "photoQueue", "photoShare", "me", "onboarded", "lastBackup", "notified"];
  var syncing = false, syncTimer = null, applyingRemote = false, pendingRender = false;
  // Si sta scrivendo in un campo della pagina: si aggiorna quando si esce dal campo
  const editing = () => { const a = document.activeElement; return !!a && app.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); };
  app.addEventListener("focusout", () => setTimeout(() => { if (pendingRender && sheet.hidden && !editing()) { pendingRender = false; render(true); } }, 0));
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
    (raw.get("shop", []) || []).forEach(x => { if (x && x.id) f["shop:" + x.id] = x; });
    const vd = raw.get("videos", {}) || {}; Object.keys(vd).forEach(id => { f["videos:" + id] = vd[id]; });
    const ct = raw.get("contacts", {}) || {}; if (Object.keys(ct).length) f.contacts = ct;
    const hm = raw.get("home", null); if (hm) f.home = hm;
    return f;
  }
  function unflatten(f) {
    const ks = [], per = {}, fv = {}, ev = [], vd = {}, sh = [];
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
      else if (p[0] === "shop") sh.push(v);
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
      raw.set("shop", sh.sort((a, b) => String(a.id).localeCompare(String(b.id))));
      if (hm) raw.set("home", hm); else raw.del("home");
    } finally { applyingRemote = false; }
    favs = fv; myEvents = ev; videos = vd; contacts = ct; home = hm; shop = raw.get("shop", []);
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
    if (cfg.v !== 2) return { space: cfg.key, keyFor: async n => n, nameFor: k => k, encode: async (n, v) => v, decode: async r => ({ n: r.k, v: r.v }), seal: async b => bytesToB64u(b), open: async s2 => b64uToBytes(s2) };
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
      async seal(bytes) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, bytes));
        const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
        return bytesToB64u(out);
      },
      async open(str) {
        const b = b64uToBytes(str);
        return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.subarray(0, 12) }, aes, b.subarray(12)));
      },
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

  // Il servizio Google a volte è lento (anche 10 secondi) o risponde con una pagina d'errore:
  // ogni richiesta ha un tempo massimo e, se non riesce, si riprova da soli sempre più di rado.
  var syncAgain = false, syncFails = 0, retryTimer = null;
  async function postSync(url, body) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 45000);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), signal: ctl.signal });
      const txt = await res.text();
      try { return JSON.parse(txt); }
      catch (e) { throw new Error(res.status === 404 || /impossibile aprire il file|unable to open the file/i.test(txt) ? "il servizio Google è momentaneamente occupato" : "risposta non valida dal servizio"); }
    } catch (err) {
      if (err.name === "AbortError") throw new Error("il servizio Google non ha risposto in tempo");
      // un errore di rete del browser: connessione assente, indirizzo bloccato o pagina d'errore di Google
      if (err instanceof TypeError) throw Object.assign(new Error("il servizio non è raggiungibile da questo telefono"), { net: true });
      throw err;
    } finally { clearTimeout(tm); }
  }
  // Indirizzi di versioni precedenti del servizio centrale: stessi dati (stesso Drive), si passa da soli a quello attuale
  function currentSync() {
    const cfg = raw.get("sync", null), central = centralUrl(), old = (window.PP_CONFIG && PP_CONFIG.previousServiceUrls) || [];
    if (cfg && central && cfg.url !== central && old.includes(cfg.url)) { cfg.url = central; raw.set("sync", cfg); }
    return cfg;
  }
  async function syncNow(manual) {
    const cfg = currentSync();
    if (!cfg) return false;
    if (syncing) {
      // ce n'è già una in corso: se ne fa un'altra appena finisce (e se l'ha chiesta la persona, glielo si dice)
      syncAgain = manual ? "manual" : (syncAgain || "auto");
      if (manual) toast("Sincronizzazione in corso…");
      return false;
    }
    syncing = true; clearTimeout(syncTimer); clearTimeout(retryTimer);
    try {
      const codec = await getCodec(cfg);
      const cur = flatten(), meta = cfg.meta || {}, now = Date.now(), changes = [], startJson = {};
      Object.keys(cur).forEach(n => { startJson[n] = JSON.stringify(cur[n]); });
      if (!cfg.ro) {
        for (const n of Object.keys(cur)) if (meta[n] !== hashStr(startJson[n])) changes.push({ k: await codec.keyFor(n), v: await codec.encode(n, cur[n]), t: now });
        for (const n of Object.keys(meta)) if (!(n in cur)) changes.push({ k: await codec.keyFor(n), v: null, t: now, d: true });
      }
      const since = cfg.full ? 0 : cfg.seq || 0;
      const data = await postSync(cfg.url, { key: codec.space, since, changes });
      if (!data || data.error || !Array.isArray(data.rec)) throw new Error((data && data.error) || "risposta non valida dal servizio");
      // Lo spazio sul servizio è stato ricreato (id diverso) o ha meno modifiche di quelle già viste: si riallinea tutto
      // Se nel frattempo la condivisione è stata tolta o cambiata su questo telefono, la risposta non vale più
      const stillSame = () => { const live = raw.get("sync", null); return !!live && (live.secret || live.key) === (cfg.secret || cfg.key); };
      if (!stillSame()) return false;
      if (!cfg.full && (data.seq < since || (cfg.epoch && data.id && data.id !== cfg.epoch))) {
        raw.set("sync", Object.assign({}, raw.get("sync", null), { full: true }));
        syncAgain = syncAgain || "auto";
        return false;
      }
      let changed = false;
      const onServer = new Set(), keepDiary = new Set();
      for (const r of data.rec) {
        const nm = codec.nameFor(r.k);
        if (nm) onServer.add(nm);
        // le voci del diario non si cancellano mai davvero (hanno del: true): un «cancellato» arriva da una versione
        // vecchia dell'app che non le conosce, quindi si tengono e si rimandano
        if (r.d && nm && /^(k:[^:]+:(diary|plan|ms|rem|remDone):|shop:)/.test(nm) && nm in cur) { keepDiary.add(nm); continue; }
        if (r.d) { if (nm && nm in cur) { delete cur[nm]; changed = true; } continue; }
        const o = await codec.decode(r);
        if (o) onServer.add(o.n);
        if (o && JSON.stringify(cur[o.n]) !== JSON.stringify(o.v)) { cur[o.n] = o.v; changed = true; }
      }
      if (!stillSame()) return false;
      // Modifiche fatte su questo telefono mentre la sincronizzazione era in corso: si tengono e partono al giro dopo
      const latest = flatten(), dirty = [];
      Object.keys(latest).forEach(n => { if (JSON.stringify(latest[n]) !== startJson[n]) { cur[n] = latest[n]; dirty.push(n); } });
      Object.keys(startJson).forEach(n => { if (!(n in latest)) { delete cur[n]; dirty.push(n); } });
      if (changed) unflatten(cur);
      const newMeta = {};
      Object.keys(cur).forEach(n => { newMeta[n] = hashStr(JSON.stringify(cur[n])); });
      dirty.forEach(n => { if (n in startJson) newMeta[n] = hashStr(startJson[n]); else delete newMeta[n]; });
      // Dopo un riallineamento: ciò che il servizio non ha più si rimanda
      let resend = keepDiary.size > 0;
      keepDiary.forEach(n => { delete newMeta[n]; });
      if (cfg.full) Object.keys(cur).forEach(n => { if (!onServer.has(n)) { delete newMeta[n]; resend = true; } });
      const saved = Object.assign({}, raw.get("sync", null), { seq: data.seq, meta: newMeta, last: Date.now(), err: "" });
      if (data.id) saved.epoch = data.id;
      delete saved.full; delete saved.triedCentral;
      raw.set("sync", saved);
      syncFails = 0;
      setTimeout(uploadPhotos, 200);
      if (!cfg.ro && Date.now() - (Number(raw.get("lastBackup", 0)) || 0) > 24 * 3600e3) setTimeout(autoBackup, 1500);
      if (dirty.length || resend) syncTimer = setTimeout(() => syncNow(false), 1500);
      if (changed || manual || /impostazioni/.test(location.hash)) { if (sheet.hidden && !editing()) render(true); else pendingRender = true; }
      if (manual) toast(changed ? "Dati aggiornati dalla famiglia ✅" : "Tutto sincronizzato ✅");
      return true;
    } catch (err) {
      // Servizio dello spazio irraggiungibile: se quello dell'app ha già questo spazio (stesso Drive), si passa lì
      const central = centralUrl();
      if (err && err.net && central && cfg.url !== central && !cfg.triedCentral) {
        try {
          const codec = await getCodec(cfg), probe = await postSync(central, { key: codec.space, since: 0, changes: [] });
          const live = raw.get("sync", null);
          if (probe && probe.seq > 0 && live) { raw.set("sync", Object.assign(live, { url: central, err: "" })); syncAgain = manual ? "manual" : "auto"; return false; }
        } catch (e2) { /* anche il servizio dell'app non risponde */ }
        const live = raw.get("sync", null);
        if (live) raw.set("sync", Object.assign(live, { triedCentral: true }));
      }
      const c = raw.get("sync", null);
      if (c) {
        raw.set("sync", Object.assign(c, { err: String(err && err.message || err) }));
        syncFails++;
        retryTimer = setTimeout(() => syncNow(false), Math.min(300, 15 * Math.pow(2, syncFails - 1)) * 1000);
        if (/impostazioni/.test(location.hash) && sheet.hidden && !editing()) render(true);
      }
      if (manual) toast("Sincronizzazione non riuscita: " + String(err && err.message || err) + ". Riprovo da solo.");
      return false;
    } finally {
      syncing = false;
      updateNetChip();
      if (syncAgain) { const m = syncAgain === "manual"; syncAgain = false; setTimeout(() => syncNow(m), 300); }
    }
  }
  const b64u = str => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64u = str => decodeURIComponent(escape(atob(str.replace(/-/g, "+").replace(/_/g, "/"))));
  const centralUrl = () => (window.PP_CONFIG && PP_CONFIG.serviceUrl) || "";
  function inviteCode(c) {
    c = c || raw.get("sync", null);
    if (!c) return "";
    return c.v === 2 ? "PP2-" + b64u(JSON.stringify(Object.assign({ u: c.url, s: c.secret }, c.ro ? { r: 1 } : {}))) : "PP1-" + b64u(JSON.stringify(Object.assign({ u: c.url, k: c.key }, c.ro ? { r: 1 } : {})));
  }
  function parseInvite(text) {
    const m = String(text || "").match(/PP([12])-[A-Za-z0-9_-]+/);
    if (!m) return null;
    try {
      const o = JSON.parse(unb64u(m[0].slice(4)));
      if (!o || !/^(https:\/\/|http:\/\/(127\.0\.0\.1|localhost)[:/])/.test(o.u)) return null;
      if (m[1] === "2") return String(o.s || "").length >= 20 ? Object.assign({ v: 2, url: o.u, secret: o.s }, o.r ? { ro: true } : {}) : null;
      return String(o.k || "").length >= 20 ? Object.assign({ url: o.u, key: o.k }, o.r ? { ro: true } : {}) : null;
    } catch (e) { return null; }
  }
  function randomKey() { const a = new Uint8Array(24); crypto.getRandomValues(a); return bytesToB64u(a); }
  // Crea un nuovo spazio cifrato sul servizio indicato e carica i dati di questo telefono
  async function startSpace(url) {
    raw.set("sync", { v: 2, url, secret: randomKey(), seq: 0, meta: {}, last: 0, err: "" });
    const ok = await syncWithRetry();
    if (!ok) { clearTimeout(retryTimer); raw.del("sync"); }
    return ok;
  }
  // Per attivare o entrare in uno spazio: fino a 3 tentativi, perché il servizio a volte non risponde al primo colpo
  async function syncWithRetry() {
    for (let i = 0; i < 3; i++) {
      if (i) await new Promise(r => setTimeout(r, 2500 * i));
      while (syncing) await new Promise(r => setTimeout(r, 300));
      if (await syncNow(false)) return true;
    }
    return false;
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
        <p class="small">${c.err ? `⚠️ Ultimo tentativo non riuscito: ${esc(c.err)}. Riprovo da solo tra poco.` : "✅ Tutto collegato."} Ultima sincronizzazione riuscita: <b>${esc(when)}</b>.</p>
        <p class="small">${c.v === 2 ? "🔒 Dati cifrati sul telefono: " + (own ? "il vostro servizio Google" : "il servizio dell'app") + " conserva solo dati illeggibili." : "⚠️ Questo spazio è stato creato prima della cifratura: i dati sono leggibili nel Drive di chi ha creato il servizio."}</p>
        ${c.ro ? `<p class="small"><b>👀 Sola lettura:</b> su questo telefono puoi vedere tutto, ma non modificare.</p>` : ""}
        <label class="field"><span>Chi usa questo telefono?</span>
          <input type="text" list="meList" data-change="me" value="${esc(me())}" placeholder="Es. Mamma, Papà, Nonna Lucia" autocomplete="off">
          <datalist id="meList"><option value="Mamma"><option value="Papà"><option value="Nonna"><option value="Nonno"><option value="Babysitter"></datalist></label>
        <p class="small muted" style="margin-top:-6px">Compare accanto a quello che segni nel diario e nella spesa.</p>
        <div class="btn-row">
          <button class="btn" data-act="sync-invite">📨 Invita qualcuno</button>
          <button class="btn ghost" data-act="sync-now">🔄 Sincronizza ora</button>
        </div>
        ${c.err ? `<button class="btn ghost block" data-act="sync-check" style="margin-top:10px">🔍 Verifica il collegamento</button>` : ""}
        ${c.v !== 2 ? `<button class="btn block" data-act="sync-encrypt" style="margin-top:10px">🔒 Passa alla cifratura</button>` : ""}
        <button class="btn ghost block" data-act="backups" style="margin-top:10px">🗂️ Copie di sicurezza</button>
        <button class="btn ghost block" data-act="sync-newfamily" style="margin-top:10px">🏠 Crea uno spazio per un'altra famiglia</button>
        ${own ? `<button class="btn ghost block" data-act="sync-update" style="margin-top:8px">🛠️ Aggiorna il servizio Google</button>` : ""}
        <p class="small muted" style="margin:10px 0 0">Le foto del diario vengono cifrate e condivise con la famiglia; quelle dei piatti restano sul telefono che le ha scattate. Il codice di invito apre tutti i dati della famiglia: mandalo solo a persone di fiducia.</p>
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
        <li>Se Google lo chiede, autorizza di nuovo (Drive e servizi esterni, che servono per le notizie).</li>
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
  // Copie di sicurezza: il servizio fa una copia del file della famiglia una volta alla settimana e ne tiene 6
  async function autoBackup() {
    const c = raw.get("sync", null);
    if (!c) return;
    try {
      const codec = await getCodec(c), res = await postSync(c.url, { action: "backup", key: codec.space });
      if (res && res.ok) raw.set("lastBackup", Date.now());
      else if (res && Array.isArray(res.rec)) raw.set("lastBackup", Date.now()); // servizio senza copie: si riprova domani
    } catch (e) { /* si riprova alla prossima sincronizzazione */ }
  }
  async function openBackups() {
    const c = raw.get("sync", null);
    if (!c) return;
    openSheet(`<h2 id="backups">🗂️ Copie di sicurezza</h2><p class="small muted">Cerco le copie…</p>`);
    let res = null;
    try { const codec = await getCodec(c); res = await postSync(c.url, { action: "backup-list", key: codec.space }); } catch (e) { res = { error: String(e.message || e) }; }
    const body = res && Array.isArray(res.list)
      ? (res.list.length ? `<div class="card" style="padding:0;overflow:hidden">${res.list.map(x => `<div class="food"><span class="st">🗂️</span><span class="grow">${fmt(parseISO(x.d), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}<br><span class="small muted">${Math.max(1, Math.round(x.size / 1024))} KB</span></span><button class="btn ghost small" data-act="backup-restore" data-d="${esc(x.d)}">Ripristina</button></div>`).join("")}</div>`
        : `<p class="small">Ancora nessuna copia: la prima viene fatta in automatico entro un giorno.</p>`)
      : `<p class="small">${res && res.error ? "Non riesco a leggere le copie: " + esc(res.error) : "Il servizio Google va aggiornato alla versione 6 per le copie di sicurezza."}</p>`;
    if (!sheetShows("backups")) return;
    openSheet(`<h2 id="backups">🗂️ Copie di sicurezza</h2>
      <p class="small">Ogni settimana il servizio salva una copia dei dati della famiglia nella cartella «Piccoli Passi - copie» del Drive, <b>cifrata</b> come i dati. Restano le ultime 6. Le foto del diario sono già nella cartella delle foto.</p>
      ${body}
      <p class="small muted">«Ripristina» riporta i dati com'erano quel giorno; quello che avete aggiunto dopo resta.</p>
      <button class="btn ghost block" data-act="close">Chiudi</button>`);
  }
  async function restoreBackup(d) {
    const c = raw.get("sync", null);
    if (!c || !confirm("Ripristinare i dati del " + fmt(parseISO(d), { day: "numeric", month: "long" }) + "? Arriverà anche agli altri telefoni della famiglia.")) return;
    toast("Ripristino in corso…");
    try {
      const codec = await getCodec(c), res = await postSync(c.url, { action: "backup-get", key: codec.space, d });
      if (!res || !Array.isArray(res.rec)) throw new Error((res && res.error) || "copia non disponibile");
      const cur = flatten(), meta = Object.assign({}, c.meta || {});
      let n = 0;
      for (const r of res.rec) { if (r.d) continue; const o = await codec.decode(r); if (o) { cur[o.n] = o.v; delete meta[o.n]; n++; } }
      unflatten(cur);
      if (!raw.get("sync", null)) return;
      raw.set("sync", Object.assign({}, raw.get("sync", null), { meta }));
      if (sheetShows("backups")) closeSheet();
      if (sheet.hidden) render(true); else pendingRender = true;
      toast("Ripristinati " + n + " elementi ✅");
      syncNow(false);
    } catch (e) { toast("Ripristino non riuscito: " + (e.message || e)); }
  }

  // Membri in sola lettura (nonni): l'app non permette modifiche e non invia nulla
  const isRO = () => { const c = raw.get("sync", null); return !!(c && c.ro); };
  const RO_BLOCK = new Set(["log-add", "log-del", "sleep-start", "sleep-stop", "food", "food-again", "food-del", "g-add", "g-del", "ap-add", "ap-del", "ready", "done", "fav",
    "kid-add", "kid-del", "ms-toggle", "plan-slot", "plan-auto", "plan-clear", "shop-add-plan", "shop-toggle", "shop-del", "shop-clear", "rem-add", "rem-done", "rem-del", "ev-add", "ev-del", "home-open", "sync-newfamily", "sync-encrypt", "backup-restore",
    "al-offer", "al-intro", "kid-photo-del", "h-toggle", "q-add", "q-del", "q-toggle", "plan-set", "set-meals", "vid-del", "vid-add"]);
  // Chi usa questo telefono: compare sulle voci del diario e della spesa
  const me = () => String(raw.get("me", "") || "");
  // Modifiche fatte qui e non ancora arrivate al servizio (per l'indicatore in alto)
  function pendingCount() {
    const c = raw.get("sync", null);
    if (!c || c.ro) return 0;
    const cur = flatten(), meta = c.meta || {};
    let n = 0;
    Object.keys(cur).forEach(k => { if (meta[k] !== hashStr(JSON.stringify(cur[k]))) n++; });
    Object.keys(meta).forEach(k => { if (!(k in cur)) n++; });
    return n;
  }
  function updateNetChip() {
    const b = document.getElementById("netChip"), c = raw.get("sync", null);
    if (!b) return;
    const off = !navigator.onLine, n = c ? pendingCount() : 0;
    b.hidden = !settings || (!off && !n && !(c && c.err));
    b.textContent = off ? "📴" : syncing ? "🔄" : n ? "⏳ " + n : "⚠️";
    b.setAttribute("aria-label", off ? "Senza connessione: le modifiche partiranno quando torni online" : n ? n + " modifiche da inviare alla famiglia" : "Condivisione con un problema: tocca per vedere");
    b.title = b.getAttribute("aria-label");
  }
  window.addEventListener("online", () => { updateNetChip(); if (raw.get("sync", null)) syncNow(false); });
  window.addEventListener("offline", updateNetChip);

  // Verifica del collegamento: cosa raggiunge questo telefono (da mandare a chi aiuta, senza dati personali)
  const sheetShows = id => !sheet.hidden && !!sheet.querySelector("#" + id);
  async function openSyncCheck() {
    const c = raw.get("sync", null);
    if (!c) return;
    const central = centralUrl(), idOf = u => { const m = String(u).match(/\/s\/([^/]+)\//); return m ? "…" + m[1].slice(-8) : String(u).replace(/^https?:\/\//, "").slice(0, 40); };
    const rows = [];
    let shown = false;
    const draw = done => (shown && !sheetShows("syncCheck")) ? null : (shown = true) && openSheet(`<h2 id="syncCheck">🔍 Verifica del collegamento</h2>
      <div class="card" style="padding:0;overflow:hidden">${rows.map(r => `<div class="food"><span class="st">${r.ok == null ? "⏳" : r.ok ? "✅" : "❌"}</span><span class="grow">${esc(r.t)}<br><span class="small muted">${esc(r.d || "")}</span></span></div>`).join("")}</div>
      <p class="small muted">${done ? "Se qualcosa è ❌, fai uno screenshot di questa pagina e mandalo a chi ti aiuta: non contiene dati personali." : "Verifico…"} Versione ${VERSION}.</p>
      <button class="btn ghost block" data-act="close">Chiudi</button>`);
    const step = async (t, fn) => {
      const r = { t, ok: null }; rows.push(r); draw(false);
      const t0 = Date.now();
      try { r.d = await fn(); r.ok = true; } catch (e) { r.ok = false; r.d = String(e && e.message || e); }
      r.d = (r.d || "") + " · " + ((Date.now() - t0) / 1000).toFixed(1) + " s";
      draw(false);
    };
    const getJson = async u => {
      const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 30000);
      try { const res = await fetch(u, { signal: ctl.signal, cache: "no-store" }); const txt = await res.text(); try { return JSON.parse(txt); } catch (e) { throw new Error("risposta " + res.status + " non valida: " + txt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80)); } }
      catch (e) { if (e.name === "AbortError") throw new Error("nessuna risposta in 30 secondi"); throw new Error(e instanceof TypeError ? "non raggiungibile (" + e.message + ")" : e.message); }
      finally { clearTimeout(tm); }
    };
    await step("Internet", async () => { await fetch(location.origin + location.pathname + "manifest.webmanifest?ping=" + Date.now(), { cache: "no-store" }); return navigator.onLine ? "collegato" : "il telefono risulta offline"; });
    await step("Servizio di questo spazio " + idOf(c.url), async () => { const j = await getJson(c.url); return j.app === "piccoli-passi" ? "risponde (versione " + (j.v || "1-2") + ")" : "risponde, ma non è il servizio di Piccoli Passi"; });
    if (central && central !== c.url) await step("Servizio dell'app " + idOf(central), async () => { const j = await getJson(central); return "risponde (versione " + (j.v || "1-2") + ")"; });
    await step("Spazio della famiglia", async () => {
      const codec = await getCodec(c), j = await postSync(c.url, { key: codec.space, since: 0, changes: [] });
      if (j.error) throw new Error(j.error);
      return j.seq > 0 ? "trovato, con " + plural(j.rec.length, "elemento", "elementi") : "non trovato: chi ha invitato deve aprire l'app e sincronizzare";
    });
    draw(true);
  }

  function openInvite(ro) {
    const code = inviteCode(ro ? Object.assign({}, raw.get("sync", null), { ro: true }) : null);
    const link = location.origin + location.pathname + "#/unisciti/" + code;
    const text = "Ti invito a seguire " + (kids.length === 1 && kids[0].name ? kids[0].name : "i nostri bimbi") + " con me su Piccoli Passi 🌱\n\n1) Apri l'app: " + location.origin + location.pathname +
      "\n2) Su iPhone aggiungila alla schermata Home e aprila da lì\n3) Tocca «Ho un codice di invito» e incolla questo codice:\n\n" + code + "\n\nOppure, se apri l'app nel browser, usa direttamente questo link: " + link;
    openSheet(`<h2>📨 Invita qualcuno</h2>
      <div class="segmented"><button class="${ro ? "" : "on"}" data-act="sync-invite">✏️ Può modificare</button><button class="${ro ? "on" : ""}" data-act="sync-invite-ro">👀 Solo lettura</button></div>
      <p class="small">${ro ? "Per i nonni o la babysitter: chi lo riceve <b>vede</b> diario, foto, crescita e agenda, ma <b>non può cambiare niente</b>. L'app lo rispetta su quel telefono; il codice resta comunque riservato alla famiglia." : "Per il partner: chi lo riceve vedrà e potrà modificare tutti i dati della famiglia."} Mandalo per esempio su WhatsApp.</p>
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
    try { Object.keys(localStorage).filter(k => /^pp\.(k\.|kids$|favs$|myEvents$|videos$|contacts$|home$|shop$|photoQueue$)/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignore */ }
    applyingRemote = false;
    kids = []; favs = {}; myEvents = []; videos = {}; contacts = {}; home = null; shop = []; activeKid = null; raw.set("activeKid", null); loadKid();
    raw.set("sync", Object.assign({}, inv, { seq: 0, meta: {}, last: 0, err: "" }));
    closeSheet(); toast("Collegamento in corso…"); render(false);
    const ok = await syncWithRetry();
    location.hash = "#/oggi"; render(false);
    if (ok && kids.length && !raw.get("onboarded", false)) setTimeout(() => openTour(0), 600);
    toast(ok ? (kids.length ? "Benvenuto in famiglia! 🎉" : "Collegato! Ora inserisci il tuo bimbo per iniziare 🌱") : "Il servizio non risponde ancora: riprovo da solo");
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
        <h2>👶 Profilo di ${ofName()}</h2>
        <label class="field"><span>Nome</span><input type="text" name="name" value="${esc(settings.name || "")}" autocomplete="off"></label>
        <label class="field"><span>Data di nascita</span><input type="date" name="birth" value="${esc(settings.birth || "")}" max="${iso(today0())}" required></label>
        <label class="field"><span>Curve di crescita</span><select name="sex"><option value="m" ${settings.sex !== "f" ? "selected" : ""}>Maschio</option><option value="f" ${settings.sex === "f" ? "selected" : ""}>Femmina</option></select></label>
        <label class="field"><span>Allattamento</span><select name="feed">${[["seno", "🤱 Al seno"], ["artificiale", "🍼 Artificiale (biberon)"], ["misto", "🤱🍼 Misto"]].map(([k, l]) => `<option value="${k}" ${(settings.feed || "seno") === k ? "selected" : ""}>${l}</option>`).join("")}</select>
          <small class="muted">Nel diario «Latte» parte già con seno o biberon; con il misto ripropone l'ultimo che hai segnato.</small></label>
        <div class="field"><span>Foto nella pagina Oggi</span></div>
        <div class="btn-row" style="margin:0 0 14px"><label class="btn ghost small" style="cursor:pointer">📷 ${settings.photo ? "Cambia foto" : "Scegli una foto"}<input type="file" accept="image/*" data-act="kid-photo" hidden></label>
          ${settings.photo ? `<button class="btn ghost small" type="button" data-act="kid-photo-del">Togli la foto</button>` : ""}</div>
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
        <p class="small">Salva una copia di tutti i dati in un file, da conservare o da importare su un telefono nuovo. Le foto (del diario e dei piatti) non sono incluse: con la condivisione attiva quelle del diario restano comunque sul servizio, cifrate.</p>
        <div class="btn-row">
          <button class="btn ghost" data-act="export">⬇️ Esporta</button>
          <button class="btn ghost" data-act="export-photos">⬇️ Esporta con le foto</button>
          <label class="btn ghost" style="cursor:pointer">⬆️ Importa<input type="file" accept="application/json,.json" data-act="import" hidden></label>
        </div>
      </div>
      <div class="card">
        <h2>🔐 Dove sono i tuoi dati</h2>
        <ul class="small">
          <li><b>Sul telefono:</b> profili, diario, crescita, agenda, preferiti e foto restano in questa app.</li>
          <li><b>Condivisione (se attiva):</b> i dati partono già <b>cifrati</b> con il codice di famiglia; il servizio li conserva senza poterli leggere. Lo stesso vale per le foto del diario, salvate cifrate in una cartella del Drive di chi gestisce il servizio. Le foto dei piatti non vengono inviate.</li>
          <li><b>Comune:</b> il nome viene cercato su OpenStreetMap e il sito del Comune o dell'ASL su Wikidata. Non viene inviato nient'altro.</li>
          <li><b>Notizie sugli eventi:</b> per cercarle su Google News si invia solo il nome del comune, al servizio dell'app oppure, se non c'è, ai lettori pubblici di notizie rss2json.com e allorigins.win.</li>
          <li><b>Video:</b> YouTube riceve la richiesta solo quando premi play.</li>
        </ul>
      </div>
      <div class="card">
        <h2>ℹ️ Informazioni</h2>
        <button class="btn ghost small" data-act="tour" data-i="0" style="margin-bottom:10px">📘 Rivedi la guida all'app</button>
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
    if (isRO() && RO_BLOCK.has(act)) { e.preventDefault(); toast("👀 Sei in sola lettura: puoi guardare tutto, ma non modificare"); return; }
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
      case "sync-now": raw.del("photoShare"); syncNow(true); break;
      case "sync-check": openSyncCheck(); break;
      case "backups": openBackups(); break;
      case "ms-toggle": toggleMilestone(t.dataset.k); break;
      case "tour": openTour(Number(t.dataset.i)); break;
      case "tour-end": raw.set("onboarded", true); closeSheet(); break;
      case "week-move": ui.wStart = iso(addDays(weekStart(), Number(t.dataset.d))); render(true); break;
      case "plan-slot": openPlanSlot(t.dataset.d, t.dataset.m); break;
      case "plan-set": setPlan(t.dataset.d, t.dataset.m, t.dataset.id); closeSheet(); render(true); break;
      case "plan-auto": {
        const res = autoPlan();
        const fr = res.fresh.length ? " · " + (res.fresh.length === 1 ? "1 cibo nuovo, segnato" : res.fresh.length + " cibi nuovi, segnati") + " con ✨" : "";
        toast(res.n ? (res.moved ? "Le pappe partono " + fmt(parseISO(res.from), { weekday: "long", day: "numeric", month: "long" }) + ", ai 6 mesi. " : "") + "Proposte " + plural(res.n, "pappa", "pappe") + " ✨" + fr
          : res.empty ? "Nessuna ricetta adatta ai cibi provati: segna nel diario i cibi che ha già assaggiato" : "La settimana è già piena: tocca una pappa per cambiarla");
        render(true); break;
      }
      case "set-meals": {
        settings.meals = Number(t.dataset.v) || undefined; S.set("settings", settings);
        const st = weekStart();
        if (Array.from({ length: 7 }, (_, i) => plan[iso(addDays(st, i))]).some(p => p && p.auto)) autoPlan();
        render(true); break;
      }
      case "plan-clear": if (confirm("Svuotare il piano di questa settimana?")) { const st = weekStart(); for (let k = 0; k < 7; k++) { const d = iso(addDays(st, k)); if (plan[d]) plan[d] = { pranzo: null, cena: null }; } S.set("plan", plan); render(true); } break;
      case "plan-recipe": {
        const r = recipeById(t.dataset.id), days = Array.from({ length: 7 }, (_, i) => addDays(today0(), i));
        if (r) openSheet(`<h2>🗓️ ${esc(r.t)}</h2><p class="small muted">Quando la prepari?</p><div class="card" style="padding:0;overflow:hidden">${days.map(d => MEALS.map(([m, l]) => `<button class="food" data-act="plan-set" data-d="${iso(d)}" data-m="${m}" data-id="${r.id}"><span class="st">${l.split(" ")[0]}</span><span class="grow">${fmt(d, { weekday: "long", day: "numeric", month: "short" })} · ${l.split(" ")[1]}${(plan[iso(d)] || {})[m] ? `<br><span class="small muted">al posto di: ${esc((recipeById(plan[iso(d)][m]) || {}).t || "")}</span>` : ""}</span></button>`).join("")).join("")}</div><button class="btn ghost block" data-act="close" style="margin-top:10px">Chiudi</button>`);
        break;
      }
      case "shop-add-plan": { const n = planIngredientsToShop(); toast(n ? plural(n, "ingrediente aggiunto", "ingredienti aggiunti") + " alla spesa 🛒" : "Niente da aggiungere: pianifica qualche pappa o sono già in lista"); if (n && !/spesa/.test(location.hash)) location.hash = "#/spesa"; else render(true); break; }
      case "shop-toggle": { const x = shop.find(v => v.id === t.dataset.id); if (x) { x.done = !x.done; S.set("shop", shop); render(true); } break; }
      case "shop-del": shop = shop.map(v => (v.id === t.dataset.id ? { id: v.id, del: true } : v)); S.set("shop", shop); render(true); break;
      case "shop-clear": shop = shop.map(v => (v.done && !v.del ? { id: v.id, del: true } : v)); S.set("shop", shop); render(true); break;
      case "rem-add": openRem(Number(t.dataset.i)); break;
      case "rem-edit": openRem(null, t.dataset.id); break;
      case "rem-del": if (confirm("Eliminare questo promemoria?")) { rem = rem.map(r => (r.id === t.dataset.id ? { id: r.id, del: true } : r)); S.set("rem", rem); closeSheet(); render(true); } break;
      case "rem-done": remDone[t.dataset.key] = !remDone[t.dataset.key]; S.set("remDone", remDone); render(true); break;
      case "rem-ics": { const r = rem.find(x => x.id === t.dataset.id); if (r) download("promemoria-" + r.id + ".ics", remIcs(r), "text/calendar;charset=utf-8"); break; }
      case "auto-ics": { const x = autoReminders().find(y => y.id === t.dataset.id); if (x) download(x.id.replace(/:/g, "-") + ".ics", autoIcs(x), "text/calendar;charset=utf-8"); break; }
      case "notif-on": if ("Notification" in window) Notification.requestPermission().then(() => { render(true); checkNotify(); }); break;
      case "backup-restore": restoreBackup(t.dataset.d); break;
      case "net-chip": if (!navigator.onLine) toast("📴 Sei senza connessione: quello che segni resta sul telefono e parte da solo quando torni online"); else { location.hash = "#/impostazioni"; syncNow(true); } break;
      case "cal-day": ui.dSel = t.dataset.d; ui.dMon = t.dataset.d.slice(0, 7) + "-01"; ui.dTab = "cal"; if (!/diario/.test(location.hash)) location.hash = "#/diario"; else render(true); break;
      case "cal-mon": { const m0 = parseISO(ui.dMon || (ui.dSel || iso(today0())).slice(0, 7) + "-01"); ui.dMon = iso(new Date(m0.getFullYear(), m0.getMonth() + Number(t.dataset.d), 1)); render(true); break; }
      case "log-add": openLog(t.dataset.type, t.dataset.d || iso(today0())); break;
      case "log-edit": openLog(null, null, t.dataset.id); break;
      case "g-edit": openAddGrowth(null, t.dataset.id); break;
      case "log-del": if (confirm("Eliminare questa voce del diario?")) { deleteLog(t.dataset.id); closeSheet(); render(true); } break;
      case "lg-pick": { const box = t.closest(".lg-pick"), inp = box.nextElementSibling, on = t.classList.contains("on") && box.dataset.name !== "kind" && box.dataset.name !== "r";
        box.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === t && !on)); inp.value = on ? "" : t.dataset.v;
        // consistenza e colore solo per la cacca, il lato solo per il seno
        if (box.dataset.name === "kind") {
          const poo = sheet.querySelector("#lgPoo"), side = sheet.querySelector("#lgSide");
          if (poo) poo.hidden = !["cacca", "entrambi"].includes(inp.value);
          if (side) side.hidden = inp.value !== "seno";
        }
        break; }
      case "lg-food": { t.classList.toggle("on"); const inp = sheet.querySelector("input[name=foods]");
        inp.value = [...sheet.querySelectorAll("#lgFoods .chip.on")].map(b => b.dataset.id).join(","); break; }
      case "lg-fill": { const inp = sheet.querySelector("input[name=t]"); if (inp) inp.value = t.dataset.v; break; }
      case "lg-unphoto": { const sp = t.closest("span"); if (sp.dataset.new) pendingPhotos = pendingPhotos.filter(p => p.id !== sp.dataset.new); sp.remove(); break; }
      case "sleep-start": {
        const d = iso(today0());
        if (!sleeping()) { diary.push({ id: "l" + Date.now().toString(36), date: d, type: "sonno", time: nowHM(), end: null, by: me() || undefined, kind: toMin(nowHM()) > 19 * 60 || toMin(nowHM()) < 6 * 60 ? "notte" : "nanna" }); S.set("diary", diary); toast("Buona nanna 😴"); }
        render(true); break;
      }
      case "sleep-stop": {
        const x = diary.find(v => v.id === t.dataset.id);
        if (x) { x.end = nowHM(); x.endDate = iso(today0()); S.set("diary", diary); toast("Nanna di " + durTxt(sleepMin(x)) + " ✅"); }
        render(true); break;
      }
      case "photo-open": openPhoto(t.dataset.id, t.dataset.e); break;
      case "photo-save": { const b = await PhotoDB.get("d:" + t.dataset.id).catch(() => null); if (b) download("piccoli-passi-" + t.dataset.id + ".jpg", b, "image/jpeg"); break; }
      case "go-growth": ui.healthTab = "crescita"; location.hash = "#/salute"; break;
      case "sync-invite": openInvite(false); break;
      case "sync-invite-ro": openInvite(true); break;
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
      case "kid-photo-del":
        if (settings.photo && confirm("Togliere la foto? Tornerà l'illustrazione.")) { dropPhoto(settings.photo); settings = Object.assign({}, settings); delete settings.photo; S.set("settings", settings); render(true); }
        break;
      case "photo-del":
        closeSheet();
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
        if (confirm("Eliminare questa misurazione?")) { growth = growth.filter(g => g.id !== t.dataset.id); S.set("growth", growth); closeSheet(); render(true); }
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
      case "back": goBack(); break;
      case "cook-mode":
        cookMode = t.dataset.v === "bimby" ? "bimby" : "classica"; raw.set("cookMode", cookMode);
        if (/ricette/.test(location.hash)) toast(bimbyOn() ? "Versione Bimby attiva nelle ricette" : "Versione Bimby disattivata");
        render(true); break;
      case "recipe-more": openRecipeMenu(t.dataset.id); break;
      case "recipe-copy": {
        const r = RECIPES.find(x => x.id === t.dataset.id);
        closeSheet();
        if (r) toast(await copyText(recipeText(r)) ? "Ricetta copiata 📋" : "Non riesco a copiare la ricetta");
        break;
      }
      case "recipe-share": {
        const r = RECIPES.find(x => x.id === t.dataset.id);
        closeSheet();
        if (r && navigator.share) navigator.share({ title: r.t, text: recipeText(r) }).catch(() => { /* annullato */ });
        break;
      }
      case "cook": openCook(t.dataset.id); break;
      case "cook-close": closeCook(); break;
      case "cook-next": if (cook) { cook.i = Math.min(cook.steps.length, cook.i + 1); drawCook(); } break;
      case "cook-prev": if (cook) { cook.i = Math.max(-1, cook.i - 1); drawCook(); } break;
      case "cook-timer": startTimer(+t.dataset.m); break;
      case "cook-timer-stop": if (cookTimer && confirm("Fermare il timer?")) stopTimer(); break;
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
      case "export": case "export-photos": {
        const data = { app: "piccoli-passi", v: 2, exported: new Date().toISOString(), kids, activeKid, kidData: {} };
        SHARED_KEYS.forEach(k => { data[k] = raw.get(k, null); });
        kids.forEach(k => { data.kidData[k.id] = {}; KID_KEYS.forEach(key => { data.kidData[k.id][key] = raw.get("k." + k.id + "." + key, null); }); });
        if (act === "export-photos") {
          // le foto del diario di tutti i figli, dentro lo stesso file
          toast("Preparo il file con le foto…");
          data.photos = {};
          const ids = kids.flatMap(k => (raw.get("k." + k.id + ".diary", []) || []).filter(x => !x.del).flatMap(x => x.photos || [])).concat(kids.map(k => k.photo).filter(Boolean));
          for (const pid of ids) { const b = await PhotoDB.get("d:" + pid).catch(() => null) || await fetchSharedPhoto(pid); if (b) data.photos[pid] = bytesToB64u(new Uint8Array(await b.arrayBuffer())); }
        }
        download("piccoli-passi-" + (act === "export-photos" ? "completo-" : "backup-") + iso(today0()) + ".json", JSON.stringify(data), "application/json");
        break;
      }
      case "reset":
        if (confirm("Vuoi davvero cancellare tutti i dati (diario, preferiti, eventi)?")) {
          try { Object.keys(localStorage).filter(k => k.startsWith("pp.")).forEach(k => localStorage.removeItem(k)); } catch (err) { /* ignore */ }
          clearTimeout(syncTimer); clearTimeout(retryTimer);
          kids = []; raw.set("kids", kids); switchKid(null);
          favs = {}; myEvents = []; contacts = {}; videos = {}; home = null; shop = []; evKm = 50; theme = "auto"; applyTheme();
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
    if (isRO() && e.target.dataset && /^(import|lg-photo)$/.test(e.target.dataset.act)) { e.target.value = ""; toast("👀 Sei in sola lettura: puoi guardare tutto, ma non modificare"); return; }
    if (e.target.dataset && e.target.dataset.change === "me") { raw.set("me", e.target.value.trim().slice(0, 30)); toast("Fatto: le tue voci avranno il nome «" + (me() || "—") + "»"); return; }
    if (e.target.dataset && e.target.dataset.act === "lg-photo" && e.target.files.length) {
      const files = [...e.target.files].slice(0, 10), prev = sheet.querySelector("#lgPrev");
      e.target.value = "";
      files.forEach(file => { resizing++; resizeImage(file, 1440).then(blob => {
        const pid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10), u = URL.createObjectURL(blob);
        pendingPhotos.push({ id: pid, blob });
        if (prev) prev.insertAdjacentHTML("beforeend", `<span data-new="${pid}"><img src="${u}" alt=""><button type="button" data-act="lg-unphoto" aria-label="Togli">✕</button></span>`);
      }).catch(() => toast("Non riesco a leggere questa foto")).finally(() => { resizing--; }); });
      return;
    }
    if (e.target.dataset && e.target.dataset.act === "kid-photo" && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = "";
      if (isRO()) { toast("👀 Sei in sola lettura: puoi guardare tutto, ma non modificare"); return; }
      toast("Preparo la foto…");
      resizeImage(file, 1440).then(blob => {
        const pid = "kid" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), old = settings.photo;
        return PhotoDB.set("d:" + pid, blob).then(() => {
          if (old) dropPhoto(old);
          settings = Object.assign({}, settings, { photo: pid }); S.set("settings", settings);
          // con la condivisione attiva la foto parte cifrata, come quelle del diario
          raw.set("photoQueue", (raw.get("photoQueue", []) || []).concat(pid)); uploadPhotos();
          toast("Foto salvata 📷"); render(true);
        });
      }).catch(() => toast("Non riesco a usare questa foto"));
      return;
    }
    if (e.target.dataset && e.target.dataset.act === "photo" && e.target.files[0]) {
      const key = e.target.dataset.key, file = e.target.files[0];
      e.target.value = "";
      if (!sheet.hidden) closeSheet();
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
          if (!confirm(raw.get("sync", null)
            ? "La condivisione è attiva: i dati verranno sostituiti con quelli del file anche sui telefoni della famiglia, e quello che è stato aggiunto dopo il file andrà perso. Procedo?"
            : "Importare i dati? Quelli presenti su questo telefono verranno sostituiti.")) return;
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
          Object.keys(data.photos || {}).forEach(pid => PhotoDB.set("d:" + pid, new Blob([b64uToBytes(data.photos[pid])], { type: "image/jpeg" })).catch(() => { /* spazio pieno */ }));
          switchKid(kids.some(k => k.id === data.activeKid) ? data.activeKid : (kids[0] || {}).id || null);
          favs = raw.get("favs", {}); myEvents = raw.get("myEvents", []); contacts = raw.get("contacts", {}); videos = raw.get("videos", {}); shop = raw.get("shop", []); home = raw.get("home", null);
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
    if (isRO() && !/^(syncJoinForm|syncSetupForm)$/.test(f.id)) { toast("👀 Sei in sola lettura: puoi guardare tutto, ma non modificare"); return; }
    const fd = new FormData(f);
    if (f.id === "welcomeForm" || f.id === "settingsForm") {
      const birth = fd.get("birth");
      if (!birth) return;
      settings = Object.assign({}, settings || {}, { name: String(fd.get("name") || "").trim(), birth });
      if (fd.get("sex")) settings.sex = fd.get("sex");
      if (fd.get("feed")) settings.feed = fd.get("feed");
      S.set("settings", settings);
      if (f.id === "welcomeForm") switchKid(activeKid);
      if (f.id === "settingsForm") toast("Salvato ✅");
      location.hash = "#/oggi"; render(false);
      if (f.id === "welcomeForm" && !raw.get("onboarded", false)) setTimeout(() => openTour(0), 350);
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
      const g = { id: f.dataset.id || "g" + Date.now(), date: fd.get("date"), w: n("w"), l: n("l"), h: n("h") };
      if (g.w && g.w > 30) g.w = g.w / 1000; // scritto in grammi
      if (!g.w && !g.l && !g.h) { toast("Inserisci almeno una misura"); return; }
      growth = growth.filter(x => x.id !== g.id).concat(g); S.set("growth", growth); closeSheet(); toast("Misurazione salvata 📏"); render(true);
    } else if (f.id === "shopForm") {
      const v = String(fd.get("t") || "").trim();
      if (v && addShop(v)) { S.set("shop", shop); render(true); setTimeout(() => { const i = app.querySelector("#shopForm input"); if (i) i.focus(); }, 50); } else toast("È già in lista");
    } else if (f.id === "remForm") {
      const r = saveRem(f, fd); render(true);
      // il file per il calendario va aperto con un tocco (i telefoni bloccano gli scaricamenti automatici)
      openSheet(`<h2>🔔 Promemoria salvato</h2><p>Perché il telefono ti avvisi anche con l'app chiusa, aggiungilo al suo calendario:</p>
        <button class="btn block" data-act="rem-ics" data-id="${esc(r.id)}">📅 Aggiungi al calendario del telefono</button>
        <p class="small muted">Si apre il calendario con l'evento e l'avviso già impostati: conferma con «Aggiungi».</p>
        <button class="btn ghost block" data-act="close" style="margin-top:8px">Più tardi</button>`);
    } else if (f.id === "logForm") {
      if (resizing) { toast("Sto preparando le foto, un attimo…"); return; }
      if (saveLog(f, fd)) { closeSheet(); toast("Segnato nel diario ✅"); render(true); }
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
  if (raw.get("sync", null)) syncNow(false);
  // ogni minuto, mentre l'app è aperta (anche se la condivisione è stata attivata dopo l'avvio)
  setInterval(() => { if (document.visibilityState === "visible" && raw.get("sync", null) && !syncFails) syncNow(false); }, 60000);
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
