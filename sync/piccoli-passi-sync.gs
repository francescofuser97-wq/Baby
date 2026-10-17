/**
 * Piccoli Passi – servizio di condivisione e notizie (Google Apps Script).
 *
 * Può essere usato da una sola famiglia o da tante (servizio centrale indicato in js/config.js).
 * Ogni famiglia ha uno «spazio»: un file nel Google Drive di chi pubblica questo script.
 * L'app cifra i dati sul telefono prima di inviarli (AES-GCM) e manda solo l'identificativo dello
 * spazio, mai il codice segreto: chi gestisce il servizio vede solo dati illeggibili.
 * Il servizio legge anche le notizie di Google News sugli eventi per bambini del comune scelto
 * (l'app da sola non può farlo, perché i browser bloccano queste richieste).
 *
 * Pubblicazione: Esegui il deployment → Nuovo deployment → App web
 *   Esegui come: Me · Chi ha accesso: Chiunque
 */
var FILE_PREFIX = 'piccoli-passi-';
var VERSION = 6;

function doGet() {
  return json_({ ok: true, app: 'piccoli-passi', v: VERSION, msg: 'Servizio di condivisione attivo.' });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ error: 'richiesta non valida' }); }
  // Notizie: nessun dato personale e nessun codice; non blocca le sincronizzazioni delle famiglie
  if (req.action === 'news') return json_(news_(req.q));
  // Foto del diario: arrivano già cifrate dal telefono, una per file
  if (req.action === 'blob-put' || req.action === 'blob-get' || req.action === 'blob-del') return json_(blob_(req));
  // Copie di sicurezza settimanali dello spazio (cifrate come i dati)
  if (req.action === 'backup' || req.action === 'backup-list' || req.action === 'backup-get') return json_(backup_(req));

  var key = String(req.key || '');                            // identificativo dello spazio
  if (key.length < 20) return json_({ error: 'codice non valido' });
  var changes = req.changes || [];
  if (changes.length > 2000) return json_({ error: 'troppe modifiche in una volta' });

  // Una sincronizzazione alla volta; se il servizio è occupato si risponde subito e il telefono riprova
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({ error: 'servizio occupato, riprovo tra poco' });
  try {
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key);
    var name = FILE_PREFIX + Utilities.base64EncodeWebSafe(digest).replace(/=+$/, '').slice(0, 32) + '.json';
    var props = PropertiesService.getScriptProperties();
    var file = findFile_(name, props);
    var db = file ? JSON.parse(file.getBlob().getDataAsString()) : { seq: 0, rec: {} };
    // «id» cambia solo se il file viene ricreato (per esempio dopo una cancellazione): i telefoni allora rimandano tutto
    if (!db.id) db.id = Utilities.getUuid();

    // Unisce le modifiche: per ogni elemento vince la modifica più recente.
    // Quelle più vecchie di ciò che c'è già vengono scartate e al telefono si rimanda il valore attuale.
    var applied = 0, rejected = [];
    for (var i = 0; i < changes.length; i++) {
      var c = changes[i];
      if (!c || typeof c.k !== 'string') continue;
      var cur = db.rec[c.k];
      if (!cur || Number(c.t) > Number(cur.t)) {
        db.seq++;
        db.rec[c.k] = { v: c.d ? null : c.v, t: Number(c.t), d: !!c.d, s: db.seq };
        applied++;
      } else rejected.push(c.k);
    }
    // il file si crea solo alla prima modifica: una semplice lettura non lascia file vuoti nel Drive
    if (applied) {
      var text = JSON.stringify(db);
      if (file) file.setContent(text);
      else { file = DriveApp.createFile(name, text, 'application/json'); props.setProperty('f:' + name, file.getId()); }
    }

    // Restituisce tutto ciò che è cambiato dall'ultima sincronizzazione del telefono
    var since = Number(req.since || 0);
    var out = [], sent = {};
    for (var k in db.rec) {
      if (db.rec[k].s > since) { out.push({ k: k, v: db.rec[k].v, t: db.rec[k].t, d: db.rec[k].d }); sent[k] = true; }
    }
    rejected.forEach(function (k) { if (!sent[k]) { out.push({ k: k, v: db.rec[k].v, t: db.rec[k].t, d: db.rec[k].d }); sent[k] = true; } });
    return json_({ seq: db.seq, rec: out, id: file ? db.id : null });
  } catch (err) {
    return json_({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* Foto: un file per foto nella cartella «Piccoli Passi - foto» del Drive. Il contenuto è cifrato dal telefono
   con il codice della famiglia: qui non si può vedere. */
function blob_(req) {
  var key = String(req.key || ''), id = String(req.id || '');
  if (key.length < 20 || !/^[A-Za-z0-9_-]{8,40}$/.test(id)) return { error: 'richiesta non valida' };
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key);
  var name = FILE_PREFIX + Utilities.base64EncodeWebSafe(digest).replace(/=+$/, '').slice(0, 32) + '-foto-' + id + '.txt';
  var it = DriveApp.getFilesByName(name), file = null;
  while (it.hasNext()) { var f = it.next(); if (!f.isTrashed()) { file = f; break; } }
  if (req.action === 'blob-get') return file ? { data: file.getBlob().getDataAsString() } : { error: 'foto non trovata' };
  if (req.action === 'blob-del') { if (file) file.setTrashed(true); return { ok: true }; }
  var data = String(req.data || '');
  if (!data || data.length > 8000000) return { error: 'foto troppo grande' };
  if (file) file.setContent(data);
  else {
    var folders = DriveApp.getFoldersByName('Piccoli Passi - foto');
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('Piccoli Passi - foto');
    folder.createFile(name, data, 'text/plain');
  }
  return { ok: true };
}

/* Copie di sicurezza: una alla settimana per spazio, nella cartella «Piccoli Passi - copie»; si tengono le ultime 6.
   Sono copie del file dello spazio, quindi cifrate come lui. */
function backup_(req) {
  var key = String(req.key || '');
  if (key.length < 20) return { error: 'codice non valido' };
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key);
  var base = FILE_PREFIX + Utilities.base64EncodeWebSafe(digest).replace(/=+$/, '').slice(0, 32);
  var list = [], it = DriveApp.searchFiles("title contains '" + base + "-copia-' and trashed = false");
  while (it.hasNext()) { var f = it.next(); var m = f.getName().match(/-copia-(\d{4}-\d{2}-\d{2})\.json$/); if (m) list.push({ d: m[1], f: f }); }
  list.sort(function (a, b) { return a.d < b.d ? 1 : -1; });
  if (req.action === 'backup-list') return { list: list.map(function (x) { return { d: x.d, size: x.f.getSize() }; }) };
  if (req.action === 'backup-get') {
    var hit = list.filter(function (x) { return x.d === String(req.d); })[0];
    if (!hit) return { error: 'copia non trovata' };
    var db = JSON.parse(hit.f.getBlob().getDataAsString()), out = [];
    for (var k in db.rec) out.push({ k: k, v: db.rec[k].v, t: db.rec[k].t, d: db.rec[k].d });
    return { rec: out };
  }
  var today = Utilities.formatDate(new Date(), 'Europe/Rome', 'yyyy-MM-dd');
  if (list.length && (new Date(today) - new Date(list[0].d)) < 6 * 864e5) return { ok: true, last: list[0].d };
  var file = findFile_(base + '.json', PropertiesService.getScriptProperties());
  if (!file) return { ok: true, last: null };
  var folders = DriveApp.getFoldersByName('Piccoli Passi - copie');
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('Piccoli Passi - copie');
  folder.createFile(base + '-copia-' + today + '.json', file.getBlob().getDataAsString(), 'application/json');
  list.slice(5).forEach(function (x) { x.f.setTrashed(true); });
  return { ok: true, last: today };
}

/* Trova il file dello spazio. L'indirizzo del file è ricordato nelle proprietà dello script (più veloce
   e sicuro della ricerca in Drive, che a volte non vede subito i file appena creati).
   Se per qualche motivo esistono più file con lo stesso nome, li unisce in uno solo. */
function findFile_(name, props) {
  var id = props.getProperty('f:' + name);
  if (id) {
    try { var known = DriveApp.getFileById(id); if (!known.isTrashed()) return known; } catch (err) { /* file non più disponibile */ }
    props.deleteProperty('f:' + name);
  }
  var it = DriveApp.getFilesByName(name), list = [];
  while (it.hasNext()) { var f = it.next(); if (!f.isTrashed()) list.push(f); }
  if (!list.length) return null;
  var main = list[0];
  if (list.length > 1) {
    var db = JSON.parse(main.getBlob().getDataAsString());
    for (var i = 1; i < list.length; i++) {
      var other = JSON.parse(list[i].getBlob().getDataAsString());
      db.seq = Math.max(db.seq, other.seq);
      for (var k in other.rec) {
        if (!db.rec[k] || Number(other.rec[k].t) > Number(db.rec[k].t)) db.rec[k] = other.rec[k];
      }
      list[i].setTrashed(true);
    }
    // tutti i telefoni devono ricevere di nuovo tutto: si rinumerano gli elementi
    for (var r in db.rec) db.rec[r].s = ++db.seq;
    main.setContent(JSON.stringify(db));
  }
  props.setProperty('f:' + name, main.getId());
  return main;
}

/* Notizie da Google News per alcune ricerche (max 5), tenute in memoria per 3 ore.
   Se una ricerca non riesce, il motivo torna in «errors» (e non viene messo in memoria). */
function news_(queries) {
  var cache = CacheService.getScriptCache();
  var items = [], errors = [];
  (queries || []).slice(0, 5).forEach(function (q) {
    q = String(q).slice(0, 150);
    var ck = 'n3:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, q));
    var hit = cache.get(ck);
    if (hit) { items = items.concat(JSON.parse(hit)); return; }
    var found = [], text = '';
    try {
      var url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=it&gl=IT&ceid=IT:it';
      var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      text = res.getContentText();
      if (res.getResponseCode() !== 200) { errors.push('HTTP ' + res.getResponseCode() + ': ' + text.slice(0, 120)); return; }
      var channel = XmlService.parse(text).getRootElement().getChild('channel');
      channel.getChildren('item').slice(0, 10).forEach(function (it) {
        var src = it.getChild('source');
        var desc = String(it.getChildText('description') || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 400);
        found.push({ t: it.getChildText('title'), l: it.getChildText('link'), d: it.getChildText('pubDate'), s: src ? src.getText() : '', x: desc });
      });
    } catch (err) {
      errors.push(String(err && err.message || err).slice(0, 200) + (text ? ' · ' + text.slice(0, 120) : ''));
      return;
    }
    try { cache.put(ck, JSON.stringify(found), 10800); } catch (err) { /* troppo grande per la cache */ }
    items = items.concat(found);
  });
  return errors.length ? { items: items, errors: errors } : { items: items };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
