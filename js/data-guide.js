/* Guida allo svezzamento, cibi per il diario, consigli del giorno, tappe dello sviluppo. */

window.READINESS = [
  { id: "seduto", t: "Sta seduto con un piccolo sostegno e tiene bene la testa" },
  { id: "bocca", t: "Porta gli oggetti alla bocca con precisione" },
  { id: "interesse", t: "Ti guarda mangiare, apre la bocca, allunga le mani verso il cibo" },
  { id: "lingua", t: "Non spinge più fuori con la lingua tutto quello che gli metti in bocca" },
  { id: "pediatra", t: "Ne avete parlato con il pediatra" }
];

window.GUIDE = [
  {
    id: "quando", e: "🗓️", t: "Quando iniziare",
    sub: "Intorno ai 6 mesi, quando il bimbo è pronto",
    html: `
<p>OMS, Ministero della Salute e società pediatriche consigliano di iniziare <strong>intorno ai 6 mesi</strong>: non prima delle 17 settimane compiute e non oltre le 26. Il momento giusto dipende dal tuo bambino, non dal calendario.</p>
<h3>Segnali che è pronto</h3>
<ul>
<li>Sta seduto con poco sostegno e controlla bene la testa.</li>
<li>Afferra gli oggetti e li porta alla bocca.</li>
<li>Mostra interesse quando mangiate: vi guarda, apre la bocca, cerca il cibo.</li>
<li>Ha perso il <em>riflesso di estrusione</em>: non spinge più fuori con la lingua tutto ciò che entra in bocca.</li>
</ul>
<p>Svegliarsi di notte o volere più latte <strong>non</strong> sono, da soli, segnali di prontezza.</p>
<div class="note">Il bilancio di salute dei 6 mesi dal pediatra è il momento ideale per decidere insieme come partire.</div>`
  },
  {
    id: "misto", e: "🥄✋", t: "L'approccio misto",
    sub: "Pappe e pezzetti insieme, senza fretta",
    html: `
<p>Avete scelto un approccio <strong>misto</strong>: unisce la tranquillità delle pappe al cucchiaino con l'autonomia dei pezzetti da prendere con le mani (come nell'autosvezzamento).</p>
<h3>Come funziona in pratica</h3>
<ul>
<li><strong>Pappa + qualcosa da toccare:</strong> mentre gli offri la pappa, metti sul vassoio un bastoncino morbido (zucchina, patata dolce, banana).</li>
<li><strong>Cucchiaino precaricato:</strong> riempi il cucchiaino e daglielo in mano: impara a portarlo alla bocca da solo.</li>
<li><strong>Consistenze che crescono:</strong> liscia nelle prime settimane → schiacciata con la forchetta → con piccoli grumi → tritata e a pezzetti. Non restare troppo a lungo sulle pappe lisce: tra i 6 e i 10 mesi il bimbo impara a masticare con le gengive, ed è il momento migliore per abituarlo.</li>
<li><strong>Mangiate insieme:</strong> il bimbo impara guardandovi. Quando possibile, offrigli una versione senza sale di ciò che mangiate voi.</li>
</ul>
<h3>Il latte resta fondamentale</h3>
<p>Fino a 12 mesi il latte, sia materno che formula, resta l'alimento principale. Continua l'allattamento a richiesta; per la formula il pediatra ti dirà come ridurre le quantità mentre aumentano i pasti.</p>
<h3>Ritmo indicativo</h3>
<ul>
<li><strong>6 mesi:</strong> un pasto al giorno, di solito il pranzo.</li>
<li><strong>7-8 mesi:</strong> si aggiunge la cena; poi colazione e merenda con frutta, yogurt, cereali.</li>
<li><strong>9-12 mesi:</strong> 3 pasti e 1-2 spuntini, sempre più simili ai vostri.</li>
</ul>`
  },
  {
    id: "pezzi", e: "✂️", t: "Pezzi sicuri: forme e misure",
    sub: "Come tagliare il cibo a ogni età",
    html: `
<h3>Intorno ai 6 mesi: presa a pugno</h3>
<p>Bastoncini <strong>lunghi come un dito adulto</strong> e larghi circa due dita: il bimbo li stringe nel pugno e mangia la parte che sporge.</p>
<h3>Dagli 8-9 mesi: presa a pinza</h3>
<p>Pezzetti piccoli <strong>come un cece</strong>, che raccoglie con pollice e indice.</p>
<h3>La prova della morbidezza</h3>
<p>Ogni pezzo deve <strong>schiacciarsi facilmente tra il tuo pollice e l'indice</strong>, oppure tra la lingua e il palato.</p>
<h3>Da tagliare sempre</h3>
<ul>
<li>Uva, pomodorini, mirtilli grandi, olive: <strong>in quarti per lungo</strong>.</li>
<li>Würstel e salsicce: meglio evitarli. Se proprio, tagliati per lungo e poi a pezzetti, mai a rondelle.</li>
<li>Mela e carota crude: grattugiate finemente, mai a pezzi.</li>
<li>Pane: tostato leggermente, in bastoncini (la mollica gommosa fa una palla in bocca).</li>
</ul>
<h3>Da evitare (rischio soffocamento)</h3>
<ul>
<li>Frutta secca intera o a pezzi, arachidi: <strong>fino a 4-5 anni</strong> solo in crema o farina.</li>
<li>Popcorn, caramelle dure, chicchi di mais, cubetti di formaggio filante.</li>
<li>Cibi tondi e lisci interi.</li>
</ul>
<div class="note">Il bimbo mangia <strong>sempre seduto dritto</strong> nel seggiolone, con un adulto accanto. Mai sdraiato, mai in macchina o mentre gattona.</div>`
  },
  {
    id: "conato", e: "🫁", t: "Conato o soffocamento?",
    sub: "Riconoscerli e sapere cosa fare",
    html: `
<div class="cols">
<div class="col ok"><h3>Conato (normale)</h3>
<ul><li>È rumoroso: tossisce, fa versi.</li><li>Occhi che lacrimano, lingua in fuori.</li><li>Può arrivare a rigurgitare.</li></ul>
<p><strong>Cosa fare:</strong> resta calmo e lascialo fare. Il conato è un riflesso che lo protegge: sta imparando.</p></div>
<div class="col danger"><h3>Soffocamento (emergenza)</h3>
<ul><li>È <strong>silenzioso</strong>: non tossisce, non piange.</li><li>Non respira, ha lo sguardo spaventato.</li><li>Il colore delle labbra cambia (bluastro).</li></ul>
<p><strong>Cosa fare:</strong> intervieni subito con le manovre di disostruzione pediatrica e fai chiamare il <strong>112</strong>.</p></div>
</div>
<div class="note">Consiglio di cuore: <strong>fate un corso di disostruzione pediatrica</strong>, tutti e due e magari anche i nonni. Lo organizzano spesso Croce Rossa, associazioni di volontariato e alcuni comuni: dura un paio d'ore e regala tantissima serenità.</div>`
  },
  {
    id: "evitare", e: "🚫", t: "Cosa evitare nel primo anno",
    sub: "Sale, zucchero, miele e pochi altri",
    html: `
<ul>
<li><strong>Sale e dado:</strong> niente sale aggiunto. Attenzione al sale nascosto in affettati, formaggi stagionati (il parmigiano va bene, 1 cucchiaino), pane salato, cibi pronti.</li>
<li><strong>Zucchero:</strong> niente zucchero aggiunto, biscotti zuccherati, dolci, bevande zuccherate o succhi di frutta.</li>
<li><strong>Miele:</strong> mai prima dei 12 mesi, nemmeno sul ciuccio (rischio botulismo).</li>
<li><strong>Latte vaccino come bevanda:</strong> non prima dei 12 mesi. In piccole quantità nelle preparazioni va bene; yogurt e formaggi freschi sono ok.</li>
<li><strong>Bevande vegetali di riso:</strong> da evitare nei bambini piccoli.</li>
<li><strong>Crudi:</strong> niente carne, pesce o uova crudi o poco cotti, né formaggi a latte crudo.</li>
<li><strong>Pesci grandi predatori</strong> (pesce spada, squalo/verdesca, tonno fresco, luccio): contengono più mercurio.</li>
<li><strong>Spinaci e bietole:</strong> in piccole quantità, cotti e consumati subito, senza riscaldarli.</li>
<li><strong>Tè, tisane zuccherate, bibite:</strong> no. Si beve <strong>acqua</strong>.</li>
</ul>
<p>Erbe aromatiche e spezie delicate (basilico, prezzemolo, rosmarino, cannella, curcuma) invece vanno benissimo e aiutano a dare sapore senza sale.</p>`
  },
  {
    id: "allergeni", e: "⚠️", t: "Introdurre gli allergeni",
    sub: "Presto, uno alla volta, e poi regolarmente",
    html: `
<p>Le indicazioni attuali sono chiare: <strong>non bisogna rimandare</strong> gli alimenti più allergizzanti. Introdurli durante lo svezzamento, intorno ai 6 mesi, può anzi aiutare a prevenire le allergie.</p>
<h3>Come fare</h3>
<ul>
<li><strong>Uno alla volta</strong>, in piccola quantità, aspettando 2-3 giorni prima del successivo.</li>
<li><strong>Di mattina o a pranzo</strong>, in un giorno in cui il bimbo sta bene, per poterlo osservare nelle ore successive.</li>
<li>Una volta introdotto, <strong>continua a offrirlo regolarmente</strong> (1-2 volte a settimana): la costanza mantiene la tolleranza.</li>
</ul>
<h3>Come proporli</h3>
<ul>
<li>🥛 <strong>Latte:</strong> yogurt intero, ricotta, parmigiano.</li>
<li>🥚 <strong>Uovo:</strong> sempre ben cotto (frittatina al forno, uovo sodo schiacciato).</li>
<li>🌾 <strong>Glutine:</strong> pastina, semolino, pane, avena.</li>
<li>🐟 <strong>Pesce:</strong> merluzzo, nasello, salmone.</li>
<li>🥜 <strong>Arachidi:</strong> crema 100% liscia diluita nello yogurt o nella pappa.</li>
<li>🌰 <strong>Frutta a guscio:</strong> creme lisce o farine (mandorle, nocciole), mai intera.</li>
<li>⚪ <strong>Sesamo:</strong> tahina, hummus.</li>
<li>🫘 <strong>Soia:</strong> tofu morbido, yogurt di soia bianco.</li>
</ul>
<h3>Segnali di reazione</h3>
<ul>
<li><strong>Chiama il pediatra</strong> se compaiono orticaria o chiazze rosse, gonfiore di labbra o occhi, vomito ripetuto.</li>
<li><strong>Chiama subito il 112</strong> se ha difficoltà a respirare, tosse insistente o voce rauca, gonfiore di lingua o gola, è pallido o insolitamente sonnolento.</li>
</ul>
<div class="note">Puoi segnare ogni allergene introdotto nel <a href="#/diario">Diario dei cibi</a>.</div>`
  },
  {
    id: "ferro", e: "💪", t: "Ferro e nutrienti chiave",
    sub: "Perché da 6 mesi servono cibi ricchi di ferro",
    html: `
<p>Verso i 6 mesi le riserve di ferro con cui il bimbo è nato iniziano a calare. Per questo i primi cibi dovrebbero includere spesso alimenti <strong>ricchi di ferro</strong>.</p>
<ul>
<li><strong>Fonti migliori:</strong> carne (manzo, vitello, tacchino, pollo), pesce, uovo.</li>
<li><strong>Fonti vegetali:</strong> legumi (lenticchie, ceci, fagioli), cereali integrali, tahina.</li>
<li><strong>Il trucco:</strong> abbina le fonti vegetali a frutta o verdura ricche di <strong>vitamina C</strong> (agrumi, kiwi, fragole, broccoli, peperone, pomodoro): aiuta ad assorbire il ferro.</li>
<li><strong>Grassi buoni:</strong> olio extravergine d'oliva a crudo in ogni pappa, pesce, avocado.</li>
</ul>
<p>Con l'allattamento misto il bimbo riceve già un po' di ferro dalla formula, ma i cibi ricchi di ferro restano importanti.</p>`
  },
  {
    id: "acqua", e: "💧", t: "Bere acqua",
    sub: "Il bicchiere fin dall'inizio",
    html: `
<p>Con l'inizio dello svezzamento offri un po' d'<strong>acqua naturale</strong> durante i pasti.</p>
<ul>
<li>Meglio un <strong>bicchiere aperto</strong> piccolo, o con la cannuccia, piuttosto che il biberon: aiuta lo sviluppo della bocca.</li>
<li>All'inizio ne berrà pochissima e si bagnerà: è normale, è un allenamento.</li>
<li>Va bene l'acqua del rubinetto, se potabile, oppure un'acqua minerale povera di sodio.</li>
</ul>`
  },
  {
    id: "pasto", e: "🪑", t: "Il momento del pasto",
    sub: "Seggiolone, ritmo, rispetto della sazietà",
    html: `
<ul>
<li><strong>Postura:</strong> seduto dritto, schiena a 90°, piedi appoggiati a un poggiapiedi, vassoio all'altezza della pancia.</li>
<li><strong>Niente distrazioni:</strong> niente tv né telefono durante il pasto. Il pasto è relazione: parlagli, nomina i cibi, i colori, le consistenze.</li>
<li><strong>Lascialo pasticciare:</strong> toccare, schiacciare e annusare sono il suo modo di conoscere il cibo. Un telo sotto il seggiolone ti salverà il pavimento.</li>
<li><strong>Rispetta la sazietà:</strong> se gira la testa, chiude la bocca o spinge via il cucchiaio, ha finito. Non insistere e non usare trucchi come l'aeroplanino.</li>
<li><strong>Pazienza:</strong> un cibo nuovo può servire <strong>8-15 assaggi</strong> prima di essere accettato. Un «no» oggi non è un «no» per sempre.</li>
<li><strong>Niente cibo come premio o consolazione.</strong></li>
</ul>`
  },
  {
    id: "organizzazione", e: "🧊", t: "Organizzarsi in cucina",
    sub: "Congelare, conservare, riscaldare",
    html: `
<ul>
<li><strong>Cucina in anticipo:</strong> brodo, creme di verdura, legumi e polpette si congelano benissimo nelle vaschette per il ghiaccio. Un cubetto è una porzione.</li>
<li><strong>Etichette:</strong> scrivi cosa c'è e la data. In freezer fino a 1 mese.</li>
<li><strong>Scongela in frigo</strong> (non a temperatura ambiente) e consuma entro 24 ore.</li>
<li><strong>Riscalda una sola volta</strong> e butta gli avanzi del piatto in cui ha mangiato.</li>
<li><strong>Microonde:</strong> mescola bene e controlla la temperatura, perché scalda in modo non uniforme.</li>
<li><strong>Cucina per tutti:</strong> prepara un unico piatto, metti da parte la porzione del bimbo e poi sala la vostra.</li>
</ul>`
  },
  {
    id: "piano", e: "📅", t: "Esempio di prime 4 settimane",
    sub: "Un'idea di percorso, da adattare col pediatra",
    html: `
<p>Questo è solo un <strong>esempio</strong> di come procedere. L'ordine degli alimenti è flessibile: segui le indicazioni del tuo pediatra e i tempi del bambino.</p>
<h3>Settimana 1 · Verdure, cereali, frutta</h3>
<ul>
<li>Pranzo: <a href="#/ricetta/prima-pappa">prima pappa</a> con crema di riso o di mais e tapioca, verdure e olio.</li>
<li>Da toccare: bastoncini di <a href="#/ricetta/patata-dolce">patata dolce</a> o zucchina.</li>
<li>Frutta: <a href="#/ricetta/mela-pera">mela o pera cotta</a>, <a href="#/ricetta/banana">banana</a>.</li>
</ul>
<h3>Settimana 2 · Carne o legumi, primo latticino</h3>
<ul>
<li>Aggiungi alla pappa <a href="#/ricetta/tacchino-zucchine">tacchino o pollo</a> oppure <a href="#/ricetta/lenticchie-rosse">lenticchie rosse</a>.</li>
<li>Parmigiano (1 cucchiaino) e yogurt intero bianco.</li>
<li>Da toccare: <a href="#/ricetta/broccoli-alberelli">broccoli</a>, <a href="#/ricetta/avocado">avocado</a>.</li>
</ul>
<h3>Settimana 3 · Pesce e glutine</h3>
<ul>
<li><a href="#/ricetta/merluzzo-patate">Merluzzo o nasello</a> con verdure.</li>
<li><a href="#/ricetta/pastina-brodo">Pastina o semolino</a> per il glutine.</li>
<li>Ricotta.</li>
</ul>
<h3>Settimana 4 · Uovo e altri allergeni</h3>
<ul>
<li><a href="#/ricetta/frittatina-forno">Uovo ben cotto</a>.</li>
<li><a href="#/ricetta/yogurt-arachidi">Crema di arachidi</a> diluita.</li>
<li>Sesamo con un po' di <a href="#/ricetta/hummus">hummus</a> o tahina.</li>
</ul>
<p>Verso i <strong>7 mesi</strong> si può aggiungere la cena e iniziare a schiacciare il cibo con la forchetta invece di frullarlo.</p>`
  }
];

/* Cibi per il diario. cat: categoria; al: chiave allergene; m: età consigliata in mesi */
window.FOOD_CATS = [
  { id: "verdura", n: "Verdure", e: "🥕" },
  { id: "frutta", n: "Frutta", e: "🍎" },
  { id: "cereali", n: "Cereali e farine", e: "🌾" },
  { id: "proteine", n: "Carne, pesce, uova, legumi", e: "🍗" },
  { id: "latticini", n: "Latticini", e: "🧀" },
  { id: "allergeni", n: "Altri allergeni", e: "⚠️" }
];

window.FOODS = [
  ["carota", "Carota", "verdura"], ["zucca", "Zucca", "verdura"], ["patata", "Patata", "verdura"], ["patata-dolce", "Patata dolce", "verdura"],
  ["zucchina", "Zucchina", "verdura"], ["finocchio", "Finocchio", "verdura"], ["broccolo", "Broccolo", "verdura"], ["cavolfiore", "Cavolfiore", "verdura"],
  ["fagiolini", "Fagiolini", "verdura"], ["piselli", "Piselli", "verdura"], ["porro", "Porro", "verdura"], ["spinaci", "Spinaci", "verdura"],
  ["bietola", "Bietola", "verdura"], ["pomodoro", "Pomodoro", "verdura"], ["melanzana", "Melanzana", "verdura"], ["peperone", "Peperone", "verdura"],
  ["asparagi", "Asparagi", "verdura"], ["verza", "Verza / cavolo", "verdura"], ["carciofo", "Carciofo", "verdura"], ["barbabietola", "Barbabietola", "verdura"],
  ["sedano", "Sedano", "verdura", "sedano"],
  ["mela", "Mela", "frutta"], ["pera", "Pera", "frutta"], ["banana", "Banana", "frutta"], ["cachi", "Cachi", "frutta"], ["avocado", "Avocado", "frutta"],
  ["pesca", "Pesca", "frutta"], ["albicocca", "Albicocca", "frutta"], ["prugna", "Prugna", "frutta"], ["kiwi", "Kiwi", "frutta"],
  ["agrumi", "Arancia / mandarino", "frutta"], ["fragole", "Fragole", "frutta"], ["mirtilli", "Mirtilli (schiacciati)", "frutta"],
  ["uva", "Uva (in quarti)", "frutta"], ["melone", "Melone", "frutta"], ["anguria", "Anguria", "frutta"], ["mango", "Mango", "frutta"],
  ["riso", "Riso", "cereali"], ["mais", "Mais / polenta", "cereali"], ["tapioca", "Tapioca", "cereali"], ["miglio", "Miglio", "cereali"],
  ["quinoa", "Quinoa", "cereali"], ["avena", "Avena", "cereali", "glutine"], ["grano", "Pasta / semolino (grano)", "cereali", "glutine"],
  ["pane", "Pane", "cereali", "glutine"], ["orzo", "Orzo", "cereali", "glutine"], ["farro", "Farro", "cereali", "glutine"],
  ["tacchino", "Tacchino", "proteine"], ["pollo", "Pollo", "proteine"], ["coniglio", "Coniglio", "proteine"], ["manzo", "Manzo / vitello", "proteine"],
  ["maiale", "Maiale (magro)", "proteine"], ["agnello", "Agnello", "proteine"],
  ["merluzzo", "Merluzzo / nasello", "proteine", "pesce"], ["platessa", "Platessa / sogliola", "proteine", "pesce"],
  ["orata", "Orata / branzino", "proteine", "pesce"], ["salmone", "Salmone", "proteine", "pesce"], ["trota", "Trota", "proteine", "pesce"],
  ["uovo", "Uovo (ben cotto)", "proteine", "uovo"], ["lenticchie", "Lenticchie", "proteine"], ["ceci", "Ceci", "proteine"], ["fagioli", "Fagioli", "proteine"],
  ["tofu", "Tofu", "proteine", "soia"],
  ["yogurt", "Yogurt intero", "latticini", "latte"], ["ricotta", "Ricotta", "latticini", "latte"], ["parmigiano", "Parmigiano", "latticini", "latte"],
  ["mozzarella", "Mozzarella", "latticini", "latte"], ["burro", "Burro", "latticini", "latte"],
  ["arachidi", "Crema di arachidi", "allergeni", "arachidi"], ["frutta-guscio", "Creme di mandorle / nocciole", "allergeni", "frutta-guscio"],
  ["sesamo", "Sesamo / tahina", "allergeni", "sesamo"], ["crostacei", "Gamberi / crostacei", "allergeni", "crostacei"],
  ["molluschi", "Calamari / cozze", "allergeni", "molluschi"]
].map(([id, n, cat, al]) => ({ id, n, cat, al: al || null }));

/* Allergeni principali da tenere sotto controllo nel diario */
window.KEY_ALLERGENS = ["latte", "uovo", "glutine", "pesce", "arachidi", "frutta-guscio", "sesamo", "soia"];

/* Consigli del giorno: min/max età in mesi, cat categoria */
window.TIPS = [
  { min: 4, max: 6, cat: "Svezzamento", t: "Prima di iniziare, prepara il seggiolone: schiena dritta, piedi appoggiati. Un bimbo ben seduto mangia meglio e in sicurezza." },
  { min: 4, max: 6, cat: "Svezzamento", t: "Fallo sedere al tavolo con voi durante i pasti, anche solo con un giochino: imparerà che a tavola si sta insieme." },
  { min: 4, max: 7, cat: "Svezzamento", t: "Comprate un set di cucchiaini morbidi e un bicchiere piccolo: niente di più serve per iniziare." },
  { min: 5, max: 7, cat: "Sicurezza", t: "Cercate un corso di disostruzione pediatrica nella vostra zona: un paio d'ore che danno tanta serenità a tutta la famiglia." },
  { min: 6, max: 12, cat: "Svezzamento", t: "Un cibo rifiutato non è bocciato: possono servire 8-15 assaggi. Riproponilo con calma, magari in forma diversa." },
  { min: 6, max: 12, cat: "Svezzamento", t: "Il bimbo ha finito quando gira la testa, chiude la bocca o spinge via il cucchiaio. Fidati dei suoi segnali." },
  { min: 6, max: 12, cat: "Svezzamento", t: "Pasticciare è imparare: toccare e schiacciare il cibo lo aiuta ad accettare consistenze nuove." },
  { min: 6, max: 12, cat: "Svezzamento", t: "Olio extravergine d'oliva a crudo in ogni pappa: grassi buoni e più sapore, senza sale." },
  { min: 6, max: 12, cat: "Svezzamento", t: "Erbe e spezie delicate come basilico, prezzemolo, rosmarino e cannella aiutano a dare sapore senza sale." },
  { min: 6, max: 12, cat: "Svezzamento", t: "Una volta introdotto un allergene, continua a offrirlo 1-2 volte a settimana: la regolarità aiuta a mantenere la tolleranza." },
  { min: 6, max: 10, cat: "Svezzamento", t: "Non restare troppo a lungo sulle pappe lisce: da 7-8 mesi prova a schiacciare con la forchetta invece di frullare." },
  { min: 6, max: 24, cat: "Svezzamento", t: "Mangiate insieme quando potete: il bimbo impara copiando voi, anche a mangiare le verdure!" },
  { min: 6, max: 12, cat: "Svezzamento", t: "Un po' d'acqua nel bicchiere a ogni pasto: all'inizio ne berrà pochissima, ma è un ottimo allenamento." },
  { min: 6, max: 24, cat: "Salute", t: "I primi dentini arrivano spesso tra i 6 e i 10 mesi. Dal primo dente lavalo due volte al giorno con una traccia di dentifricio al fluoro, quanto un chicco di riso." },
  { min: 5, max: 12, cat: "Salute", t: "Per le gengive doloranti va bene un massaggio con il dito pulito, o un anello da dentizione raffreddato in frigo (non in freezer)." },
  { min: 4, max: 12, cat: "Sicurezza", t: "Nanna sicura: fino a 12 mesi sempre a pancia in su, nel suo lettino, senza cuscini, paracolpi o peluche." },
  { min: 5, max: 10, cat: "Sicurezza", t: "Prima che inizi a gattonare, mettiti alla sua altezza e cerca i pericoli: prese, cavi, cassetti, detersivi, angoli dei tavoli, piante." },
  { min: 7, max: 18, cat: "Sicurezza", t: "Cancelletti per le scale, blocca-cassetti e detersivi in alto: è ora di mettere la casa a prova di esploratore." },
  { min: 4, max: 24, cat: "Sicurezza", t: "In auto il seggiolino rivolto all'indietro è il più sicuro: tienilo così il più a lungo possibile, nei limiti del modello." },
  { min: 4, max: 24, cat: "Crescita", t: "Leggete un libro insieme ogni giorno, anche solo per pochi minuti: è il regalo più grande per il suo linguaggio (Nati per Leggere)." },
  { min: 4, max: 24, cat: "Crescita", t: "Niente schermi prima dei 2 anni, compresa la tv accesa in sottofondo: i pediatri lo raccomandano per il linguaggio e l'attenzione." },
  { min: 4, max: 12, cat: "Crescita", t: "Parlagli di ciò che fai («Ora prendiamo il body blu, ecco la manica!»): si chiama parlato narrato ed è una palestra per il linguaggio." },
  { min: 4, max: 24, cat: "Crescita", t: "Se in famiglia parlate dialetto o un'altra lingua, usatela pure con lui: crescere con più lingue è una ricchezza, non crea confusione." },
  { min: 4, max: 24, cat: "Crescita", t: "Il gioco libero sul tappeto, senza troppi giocattoli, vale moltissimo: lascialo esplorare e osserva cosa lo incuriosisce." },
  { min: 4, max: 24, cat: "Crescita", t: "Cantare insieme stimola linguaggio, ritmo e legame affettivo. Non serve essere intonati: per lui la tua è la voce più bella." },
  { min: 4, max: 24, cat: "Crescita", t: "Stare all'aria aperta ogni giorno, anche in autunno e in inverno ben coperti, fa bene a sonno, umore e curiosità." },
  { min: 6, max: 18, cat: "Crescita", t: "Verso gli 8 mesi può comparire la paura degli estranei: è una tappa normale. Dai tempo e resta vicino quando conosce persone nuove." },
  { min: 4, max: 24, cat: "Genitori", t: "Prenditi cura anche di te: chiedere aiuto a partner, nonni o amici non è debolezza, è organizzazione." },
  { min: 4, max: 24, cat: "Genitori", t: "Ogni bambino ha i suoi tempi: evita i confronti con gli altri bambini. Se hai un dubbio, il pediatra è lì per te." },
  { min: 4, max: 24, cat: "Genitori", t: "Il consultorio familiare offre gratuitamente sostegno all'allattamento e incontri per neogenitori: trovi i contatti nella sezione Eventi." }
];

/* Tappe dello sviluppo: indicative, ogni bambino ha i suoi tempi */
window.MILESTONES = [
  { min: 4, max: 6, t: "4-6 mesi", items: [
    "Si gira dalla pancia alla schiena e viceversa",
    "A pancia in giù si solleva sulle braccia",
    "Afferra gli oggetti e li porta alla bocca",
    "Ride, fa versi e inizia la lallazione («a-gu», «ba»)",
    "Riconosce le persone familiari e reagisce al suo nome"
  ]},
  { min: 6, max: 9, t: "6-9 mesi", items: [
    "Sta seduto da solo, prima con appoggio e poi senza",
    "Passa un oggetto da una mano all'altra",
    "Striscia o gattona (non tutti gattonano, ed è normale)",
    "Ripete sillabe: «ba-ba», «da-da», «ma-ma»",
    "Cerca un gioco nascosto sotto un panno",
    "Può avere paura degli estranei"
  ]},
  { min: 9, max: 12, t: "9-12 mesi", items: [
    "Si tira su in piedi aggrappandosi ai mobili",
    "Cammina tenendosi al divano o con le mani",
    "Prende piccoli pezzi con pollice e indice (pinza)",
    "Indica le cose, fa «ciao» e batte le mani",
    "Capisce parole semplici e il «no»",
    "Verso i 12 mesi possono arrivare le prime parole"
  ]},
  { min: 12, max: 18, t: "12-18 mesi", items: [
    "Cammina da solo (in media tra i 12 e i 15 mesi, ma anche fino ai 18)",
    "Dice alcune parole e capisce molto di più",
    "Imita i gesti dei grandi (telefono, spazzola)",
    "Beve dal bicchiere e prova a usare il cucchiaio",
    "Indica quello che vuole"
  ]},
  { min: 18, max: 30, t: "18-24 mesi", items: [
    "Corre, sale le scale tenendosi",
    "Il vocabolario cresce velocemente",
    "Verso i 2 anni unisce due parole («pappa no», «mamma qua»)",
    "Fa i primi giochi di finzione (dar da mangiare alla bambola)",
    "Costruisce torri di qualche cubo"
  ]}
];
