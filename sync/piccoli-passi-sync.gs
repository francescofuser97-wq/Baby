/**
 * Piccoli Passi – servizio di condivisione per la famiglia (Google Apps Script).
 *
 * I dati condivisi vengono salvati in un file nel Google Drive di chi pubblica questo script.
 * Ogni famiglia ha un codice segreto: solo chi lo conosce può leggere e scrivere i dati.
 *
 * Pubblicazione: Esegui il deployment → Nuovo deployment → App web
 *   Esegui come: Me · Chi ha accesso: Chiunque
 */
var FILE_PREFIX = 'piccoli-passi-';

function doGet() {
  return json_({ ok: true, app: 'piccoli-passi', msg: 'Servizio di condivisione attivo.' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    var key = String(req.key || '');
    if (key.length < 20) return json_({ error: 'codice non valido' });

    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key);
    var name = FILE_PREFIX + Utilities.base64EncodeWebSafe(digest).replace(/=+$/, '').slice(0, 32) + '.json';
    var files = DriveApp.getFilesByName(name);
    var file = files.hasNext() ? files.next() : null;
    var db = file ? JSON.parse(file.getBlob().getDataAsString()) : { seq: 0, rec: {} };

    // Unisce le modifiche: per ogni elemento vince la modifica più recente
    var changes = req.changes || [];
    var applied = 0;
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
    if (applied || !file) {
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

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
