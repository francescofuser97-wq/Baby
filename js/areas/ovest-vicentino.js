/* Pacchetto di zona: Montecchio Maggiore e dintorni.
   Contenuti curati (eventi, luoghi, ospedali, fonti) mostrati solo a chi ha scelto un comune
   entro «radiusKm» dal centro. Per aggiungere un’altra zona, crea un file simile in js/areas/
   e aggiungilo a index.html e sw.js.
   Campi degli eventi: id, t, e, start/end (ISO), when, time, place, town, km, age, desc, link, status, q.
   «town» deve comparire in «towns» (coordinate [lat, lon]) oppure l’evento deve avere lat/lon.
   Ultimo aggiornamento degli eventi: campo «updated». */
(window.AREA_PACKS = window.AREA_PACKS || []).push({
  "id": "ovest-vicentino",
  "name": "Montecchio Maggiore e dintorni (Vicenza, Verona, Padova, Bassano)",
  "center": [
    45.5049,
    11.4115
  ],
  "radiusKm": 60,
  "updated": "2026-10-16",
  "events": [
    {
      "id": "sagra-eurosia-2026",
      "t": "Sagra di Santa Eurosia",
      "e": "🎪",
      "start": "2026-10-17",
      "end": "2026-10-18",
      "time": "",
      "place": "Sant'Urbano",
      "town": "Montecchio Maggiore",
      "km": 2,
      "age": "Per tutta la famiglia",
      "desc": "Festa di paese con cucina tradizionale, musica e processione. Bella per una passeggiata col passeggino: tieniti lontano dalle casse, perché le orecchie dei piccoli sono delicate.",
      "link": "https://www.itinerarinelgusto.it/sagre-e-feste/veneto/montecchio-maggiore-vi",
      "status": "da verificare",
      "q": "Sant'Urbano Montecchio Maggiore"
    },
    {
      "id": "a-corpo-libero-2026",
      "t": "«A corpo libero»: teatro per piccolissimi",
      "e": "🎪",
      "start": "2026-10-24",
      "end": "",
      "time": "10:00 e 16:00",
      "place": "Teatro Yurta (La Piccionaia)",
      "town": "Vicenza",
      "km": 13,
      "age": "Da 1 a 4 anni",
      "desc": "Spettacolo de La Baracca – Testoni Ragazzi dentro il festival Stardust de La Piccionaia. Uno dei pochi pensati proprio per i più piccoli. Di solito i posti sono pochi: prenota per tempo.",
      "link": "https://www.altrevelocita.it/stardust-festival-la-piccionaia-vicenza-2026/",
      "status": "da verificare",
      "q": "Teatro Astra Vicenza"
    },
    {
      "id": "mille-bolle-verona-2026",
      "t": "«Le Mille Bolle Incantate» – Famiglie a Teatro",
      "e": "🫧",
      "start": "2026-10-25",
      "end": "",
      "time": "Pomeriggio (orario sul sito)",
      "place": "Fondazione Aida (Teatro Stimate / Teatro Nuovo)",
      "town": "Verona",
      "km": 45,
      "age": "Gratis sotto i 3 anni · età da verificare",
      "desc": "Primo spettacolo della 44ª rassegna «Famiglie a Teatro». Le bolle di sapone incantano anche i bebè. Sotto i 3 anni l'ingresso è gratuito.",
      "link": "https://www.fondazioneaida.it/spazio/teatro-stimate/",
      "status": "da verificare",
      "q": "Teatro Stimate Verona"
    },
    {
      "id": "sdeng-2026",
      "t": "«Sdeng!» – teatro per la prima infanzia",
      "e": "🔧",
      "start": "2026-10-28",
      "end": "2026-10-29",
      "time": "28/10 ore 10:45 e 12:00 · 29/10 ore 17:00",
      "place": "Centro Zona 3",
      "town": "Vicenza",
      "km": 13,
      "age": "Prima infanzia",
      "desc": "«Storia di un inventore che non sa stare fermo», di Alessandro Maione, nel festival Stardust. Un breve spettacolo pensato per i più piccoli.",
      "link": "https://www.altrevelocita.it/stardust-festival-la-piccionaia-vicenza-2026/",
      "status": "da verificare",
      "q": "Centro Zona 3 Vicenza"
    },
    {
      "id": "festival-ragazzi-padova-2026",
      "t": "Festival nazionale del teatro per i ragazzi",
      "e": "🎭",
      "start": "2026-09-26",
      "end": "2026-11-29",
      "time": "Sabato 16:00 · domenica 10:30 e 16:00",
      "place": "Piccolo Teatro Don Bosco, via Asolo 2",
      "town": "Padova",
      "km": 48,
      "age": "Età diverse: controlla ogni spettacolo",
      "desc": "Ogni weekend fino al 29 novembre, biglietto intorno ai 7 €. Scegli gli spettacoli della domenica mattina, che di solito sono i più adatti ai piccoli.",
      "link": "https://padovacultura.padovanet.it/it/manifestazioni-questo-mese",
      "status": "da verificare",
      "q": "Piccolo Teatro Don Bosco via Asolo 2 Padova"
    },
    {
      "id": "ora-ti-racconto-nov",
      "t": "«Ora ti racconto»: letture animate in biblioteca",
      "e": "📖",
      "start": "2026-11-07",
      "end": "",
      "time": "Mattina",
      "place": "Biblioteca civica, via S. Bernardino 12",
      "town": "Montecchio Maggiore",
      "km": 0,
      "age": "Pensato per 3-8 anni",
      "desc": "Letture animate per bambini più grandi, ma è un'ottima occasione per conoscere la biblioteca, fare la tessera al bebè e chiedere se ci sono letture per 0-3 anni.",
      "link": "https://www.comune.montecchio-maggiore.vi.it/it/categorie-eventi/66844",
      "status": "da verificare",
      "q": "Biblioteca civica Montecchio Maggiore"
    },
    {
      "id": "bli-blip-astra",
      "t": "«Bli-blip»: teatro per famiglie",
      "e": "🎭",
      "start": "2026-11-08",
      "end": "",
      "time": "17:00",
      "place": "Teatro Astra",
      "town": "Vicenza",
      "km": 13,
      "age": "Età consigliata: da verificare",
      "desc": "Spettacolo di Theaterhaus Ensemble nel calendario «Eventi per famiglie» de La Piccionaia. Controlla l'età consigliata: alcune proposte sono pensate per i piccolissimi.",
      "link": "https://www.piccionaia.org/centro-teatrale-piccionaia/calendario/eventi-per-famiglie/",
      "status": "da verificare",
      "q": "Teatro Astra Vicenza"
    },
    {
      "id": "festa-olio-2026",
      "t": "Festa dell'Olio",
      "e": "🫒",
      "start": "",
      "end": "",
      "when": "Novembre 2026 (date da confermare)",
      "place": "Centro",
      "town": "Montecchio Maggiore",
      "km": 0,
      "age": "Per tutta la famiglia",
      "desc": "Festa tradizionale dedicata all'olio dei colli, organizzata dall'associazione Amici della città di Montecchio. Le date 2026 non sono ancora uscite.",
      "link": "https://www.itinerarinelgusto.it/sagre-e-feste/festa-dell-olio-a-montecchio-maggiore-3739",
      "status": "date da confermare",
      "q": "Montecchio Maggiore centro"
    },
    {
      "id": "giardini-natale-asiago",
      "t": "Giardini di Natale ad Asiago",
      "e": "🎄",
      "start": "2026-11-07",
      "end": "2027-01-06",
      "time": "",
      "place": "Centro",
      "town": "Asiago",
      "km": 70,
      "age": "Per tutta la famiglia",
      "desc": "Il centro di Asiago si veste a festa. È una gita da fare in giornata: in montagna fa freddo, quindi copri bene il bimbo e porta il sacco termico per il passeggino o la fascia.",
      "link": "https://www.vicenzatoday.it/eventi/bambini/si/",
      "status": "da verificare",
      "q": "Asiago centro"
    },
    {
      "id": "presepi-verona-2026",
      "t": "Presepi dal Mondo",
      "e": "🌟",
      "start": "2026-11-14",
      "end": "2027-01-17",
      "time": "",
      "place": "Centro",
      "town": "Verona",
      "km": 45,
      "age": "Per tutta la famiglia",
      "desc": "Una grande mostra di presepi da tutto il mondo. Al bimbo piacciono luci e figure; per la folla del weekend è più comoda la fascia del passeggino.",
      "link": "https://dovevado.net/mercatini-di-natale-verona/",
      "status": "da verificare",
      "q": "Verona centro storico"
    },
    {
      "id": "opera-baby-2027",
      "t": "Opera Baby: «Figaro giù, Figaro su!»",
      "e": "🎶",
      "start": "2027-04-18",
      "end": "",
      "time": "10:00 e 11:15",
      "place": "Teatro Comunale",
      "town": "Vicenza",
      "km": 13,
      "age": "Da 6 a 36 mesi, con i genitori",
      "desc": "L'opera lirica raccontata ai piccolissimi in 40 minuti, liberamente ispirata al Barbiere di Siviglia. È proprio per la sua età: segnatelo, i biglietti di solito vanno a ruba.",
      "link": "https://www.tcvi.it/it/eventi/stagione/family-show/figaro-giu-figaro-su/",
      "status": "confermato",
      "q": "Teatro Comunale Vicenza"
    },
    {
      "id": "natale-vicenza-2026",
      "t": "Natale a Vicenza: villaggio e mercatini",
      "e": "✨",
      "start": "",
      "end": "",
      "when": "Da fine novembre al 6 gennaio (date 2026 da confermare)",
      "place": "Piazza Biade e centro storico",
      "town": "Vicenza",
      "km": 13,
      "age": "Per tutta la famiglia",
      "desc": "Casette di legno, luci e animazioni in centro. Nel 2025 c'era anche Babbo Natale in piazza San Lorenzo. Per il passeggino scegli le mattine dei giorni feriali: c'è meno folla.",
      "link": "https://mercatininatalevicenza.it/",
      "status": "date da confermare",
      "q": "Piazza Biade Vicenza"
    },
    {
      "id": "buone-feste-montecchio-2026",
      "t": "Buone Feste a Montecchio Maggiore",
      "e": "🎅",
      "start": "",
      "end": "",
      "when": "Dicembre 2026 – 6 gennaio 2027 (programma in arrivo)",
      "place": "Piazza Marconi, Alte Ceccato, Sant'Urbano",
      "town": "Montecchio Maggiore",
      "km": 0,
      "age": "Per tutta la famiglia",
      "desc": "Ogni anno il Comune pubblica un cartellone con più di 30 appuntamenti: mercatini in piazza Marconi, accensione degli alberi ad Alte Ceccato e Sant'Urbano, concerti e presepi. Nel 2025 il programma è partito il 6 dicembre.",
      "link": "https://www.comune.montecchio-maggiore.vi.it/it/news/buone-feste-a-montecchio-maggiore-2025-26-dal-6-dicembre-il-natale-si-accende-in-citta-tra-eventi-e-tradizione",
      "status": "date da confermare",
      "q": "Piazza Marconi Montecchio Maggiore"
    },
    {
      "id": "mercatini-montecchio-2026",
      "t": "Mercatini di Natale in piazza Marconi",
      "e": "🛍️",
      "start": "",
      "end": "",
      "when": "Di solito un weekend di inizio dicembre",
      "place": "Piazza Marconi",
      "town": "Montecchio Maggiore",
      "km": 0,
      "age": "Per tutta la famiglia",
      "desc": "Stand di hobbisti, scuole e associazioni del territorio. Nel 2024 si è tenuto il 7-8 dicembre, dalle 10 alle 19.",
      "link": "https://www.comune.montecchio-maggiore.vi.it/it/eventi/mercatini-di-natale",
      "status": "date da confermare",
      "q": "Piazza Marconi Montecchio Maggiore"
    },
    {
      "id": "dimora-babbo-natale-2026",
      "t": "La Vera Dimora di Babbo Natale",
      "e": "🧝",
      "start": "",
      "end": "",
      "when": "Periodo natalizio (prenotazione obbligatoria)",
      "place": "Le Priare, via Castelli 4 Martiri",
      "town": "Montecchio Maggiore",
      "km": 1,
      "age": "Ideale da 2-3 anni, ma bello anche in braccio",
      "desc": "Un percorso fiabesco con gnomi, elfi e il Grinch dentro le antiche cave di pietra (le Priare). Le visite sono a gruppi. Nelle grotte fa fresco: meglio la fascia o il marsupio, e vestiti a strati.",
      "link": "https://www.comune.montecchio-maggiore.vi.it/it/eventi/la-vera-dimora-di-babbo-natale-694848",
      "status": "date da confermare",
      "q": "Priare via Castelli 4 Martiri Montecchio Maggiore"
    },
    {
      "id": "mercatini-verona-2026",
      "t": "Mercatini di Natale di Verona",
      "e": "🎄",
      "start": "",
      "end": "",
      "when": "Da fine novembre a fine dicembre (date 2026 da confermare)",
      "place": "Centro storico",
      "town": "Verona",
      "km": 45,
      "age": "Per tutta la famiglia",
      "desc": "Casette di legno, luci e dolci in centro. Nei weekend c'è molta gente: con il passeggino sono meglio i giorni feriali o la mattina presto.",
      "link": "https://www.tuttomercatinidinatale.it/mercatini-natale-verona.html",
      "status": "date da confermare",
      "q": "Piazza dei Signori Verona"
    },
    {
      "id": "santa-lucia-verona-2026",
      "t": "Bancarelle di Santa Lucia",
      "e": "🍭",
      "start": "",
      "end": "",
      "when": "Intorno al 13 dicembre (date 2026 da confermare)",
      "place": "Piazza Bra",
      "town": "Verona",
      "km": 45,
      "age": "Per tutta la famiglia",
      "desc": "Una tradizione molto sentita a Verona: Santa Lucia porta i doni ai bambini la notte del 12 dicembre, e in piazza Bra arrivano le bancarelle di dolci e giocattoli.",
      "link": "https://www.theveronastay.it/news/mercatini-natale-verona-2025-ora-blu-stesso-url-della-pagina-esistente.html",
      "status": "date da confermare",
      "q": "Piazza Bra Verona"
    },
    {
      "id": "natale-bassano-2026",
      "t": "Natale a Bassano",
      "e": "🚂",
      "start": "",
      "end": "",
      "when": "Dicembre 2026 (programma da confermare)",
      "place": "Piazza Libertà, piazza Garibaldi, Castello degli Ezzelini",
      "town": "Bassano del Grappa",
      "km": 45,
      "age": "Per tutta la famiglia",
      "desc": "Mercatini in centro, il Trenino Lillipuziano e il «Sentiero incantato di Babbo Natale» al Castello degli Ezzelini. Nel 2025 c'erano anche letture animate e laboratori.",
      "link": "https://www.bassanodascoprire.com/eventi/mercatini-di-natale-di-bassano",
      "status": "date da confermare",
      "q": "Piazza Libertà Bassano del Grappa"
    },
    {
      "id": "ora-ti-racconto-dic",
      "t": "«Ora ti racconto»: letture di dicembre",
      "e": "📖",
      "start": "2026-12-05",
      "end": "",
      "time": "Mattina",
      "place": "Biblioteca civica, via S. Bernardino 12",
      "town": "Montecchio Maggiore",
      "km": 0,
      "age": "Pensato per 3-8 anni",
      "desc": "Un nuovo appuntamento con le letture animate. Utile da tenere a mente per i prossimi anni, e per fare un giro nella sezione dei libri per i più piccoli.",
      "link": "https://www.comune.montecchio-maggiore.vi.it/it/categorie-eventi/66844",
      "status": "da verificare",
      "q": "Biblioteca civica Montecchio Maggiore"
    }
  ],
  "places": [
    {
      "id": "biblioteca",
      "t": "Biblioteca civica di Montecchio Maggiore",
      "e": "📚",
      "cat": "Servizi",
      "addr": "Via S. Bernardino 12, Montecchio Maggiore",
      "tel": "0444 698874",
      "km": 0,
      "desc": "Chiedi la tessera anche per il bebè e cerca la sezione dei libri cartonati e tattili per la fascia 0-3: è il cuore di Nati per Leggere. Chiedi anche se ci sono letture per i più piccoli.",
      "link": "https://rbv.biblioteche.it/library/Montecchio-Maggiore",
      "q": "Biblioteca civica Montecchio Maggiore"
    },
    {
      "id": "consultorio",
      "t": "Consultorio familiare ULSS 8 – Montecchio",
      "e": "🤱",
      "cat": "Servizi",
      "addr": "Via Giuriolo 11, Montecchio Maggiore",
      "tel": "0444 703540",
      "km": 0,
      "desc": "Servizio gratuito per neogenitori: sostegno all'allattamento, incontri dopo la nascita, la «Colazione Mamme». Telefona dal lunedì al venerdì, dalle 10:30 alle 12:30, e chiedi se ci sono incontri sullo svezzamento o sul massaggio neonatale.",
      "link": "https://www.aulss8.veneto.it/sedi/consultorio-familiare-sede-di-montecchio-maggiore/",
      "q": "Consultorio familiare via Giuriolo 11 Montecchio Maggiore"
    },
    {
      "id": "piscina-montecchio",
      "t": "Centro Natatorio di Montecchio Maggiore",
      "e": "🏊",
      "cat": "Acquaticità",
      "addr": "Via Bruschi 2/4, Montecchio Maggiore",
      "tel": "0444 699387",
      "km": 1,
      "desc": "Corsi di acquaticità neonatale: un'esperienza bellissima da vivere insieme in acqua calda (32-34 °C). Chiedi orari e fasce d'età, e prima di iniziare parlane col pediatra.",
      "link": "https://www.nuotoinpiscina.it/piscine-montecchio-maggiore/centro-natatorio-montecchio-maggiore-piscina-basic",
      "q": "Centro Natatorio Montecchio Maggiore via Bruschi"
    },
    {
      "id": "piscine-vicenza",
      "t": "Piscine di Vicenza – Gestanti e neonati",
      "e": "🐳",
      "cat": "Acquaticità",
      "addr": "Vicenza",
      "tel": "",
      "km": 13,
      "desc": "Un'alternativa a Vicenza, con corsi dedicati ai neonati e ai loro genitori.",
      "link": "https://www.piscinedivicenza.it/attivita-in-piscina/gestanti-e-neonati/",
      "q": "Piscine di Vicenza"
    },
    {
      "id": "castelli",
      "t": "Castelli di Giulietta e Romeo",
      "e": "🏰",
      "cat": "Passeggiate",
      "addr": "Via Castelli, Montecchio Maggiore",
      "tel": "",
      "km": 1,
      "desc": "Il simbolo del paese, con una vista bellissima sulla pianura. La strada sale: meglio la fascia o il marsupio. Al tramonto è magico.",
      "link": "",
      "q": "Castelli di Giulietta e Romeo Montecchio Maggiore"
    },
    {
      "id": "parco-querini",
      "t": "Parco Querini",
      "e": "🦆",
      "cat": "Passeggiate",
      "addr": "Viale Rumor, Vicenza",
      "tel": "",
      "km": 13,
      "desc": "Il grande parco di Vicenza, con viali pianeggianti perfetti per il passeggino, alberi secolari e i conigli e le anatre intorno all'isoletta con il tempietto.",
      "link": "",
      "q": "Parco Querini Vicenza"
    },
    {
      "id": "lago-fimon",
      "t": "Lago di Fimon",
      "e": "🌾",
      "cat": "Passeggiate",
      "addr": "Arcugnano",
      "tel": "",
      "km": 20,
      "desc": "Una passeggiata tranquilla in riva al lago, tra canneti e anatre. In parte è su sterrato: ok con un passeggino a ruote grandi, altrimenti usa il marsupio.",
      "link": "",
      "q": "Lago di Fimon Arcugnano"
    },
    {
      "id": "biblioteca-valdagno",
      "t": "Biblioteca civica Villa Valle – Valdagno",
      "e": "📖",
      "cat": "Servizi",
      "addr": "Villa Valle, Valdagno",
      "tel": "",
      "km": 18,
      "desc": "Da ottobre 2026 sono ripartite le letture ad alta voce dei volontari, e c'è anche «Letture Cucù», un ciclo di 3 incontri per bambini da 0 a 36 mesi. Chiedi le date in biblioteca.",
      "link": "https://bibliotecavaldagno.it/",
      "q": "Biblioteca civica Villa Valle Valdagno"
    },
    {
      "id": "famiglie-teatro-verona",
      "t": "Famiglie a Teatro – Fondazione Aida",
      "e": "🎟️",
      "cat": "Cultura",
      "addr": "Teatro Stimate, Teatro Nuovo e Nuovo San Michele, Verona",
      "tel": "",
      "km": 45,
      "desc": "Rassegna di spettacoli per famiglie dal 25 ottobre 2026 al 4 aprile 2027. Sotto i 3 anni si entra gratis. C'è anche una tessera a scalare per tutta la stagione.",
      "link": "https://www.fondazioneaida.it/",
      "q": "Teatro Stimate Verona"
    },
    {
      "id": "piccionaia",
      "t": "La Piccionaia – teatro per famiglie",
      "e": "🎭",
      "cat": "Cultura",
      "addr": "Teatro Astra e altri teatri del Vicentino",
      "town": "Vicenza",
      "tel": "",
      "km": 13,
      "desc": "La compagnia teatrale vicentina che organizza spettacoli per famiglie, alcuni dedicati ai piccolissimi (dai 12-18 mesi). Tieni d'occhio il calendario.",
      "link": "https://www.piccionaia.org/centro-teatrale-piccionaia/calendario/eventi-per-famiglie/",
      "q": "Teatro Astra Vicenza"
    }
  ],
  "hospitals": [
    {
      "t": "Ospedale di Arzignano – Pronto soccorso",
      "q": "Ospedale di Arzignano pronto soccorso",
      "km": 8,
      "town": "Arzignano"
    },
    {
      "t": "Ospedale San Bortolo, Vicenza – Pronto soccorso pediatrico",
      "q": "Ospedale San Bortolo Vicenza pronto soccorso pediatrico",
      "km": 13,
      "town": "Vicenza"
    }
  ],
  "sources": [
    {
      "t": "Comune di Montecchio Maggiore – Eventi",
      "link": "https://www.comune.montecchio-maggiore.vi.it/it/eventi"
    },
    {
      "t": "Biblioteca di Montecchio – eventi",
      "link": "https://www.comune.montecchio-maggiore.vi.it/it/categorie-eventi/66844"
    },
    {
      "t": "VicenzaToday – eventi per bambini",
      "link": "https://www.vicenzatoday.it/eventi/bambini/si/"
    },
    {
      "t": "EasyVi – eventi a Vicenza e provincia",
      "link": "https://easyvi.it/eventi/"
    },
    {
      "t": "La Piccionaia – eventi per famiglie",
      "link": "https://www.piccionaia.org/centro-teatrale-piccionaia/calendario/eventi-per-famiglie/"
    },
    {
      "t": "Comune di Arzignano – eventi",
      "link": "https://www.comune.arzignano.vi.it/home/vivere/eventi.html"
    },
    {
      "t": "Teatro Comunale di Vicenza – calendario",
      "link": "https://www.tcvi.it/en/events/events-calendar/"
    },
    {
      "t": "Fondazione Aida (Verona) – Famiglie a Teatro",
      "link": "https://www.fondazioneaida.it/"
    },
    {
      "t": "Verona – eventi (VisitVerona)",
      "link": "https://www.visitverona.it/it/eventi"
    },
    {
      "t": "Padova Cultura – manifestazioni del mese",
      "link": "https://padovacultura.padovanet.it/it/manifestazioni-questo-mese"
    },
    {
      "t": "Biblioteca di Valdagno",
      "link": "https://bibliotecavaldagno.it/"
    },
    {
      "t": "Nati per Leggere",
      "link": "https://www.natiperleggere.it/"
    }
  ],
  "towns": {
    "Montecchio Maggiore": [
      45.5049,
      11.4115
    ],
    "Arzignano": [
      45.5206,
      11.334
    ],
    "Valdagno": [
      45.6475,
      11.3017
    ],
    "Vicenza": [
      45.5455,
      11.5354
    ],
    "Verona": [
      45.4384,
      10.9916
    ],
    "Padova": [
      45.4064,
      11.8768
    ],
    "Bassano del Grappa": [
      45.7663,
      11.7344
    ],
    "Asiago": [
      45.8753,
      11.5094
    ],
    "Arcugnano": [
      45.472,
      11.539
    ],
    "Schio": [
      45.7136,
      11.3594
    ],
    "Thiene": [
      45.7085,
      11.4775
    ],
    "Lonigo": [
      45.3866,
      11.3887
    ],
    "Marostica": [
      45.7466,
      11.6559
    ],
    "Sovizzo": [
      45.5267,
      11.4462
    ],
    "Brendola": [
      45.4722,
      11.444
    ],
    "Trissino": [
      45.5616,
      11.3746
    ],
    "Montebello Vicentino": [
      45.4588,
      11.3838
    ],
    "Altavilla Vicentina": [
      45.5126,
      11.4683
    ],
    "Creazzo": [
      45.5317,
      11.4808
    ],
    "Chiampo": [
      45.5449,
      11.281
    ],
    "Recoaro Terme": [
      45.7067,
      11.2245
    ],
    "San Bonifacio": [
      45.3961,
      11.2717
    ],
    "Soave": [
      45.4199,
      11.2464
    ],
    "Bussolengo": [
      45.4723,
      10.8509
    ],
    "Castelfranco Veneto": [
      45.6712,
      11.9268
    ],
    "Cittadella": [
      45.648,
      11.7838
    ],
    "Noventa Vicentina": [
      45.2911,
      11.541
    ],
    "Dueville": [
      45.6375,
      11.548
    ],
    "Camisano Vicentino": [
      45.5225,
      11.7086
    ],
    "Torri di Quartesolo": [
      45.5178,
      11.6201
    ],
    "Isola Vicentina": [
      45.6301,
      11.4458
    ]
  }
});
