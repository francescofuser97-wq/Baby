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
var VERSION = 3;

function doGet() {
  return json_({ ok: true, app: 'piccoli-passi', v: VERSION, msg: 'Servizio di condivisione attivo.' });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ error: 'richiesta non valida' }); }
  // Notizie: nessun dato personale e nessun codice; non blocca le sincronizzazioni delle famiglie
  if (req.action === 'news') return json_(news_(req.q));

  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var key = String(req.key || '');                          // identificativo dello spazio
    if (key.length < 20) return json_({ error: 'codice non valido' });

    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key);
    var name = FILE_PREFIX + Utilities.base64EncodeWebSafe(digest).replace(/=+$/, '').slice(0, 32) + '.json';
    var files = DriveApp.getFilesByName(name);
    var file = files.hasNext() ? files.next() : null;
    var db = file ? JSON.parse(file.getBlob().getDataAsString()) : { seq: 0, rec: {} };

    // Unisce le modifiche: per ogni elemento vince la modifica più recente
    var changes = req.changes || [];
    var applied = 0;
    if (changes.length > 2000) return json_({ error: 'troppe modifiche in una volta' });
    for (var i = 0; i < changes.length; i++) {
      var c = changes[i];
      if (!c || typeof c.k !== 'string') continue;
      var cur = db.rec[c.k];
      if (!cur || Number(c.t) > Number(cur.t)) {
        db.seq++;
        db.rec[c.k] = { v: c.d ? null : c.v, t: Number(c.t), d: !!c.d, s: db.seq };
        applied++;
      }
    }
    // il file si crea solo alla prima modifica: una semplice lettura non lascia file vuoti nel Drive
    if (applied) {
      var text = JSON.stringify(db);
      if (file) file.setContent(text); else DriveApp.createFile(name, text, 'application/json');
    }

    // Restituisce tutto ciò che è cambiato dall'ultima sincronizzazione del telefono
    var since = Number(req.since || 0);
    var out = [];
    for (var k in db.rec) {
      if (db.rec[k].s > since) out.push({ k: k, v: db.rec[k].v, t: db.rec[k].t, d: db.rec[k].d });
    }
    return json_({ seq: db.seq, rec: out });
  } catch (err) {
    return json_({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
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
