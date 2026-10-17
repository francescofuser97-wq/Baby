/* Ricette per lo svezzamento (approccio misto: versione pappa + versione a pezzi).
   Campi: id, t titolo, e emoji, m età minima in mesi, cat categoria, min minuti,
   seasons stagioni ([] = tutto l'anno), al allergeni, ing ingredienti, steps,
   pappa / pezzi = come adattarla, tip consiglio, store conservazione. */
window.RECIPES = [
  {
    id: "brodo-vegetale", t: "Brodo vegetale di base", e: "🥕", m: 6, cat: "base", min: 60, seasons: [], al: ["sedano"],
    ing: ["1 patata", "1 carota", "1 zucchina (in autunno anche un pezzo di zucca)", "½ costa di sedano (facoltativa)", "1 litro d'acqua", "Niente sale e niente dado"],
    steps: [
      "Lava e sbuccia le verdure, poi tagliale a pezzi grossi.",
      "Mettile in una pentola con l'acqua fredda e porta a bollore.",
      "Abbassa la fiamma, copri e cuoci per 45-60 minuti.",
      "Filtra il brodo e tieni da parte le verdure: serviranno per la pappa o come primi pezzi."
    ],
    pappa: "Frulla o passa al passaverdure 2-3 cucchiai delle verdure cotte e aggiungile alla pappa.",
    pezzi: "Carota, zucchina e patata ben cotte, tagliate a bastoncini lunghi come un dito adulto, sono perfette come primi pezzi da afferrare.",
    tip: "Cambia spesso le verdure seguendo la stagione: abituare il bimbo a sapori diversi fin da subito lo aiuterà ad accettare più cibi in futuro.",
    store: "In frigo in un vasetto chiuso fino a 2 giorni. In freezer, nelle vaschette per il ghiaccio, fino a 1 mese."
  },
  {
    id: "prima-pappa", t: "La prima pappa: crema di riso e verdure", e: "🥣", m: 6, cat: "pappa", min: 10, seasons: [], al: ["latte"],
    ing: ["180-200 ml di brodo vegetale caldo", "2-3 cucchiai di crema di riso (o di mais e tapioca)", "2-3 cucchiai di verdure del brodo passate", "1 cucchiaino di olio extravergine d'oliva a crudo", "1 cucchiaino di parmigiano (dopo i primi giorni, facoltativo)"],
    steps: [
      "Versa la crema di riso a pioggia nel brodo caldo, mescolando per non fare grumi.",
      "Aggiungi le verdure passate e mescola.",
      "Condisci con l'olio a crudo (e il parmigiano, se già introdotto).",
      "Controlla la temperatura sul dorso della mano: deve essere tiepida."
    ],
    pappa: "Le prime volte bastano pochi cucchiaini: è una scoperta, non un pasto da finire. Puoi dare al bimbo un cucchiaino già carico da tenere in mano.",
    pezzi: "Accanto alla pappa metti un bastoncino morbido di carota o zucchina del brodo: così esplora anche con le mani.",
    tip: "Scegli un momento sereno, quando non ha troppa fame né sonno. Se rifiuta, nessun problema: riprova nei giorni seguenti.",
    store: "Meglio prepararla al momento.",
    videos: [{ id: "5ioVNLjey58", t: "Come si fa lo svezzamento: preparare la prima pappa", src: "Tutorial video" }]
  },
  {
    id: "zucca-mais", t: "Pappa di zucca con crema di mais e tapioca", e: "🎃", m: 6, cat: "pappa", min: 30, seasons: ["autunno", "inverno"], al: [],
    ing: ["100 g di zucca (delica o mantovana)", "1 patata piccola", "180 ml di brodo vegetale", "2 cucchiai di crema di mais e tapioca", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Taglia zucca e patata a cubetti e cuocile a vapore o nel brodo per 15-20 minuti.",
      "Frullale con un po' di brodo fino a ottenere una crema liscia.",
      "Sciogli la crema di mais e tapioca nel brodo caldo rimasto.",
      "Unisci tutto e condisci con l'olio a crudo."
    ],
    pappa: "Liscia all'inizio. Dopo qualche settimana schiaccia la zucca con la forchetta invece di frullarla, per abituarlo ai grumi.",
    pezzi: "Spicchi di zucca al forno (200 °C, 25-30 minuti, con un filo d'olio e senza sale), tagliati a bastoncino: devono schiacciarsi facilmente tra pollice e indice.",
    tip: "La zucca è dolce e piace quasi a tutti: è ottima per i primi giorni. La crema di mais e tapioca non contiene glutine.",
    store: "Purea di zucca in freezer, a cubetti, fino a 1 mese."
  },
  {
    id: "patata-dolce", t: "Patata dolce: purè o bastoncini al forno", e: "🍠", m: 6, cat: "pezzi", min: 35, seasons: ["autunno", "inverno"], al: [],
    ing: ["1 patata dolce (batata) media", "1 cucchiaino di olio extravergine d'oliva", "Un pizzico di cannella (facoltativo)"],
    steps: [
      "Lava bene la patata dolce e sbucciala.",
      "Per il purè: cuocila a cubetti a vapore per 15 minuti.",
      "Per i bastoncini: tagliala a bastoncini spessi circa 1,5 cm, spennellali d'olio e cuocili in forno a 200 °C per 20-25 minuti.",
      "Controlla che siano morbidi dentro e lasciali intiepidire."
    ],
    pappa: "Schiaccia con la forchetta e allunga con un po' di latte (materno o formula) o di brodo.",
    pezzi: "I bastoncini sono perfetti per la presa a pugno dei 6 mesi: il bimbo li impugna e mangia la parte che sporge.",
    tip: "È ricca di beta-carotene e il suo sapore dolce piace molto. Una spezia delicata come la cannella è un modo per allargare i sapori senza sale né zucchero.",
    store: "Cotta, in frigo 2 giorni. Il purè si congela bene."
  },
  {
    id: "mela-pera", t: "Mela e pera cotte al vapore", e: "🍐", m: 6, cat: "merenda", min: 15, seasons: [], al: [],
    ing: ["1 mela o 1 pera", "Un pizzico di cannella (facoltativo)"],
    steps: [
      "Sbuccia il frutto, togli il torsolo e taglialo in 4-6 spicchi.",
      "Cuoci a vapore per 8-12 minuti finché è morbido.",
      "Lascia intiepidire."
    ],
    pappa: "Schiaccia con la forchetta o frulla. Se il frutto è maturo, puoi anche grattugiarlo crudo finemente.",
    pezzi: "Offri gli spicchi cotti interi: devono essere abbastanza morbidi da schiacciarsi tra le dita.",
    tip: "La mela cruda a pezzi è dura e può andare di traverso: crudo solo grattugiata finemente, finché il bimbo non mastica bene.",
    store: "In frigo 2 giorni; la purea si congela."
  },
  {
    id: "banana", t: "Banana schiacciata o «con la maniglia»", e: "🍌", m: 6, cat: "merenda", min: 2, seasons: [], al: [],
    ing: ["1 banana ben matura"],
    steps: [
      "Lava la buccia e taglia la banana a metà.",
      "Togli la buccia solo per metà, lasciando l'altra parte come impugnatura."
    ],
    pappa: "Schiacciala con la forchetta, da sola o mescolata a yogurt o ricotta.",
    pezzi: "Offri la banana «con la maniglia», oppure premi con un dito sulla punta per dividerla per lungo nei suoi tre spicchi naturali.",
    tip: "Se gli scivola dalle mani, rotola i pezzi in un po' di fiocchi d'avena frullati: così si afferrano meglio.",
    store: "Da preparare al momento: annerisce in fretta."
  },
  {
    id: "cachi-yogurt", t: "Cachi e yogurt", e: "🟠", m: 6, cat: "merenda", min: 3, seasons: ["autunno"], al: ["latte"],
    ing: ["½ caco morbido e maturo (tipo loto o vaniglia)", "2-3 cucchiai di yogurt intero bianco, senza zucchero"],
    steps: [
      "Taglia il caco e scava la polpa con il cucchiaino.",
      "Elimina semi e parti fibrose.",
      "Mescola la polpa con lo yogurt."
    ],
    pappa: "Così com'è: cremosa e dolce.",
    pezzi: "Dai al bimbo un cucchiaino già carico da portare alla bocca da solo. Evita il caco mela, che è sodo e croccante.",
    tip: "In Veneto ottobre e novembre sono il periodo dei cachi: un frutto di stagione e del territorio. Lo yogurt intero va bene da 6 mesi.",
    store: "Da preparare al momento."
  },
  {
    id: "lenticchie-rosse", t: "Crema di lenticchie rosse e carote", e: "🫘", m: 6, cat: "pappa", min: 25, seasons: [], al: [],
    ing: ["15 g di lenticchie rosse decorticate secche (circa 1 cucchiaio e mezzo)", "1 carota", "1 patata piccola", "Acqua o brodo vegetale", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Sciacqua le lenticchie: quelle decorticate non hanno bisogno di ammollo.",
      "Cuocile con carota e patata a pezzi, coperte d'acqua, per 15-20 minuti, finché si sfaldano.",
      "Frulla tutto aggiungendo acqua o brodo fino alla consistenza giusta.",
      "Condisci con l'olio a crudo."
    ],
    pappa: "Ottima anche mescolata a 2 cucchiai di crema di riso al posto della carne.",
    pezzi: "Prepara una crema più densa e spalmala su un bastoncino di pane tostato, oppure prova le polpettine di lenticchie.",
    tip: "Le lenticchie rosse senza buccia sono digeribili e ricche di ferro. Abbinale a frutta o verdura ricche di vitamina C (agrumi, kiwi, broccoli, pomodoro): aiuta ad assorbire il ferro.",
    store: "In frigo 2 giorni. In freezer a cubetti fino a 1 mese."
  },
  {
    id: "tacchino-zucchine", t: "Pappa con tacchino e zucchine", e: "🦃", m: 6, cat: "pappa", min: 25, seasons: [], al: [],
    ing: ["20-30 g di fesa di tacchino o petto di pollo", "1 zucchina", "180 ml di brodo vegetale", "2 cucchiai di crema di riso", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Cuoci la carne a vapore o nel brodo per circa 15 minuti, finché è ben cotta.",
      "Frullala molto finemente con un po' di brodo, fino a ottenere una crema liscia (come un omogeneizzato).",
      "Prepara la crema di riso nel brodo e aggiungi la zucchina cotta e passata.",
      "Unisci la carne e condisci con l'olio a crudo."
    ],
    pappa: "Le prime volte frulla benissimo la carne; poi passa al trito fine.",
    pezzi: "Striscioline di carne cotta morbida, grandi come un dito: il bimbo le succhia e ne sente il sapore. Più avanti, polpettine morbide.",
    tip: "La carne fresca fatta in casa è ottima, ma gli omogeneizzati del negozio vanno benissimo nei giorni di corsa: nessun senso di colpa!",
    store: "Carne cotta in frigo 1-2 giorni. Frullata, in freezer fino a 1 mese."
  },
  {
    id: "merluzzo-patate", t: "Merluzzo con patate e zucchine", e: "🐟", m: 6, cat: "pappa", min: 25, seasons: [], al: ["pesce"],
    ing: ["30-40 g di filetto di merluzzo o nasello (va bene anche surgelato)", "1 patata", "1 zucchina", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Cuoci patata e zucchina a vapore per 12-15 minuti.",
      "Negli ultimi 8-10 minuti aggiungi il pesce nel cestello.",
      "Sbriciola il pesce con le dita per controllare che non ci siano lische.",
      "Schiaccia o frulla tutto e condisci con l'olio."
    ],
    pappa: "Frullato liscio le prime volte, poi schiacciato con la forchetta.",
    pezzi: "Il pesce cotto si sfalda in scaglie morbide: offrine pezzetti (dopo aver controllato le lische) insieme a bastoncini di patata e zucchina.",
    tip: "Pesci adatti: merluzzo, nasello, platessa, sogliola, orata, branzino, trota, salmone. Evita pesce spada, squalo/verdesca, tonno fresco e luccio, per il mercurio.",
    store: "Cotto, in frigo 1 giorno. Meglio prepararlo al momento."
  },
  {
    id: "pastina-brodo", t: "Pastina in brodo vegetale (primo glutine)", e: "🍝", m: 6, cat: "pappa", min: 10, seasons: [], al: ["glutine", "latte"],
    ing: ["180 ml di brodo vegetale", "2 cucchiai di pastina piccola (stelline, puntine) o di semolino", "2 cucchiai di verdure passate", "1 cucchiaino di olio extravergine d'oliva", "1 cucchiaino di parmigiano"],
    steps: [
      "Porta a bollore il brodo e cuoci la pastina 1-2 minuti in più di quanto scritto sulla confezione, così è ben morbida.",
      "Aggiungi le verdure passate.",
      "Condisci con olio e parmigiano."
    ],
    pappa: "Pastina piccolissima o semolino: consistenza vellutata ma non del tutto liscia.",
    pezzi: "Pasta corta grande (fusilli, penne rigate) cotta molto morbida: si afferra bene con la mano.",
    tip: "Il glutine si introduce dai primi mesi di svezzamento, all'inizio in piccole quantità, e poi si continua a offrirlo regolarmente. Rimandarlo non serve a prevenire la celiachia.",
    store: "Da preparare al momento."
  },
  {
    id: "frittatina-forno", t: "Frittatina al forno a striscioline", e: "🍳", m: 6, cat: "pezzi", min: 20, seasons: [], al: ["uovo"],
    ing: ["1 uovo", "2 cucchiai di verdure cotte schiacciate (zucchina, carota o un po' di spinaci)", "1 cucchiaio di latte materno o formula (facoltativo)", "Qualche goccia d'olio per la teglia"],
    steps: [
      "Sbatti l'uovo con le verdure e il latte.",
      "Versa in un pirottino o in una teglia piccola unta d'olio.",
      "Cuoci in forno a 180 °C per 15 minuti, finché è completamente rappresa.",
      "Lascia intiepidire e taglia a striscioline larghe 1-2 cm."
    ],
    pappa: "Sbriciolala finemente nella pappa di verdure o schiacciala con le verdure.",
    pezzi: "Le striscioline si impugnano bene e sono morbide da masticare con le gengive.",
    tip: "L'uovo va sempre ben cotto, mai crudo o con il tuorlo liquido. La prima volta offrine poco, di mattina o a pranzo, per poterlo osservare nelle ore successive.",
    store: "In frigo fino a 1 giorno."
  },
  {
    id: "ricotta-pera", t: "Ricotta e pera", e: "🧀", m: 6, cat: "merenda", min: 5, seasons: [], al: ["latte"],
    ing: ["2 cucchiai di ricotta vaccina fresca", "½ pera matura (o cotta al vapore)"],
    steps: [
      "Schiaccia la pera con la forchetta.",
      "Mescola con la ricotta fino a ottenere una crema."
    ],
    pappa: "Una merenda cremosa e delicata.",
    pezzi: "Spalma la ricotta su un bastoncino di pane tostato e offri accanto spicchi di pera cotta.",
    tip: "La ricotta è un latticino fresco con poco sale: ottimo da introdurre presto.",
    store: "Da preparare al momento."
  },
  {
    id: "avocado", t: "Avocado: crema o spicchi", e: "🥑", m: 6, cat: "merenda", min: 3, seasons: [], al: [],
    ing: ["¼ di avocado ben maturo", "Qualche goccia di limone (facoltativo)", "½ banana (facoltativo)"],
    steps: [
      "Taglia l'avocado a metà, togli il nocciolo e la buccia.",
      "Per la crema schiaccialo con la forchetta, anche insieme alla banana."
    ],
    pappa: "Crema liscia, da sola o con banana.",
    pezzi: "Spicchi spessi. Se scivolano, rotolali nei fiocchi d'avena frullati: si afferrano meglio.",
    tip: "Contiene grassi buoni e ha una consistenza morbidissima: perfetto per i primi pezzi.",
    store: "Da preparare al momento."
  },
  {
    id: "broccoli-alberelli", t: "Broccoli «alberelli» al vapore", e: "🥦", m: 6, cat: "pezzi", min: 12, seasons: ["autunno", "inverno"], al: [],
    ing: ["Qualche cimetta di broccolo con un pezzo di gambo", "1 patata (per la crema)", "Olio extravergine d'oliva"],
    steps: [
      "Lava le cimette lasciando un pezzo di gambo come manico.",
      "Cuoci a vapore per 8-10 minuti, finché anche il gambo è morbido.",
      "Condisci con un filo d'olio."
    ],
    pappa: "Frulla i broccoli con la patata lessa e un cucchiaino d'olio: diventa una crema verde.",
    pezzi: "Gli «alberelli» si tengono per il gambo: il bimbo morde la parte morbida in cima.",
    tip: "I broccoli sono ricchi di vitamina C, che aiuta ad assorbire il ferro di legumi e cereali.",
    store: "Cotti, in frigo 1-2 giorni."
  },
  {
    id: "porridge-mela", t: "Pappa del mattino: avena e mela", e: "🌾", m: 6, cat: "colazione", min: 8, seasons: [], al: ["glutine"],
    ing: ["2 cucchiai di fiocchi d'avena piccoli (o crema di avena per bambini)", "80-100 ml d'acqua", "2-3 cucchiai di latte materno o formula già preparata", "½ mela grattugiata finemente"],
    steps: [
      "Cuoci i fiocchi d'avena nell'acqua per 3-5 minuti, mescolando.",
      "Togli dal fuoco e lascia intiepidire.",
      "Aggiungi il latte e la mela grattugiata."
    ],
    pappa: "Più liquida all'inizio, poi sempre più densa.",
    pezzi: "Cuoci il porridge più denso, stendilo in un piatto, lascialo rassodare e taglialo a quadrotti da prendere con le mani.",
    tip: "Il latte materno o la formula si aggiungono a fine cottura, senza farli bollire. L'avena può contenere glutine.",
    store: "Da preparare al momento."
  },
  {
    id: "yogurt-arachidi", t: "Yogurt con crema di arachidi (per introdurre le arachidi)", e: "🥜", m: 6, cat: "merenda", min: 3, seasons: [], al: ["arachidi", "latte"],
    ing: ["3 cucchiai di yogurt intero bianco", "¼ di cucchiaino di crema di arachidi 100% liscia (senza zucchero, sale o olio di palma)", "1 cucchiaio d'acqua tiepida"],
    steps: [
      "Sciogli la crema di arachidi nell'acqua tiepida.",
      "Mescolala bene con lo yogurt."
    ],
    pappa: "La prima volta offrine una piccola quantità. Se va tutto bene, nelle volte successive arriva gradualmente a 1 cucchiaino di crema.",
    pezzi: "Più avanti puoi spalmarne uno strato sottilissimo su un bastoncino di pane tostato.",
    tip: "Mai arachidi intere o a pezzi prima dei 4-5 anni, e mai crema densa da sola sul cucchiaio: si attacca al palato. Una volta introdotte, offrile 1-2 volte a settimana per mantenere la tolleranza. Se in famiglia ci sono allergie, parlane prima col pediatra.",
    store: "Da preparare al momento."
  },
  {
    id: "risotto-zucca", t: "Risottino morbido alla zucca", e: "🍚", m: 7, cat: "famiglia", min: 30, seasons: ["autunno", "inverno"], al: ["latte"],
    ing: ["30 g di riso (il Vialone Nano veneto è perfetto)", "80 g di zucca", "Brodo vegetale caldo", "1 cucchiaino di olio extravergine d'oliva", "1 cucchiaino di parmigiano"],
    steps: [
      "Cuoci la zucca a cubetti in un pentolino con un filo d'olio e un mestolo di brodo per 5 minuti.",
      "Aggiungi il riso e cuoci 20-25 minuti (più del solito), aggiungendo brodo un po' alla volta.",
      "Quando è molto cremoso, manteca fuori dal fuoco con parmigiano e olio."
    ],
    pappa: "Frullalo in parte (o tutto, le prime volte) per una consistenza cremosa con qualche chicco.",
    pezzi: "Con il risotto ben colloso forma delle palline grandi come una noce: si afferrano facilmente.",
    tip: "Se lo cucini per tutta la famiglia, metti da parte la porzione del bimbo prima di aggiungere il sale.",
    store: "In frigo 1 giorno."
  },
  {
    id: "polpettine-lenticchie", t: "Polpettine di lenticchie e carote al forno", e: "🧆", m: 7, cat: "pezzi", min: 35, seasons: [], al: ["glutine", "latte"],
    ing: ["100 g di lenticchie rosse cotte e ben scolate", "1 carota grattugiata e cotta al vapore", "2-3 cucchiai di fiocchi d'avena frullati", "1 cucchiaio di parmigiano (facoltativo)", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Schiaccia le lenticchie e mescolale con carota, avena e parmigiano.",
      "Se l'impasto è troppo morbido aggiungi altra avena.",
      "Forma polpettine allungate, a forma di dito.",
      "Cuoci su carta forno a 180 °C per 15-20 minuti."
    ],
    pappa: "Sbriciolale nel brodo vegetale o schiacciale con un po' di yogurt.",
    pezzi: "La forma allungata è perfetta per la presa a pugno.",
    tip: "Preparane il doppio e congelale: sono un pasto salva-serata.",
    store: "In frigo 2 giorni. Crude o cotte in freezer fino a 1 mese."
  },
  {
    id: "pancake-banana", t: "Pancake di banana e uovo", e: "🥞", m: 7, cat: "colazione", min: 15, seasons: [], al: ["uovo", "glutine"],
    ing: ["1 banana matura", "1 uovo", "2 cucchiai di fiocchi d'avena frullati (facoltativi)", "Qualche goccia d'olio per la padella"],
    steps: [
      "Schiaccia la banana e sbattila con l'uovo (e l'avena).",
      "Scalda una padella antiaderente appena unta.",
      "Versa piccole cucchiaiate di impasto e cuoci 2-3 minuti per lato, finché sono ben cotti anche al centro."
    ],
    pappa: "Sbriciolati nello yogurt.",
    pezzi: "Tagliati a strisce: sono morbidi e si sciolgono in bocca.",
    tip: "Niente zucchero: la dolcezza arriva dalla banana. Senza avena la ricetta è senza glutine.",
    store: "In frigo 1 giorno. Si congelano bene, separati da carta forno."
  },
  {
    id: "hummus", t: "Hummus senza sale (ceci e sesamo)", e: "🫛", m: 7, cat: "pezzi", min: 10, seasons: [], al: ["sesamo"],
    ing: ["200 g di ceci cotti (se in barattolo, senza sale aggiunto e ben sciacquati)", "1 cucchiaio di tahina (crema di sesamo)", "Il succo di ½ limone", "2 cucchiai di olio extravergine d'oliva", "Acqua q.b."],
    steps: [
      "Metti tutto nel frullatore.",
      "Frulla aggiungendo acqua fino a ottenere una crema liscia."
    ],
    pappa: "Un cucchiaio di hummus mescolato alla crema di verdure o alla pappa di cereali.",
    pezzi: "Spalmato su un bastoncino di pane tostato, oppure come salsa per bastoncini di verdure cotte.",
    tip: "La tahina è un modo semplice per introdurre il sesamo, uno degli allergeni.",
    store: "In frigo fino a 2 giorni. Si congela in piccole porzioni."
  },
  {
    id: "fusilli-pomodoro", t: "Fusilli al pomodoro e ricotta", e: "🍅", m: 7, cat: "famiglia", min: 15, seasons: [], al: ["glutine", "latte"],
    ing: ["30-40 g di pasta corta (fusilli o penne)", "3-4 cucchiai di passata di pomodoro", "1 cucchiaio di ricotta", "1 cucchiaino di olio extravergine d'oliva", "Qualche foglia di basilico"],
    steps: [
      "Cuoci la passata 10 minuti con olio e basilico, senza sale.",
      "Cuoci la pasta 2 minuti in più del normale.",
      "Togli il basilico e condisci la pasta con sugo e ricotta."
    ],
    pappa: "Trita la pasta (o usa pastina piccola) e mescola con il sugo.",
    pezzi: "Fusilli interi: la forma a spirale trattiene il sugo e si impugna bene.",
    tip: "Il pomodoro può arrossare la pelle intorno alla bocca: è un'irritazione da acidità, di solito non un'allergia. Se compaiono altri sintomi, parlane col pediatra.",
    store: "Il sugo si conserva in frigo 2 giorni e si congela."
  },
  {
    id: "salmone-pure", t: "Salmone al forno con purè di patate", e: "🍣", m: 7, cat: "pappa", min: 25, seasons: [], al: ["pesce"],
    ing: ["40 g di filetto di salmone (fresco o surgelato)", "1 patata", "2-3 cucchiai di latte materno o formula (o acqua di cottura)", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Cuoci il salmone al cartoccio in forno a 180 °C per 12-15 minuti.",
      "Lessa la patata e schiacciala con il latte e l'olio.",
      "Sbriciola il salmone con le dita per togliere eventuali lische."
    ],
    pappa: "Unisci il salmone al purè e schiaccia tutto insieme.",
    pezzi: "Scaglie di salmone e bastoncini di patata lessa.",
    tip: "Il salmone contiene grassi omega-3, importanti per lo sviluppo del cervello e della vista.",
    store: "Cotto, in frigo 1 giorno."
  },
  {
    id: "gnocchetti-ricotta", t: "Gnocchetti morbidi di ricotta e spinaci", e: "🥬", m: 8, cat: "pezzi", min: 25, seasons: [], al: ["latte", "glutine"],
    ing: ["125 g di ricotta", "50 g di spinaci cotti, strizzati e tritati", "3-4 cucchiai di farina 00 (o di riso, per una versione senza glutine)", "1 cucchiaio di parmigiano"],
    steps: [
      "Mescola ricotta, spinaci e parmigiano.",
      "Aggiungi la farina poco alla volta, finché l'impasto non si attacca più alle mani.",
      "Forma dei cilindri e tagliali in gnocchetti lunghi 4-5 cm.",
      "Cuocili in acqua bollente non salata: quando salgono a galla, aspetta 1 minuto e scolali."
    ],
    pappa: "Schiacciali con la forchetta e condiscili con un filo d'olio.",
    pezzi: "Gnocchetti interi, conditi con olio o con un velo di sugo di pomodoro.",
    tip: "Spinaci e bietole: nel primo anno offrili in piccole quantità, cotti e mangiati subito, senza riscaldarli.",
    store: "Crudi, si congelano su un vassoio e poi si mettono in un sacchetto."
  },
  {
    id: "polenta-ragu", t: "Polenta morbida con ragù bianco", e: "🌽", m: 8, cat: "famiglia", min: 40, seasons: ["autunno", "inverno"], al: ["sedano"],
    ing: ["30 g di farina di mais (fine o istantanea)", "250 ml d'acqua o brodo vegetale", "40 g di macinato di vitello o tacchino", "½ carota, un pezzetto di sedano e di cipolla tritati finemente", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Stufa il trito di verdure in un pentolino con l'olio e un goccio d'acqua (senza friggere).",
      "Aggiungi la carne, sgranala bene e cuoci 15-20 minuti con un po' di brodo.",
      "Prepara la polenta morbida: versa la farina a pioggia nel liquido bollente e mescola (5-8 minuti per l'istantanea, circa 40 per la classica)."
    ],
    pappa: "Polenta morbida con il ragù tritato finissimo.",
    pezzi: "Lascia rassodare la polenta in un piatto, tagliala a bastoncini e scaldala qualche minuto in forno: si tiene in mano benissimo.",
    tip: "Un piatto della tradizione vicentina che il bimbo può mangiare insieme a voi. Come sempre, metti da parte la sua porzione prima di salare.",
    store: "Ragù in frigo 2 giorni, si congela. La polenta avanzata si conserva in frigo 1-2 giorni."
  },
  {
    id: "risi-bisi", t: "Risi e bisi (riso e piselli alla veneta)", e: "🟢", m: 8, cat: "famiglia", min: 30, seasons: ["primavera", "inverno", "autunno"], al: ["latte"],
    ing: ["30 g di riso Vialone Nano", "40 g di piselli (i surgelati vanno benissimo)", "Brodo vegetale caldo", "1 cucchiaino di olio extravergine d'oliva", "1 cucchiaino di parmigiano", "Un po' di prezzemolo tritato"],
    steps: [
      "Cuoci i piselli nel brodo per 10 minuti.",
      "Passane metà al passaverdure (così togli le bucce) e rimetti la crema in pentola.",
      "Aggiungi il riso e cuocilo morbido, allungando con brodo: deve restare all'onda, quasi una minestra.",
      "Manteca con olio, parmigiano e prezzemolo."
    ],
    pappa: "Passa al passaverdure tutti i piselli e frulla brevemente il riso.",
    pezzi: "Riso cremoso da prendere col cucchiaio precaricato. I piselli interi vanno schiacciati leggermente tra le dita prima di offrirli.",
    tip: "Un classico veneto (è il piatto di San Marco), perfetto da mangiare tutti insieme.",
    store: "In frigo 1 giorno."
  },
  {
    id: "muffin-zucchine", t: "Muffin salati di zucchine", e: "🧁", m: 8, cat: "pezzi", min: 35, seasons: ["estate", "primavera", "autunno"], al: ["uovo", "glutine", "latte"],
    ing: ["1 zucchina grattugiata e strizzata", "1 uovo", "60 g di farina (00 o integrale)", "40 ml di latte (in cottura, in piccole quantità, va bene anche quello vaccino)", "1 cucchiaino raso di lievito per torte salate", "2 cucchiai di parmigiano", "1 cucchiaio di olio extravergine d'oliva"],
    steps: [
      "Sbatti l'uovo con latte e olio.",
      "Aggiungi zucchina, parmigiano, farina e lievito e mescola.",
      "Versa nei pirottini per mini muffin (circa 6-8).",
      "Cuoci in forno a 180 °C per 18-20 minuti."
    ],
    pappa: "Sbriciolati in un po' di yogurt bianco o nel brodo.",
    pezzi: "Tagliati a metà o a spicchi: morbidi e facili da mordere.",
    tip: "Perfetti da portare fuori casa per una merenda o un pranzo al sacco.",
    store: "In frigo 2 giorni, in freezer fino a 1 mese."
  },
  {
    id: "pasta-fagioli", t: "Pasta e fagioli passata", e: "🥘", m: 8, cat: "famiglia", min: 40, seasons: ["autunno", "inverno"], al: ["glutine", "sedano"],
    ing: ["60 g di fagioli borlotti cotti (senza sale)", "1 patata", "1 carota", "Un pezzetto di sedano", "Brodo vegetale", "20-30 g di ditalini", "Un rametto di rosmarino", "1 cucchiaino di olio extravergine d'oliva"],
    steps: [
      "Cuoci verdure, fagioli e rosmarino nel brodo per 20 minuti.",
      "Togli il rosmarino e passa tutto al passaverdure: così elimini le bucce dei fagioli.",
      "Rimetti sul fuoco, aggiungi i ditalini e cuocili ben morbidi.",
      "Condisci con l'olio a crudo."
    ],
    pappa: "Con pastina piccola al posto dei ditalini.",
    pezzi: "Ditalini e qualche fagiolo intero ben cotto, schiacciato leggermente tra le dita.",
    tip: "La «pasta e fasoi» è un piatto unico della tradizione veneta: legumi e cereali insieme danno proteine complete.",
    store: "In frigo 2 giorni, si congela senza la pasta."
  },
  {
    id: "hamburger-pollo", t: "Hamburger di pollo e zucchine", e: "🍗", m: 8, cat: "pezzi", min: 30, seasons: [], al: ["glutine"],
    ing: ["150 g di macinato di pollo o tacchino", "1 zucchina grattugiata e strizzata", "2 cucchiai di pangrattato", "Un po' di prezzemolo tritato"],
    steps: [
      "Impasta tutti gli ingredienti.",
      "Forma piccoli hamburger o bastoncini.",
      "Cuocili su carta forno a 200 °C per 15-18 minuti, girandoli a metà, finché sono ben cotti dentro."
    ],
    pappa: "Sbriciola e trita, poi uniscilo alla pappa di verdure.",
    pezzi: "Taglialo a strisce larghe un dito.",
    tip: "Le verdure nell'impasto lo rendono morbido e succoso, anche senza sale.",
    store: "In frigo 1 giorno. Si congelano da crudi."
  },
  {
    id: "polpette-merluzzo", t: "Polpette di merluzzo e patate", e: "🐠", m: 9, cat: "pezzi", min: 30, seasons: [], al: ["pesce", "glutine"],
    ing: ["150 g di merluzzo cotto al vapore e senza lische", "1 patata lessa", "1 cucchiaio di prezzemolo tritato", "Pangrattato q.b."],
    steps: [
      "Schiaccia insieme pesce e patata.",
      "Aggiungi prezzemolo e pangrattato finché l'impasto si lavora bene.",
      "Forma polpettine allungate e passale nel pangrattato.",
      "Cuoci in forno a 200 °C per 15 minuti."
    ],
    pappa: "Sbriciolate e schiacciate con un po' di verdura.",
    pezzi: "Intere: morbide dentro e appena dorate fuori.",
    tip: "Il pesce andrebbe offerto 2-3 volte a settimana: queste polpette sono un modo comodo per farlo.",
    store: "In frigo 1 giorno, in freezer fino a 1 mese."
  },
  {
    id: "minestrone", t: "Minestrone d'autunno", e: "🍲", m: 9, cat: "famiglia", min: 45, seasons: ["autunno", "inverno"], al: ["sedano", "glutine"],
    ing: ["Zucca, carota, patata, porro (parte bianca), un po' di verza", "2 cucchiai di fagioli cotti", "Un pezzetto di sedano", "Acqua", "Pastina o riso (facoltativi)", "Olio extravergine d'oliva"],
    steps: [
      "Taglia le verdure a cubetti piccoli.",
      "Cuocile in acqua con i fagioli per 30-40 minuti.",
      "Se vuoi, aggiungi pastina o riso e cuoci finché sono morbidi.",
      "Condisci con l'olio a crudo."
    ],
    pappa: "Passa tutto al passaverdure.",
    pezzi: "Scola le verdure e offrile a cubetti morbidi grandi come un cece: è un ottimo allenamento per la presa a pinza.",
    tip: "Puoi prepararlo per tutta la famiglia e aggiungere il sale solo nei piatti dei grandi.",
    store: "In frigo 2 giorni, si congela."
  },
  {
    id: "biscotti-avena", t: "Biscotti morbidi di avena e mela (senza zucchero)", e: "🍪", m: 9, cat: "merenda", min: 25, seasons: [], al: ["glutine"],
    ing: ["1 mela grattugiata (o 1 banana matura schiacciata)", "100 g di fiocchi d'avena", "2 cucchiai di olio extravergine d'oliva", "Un pizzico di cannella"],
    steps: [
      "Mescola tutti gli ingredienti e lascia riposare 10 minuti.",
      "Forma dei biscottini allungati su carta forno.",
      "Cuoci a 180 °C per 15-18 minuti: devono restare morbidi."
    ],
    pappa: "Sbriciolati in un po' di latte o yogurt.",
    pezzi: "Interi: si sciolgono in bocca.",
    tip: "Senza zucchero né miele: la dolcezza arriva dalla frutta. Il miele va evitato fino ai 12 mesi.",
    store: "In un barattolo chiuso 2-3 giorni, oppure in freezer."
  }
];

window.ALLERGENS = {
  "glutine": { n: "Glutine", e: "🌾" },
  "latte": { n: "Latte", e: "🥛" },
  "uovo": { n: "Uovo", e: "🥚" },
  "pesce": { n: "Pesce", e: "🐟" },
  "arachidi": { n: "Arachidi", e: "🥜" },
  "frutta-guscio": { n: "Frutta a guscio", e: "🌰" },
  "soia": { n: "Soia", e: "🫘" },
  "sesamo": { n: "Sesamo", e: "⚪" },
  "sedano": { n: "Sedano", e: "🥬" },
  "crostacei": { n: "Crostacei", e: "🦐" },
  "molluschi": { n: "Molluschi", e: "🦑" }
};

window.RECIPE_CATS = {
  base: "Basi", pappa: "Pappe", pezzi: "A pezzi", colazione: "Colazione", merenda: "Merenda", famiglia: "Con la famiglia"
};
