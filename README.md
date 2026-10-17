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

Funziona offline. Nome, data di nascita, diario e preferiti restano **solo sul telefono**: nel codice non c'è nessun dato personale.
Con «Esporta/Importa» (in Impostazioni) puoi copiare i dati sul telefono dell'altro genitore.

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

Dopo una modifica, aumenta il numero in `CACHE` dentro `sw.js` (es. `piccoli-passi-v2`), così i telefoni scaricano la nuova versione.

Per provarla sul computer: `npx http-server .` e apri l'indirizzo indicato.

---

Le informazioni seguono le raccomandazioni di OMS, Ministero della Salute, SIP, ESPGHAN e Nati per Leggere, ma **non sostituiscono il parere del pediatra**.
