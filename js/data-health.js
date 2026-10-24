/* Salute: bilanci, vaccinazioni, emergenze, percorso allergeni, libri e filastrocche. */

/* Percorso guidato degli allergeni: ordine suggerito (modificabile col pediatra).
   food = cibo del diario usato per registrarlo. */
window.ALLERGEN_PLAN = [
  { k: "latte", food: "yogurt", how: "2-3 cucchiai di yogurt intero bianco, oppure 1 cucchiaino di parmigiano nella pappa.", recipe: "cachi-yogurt" },
  { k: "glutine", food: "grano", how: "1-2 cucchiai di pastina o semolino cotti nel brodo vegetale.", recipe: "pastina-brodo" },
  { k: "uovo", food: "uovo", how: "Inizia con un cucchiaino di uovo sodo (ben cotto) schiacciato nella pappa, oppure una strisciolina di frittatina al forno.", recipe: "frittatina-forno" },
  { k: "pesce", food: "merluzzo", how: "30-40 g di merluzzo o nasello cotto a vapore, senza lische.", recipe: "merluzzo-patate" },
  { k: "arachidi", food: "arachidi", how: "¼ di cucchiaino di crema di arachidi 100% liscia, sciolta in acqua tiepida e mescolata allo yogurt o alla pappa.", recipe: "yogurt-arachidi" },
  { k: "sesamo", food: "sesamo", how: "½ cucchiaino di tahina nella pappa, oppure un cucchiaino di hummus.", recipe: "hummus" },
  { k: "frutta-guscio", food: "frutta-guscio", how: "¼ di cucchiaino di crema di mandorle o di nocciole 100% (senza zucchero), sciolta nella pappa o nello yogurt. Mai frutta secca intera o a pezzi.", recipe: null },
  { k: "soia", food: "tofu", how: "Un cucchiaio di tofu morbido schiacciato nella pappa, oppure 2 cucchiai di yogurt di soia bianco non zuccherato.", recipe: null }
];

/* Bilanci di salute dal pediatra: età indicative (in mesi). Il calendario preciso lo concorda il pediatra. */
window.CHECKUPS = [
  { id: "b1", m: 1, t: "Bilancio di salute di 1 mese", d: "Crescita, allattamento, sonno, riflessi. Primo controllo dopo la nascita." },
  { id: "b3", m: 3, t: "Bilancio di salute di 3 mesi", d: "Crescita, controllo del capo, sorriso, vista e udito." },
  { id: "b6", m: 6, t: "Bilancio di salute di 6 mesi", d: "Crescita, avvio dello svezzamento, posizione seduta, prime lallazioni." },
  { id: "b9", m: 9, t: "Bilancio di salute di 9 mesi", d: "Svezzamento a pezzi, gattonamento, presa a pinza, sicurezza in casa." },
  { id: "b12", m: 12, t: "Bilancio di salute di 12 mesi", d: "Primi passi, prime parole, alimentazione in famiglia, latte vaccino." },
  { id: "b18", m: 18, t: "Bilancio di salute di 18 mesi", d: "Cammino, linguaggio, comportamento e gioco." },
  { id: "b24", m: 24, t: "Bilancio di salute di 2 anni", d: "Linguaggio, autonomia, dentini, sonno." },
  { id: "b36", m: 36, t: "Bilancio di salute di 3 anni", d: "Linguaggio, socialità, preparazione alla scuola dell'infanzia." }
];

/* Vaccinazioni: calendario indicativo nazionale (PNPV). La ULSS invia la lettera con data e ora. */
window.VACCINES = [
  { id: "v3", m: 2, t: "Dal 3° mese di vita", items: ["Esavalente – 1ª dose", "Pneumococco – 1ª dose", "Rotavirus (per bocca)", "Meningococco B"] },
  { id: "v5", m: 4, t: "Intorno ai 5 mesi", items: ["Esavalente – 2ª dose", "Pneumococco – 2ª dose", "Rotavirus", "Meningococco B"] },
  { id: "vflu", m: 6, t: "Dai 6 mesi, ogni autunno", items: ["Antinfluenzale (consigliata e gratuita nei bambini piccoli: chiedi al pediatra)"] },
  { id: "v11", m: 11, t: "Intorno agli 11-13 mesi", items: ["Esavalente – 3ª dose", "Pneumococco – 3ª dose"] },
  { id: "v13", m: 13, t: "Intorno ai 13-15 mesi", items: ["Morbillo, parotite, rosolia, varicella (MPRV)", "Meningococco ACWY", "Meningococco B – richiamo"] },
  { id: "v6y", m: 72, t: "Intorno ai 5-6 anni", items: ["Richiami: difterite, tetano, pertosse, polio", "Richiamo MPRV"] }
];

/* Domande utili da fare al pediatra, per età (mesi) */
window.QUESTION_IDEAS = [
  { min: 4, max: 7, q: "Quando e con quale pasto iniziamo lo svezzamento?" },
  { min: 4, max: 9, q: "Quanto latte formulato dare ora che inizia a mangiare?" },
  { min: 4, max: 12, q: "Fino a quando continuare la vitamina D?" },
  { min: 5, max: 9, q: "In che ordine introdurre gli allergeni, visto che in famiglia non ci sono allergie?" },
  { min: 5, max: 36, q: "Consigliate il vaccino antinfluenzale quest'anno?" },
  { min: 5, max: 12, q: "Che dose di paracetamolo dare in caso di febbre, con il peso attuale?" },
  { min: 6, max: 12, q: "Come capire se mangia abbastanza?" },
  { min: 6, max: 18, q: "Come gestire i dentini e quando passare allo spazzolino?" },
  { min: 8, max: 14, q: "Come gestire i risvegli notturni?" },
  { min: 10, max: 15, q: "Quando passare al latte vaccino e in che quantità?" },
  { min: 12, max: 24, q: "Le parole che dice sono nella norma per la sua età?" }
];

/* Numeri utili. tel senza spazi per il link di chiamata. */
window.EMERGENCY_NUMBERS = [
  { t: "Emergenza", sub: "Ambulanza, emergenza sanitaria", tel: "112", e: "🚑", main: true },
  { t: "Centro Antiveleni – Niguarda Milano", sub: "Attivo 24 ore su 24, anche per i bambini", tel: "0266101029", show: "02 6610 1029", e: "☠️" },
  { t: "Centro Antiveleni – Verona", sub: "Numero verde, 24 ore su 24", tel: "800011858", show: "800 011 858", e: "☠️" }
];

window.EMERGENCY_GUIDE = [
  {
    id: "soffocamento-lattante", e: "🫁", t: "Soffocamento: bambino sotto 1 anno",
    html: `
<p><b>Se tossisce, piange o fa rumore:</b> l'aria passa. Non intervenire, lascialo tossire e resta accanto a lui.</p>
<p><b>Se non riesce a tossire, piangere o respirare:</b></p>
<ol class="steps">
<li>Fai chiamare subito il <b>112</b> (o chiamalo tu in vivavoce).</li>
<li><b>5 colpi sulla schiena:</b> mettilo a pancia in giù sul tuo avambraccio, con la testa più in basso del corpo, sostenendogli la mandibola con la mano. Con il palmo dai 5 colpi decisi tra le scapole.</li>
<li><b>5 compressioni sul torace:</b> giralo a pancia in su sull'altro avambraccio, sempre con la testa più in basso. Con due dita al centro del torace, appena sotto la linea dei capezzoli, fai 5 compressioni spingendo in profondità per circa un terzo del torace.</li>
<li>Controlla la bocca: togli l'oggetto <b>solo se lo vedi</b>. Mai infilare le dita alla cieca.</li>
<li><b>Ripeti</b> 5 colpi e 5 compressioni finché l'oggetto esce o arrivano i soccorsi.</li>
<li>Se perde coscienza: mettilo su una superficie rigida e inizia la rianimazione come imparato al corso, seguendo le istruzioni dell'operatore del 112.</li>
</ol>`
  },
  {
    id: "soffocamento-bambino", e: "🧒", t: "Soffocamento: bambino sopra 1 anno",
    html: `
<ol class="steps">
<li>Se tossisce, incoraggialo a tossire. Se non respira, fai chiamare il <b>112</b>.</li>
<li><b>5 colpi tra le scapole</b>, con il bambino piegato in avanti.</li>
<li><b>5 compressioni addominali</b> (manovra di Heimlich): mettiti dietro di lui, con il pugno sopra l'ombelico e l'altra mano sopra il pugno, e spingi verso l'interno e verso l'alto.</li>
<li>Alterna 5 colpi e 5 compressioni finché l'oggetto esce o arrivano i soccorsi.</li>
</ol>`
  },
  {
    id: "quando-112", e: "🚨", t: "Quando chiamare subito il 112",
    html: `
<ul>
<li>Fa fatica a respirare: respiro molto veloce, rientramenti tra le costole, labbra bluastre.</li>
<li>È molto sonnolento, difficile da svegliare, «molle», o ha una convulsione.</li>
<li>Ha macchie sulla pelle che <b>non scompaiono</b> premendoci sopra un bicchiere di vetro.</li>
<li>Reazione allergica con gonfiore di labbra o lingua, tosse insistente, voce rauca o difficoltà a respirare.</li>
<li>Dopo una caduta: perde i sensi, vomita più volte, è insolitamente sonnolento o irritabile.</li>
</ul>`
  },
  {
    id: "febbre", e: "🌡️", t: "Febbre",
    html: `
<ul>
<li><b>Sotto i 3 mesi</b> una febbre da 38 °C in su va sempre valutata subito: chiama il pediatra o vai in pronto soccorso.</li>
<li>Più che il numero sul termometro conta <b>come sta</b> il bambino: se gioca e beve, di solito si può aspettare il pediatra.</li>
<li>Il paracetamolo si dà in base al <b>peso</b>, con le dosi indicate dal pediatra. Niente aspirina ai bambini.</li>
<li>Offri spesso il latte e controlla che bagni i pannolini.</li>
<li>Chiama il pediatra se la febbre dura più di 2-3 giorni, se beve poco, o se il bambino ti sembra «diverso dal solito».</li>
</ul>`
  },
  {
    id: "ingestione", e: "🧴", t: "Ha ingerito qualcosa di pericoloso",
    html: `
<ul>
<li>Chiama subito il <b>Centro Antiveleni</b> (numeri qui sopra) o il 112.</li>
<li><b>Non farlo vomitare</b> e non dargli latte o altro senza indicazioni.</li>
<li>Tieni in mano la confezione del prodotto: ti chiederanno il nome e la composizione.</li>
<li>Pile a bottone e calamite sono emergenze anche se il bambino sta bene: vai subito in pronto soccorso.</li>
</ul>`
  },
  {
    id: "ustioni", e: "🔥", t: "Ustioni",
    html: `
<ul>
<li>Raffredda subito con <b>acqua corrente fresca</b> (non gelata) per 10-20 minuti.</li>
<li>Niente ghiaccio, creme, olio o dentifricio.</li>
<li>Copri con una garza pulita o con la pellicola per alimenti.</li>
<li>Se l'ustione è più grande del palmo della sua mano, o è su viso, mani o genitali: pronto soccorso.</li>
</ul>`
  }
];


/* Libri consigliati per età (molti sono classici di Nati per Leggere) */
window.BOOKS = [
  { min: 0, max: 12, t: "Libri ad alto contrasto in bianco e nero", a: "per esempio quelli di Tana Hoban", d: "Nei primi mesi la vista ama i contrasti forti: figure nere su fondo bianco catturano lo sguardo." },
  { min: 0, max: 18, t: "Libri tattili e di stoffa", a: "vari autori", d: "Da toccare, stropicciare e mordicchiare: il libro è prima di tutto un oggetto da esplorare." },
  { min: 4, max: 24, t: "Tararì tararera…", a: "Emanuela Bussolati", d: "Una storia in una lingua inventata, fatta solo di suoni: la musica della tua voce è tutto. Un classico di Nati per Leggere." },
  { min: 6, max: 24, t: "Libri fotografici di oggetti e animali", a: "vari autori", d: "Una figura per pagina, oggetti di tutti i giorni: indicali e nominali insieme." },
  { min: 10, max: 30, t: "Dov'è Spotty?", a: "Eric Hill", d: "Alza le alette e cerca il cagnolino: perfetto quando nasce il gioco del «dov'è?»." },
  { min: 12, max: 36, t: "Orso, buco!", a: "Nicola Grossi", d: "Un orso, un buco e tanta sorpresa: pochissime parole e grandi risate." },
  { min: 12, max: 36, t: "A caccia dell'orso", a: "Michael Rosen, Helen Oxenbury", d: "Ritmo, ripetizioni e suoni da fare insieme («fruscio, fruscio!»): da leggere a voce alta." },
  { min: 12, max: 36, t: "Il piccolo Bruco Maisazio", a: "Eric Carle", d: "Giorni, numeri, cibi e una magnifica farfalla, con i buchi da toccare." },
  { min: 12, max: 36, t: "Buonanotte Luna", a: "Margaret Wise Brown, Clement Hurd", d: "Una ninna nanna in forma di libro, ideale per il rituale della sera." },
  { min: 18, max: 48, t: "Indovina quanto bene ti voglio", a: "Sam McBratney, Anita Jeram", d: "Una storia di affetto tra due leprotti, dolcissima prima della nanna." },
  { min: 24, max: 60, t: "Piccolo blu e piccolo giallo", a: "Leo Lionni", d: "Due macchie di colore che si abbracciano e diventano verdi: un capolavoro sull'amicizia." },
  { min: 24, max: 60, t: "Un libro", a: "Hervé Tullet", d: "Premi, scuoti, inclina: il libro risponde. Un gioco interattivo senza schermo." }
];

/* Filastrocche e ninne nanne della tradizione */
window.RHYMES = [
  { min: 0, max: 24, t: "Stella stellina", g: "Ninna nanna: cullalo piano.", txt: "Stella stellina,\nla notte si avvicina,\nla fiamma traballa,\nla mucca è nella stalla.\nLa mucca e il vitello,\nla pecora e l'agnello,\nla chioccia coi pulcini,\nla gatta coi gattini,\ne tutti fan la nanna\nnel cuore della mamma." },
  { min: 0, max: 24, t: "Ninna nanna, ninna oh", g: "Ninna nanna tradizionale.", txt: "Ninna nanna, ninna oh,\nquesto bimbo a chi lo do?\nLo darò alla Befana\nche lo tiene una settimana.\nLo darò all'Uomo Nero\nche lo tiene un anno intero.\nNinna nanna, ninna oh,\nquesto bimbo me lo terrò!" },
  { min: 3, max: 24, t: "Questo è l'occhio bello", g: "Tocca piano le parti del viso mentre le nomini.", txt: "Questo è l'occhio bello,\nquesto è suo fratello,\nquesta è la chiesina\n(la bocca)\ne questo è il campanello:\ndin don dan!\n(il naso)" },
  { min: 4, max: 24, t: "Questo dice: ho fame", g: "Tocca un ditino alla volta, partendo dal pollice.", txt: "Questo dice: ho fame.\nQuesto dice: non c'è pane.\nQuesto dice: come faremo?\nQuesto dice: lo ruberemo!\nQuesto dice: no, no, no,\nche rubar non si può!" },
  { min: 4, max: 24, t: "Batti batti le manine", g: "Batti le sue manine a ritmo.", txt: "Batti batti le manine,\nche arriva il papà,\nporta le caramelle\ne il bimbo le mangerà!" },
  { min: 8, max: 36, t: "Giro giro tondo", g: "In braccio, girando piano; da più grande, in cerchio per mano.", txt: "Giro giro tondo,\ncasca il mondo,\ncasca la terra,\ntutti giù per terra!" },
  { min: 12, max: 48, t: "Bella lavanderina", g: "Fate i gesti insieme: lavare, saltare, girare.", txt: "Bella lavanderina\nche lava i fazzoletti\nper i poveretti\ndella città.\nFai un salto,\nfanne un altro,\nfai la giravolta,\nfalla un'altra volta,\nguarda in su,\nguarda in giù,\ndai un bacio a chi vuoi tu!" },
  { min: 18, max: 60, t: "Ambarabà ciccì coccò", g: "La conta più famosa: perfetta da recitare battendo il ritmo.", txt: "Ambarabà ciccì coccò,\ntre civette sul comò\nche facevano l'amore\ncon la figlia del dottore.\nIl dottore si ammalò:\nambarabà ciccì coccò!" }
];

/* Guide pratiche di cura quotidiana ("Come si fa").
   videos: video scelti (id YouTube, titolo, fonte); q: ricerca suggerita su YouTube. */
window.CARE_GUIDES = [
  {
    id: "lavaggi-nasali", e: "💧", t: "Lavaggi nasali",
    sub: "Con il raffreddore, per liberare il nasino",
    q: "lavaggi nasali neonato pediatra",
    videos: [{ id: "-uwx2DE2ukE", t: "Lavaggi nasali del neonato: un tutorial per i genitori", src: "Pediatra, Centro Medico Santagostino" }],
    html: `
<h3>Cosa serve</h3>
<ul><li>Soluzione fisiologica (cloruro di sodio 0,9%) in fialette monodose, oppure una siringa da 5-10 ml <b>senza ago</b>.</li><li>Fazzoletti o una salvietta.</li><li>Soluzione a temperatura ambiente (non fredda).</li></ul>
<h3>Come si fa</h3>
<ol class="steps">
<li>Sdraia il bimbo sulla schiena con la <b>testa girata di lato</b>, oppure su un fianco. Tieni ferma la testa con delicatezza.</li>
<li>Appoggia la punta della fialetta all'ingresso della <b>narice che sta in alto</b>.</li>
<li>Spremi con un gesto deciso (2-5 ml): il liquido entra e esce dall'altra narice, portando via il muco.</li>
<li>Rimettilo seduto, pulisci il nasino e coccolalo.</li>
<li>Gira la testa dall'altro lato e ripeti nell'altra narice.</li>
</ol>
<h3>Consigli</h3>
<ul>
<li>Fallo <b>prima</b> della poppata e della nanna, non subito dopo mangiato (potrebbe rigurgitare).</li>
<li>Con il raffreddore si può ripetere più volte al giorno.</li>
<li>All'inizio piangerà: è normale, il lavaggio non fa male. Con l'abitudine diventa più facile.</li>
<li>Se ha febbre alta, respira a fatica o ha mal d'orecchio, senti il pediatra.</li>
</ul>`
  },
  {
    id: "febbre-misurare", e: "🌡️", t: "Misurare la febbre",
    sub: "Termometro, valori e quando chiamare",
    q: "come misurare la febbre al neonato pediatra",
    videos: [],
    html: `
<ol class="steps">
<li>Usa un <b>termometro digitale</b> sotto l'ascella: asciuga la pelle, metti la punta al centro dell'ascella e tieni il braccino chiuso contro il corpo.</li>
<li>Aspetta il segnale acustico e leggi il valore.</li>
<li>I termometri a infrarossi (fronte o orecchio) sono comodi ma meno precisi nei lattanti: in caso di dubbio ricontrolla sotto l'ascella.</li>
</ol>
<ul>
<li>Sotto l'ascella si parla di febbre <b>da 37,5 °C</b> in su.</li>
<li><b>Sotto i 3 mesi</b> una febbre da 38 °C in su va sempre valutata subito dal pediatra o in pronto soccorso.</li>
<li>Più del numero conta come sta: se beve, gioca e si consola, di solito si può aspettare il pediatra.</li>
</ul>
<p>Trovi tutti i segnali d'allarme nella sezione <a href="#/emergenze">Emergenze</a>.</p>`
  },
  {
    id: "medicine", e: "💊", t: "Dare le medicine con la siringa",
    sub: "Sciroppi e gocce senza sputi",
    q: "come dare sciroppo con siringa al neonato",
    videos: [],
    html: `
<ol class="steps">
<li>Controlla la <b>dose in ml</b> indicata dal pediatra (spesso dipende dal peso) e usa solo il dosatore della confezione.</li>
<li>Tieni il bimbo in braccio, <b>semiseduto</b>, mai sdraiato.</li>
<li>Appoggia la siringa all'interno della <b>guancia</b>, di lato, non verso la gola.</li>
<li>Spingi piano, poco alla volta, lasciandogli il tempo di deglutire.</li>
<li>Dopo, offri il seno o un po' di latte o acqua.</li>
</ol>
<ul>
<li>Non mescolare la medicina in tutto il biberon: se non lo finisce, non sai quanta ne ha presa.</li>
<li>Lava il dosatore dopo ogni uso e annota l'orario, così non rischi doppie dosi.</li>
</ul>`
  },
  {
    id: "unghie", e: "✂️", t: "Tagliare le unghie",
    sub: "Senza paura, anche mentre dorme",
    q: "come tagliare le unghie al neonato",
    videos: [],
    html: `
<ol class="steps">
<li>Usa <b>forbicine a punta arrotondata</b> o un tagliaunghie per neonati; nei primi mesi va benissimo anche una limetta morbida.</li>
<li>Il momento migliore: mentre <b>dorme</b> o dopo il bagnetto, quando le unghie sono più morbide.</li>
<li>Tieni il ditino e premi un po' il polpastrello per allontanarlo dall'unghia.</li>
<li>Mani: segui la forma arrotondata del dito. Piedi: taglia <b>dritto</b>.</li>
</ol>
<p>Se tagli un pochino la pelle e esce una goccia di sangue, premi con una garza pulita: si ferma in fretta.</p>`
  }
];

/* Video scelti per le emergenze */
window.EMERGENCY_VIDEOS = [
  { id: "d7088oX4VKc", t: "Manovre salvavita pediatriche", src: "Croce Rossa Italiana" },
  { id: "uwo8RleF2GY", t: "Lattante (0-12 mesi): manovre di disostruzione delle vie aeree", src: "Video formativo" }
];

/* Libri per i genitori: titoli noti e reperibili in italiano (in biblioteca o in libreria) */
window.PARENT_BOOKS = [
  { cat: "🥣 Pappa e svezzamento", items: [
    { t: "Io mi svezzo da solo!", a: "Lucio Piermarini", d: "Lo svezzamento «a tavola con noi», spiegato da un pediatra con dialoghi semplici e tanto buon senso." },
    { t: "Il mio bambino non mi mangia", a: "Carlos González", d: "Per chi si preoccupa delle quantità: perché i bambini sanno regolarsi e come evitare le lotte a tavola." }
  ]},
  { cat: "🤱 Allattamento", items: [
    { t: "Un dono per tutta la vita", a: "Carlos González", d: "Guida pratica all'allattamento: posizioni, ritmi, ritorno al lavoro, difficoltà più comuni." }
  ]},
  { cat: "😴 Sonno", items: [
    { t: "Dormire senza lacrime", a: "Rosa Jové", d: "Come cambia il sonno nei primi anni e cosa aspettarsi, senza metodi rigidi." },
    { t: "Besame mucho", a: "Carlos González", d: "Crescere i figli con affetto e vicinanza: sonno, pianto, coccole e regole." }
  ]},
  { cat: "🧠 Sviluppo e cervello", items: [
    { t: "Il cervello del bambino spiegato ai genitori", a: "Álvaro Bilbao", d: "Come si sviluppa il cervello nei primi anni e piccoli gesti quotidiani per accompagnarlo." },
    { t: "12 strategie rivoluzionarie per favorire lo sviluppo mentale del bambino", a: "Daniel J. Siegel, Tina Payne Bryson", d: "Emozioni, capricci e paure spiegati con il funzionamento del cervello, con esempi pratici." },
    { t: "Il bambino in famiglia", a: "Maria Montessori", d: "Le idee di fondo del metodo Montessori: rispetto, autonomia e un ambiente a misura di bambino." }
  ]},
  { cat: "💬 Educazione e comunicazione", items: [
    { t: "Il bambino è competente", a: "Jesper Juul", d: "Relazione, rispetto e confini in famiglia: un classico della pedagogia moderna." },
    { t: "Come parlare perché i bambini ti ascoltino e come ascoltare perché ti parlino", a: "Adele Faber, Elaine Mazlish", d: "Frasi ed esempi concreti per la vita di tutti i giorni, utili soprattutto dai 2 anni." },
    { t: "I no che aiutano a crescere", a: "Asha Phillips", d: "Perché i limiti, detti con calma, fanno bene ai bambini e ai genitori." }
  ]}
];

/* Oggetti che possono servire nelle varie fasi (stesso ordine delle tappe: 4-6, 6-9, 9-12, 12-18, 18-24 mesi) */
window.MILESTONE_GEAR = [
  [
    "Tappetino morbido per stare a pancia in giù e giocare a terra",
    "Massaggiagengive da tenere in frigo (non nel freezer): arrivano i primi dentini",
    "Seggiolone (o rialzo) con schienale dritto e poggiapiedi, per lo svezzamento",
    "Bavaglini con le maniche, cucchiaini morbidi e una ciotola con ventosa",
    "Bicchiere aperto piccolo o tazza con beccuccio morbido per l'acqua"
  ],
  [
    "Paraspigoli sui tavoli bassi e sui mobili ad altezza di testa: arriva il gattonamento",
    "Copriprese e blocca-ante per i mobili bassi (detersivi e farmaci sempre in alto)",
    "Cancelletti in cima e in fondo alle scale",
    "Mobili fissati al muro (librerie, cassettiere, TV): si arrampicherà",
    "Seggiolino auto del gruppo successivo quando supera altezza o peso dell'ovetto (verso i 12-15 mesi, controlla le indicazioni del seggiolino)"
  ],
  [
    "Fermaporte per non schiacciarsi le dita",
    "Carrellino primi passi da spingere (il girello è sconsigliato dai pediatri)",
    "Scarpine morbide solo per uscire: in casa meglio a piedi nudi o con calze antiscivolo",
    "Blocca-cassetti e lucchetti per il frigorifero o il bidone",
    "Barriere per camino o stufa, se presenti"
  ],
  [
    "Protezione per le manopole del fornello e paraspigoli ancora al loro posto",
    "Seggiolino da bici o rimorchio con casco omologato, se andate in bicicletta",
    "Sgabello stabile per lavarsi le mani al lavandino",
    "Tazza e posate a misura di bambino: mangia da solo",
    "Zainetto o porta-pannolini comodo per le uscite: è sempre in movimento"
  ],
  [
    "Vasino o riduttore per il WC, quando mostra interesse (di solito tra i 2 e i 3 anni)",
    "Bici senza pedali o triciclo, con casco",
    "Lettino con sponde o letto basso quando esce dalla culla",
    "Sicurezza per finestre e balconi: nessun mobile o vaso su cui arrampicarsi vicino ai parapetti",
    "Mensole basse per giochi e libri: li sceglie e li rimette a posto da solo"
  ]
];
