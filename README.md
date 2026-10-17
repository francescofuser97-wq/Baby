# Piccoli Passi 🌱

Web app installabile (PWA) per famiglie con bambini da 0 a 3 anni, utilizzabile in tutta Italia:

- **Oggi**: età del bimbo, fase dello svezzamento, il mese di vita, consiglio, ricetta e gioco del giorno, prossimi appuntamenti ed eventi.
- **Ricette**: 32 ricette con approccio misto (versione **pappa** 🥄 e **a pezzi** ✋), in stile app di cucina: carosello, griglia fotografica, scheda a tutto schermo, ingredienti con icone e **cucina passo passo** (schermo sempre acceso e timer). Per chi ha il **Bimby®** c'è la versione con tempo, temperatura e velocità. Si può aggiungere la propria foto del piatto.
- **Guida**: svezzamento passo passo, pezzi sicuri, conato o soffocamento, allergeni, diario dei cibi e percorso allergeni.
- **Salute**: agenda, bilanci di salute, vaccinazioni, curve di crescita OMS, domande per il pediatra, guide «Come si fa», azienda sanitaria della propria zona.
- **Giochi**: attività per età, tappe dello sviluppo, mese per mese, consigli, libri e filastrocche.
- **Eventi**: eventi per bambini del proprio comune trovati in automatico nelle notizie locali (con la data messa in calendario), elenchi curati per alcune zone, luoghi e servizi vicini.
- **Emergenze** (🆘): numeri utili, pronto soccorso più vicino, disostruzione, febbre, ingestioni, ustioni.
- **Più figli** con profili separati, **condivisione cifrata** con chi si vuole (partner, nonni), tema chiaro/scuro.

## Come funziona per ogni comune

Ogni famiglia sceglie il proprio comune (Impostazioni o «Imposta il tuo comune»): non c'è un comune predefinito. Da lì l'app costruisce tutto in automatico:

| Cosa | Da dove arriva |
|---|---|
| Nome, provincia, coordinate del comune | OpenStreetMap (Nominatim), cercando per nome o dalla posizione del telefono |
| Sito ufficiale del Comune, codice ISTAT | Wikidata |
| Azienda sanitaria (ASL, ULSS, ATS, ASP…) | tabella `js/data-asl.js` (provincia, e comune per comune dove una provincia ne ha più di una) |
| Sito dell'azienda sanitaria | ULSS del Veneto: indirizzo noto; altre: Wikidata, altrimenti una ricerca |
| Eventi dalle notizie | Google News, cercato con il solo nome del comune: tramite il servizio (vedi sotto) oppure, se non c'è, tramite i lettori pubblici rss2json.com e allorigins.win. L'app tiene solo le notizie che nominano il comune e parlano di eventi, scarta la cronaca e ricava la data dal titolo («sabato 25 ottobre», «dal 7 al 9 novembre», «domenica») per metterle in calendario |
| Ricerche e mappe (consultorio, pronto soccorso, biblioteca, asilo nido, bonus, farmacia di turno…) | costruite con il nome del comune e il sito del Comune |
| Eventi, luoghi e ospedali curati | **pacchetti di zona** in `js/areas/`, mostrati solo a chi abita entro il raggio della zona |

### Pacchetti di zona

`js/areas/ovest-vicentino.js` contiene eventi, luoghi, ospedali e fonti curati per Montecchio Maggiore e dintorni. Per un'altra zona si crea un file simile (`id`, `name`, `center`, `radiusKm`, `updated`, `events`, `places`, `hospitals`, `sources`, `towns`) e lo si aggiunge a `index.html` e `sw.js`. L'aggiornamento automatico del mercoledì lavora su tutti i file di `js/areas/`.

## Il servizio (condivisione e notizie)

Il codice del servizio è in `sync/piccoli-passi-sync.gs` (Google Apps Script). Si può usare in due modi:

1. **Servizio centrale (consigliato per distribuire l'app)**: chi gestisce l'app lo pubblica **una volta** e mette l'indirizzo in `js/config.js` (`serviceUrl`). Da quel momento ogni famiglia attiva la condivisione con un tocco e tutti ricevono le notizie sugli eventi del proprio comune, senza configurare niente.
2. **Servizio di famiglia**: se `serviceUrl` è vuoto, o se una famiglia preferisce, in Impostazioni → Condividi si può collegare un servizio Google proprio. L'app spiega i passaggi.

Pubblicazione: su [script.google.com](https://script.google.com) nuovo progetto → incolla il codice → **Esegui il deployment → Nuovo deployment → App web**, «Esegui come: Me», «Chi ha accesso: Chiunque» → autorizza Drive e richieste esterne → copia l'URL che finisce con `/exec`. Per aggiornarlo: **Gestisci deployment → ✏️ → Nuova versione** (l'URL non cambia).

### Privacy e cifratura

- Ogni famiglia ha uno spazio identificato da un codice segreto (inviti `PP2-…`). Il telefono ricava dal codice tre chiavi: l'identificativo dello spazio, una chiave **AES-GCM** per cifrare i dati e una chiave **HMAC** per rendere irriconoscibili i nomi dei dati.
- Al servizio arrivano solo identificativo e dati cifrati: chi lo gestisce (e Google) non può leggere nomi, date, diario o misure, né sapere di quale comune si tratta.
- Per le notizie si invia solo il nome del comune (al servizio, oppure ai lettori pubblici rss2json.com e allorigins.win se il servizio non c'è).
- Le foto dei piatti non lasciano mai il telefono.
- Gli spazi creati con la versione precedente (codici `PP1-…`, dati in chiaro) continuano a funzionare e si possono convertire con **Passa alla cifratura**.
- Il codice di invito dà accesso ai dati della famiglia: va mandato solo a persone di fiducia.

## Pubblicare l'app

L'app è statica: basta GitHub Pages (repository pubblico: il codice non contiene dati personali) oppure Netlify o Cloudflare Pages. Su GitHub: **Settings → Pages → Deploy from a branch**, scegli il branch e la cartella **/ (root)**.

Installazione sul telefono:
- **Android (Chrome)**: menu **⋮** → **Installa app**.
- **iPhone (Safari o Chrome)**: **Condividi** ⬆️ → **Aggiungi alla schermata Home**.

## File principali

| File | Contenuto |
|---|---|
| `js/config.js` | indirizzo del servizio centrale |
| `js/app.js` | l'app |
| `js/data-recipes.js`, `js/dish-art.js` | ricette e loro illustrazioni |
| `js/data-bimby.js` | versione Bimby® delle ricette (TM31, TM5, TM6, TM7); Bimby® è un marchio di Vorwerk, l'app non è collegata a Vorwerk |
| `js/data-guide.js` | guida, cibi del diario, consigli, tappe |
| `js/data-activities.js` | giochi e attività |
| `js/data-health.js` | allergeni, bilanci, vaccinazioni, emergenze, guide di cura, libri, filastrocche |
| `js/data-months.js` | guida mese per mese |
| `js/data-asl.js` | azienda sanitaria per provincia e comune |
| `js/data-growth.js` | standard di crescita OMS 0-24 mesi (non modificare) |
| `js/areas/*.js` | pacchetti di zona |
| `sync/piccoli-passi-sync.gs` | servizio (Apps Script); `js/sync-script.js` ne contiene una copia per il pulsante «Copia il codice» |

Dopo una modifica, aumenta il numero in `CACHE` dentro `sw.js`, così i telefoni scaricano la nuova versione. Per provarla sul computer: `npx http-server .`

---

Le informazioni seguono le raccomandazioni di OMS, Ministero della Salute, SIP, ESPGHAN e Nati per Leggere, ma **non sostituiscono il parere del pediatra**.
