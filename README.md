# Piccoli Passi 🌱

Web app installabile (PWA) per accompagnare lo svezzamento e la crescita del bambino:

- **Oggi**: età del bimbo, fase dello svezzamento, checklist «è pronto?», consiglio, ricetta e gioco del giorno, prossimi eventi.
- **Ricette**: 32 ricette con approccio misto (versione **pappa** 🥄 e versione **a pezzi** ✋), filtri per età, tipo, stagione e preferiti.
- **Guida**: quando iniziare, approccio misto, pezzi sicuri, conato o soffocamento, cosa evitare, allergeni, ferro, acqua, organizzazione, esempio di prime 4 settimane.
- **Diario dei cibi** e **percorso allergeni**: cibi provati, reazioni, prossimo allergene da introdurre e quelli da riproporre.
- **Giochi**: attività per età e area di sviluppo, tappe dello sviluppo, consigli educativi, libri e filastrocche.
- **Salute**: agenda con appuntamenti e promemoria, bilanci di salute, vaccinazioni, curve di crescita OMS, domande per il pediatra.
- **Emergenze** (🆘 in alto): numeri utili, pronto soccorso vicini, disostruzione, febbre, ingestioni, ustioni.
- **Eventi**: eventi e luoghi a misura di bebè intorno a Montecchio Maggiore, con mappa, aggiunta al calendario ed eventi personali.

**Più figli**: ogni figlio ha il suo profilo (selettore in alto con il nome). Diario, allergeni, crescita, agenda, giochi fatti e domande sono separati; preferiti, eventi, numeri di emergenza e tema sono in comune. L'agenda ha anche la vista «Tutta la famiglia».

Funziona offline. Nel codice non c'è nessun dato personale: nomi, date di nascita e diario restano sul telefono, oppure nel **tuo** Google Drive se attivi la condivisione.

## Condividere con la famiglia

In **Impostazioni → Condividi con la famiglia** l'app guida passo passo. In breve:

1. Una volta sola, su [script.google.com](https://script.google.com) crei un nuovo progetto e incolli il codice di `sync/piccoli-passi-sync.gs` (l'app ha il pulsante «Copia il codice»).
2. **Esegui il deployment → Nuovo deployment → App web**, con «Esegui come: Me» e «Chi ha accesso: Chiunque». Autorizzi l'accesso al Drive e copi l'URL che finisce con `/exec`.
3. Incolli l'URL nell'app e premi **Collega**. Poi **Invita qualcuno**: il messaggio contiene un codice `PP1-…` (o un link diretto).
4. Chi riceve l'invito apre l'app, tocca **Ho un codice di invito** e lo incolla.

I dati condivisi stanno in un file `piccoli-passi-….json` nel Drive di chi ha pubblicato lo script. Ogni telefono manda e riceve solo i dati cambiati; se due persone modificano lo stesso elemento vince la modifica più recente. Il codice di invito dà accesso ai dati: mandalo solo a persone di fiducia. Le foto dei piatti non vengono condivise.

**Altre famiglie** (per esempio una cognata con la sua bimba): possono semplicemente installare l'app e usarla da sole, oppure attivare la condivisione con il loro account Google. In alternativa, da **Impostazioni → Crea uno spazio per un'altra famiglia** generi un codice per uno spazio nuovo e separato sul tuo servizio: loro non vedono i tuoi dati e tu non vedi i loro nell'app (il file però si trova nel tuo Drive).

Resta anche il backup manuale: «Esporta/Importa» in Impostazioni salva tutti i figli in un file.

## Pubblicarla con GitHub Pages

GitHub Pages gratuito funziona solo con repository **pubblici**. Il codice non contiene dati personali.

1. Su GitHub apri il repository → **Settings** → **General** → in fondo, **Change visibility** → **Make public**.
2. **Settings** → **Pages** → in «Build and deployment» scegli **Deploy from a branch**, poi il branch con l'app e la cartella **/ (root)** → **Save**.
3. Dopo 1-2 minuti l'app è online su `https://francescofuser97-wq.github.io/Baby/`.

Se preferisci tenere il repository privato, puoi collegarlo gratis a Netlify o Cloudflare Pages: la cartella da pubblicare è la radice, e non serve nessun comando di build.

## Installarla sul telefono

- **Android (Chrome)**: apri il link → menu **⋮** → **Installa app** (o «Aggiungi a schermata Home»).
- **iPhone (Safari o Chrome)**: apri il link → pulsante **Condividi** ⬆️ (in Safari in basso, in Chrome in alto a destra) → **Aggiungi alla schermata Home**.

## Aggiornare i contenuti

I contenuti sono in file JavaScript semplici da modificare:

| File | Contenuto |
|---|---|
| `js/data-recipes.js` | ricette |
| `js/data-guide.js` | guida, cibi del diario, consigli, tappe dello sviluppo |
| `js/data-activities.js` | giochi e attività |
| `js/data-events.js` | eventi, luoghi e fonti (ricordati di aggiornare `EVENTS_UPDATED`) |
| `js/data-health.js` | percorso allergeni, bilanci, vaccinazioni, emergenze, libri e filastrocche |
| `js/data-growth.js` | standard di crescita OMS 0-24 mesi (non modificare) |
| `js/data-months.js` | guida mese per mese |
| `js/dish-art.js` | illustrazioni delle ricette |
| `sync/piccoli-passi-sync.gs` | servizio di condivisione (Google Apps Script); `js/sync-script.js` ne contiene una copia per il pulsante «Copia il codice» |

Dopo una modifica, aumenta il numero in `CACHE` dentro `sw.js` (es. `piccoli-passi-v2`), così i telefoni scaricano la nuova versione.

Per provarla sul computer: `npx http-server .` e apri l'indirizzo indicato.

---

Le informazioni seguono le raccomandazioni di OMS, Ministero della Salute, SIP, ESPGHAN e Nati per Leggere, ma **non sostituiscono il parere del pediatra**.
