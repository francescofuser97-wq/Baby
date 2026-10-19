/* Altre ricette per il primo anno: prime pappe di una sola verdura o frutta, creme di cereali,
   pappe complete con carne, pesce, uovo, legumi e formaggi, e piatti a pezzi da 7 a 12 mesi.
   Stesso formato di data-recipes.js; in più «look» (illustrazione) e «bimby» (passi per il Bimby®).
   Regole del primo anno: niente sale, zucchero e miele; uovo, carne e pesce sempre ben cotti;
   cibi tondi (mirtilli, uva, pomodorini) schiacciati o tagliati per il lungo. */
(function () {
  const STORE = "In frigo, in un vasetto chiuso, fino a 24 ore. In freezer, nelle vaschette per il ghiaccio, fino a 1 mese.";
  const OIL = "1 cucchiaino di olio extravergine d'oliva a crudo";
  const out = [], looks = {}, bimby = {};
  const add = (r, look, bb) => { out.push(Object.assign({ seasons: [], al: [], store: STORE }, r)); if (look) looks[r.id] = look; if (bb) bimby[r.id] = bb; };
  const steam = (what, min) => [["Metti 500 g d'acqua nel boccale e " + what + " nel cestello. Cuoci a vapore.", min + " min / Varoma / vel. 1"]];
  const blend = (extra) => [["Svuota il boccale tenendo da parte un po' d'acqua di cottura. Metti " + (extra || "le verdure") + " nel boccale e frulla, aggiungendo acqua se serve.", "30 sec / vel. 5-8 progressivamente"]];

  /* ---------- Prime pappe di una sola verdura (dai 6 mesi) ---------- */
  const veg = (id, t, e, o) => add({
    id, t, e, m: o.m || 6, cat: "pappa", min: o.min || 20, seasons: o.s || [], al: o.al || [],
    ing: [o.q, "1 patata piccola (facoltativa: rende la crema più liscia)", "Acqua di cottura o brodo vegetale", OIL].concat(o.ing || []),
    steps: ["Lava " + o.art + " e " + o.prep + ".", "Cuoci a vapore insieme alla patata a cubetti per " + o.vap + " minuti, finché " + (o.done || "è morbidissima") + ".",
      "Frulla con qualche cucchiaio di acqua di cottura fino a ottenere una crema liscia.", "Condisci con l'olio a crudo e servi tiepida."].concat(o.steps || []),
    pappa: o.pappa || "All'inizio liscia e piuttosto fluida; dopo qualche settimana schiacciala solo con la forchetta, così si abitua a consistenze più granulose. Si può unire alla crema di cereali della prima pappa.",
    pezzi: o.pezzi, tip: o.tip, store: o.store || STORE
  }, { bowl: o.col, tex: o.tex || "smooth", top: ["oil"], plate: [[o.piece || "stick", o.col2 || o.col, o.n || 3]] },
  steam(o.bbWhat || o.art.replace(/^(la|il|lo|i|le|gli|l')\s*/, "") + " e la patata a pezzi", o.bb || 20).concat(blend(), [["Condisci con l'olio a crudo.", ""]]));

  veg("pappa-zucchine", "Pappa di zucchine", "🥒", { q: "1 zucchina media", art: "la zucchina", prep: "tagliala a rondelle, senza sbucciarla", vap: "8-10", col: "#A9C97A", col2: "#7BA84E", s: ["primavera", "estate"],
    pezzi: "Bastoncini di zucchina cotti a vapore, con la buccia: sono morbidi ma restano interi in mano.", tip: "La zucchina ha un sapore delicato: è perfetta come prima verdura e si abbina a quasi tutto.", bb: 15 });
  veg("pappa-carote", "Pappa di carote", "🥕", { q: "2 carote", art: "le carote", prep: "sbucciale e tagliale a rondelle", vap: "15-18", col: "#EE8A3C", s: [],
    pezzi: "Bastoncini di carota lunghi come un dito adulto, cotti finché si schiacciano tra pollice e indice.", tip: "Le carote crude o poco cotte sono dure: per i pezzi devono essere sempre morbidissime.", bb: 25 });
  veg("pappa-patate", "Purè di patate (senza latte)", "🥔", { q: "1 patata media", art: "la patata", prep: "sbucciala e tagliala a cubetti", vap: "15-20", col: "#EFD9A0", tex: "lumpy",
    pezzi: "Spicchi di patata cotti al vapore o al forno, morbidi dentro.", tip: "Schiaccia la patata con la forchetta o lo schiacciapatate: frullata a lungo diventa colla.", bb: 25 });
  veg("pappa-fagiolini", "Pappa di fagiolini", "🫛", { q: "100 g di fagiolini", art: "i fagiolini", prep: "spuntali", vap: "12-15", col: "#8DB862", col2: "#6B9A45", s: ["estate"], piece: "stick", n: 5,
    pezzi: "Fagiolini interi, cotti molto morbidi: si afferrano bene e si mordicchiano.", tip: "Passa la crema al colino se resta qualche filo.", bb: 25 });
  veg("pappa-piselli", "Crema di piselli", "🟢", { q: "80 g di piselli (anche surgelati)", art: "i piselli", prep: "sciacquali", vap: "10-12", col: "#93C462", tex: "lumpy", piece: "peas", n: 18,
    pezzi: "Piselli schiacciati uno a uno con la forchetta (interi possono andare di traverso), oppure spalmati su un bastoncino di pane.", tip: "Passali al passaverdure per togliere le bucce: la crema diventa vellutata.", bb: 20 });
  veg("pappa-cavolfiore", "Pappa di cavolfiore", "🤍", { q: "4-5 cimette di cavolfiore", art: "le cimette", prep: "dividile in pezzi piccoli", vap: "12-15", col: "#F2EBD9", s: ["autunno", "inverno"], piece: "floret", col2: "#F3EEDF", n: 3,
    pezzi: "Cimette con un pezzo di gambo come manico, cotte finché il gambo è tenero.", tip: "Un pizzico di curcuma o di noce moscata dà colore e profumo senza bisogno di sale.", bb: 20 });
  veg("pappa-finocchio", "Pappa di finocchio", "🌿", { q: "½ finocchio", art: "il finocchio", prep: "taglialo a spicchi sottili", vap: "15", col: "#E6EDC9", s: ["autunno", "inverno", "primavera"], piece: "wedge", col2: "#DDE8B8",
    pezzi: "Spicchi di finocchio cotti al vapore, morbidi: il bimbo li succhia e li mordicchia.", tip: "Il finocchio è dolce e digeribile: ottimo anche insieme alla patata e alla carota.", bb: 25 });
  veg("pappa-porro", "Crema di porro e patate", "🧅", { q: "La parte bianca di 1 porro", art: "il porro", prep: "taglialo a rondelle sottili", vap: "12-15", col: "#EDEBC8", s: ["autunno", "inverno"],
    pezzi: "Bastoncini di patata cotti con il porro: il sapore del porro resta sulla patata.", tip: "Il porro è più delicato della cipolla: dà gusto alle pappe senza bisogno di sale.", bb: 20 });
  veg("pappa-spinaci", "Pappa di spinaci e patate", "🥬", { m: 8, q: "Una manciata di foglie di spinaci freschi", art: "gli spinaci", prep: "togli i gambi più duri", vap: "5", done: "le foglie sono appassite e la patata è morbida", col: "#4F8A3A", s: ["primavera", "autunno", "inverno"],
    pezzi: "Spinaci tritati dentro una frittatina o mescolati al purè, da prendere a cucchiaiate.", tip: "Spinaci, bietole e barbabietola contengono nitrati: offrili in piccole quantità, freschi, e non riscaldarli.", store: "Meglio prepararla al momento e non riscaldarla.", bb: 15 });
  veg("pappa-bietola", "Pappa di bietole e zucchine", "🥬", { m: 8, q: "3-4 foglie di bietola e ½ zucchina", art: "le bietole", prep: "tagliale a listarelle insieme alla zucchina", vap: "8-10", col: "#5E9A44", s: ["primavera", "estate", "autunno"],
    pezzi: "Bastoncini di zucchina e un cucchiaio di bietola tritata nel purè.", tip: "Come per gli spinaci: poche foglie, preparate al momento.", store: "Meglio prepararla al momento e non riscaldarla.", bb: 15 });
  veg("pappa-barbabietola", "Crema rosa di barbabietola e patate", "🩷", { m: 8, q: "1 barbabietola piccola già cotta (non sott'aceto)", art: "la barbabietola", prep: "sbucciala e tagliala a cubetti", vap: "8", done: "la patata è morbida", col: "#B8325A", s: ["autunno", "inverno"],
    pezzi: "Cubetti di barbabietola cotta, morbidi: attenzione, macchiano!", tip: "Il colore rosa fa divertire, ma pipì e cacca possono colorarsi di rosso: è normale. Piccole quantità (nitrati).", store: "Meglio prepararla al momento.", bb: 15 });
  veg("pappa-asparagi", "Crema di asparagi", "🌱", { m: 7, q: "5-6 punte di asparago", art: "gli asparagi", prep: "tieni solo le punte e la parte tenera", vap: "10", col: "#A7C277", s: ["primavera"], piece: "stick", n: 4,
    pezzi: "Punte di asparago cotte morbide, da afferrare dal gambo.", tip: "Possono dare un odore particolare alla pipì: è normale.", bb: 15 });
  veg("pappa-verza", "Pappa di verza e patate", "🥬", { m: 7, q: "2 foglie di verza", art: "la verza", prep: "togli la costa centrale e tagliala a listarelle", vap: "12", col: "#B9CF8E", s: ["autunno", "inverno"],
    pezzi: "Patate e verza schiacciate grossolanamente, da prendere con le mani o con il cucchiaio.", tip: "La verza in piccole quantità è ben tollerata; se fa un po' d'aria, alternala con verdure più delicate.", bb: 20 });
  veg("pappa-zucca", "Pappa di zucca", "🎃", { q: "150 g di zucca", art: "la zucca", prep: "sbucciala, togli i semi e tagliala a cubetti", vap: "15", col: "#F2A23C", s: ["autunno", "inverno"], piece: "wedge", col2: "#E8892E",
    pezzi: "Spicchi di zucca al forno (200 °C, 25 minuti) con un filo d'olio: dolci e morbidi.", tip: "La zucca è dolce di natura: piace quasi sempre, anche ai più diffidenti.", bb: 20 });
  veg("pappa-melanzana", "Crema di melanzana e zucchina", "🍆", { m: 7, q: "½ melanzana piccola e ½ zucchina", art: "la melanzana", prep: "sbucciala e tagliala a cubetti, con la zucchina", vap: "12-15", col: "#B7A98D", s: ["estate"],
    pezzi: "Bastoncini di zucchina; la melanzana cotta è troppo scivolosa, meglio dentro la crema.", tip: "Sbucciata e ben cotta, la melanzana diventa dolce e cremosa.", bb: 20 });
  veg("pappa-pomodoro", "Pappa al pomodoro fresco", "🍅", { m: 7, q: "2 pomodori maturi (o 4 cucchiai di passata)", art: "i pomodori", prep: "sbucciali (un minuto in acqua bollente) e togli i semi", vap: "10", col: "#E0663F", s: ["estate"],
    pezzi: "Spicchi di pomodoro pelato e senza semi, oppure pasta corta condita con questa crema.", tip: "Il pomodoro cotto è adatto dai 7 mesi; se vedi rossore intorno alla bocca, di solito è solo irritazione da acidità.", bb: 15 });

  /* ---------- Frutta (dai 6 mesi) ---------- */
  const fruit = (id, t, e, o) => add({
    id, t, e, m: o.m || 6, cat: "merenda", min: o.min || 10, seasons: o.s || [], al: o.al || [],
    ing: o.ing, steps: o.steps, pappa: o.pappa, pezzi: o.pezzi, tip: o.tip, store: o.store || "Meglio prepararla al momento: la frutta frullata scurisce in fretta."
  }, { bowl: o.col, tex: o.tex || "smooth", plate: [[o.piece || "wedge", o.col2 || o.col, o.n || 4]] }, o.bb);

  fruit("pappa-mela", "Pappa di mela", "🍎", { col: "#F1E2A8",
    ing: ["1 mela (golden, fuji o renetta)", "Un pizzico di cannella (facoltativo)"],
    steps: ["Lava e sbuccia la mela, togli il torsolo e tagliala a spicchi.", "Per la mela cotta: cuocila a vapore 8-10 minuti e frullala o schiacciala con la forchetta.", "Per la mela cruda: grattugiala finemente con la grattugia di plastica o di vetro."],
    pappa: "Cotta e frullata è la più delicata; grattugiata cruda ha più sapore e aiuta a masticare.",
    pezzi: "Spicchi di mela cotti al vapore finché sono morbidi (la mela cruda a spicchi è dura e può andare di traverso: dalla mela cruda solo fettine sottilissime, dopo i 9 mesi).",
    tip: "La mela cotta è utile se le feci sono un po' molli; quella cruda grattugiata è un classico della merenda.",
    bb: [["Metti 500 g d'acqua nel boccale e gli spicchi di mela nel cestello. Cuoci a vapore.", "12 min / Varoma / vel. 1"], ["Svuota il boccale, metti la mela (e la cannella) e frulla.", "20 sec / vel. 6"]] });
  fruit("pappa-pera", "Pappa di pera", "🍐", { col: "#E9E2A8", s: ["estate", "autunno", "inverno"],
    ing: ["1 pera matura (williams o abate)"],
    steps: ["Lava e sbuccia la pera, togli il torsolo.", "Se è molto matura schiacciala cruda con la forchetta; altrimenti cuocila a vapore 6-8 minuti e frullala."],
    pappa: "Liscia e dolce: si può mescolare alla crema di riso o allo yogurt.",
    pezzi: "Spicchi di pera matura senza buccia: scivolosi, passali nel biscotto sbriciolato o nei fiocchi d'avena frullati per afferrarli meglio.",
    tip: "La pera aiuta in caso di stitichezza.",
    bb: [["Metti 500 g d'acqua nel boccale e la pera a spicchi nel cestello. Cuoci a vapore.", "8 min / Varoma / vel. 1"], ["Svuota il boccale, metti la pera e frulla.", "15 sec / vel. 6"]] });
  fruit("pappa-pesca", "Pesca schiacciata", "🍑", { col: "#F7C08A", s: ["estate"],
    ing: ["1 pesca matura"],
    steps: ["Lava e sbuccia la pesca, togli il nocciolo.", "Schiacciala con la forchetta (o frullala) e servi subito."],
    pappa: "Schiacciata: dolce e profumata, piace quasi a tutti.", pezzi: "Spicchi di pesca matura senza buccia, larghi come due dita.",
    tip: "Scegli pesche ben mature: sono più dolci e più morbide." });
  fruit("pappa-albicocca", "Albicocche cotte", "🟠", { col: "#F4A64B", s: ["estate"],
    ing: ["3 albicocche mature"],
    steps: ["Lava le albicocche, togli il nocciolo e taglia a metà.", "Cuocile a vapore 5 minuti (o lasciale crude se molto mature) e frullale o schiacciale."],
    pappa: "Crema liscia, anche insieme allo yogurt.", pezzi: "Mezze albicocche mature senza buccia.",
    tip: "Aiutano l'intestino pigro.",
    bb: [["Metti 500 g d'acqua nel boccale e le albicocche nel cestello. Cuoci a vapore.", "6 min / Varoma / vel. 1"], ["Svuota il boccale, metti le albicocche e frulla.", "15 sec / vel. 6"]] });
  fruit("pappa-prugne", "Composta di prugne (per la stitichezza)", "🟣", { col: "#7B3F61", s: ["estate", "autunno"],
    ing: ["4 prugne fresche (o 3 prugne secche denocciolate)", "2 cucchiai d'acqua"],
    steps: ["Togli il nocciolo; le prugne secche lasciale prima 30 minuti in acqua tiepida.", "Cuocile in un pentolino con l'acqua per 8-10 minuti.", "Frulla fino a una crema liscia."],
    pappa: "1-2 cucchiaini da aggiungere allo yogurt o alla crema di cereali.", pezzi: "Prugne fresche mature senza buccia, a spicchi.",
    tip: "Rimedio dolce e naturale contro la stitichezza: basta poca, una o due volte al giorno.", store: "In frigo 3 giorni; in freezer 1 mese.",
    bb: [["Metti le prugne e l'acqua nel boccale e cuoci.", "8 min / 100° / vel. 1"], ["Frulla.", "20 sec / vel. 7"]] });
  fruit("pappa-mango", "Mango schiacciato", "🥭", { col: "#F7B733",
    ing: ["¼ di mango ben maturo"],
    steps: ["Sbuccia il mango e taglia la polpa intorno al nocciolo.", "Schiacciala con la forchetta."],
    pappa: "Morbido e cremoso, non serve frullarlo.", pezzi: "Una fetta larga con un pezzo di buccia come manico, oppure il nocciolo con un po' di polpa da succhiare (sotto i vostri occhi).",
    tip: "Ricco di vitamina A e C: ottimo dopo una pappa con legumi, aiuta ad assorbire il ferro." });
  fruit("pappa-kiwi", "Kiwi schiacciato", "🥝", { m: 7, col: "#9CC04A",
    ing: ["1 kiwi maturo"],
    steps: ["Sbuccia il kiwi.", "Schiaccialo con la forchetta, anche insieme a un po' di banana se è aspro."],
    pappa: "Schiacciato, magari con la banana.", pezzi: "Spicchi di kiwi maturo, passati nei fiocchi d'avena frullati per afferrarli meglio.",
    tip: "Può arrossare un po' la pelle intorno alla bocca per l'acidità: di solito non è allergia. Se compaiono altri sintomi, senti il pediatra." });
  fruit("pappa-fragole", "Fragole schiacciate", "🍓", { col: "#E5485A", s: ["primavera"], piece: "wedge", col2: "#E5485A",
    ing: ["4-5 fragole mature"],
    steps: ["Lava bene le fragole e togli il picciolo.", "Schiacciale con la forchetta o tagliale in quattro per il lungo."],
    pappa: "Schiacciate con lo yogurt o la ricotta.", pezzi: "Fragole grandi intere (si mordicchiano) oppure tagliate in quattro per il lungo. Mai fragoline piccole intere.",
    tip: "Le fragole non sono più vietate prima dell'anno: come gli altri cibi, offrile e osserva." });
  fruit("pappa-mirtilli", "Mirtilli schiacciati", "🫐", { m: 7, col: "#4B4F8F", s: ["estate"], piece: "beans", col2: "#4B4F8F", n: 10,
    ing: ["Una manciata di mirtilli"],
    steps: ["Lava i mirtilli.", "Schiacciali uno a uno con la forchetta, oppure cuocili 3 minuti in un pentolino e frullali."],
    pappa: "Una composta viola da mescolare allo yogurt o al porridge.", pezzi: "Sempre schiacciati, mai interi: sono tondi e piccoli e possono andare di traverso.",
    tip: "Tondi e piccoli = da schiacciare sempre, fino ai 4 anni." });
  fruit("pappa-melone", "Melone a bastoncini", "🍈", { col: "#F6B26B", s: ["estate"], piece: "stick", col2: "#F6B26B",
    ing: ["Una fetta di melone maturo"],
    steps: ["Togli buccia e semi.", "Taglia a bastoncini larghi due dita oppure schiaccia la polpa."],
    pappa: "Schiacciato con la forchetta: è già una crema.", pezzi: "Bastoncini spessi di melone maturo, freschi: piacciono anche quando spuntano i dentini.",
    tip: "Rinfrescante e ricco d'acqua: perfetto nelle giornate calde." });
  fruit("pappa-anguria", "Anguria a bastoncini", "🍉", { col: "#F06B6B", s: ["estate"], piece: "stick", col2: "#F06B6B",
    ing: ["Una fetta di anguria"],
    steps: ["Togli buccia e tutti i semi.", "Taglia a bastoncini larghi o a triangoli."],
    pappa: "Schiacciata e passata al colino: un succo naturale.", pezzi: "Bastoncini o triangoli senza semi: il bimbo li succhia e li mordicchia.",
    tip: "Controlla bene che non restino semi." });
  fruit("mela-forno", "Mela cotta al forno con cannella", "🍏", { m: 6, min: 30, col: "#E7C77C", tex: "lumpy", piece: "wedge", col2: "#E2B866",
    ing: ["1 mela", "Un pizzico di cannella", "1 cucchiaio d'acqua"],
    steps: ["Taglia la mela a spicchi spessi, senza buccia.", "Mettila in una pirofila con l'acqua e la cannella.", "Cuoci a 180 °C per 20-25 minuti, finché è morbida."],
    pappa: "Schiacciata con la forchetta: profuma di torta.", pezzi: "Gli spicchi così come sono, tiepidi.",
    tip: "Senza zucchero è già dolce: la cannella fa il resto." });

  /* ---------- Creme di cereali e basi ---------- */
  add({ id: "crema-mais-tapioca", t: "Pappa con crema di mais e tapioca e zucchine", e: "🌽", m: 6, cat: "pappa", min: 15,
    ing: ["180-200 ml di brodo vegetale", "2-3 cucchiai di crema di mais e tapioca", "2 cucchiai di zucchine del brodo passate", OIL, "1 cucchiaino di parmigiano (facoltativo)"],
    steps: ["Scalda il brodo e versa la crema di mais e tapioca a pioggia, mescolando.", "Cuoci 1-2 minuti finché si addensa.", "Aggiungi le zucchine passate, l'olio e, se già introdotto, il parmigiano."],
    pappa: "È senza glutine: perfetta per le prime settimane, alternata alla crema di riso.", pezzi: "Accanto, bastoncini di zucchina e carota del brodo.",
    tip: "Alterna i cereali (riso, mais e tapioca, multicereali): il bimbo conosce sapori diversi.", store: "Meglio prepararla al momento." },
    { bowl: "#F2DC8C", tex: "smooth", top: ["oil"], plate: [["stick", "#7BA84E", 2]] },
    [["Metti il brodo nel boccale e scaldalo.", "4 min / 90° / vel. 1"], ["Aggiungi la crema di mais e tapioca dal foro del coperchio.", "2 min / 90° / vel. 3"], ["Unisci le zucchine passate e frulla.", "15 sec / vel. 5"], ["Condisci con olio (e parmigiano).", ""]]);
  add({ id: "semolino", t: "Semolino in brodo vegetale", e: "🥣", m: 6, cat: "pappa", min: 10, al: ["glutine", "latte"],
    ing: ["200 ml di brodo vegetale", "2 cucchiai di semolino di grano duro", "2 cucchiai di verdure del brodo passate", OIL, "1 cucchiaino di parmigiano"],
    steps: ["Porta il brodo a bollore.", "Versa il semolino a pioggia mescolando con la frusta.", "Cuoci 3-4 minuti, sempre mescolando.", "Aggiungi le verdure passate, l'olio e il parmigiano."],
    pappa: "Un classico per introdurre il glutine: liscio e caldo.", pezzi: "Accanto, verdure del brodo a bastoncini.",
    tip: "Il glutine si introduce come gli altri cibi, dai 6 mesi, senza aspettare: in piccole quantità e poi regolarmente.", store: "Meglio prepararlo al momento." },
    { bowl: "#F1E3B5", tex: "smooth", top: ["oil", "cheese"], plate: [["stick", "#EE8A3C", 2]] },
    [["Versa il brodo nel boccale e porta a bollore.", "6 min / 100° / vel. 1"], ["Aggiungi il semolino dal foro del coperchio con le lame in movimento.", "4 min / 90° / vel. 3"], ["Unisci verdure, olio e parmigiano.", "10 sec / vel. 3"]]);
  add({ id: "crema-miglio", t: "Crema di miglio e zucca", e: "🌾", m: 6, cat: "pappa", min: 30, seasons: ["autunno", "inverno"],
    ing: ["30 g di miglio decorticato", "80 g di zucca", "250 ml d'acqua o brodo vegetale", OIL],
    steps: ["Sciacqua il miglio sotto l'acqua corrente.", "Cuocilo con la zucca a cubetti nell'acqua per 20-25 minuti.", "Frulla fino a una crema e condisci con l'olio."],
    pappa: "Liscia; più avanti lasciala granulosa.", pezzi: "Con il miglio avanzato fai delle crocchette (vedi «Crocchette di miglio»).",
    tip: "Il miglio è senza glutine, ricco di ferro e magnesio." },
    { bowl: "#F2B35A", tex: "grains", top: ["oil"], plate: [["wedge", "#E8892E", 2]] },
    [["Metti nel boccale il miglio sciacquato, la zucca a pezzi e l'acqua. Cuoci.", "25 min / 100° / antiorario / vel. soft"], ["Frulla.", "30 sec / vel. 5-8 progressivamente"], ["Condisci con l'olio.", ""]]);
  add({ id: "crema-quinoa", t: "Quinoa con carote e piselli", e: "🍚", m: 7, cat: "pappa", min: 25,
    ing: ["30 g di quinoa", "1 carota", "2 cucchiai di piselli", "200 ml d'acqua o brodo vegetale", OIL],
    steps: ["Sciacqua bene la quinoa (toglie il sapore amaro).", "Cuocila con la carota a cubetti e i piselli per 15 minuti.", "Frulla o schiaccia e condisci con l'olio."],
    pappa: "Frullata all'inizio, poi solo schiacciata.", pezzi: "Quinoa compatta in palline con un po' di ricotta: si prendono con le mani.",
    tip: "La quinoa contiene proteine complete: ottima anche nei giorni senza carne o pesce." },
    { bowl: "#E9D29A", tex: "grains", top: ["oil"], plate: [["ball", "#E5CF96", 4]] },
    [["Metti nel boccale quinoa sciacquata, carota a pezzi, piselli e acqua. Cuoci.", "15 min / 100° / antiorario / vel. soft"], ["Frulla o lascia a pezzetti.", "20 sec / vel. 5"]]);
  add({ id: "pastina-zucchine", t: "Pastina con crema di zucchine e ricotta", e: "⭐", m: 6, cat: "pappa", min: 15, al: ["glutine", "latte"],
    ing: ["180 ml di brodo vegetale", "2 cucchiai di pastina piccola", "½ zucchina", "1 cucchiaio di ricotta", OIL],
    steps: ["Cuoci la zucchina a rondelle nel brodo per 8 minuti e frullala.", "Nello stesso brodo cuoci la pastina, 1-2 minuti più del normale.", "Unisci la crema di zucchine, la ricotta e l'olio."],
    pappa: "Cremosa e tiepida.", pezzi: "Pasta corta (farfalline, fusilli) ben cotta, da prendere con le dita.",
    tip: "La ricotta rende la pappa più cremosa e porta proteine." },
    { bowl: "#CFE0A8", tex: "stars", top: ["ricotta"], plate: [["fusilli", "#EED48A", 6]] },
    [["Metti nel boccale la zucchina a pezzi e il brodo. Cuoci.", "8 min / 100° / vel. 1"], ["Frulla.", "20 sec / vel. 6"], ["Aggiungi la pastina dal foro del coperchio.", "6-8 min / 100° / antiorario / vel. soft"], ["Unisci ricotta e olio.", ""]]);

  /* ---------- Pappe complete con carne, pesce, uovo, legumi e formaggi ---------- */
  const meal = (id, t, e, o) => add({ id, t, e, m: o.m || 6, cat: "pappa", min: o.min || 25, seasons: o.s || [], al: o.al || [],
    ing: o.ing, steps: o.steps, pappa: o.pappa || "Frullata finemente all'inizio; dopo qualche settimana più grossolana, con piccoli pezzetti morbidi.",
    pezzi: o.pezzi, tip: o.tip, store: o.store || "Meglio al momento. La carne o il pesce cotti si conservano in frigo 1 giorno, in freezer 1 mese." },
  { bowl: o.col, tex: o.tex || "lumpy", top: o.top || ["oil"], plate: o.plate }, o.bb);

  meal("pappa-manzo", "Pappa con manzo e carote", "🥩", { col: "#D9A36F",
    ing: ["25 g di manzo magro (girello o macinato)", "1 carota", "1 patata piccola", "180 ml di brodo vegetale", "2 cucchiai di crema di riso", OIL],
    steps: ["Cuoci carne, carota e patata a pezzi nel brodo per 20 minuti, finché la carne è ben cotta.", "Frulla la carne finissima con un po' di brodo.", "Prepara la crema di riso nel brodo rimasto e unisci carne e verdure.", "Condisci con l'olio a crudo."],
    pezzi: "Polpettine morbide di manzo o strisce di carne lessa tenera, lunghe come un dito, da succhiare.",
    tip: "La carne rossa è la fonte di ferro più facile da assorbire: dai 6 mesi, 2-3 volte alla settimana, in piccole quantità.",
    plate: [["finger", "#9C5634", 3], ["stick", "#EE8A3C", 2]],
    bb: [["Metti 500 g d'acqua nel boccale; nel cestello la carne a pezzetti, la carota e la patata. Cuoci a vapore.", "25 min / Varoma / vel. 1"], ["Tieni 200 g di liquido e svuota il boccale. Metti carne, verdure e un po' di liquido e frulla finissimo.", "1 min / vel. 5-10 progressivamente"], ["Aggiungi il resto del liquido e la crema di riso.", "2 min / 90° / vel. 3"], ["Condisci con l'olio.", ""]] });
  meal("pappa-pollo", "Pappa con pollo, zucchine e patate", "🍗", { col: "#E9D3B4",
    ing: ["25 g di petto di pollo", "½ zucchina", "1 patata piccola", "180 ml di brodo vegetale", "2 cucchiai di crema di mais e tapioca", OIL],
    steps: ["Cuoci il pollo con le verdure a vapore o nel brodo per 15-18 minuti, finché è cotto anche al centro.", "Frulla il pollo finissimo con un po' di brodo.", "Prepara la crema di mais e tapioca nel brodo e unisci pollo e verdure.", "Condisci con l'olio."],
    pezzi: "Strisce di pollo lessato o polpettine di pollo e patate.", tip: "Il pollo frullato da solo diventa asciutto: frullalo sempre con un po' di brodo.",
    plate: [["finger", "#E5CBA5", 3], ["stick", "#7BA84E", 2]],
    bb: [["Metti 500 g d'acqua nel boccale; nel cestello pollo a pezzetti, zucchina e patata. Cuoci a vapore.", "20 min / Varoma / vel. 1"], ["Tieni 200 g di liquido, svuota il boccale e frulla pollo e verdure con un po' di liquido.", "1 min / vel. 5-10 progressivamente"], ["Aggiungi il resto del liquido e la crema di mais e tapioca.", "2 min / 90° / vel. 3"], ["Condisci con l'olio.", ""]] });
  meal("pappa-coniglio", "Pappa con coniglio e finocchio", "🐇", { col: "#EADBC1",
    ing: ["25 g di polpa di coniglio", "¼ di finocchio", "1 patata piccola", "180 ml di brodo vegetale", "2 cucchiai di crema di riso", OIL],
    steps: ["Cuoci coniglio, finocchio e patata nel brodo per 20 minuti.", "Controlla che non ci siano ossicini e frulla la carne con un po' di brodo.", "Prepara la crema di riso nel brodo, unisci tutto e condisci con l'olio."],
    pezzi: "Sfilacci di coniglio tenero con bastoncini di patata.", tip: "Il coniglio è una carne magra e delicata, ottima tra le prime.",
    plate: [["finger", "#E1CCA9", 3], ["wedge", "#DDE8B8", 2]],
    bb: [["Metti 500 g d'acqua nel boccale; nel cestello coniglio a pezzetti, finocchio e patata. Cuoci a vapore.", "25 min / Varoma / vel. 1"], ["Controlla gli ossicini. Svuota il boccale tenendo 200 g di liquido e frulla tutto con un po' di liquido.", "1 min / vel. 5-10 progressivamente"], ["Aggiungi il liquido e la crema di riso.", "2 min / 90° / vel. 3"]] });
  meal("pappa-tacchino-zucca", "Pappa con tacchino e zucca", "🦃", { col: "#F0B866", s: ["autunno", "inverno"],
    ing: ["25 g di fesa di tacchino", "80 g di zucca", "180 ml di brodo vegetale", "2 cucchiai di crema di riso o di mais e tapioca", OIL],
    steps: ["Cuoci tacchino e zucca a cubetti nel brodo per 15 minuti.", "Frulla il tacchino con un po' di brodo e la zucca.", "Prepara la crema di cereali nel brodo, unisci e condisci con l'olio."],
    pezzi: "Polpettine di tacchino e zucca (vedi «Polpette morbide di manzo»: stesso procedimento).", tip: "La zucca addolcisce: utile con le carni che il bimbo accetta meno.",
    plate: [["finger", "#E9D3B4", 2], ["wedge", "#E8892E", 2]] });
  meal("pappa-orata", "Pappa di orata con patate e carote", "🐟", { col: "#EFE6D2", al: ["pesce"],
    ing: ["35 g di filetto di orata (o branzino) senza spine", "1 patata", "1 carota", OIL],
    steps: ["Cuoci patata e carota a vapore per 12 minuti.", "Aggiungi il pesce nel cestello e cuoci altri 8 minuti.", "Sbriciola il pesce con le dita per trovare eventuali spine.", "Schiaccia o frulla tutto con un po' d'acqua di cottura e condisci con l'olio."],
    pezzi: "Pesce sbriciolato in scaglie grandi accanto a bastoncini di patata e carota.", tip: "Il pesce si offre dai 6 mesi, 2-3 volte alla settimana: preferisci quelli piccoli e poco grassi.",
    plate: [["flakes", "#F6F0E4", 4], ["stick", "#EE8A3C", 2]],
    bb: [["Metti 500 g d'acqua nel boccale, patata e carota a cubetti nel cestello, il pesce nel Varoma.", ""], ["Cuoci tutto a vapore con il Varoma sul coperchio.", "20 min / Varoma / vel. 1"], ["Controlla le spine. Svuota il boccale e frulla con un po' d'acqua di cottura.", "20 sec / vel. 4-6"], ["Condisci con l'olio.", ""]] });
  meal("pappa-platessa", "Pappa di platessa e zucchine", "🐠", { col: "#E2E6C8", al: ["pesce"],
    ing: ["35 g di filetto di platessa o sogliola (va bene surgelato)", "1 zucchina", "180 ml di brodo vegetale", "2 cucchiai di crema di riso", OIL],
    steps: ["Cuoci la zucchina nel brodo per 8 minuti; aggiungi il pesce per gli ultimi 5.", "Controlla che non ci siano spine e frulla pesce e zucchina.", "Prepara la crema di riso nel brodo, unisci e condisci."],
    pezzi: "Scaglie di platessa (morbidissima) accanto a bastoncini di zucchina.", tip: "Platessa e sogliola hanno un sapore delicato: buone come primo pesce.",
    plate: [["flakes", "#F6F0E4", 4], ["stick", "#7BA84E", 2]] });
  meal("pappa-trota", "Pappa di trota e piselli", "🐟", { m: 7, col: "#E7B69A", al: ["pesce"],
    ing: ["35 g di filetto di trota senza spine", "2 cucchiai di piselli", "1 patata piccola", OIL],
    steps: ["Cuoci patata e piselli a vapore per 10 minuti, poi aggiungi la trota per altri 8.", "Togli eventuali spine.", "Schiaccia o frulla tutto con un po' d'acqua di cottura e condisci con l'olio."],
    pezzi: "Scaglie di trota e piselli schiacciati su bastoncini di patata.", tip: "La trota è un pesce d'acqua dolce ricco di omega-3, facile da trovare in Veneto.",
    plate: [["flakes", "#F39A7B", 4], ["peas", "#79B957", 8]] });
  meal("pappa-uovo", "Pappa con uovo sodo e verdure", "🥚", { col: "#F2D98A", al: ["uovo"],
    ing: ["1 uovo", "180 ml di brodo vegetale", "2 cucchiai di crema di riso", "2 cucchiai di verdure passate", OIL],
    steps: ["Cuoci l'uovo sodo: 10 minuti dal bollore, poi sotto l'acqua fredda.", "Prepara la crema di riso nel brodo con le verdure.", "Schiaccia mezzo tuorlo e un po' di albume e uniscili alla pappa (all'inizio basta un cucchiaino).", "Condisci con l'olio."],
    pappa: "Le prime volte una piccola quantità di uovo ben cotto, poi via via di più.", pezzi: "Spicchi di uovo sodo, oppure strisce di frittatina al forno.",
    tip: "L'uovo (tuorlo e albume) si introduce dai 6 mesi, sempre ben cotto. È uno degli allergeni da non rimandare.",
    store: "L'uovo sodo in frigo, con il guscio, per 2 giorni.", plate: [["wedge", "#F4CB4F", 4]] });
  meal("pappa-ceci", "Crema di ceci e carote", "🫘", { m: 7, col: "#E2BE7E", tex: "smooth",
    ing: ["3 cucchiai di ceci cotti (senza sale, ben sciacquati)", "1 carota", "200 ml di brodo vegetale", "2 cucchiai di crema di riso o di pastina", OIL],
    steps: ["Cuoci la carota nel brodo per 12 minuti; aggiungi i ceci per gli ultimi 5.", "Frulla e passa al colino per togliere le bucce.", "Unisci la crema di riso (o cuoci la pastina nel brodo) e condisci."],
    pezzi: "Ceci schiacciati uno a uno, o la crema spalmata su un bastoncino di pane.", tip: "I legumi passati sono ricchi di ferro e proteine: alternali alla carne e al pesce.",
    plate: [["toast", "#E2BE7E", 3]],
    bb: [["Metti nel boccale la carota a pezzi e il brodo. Cuoci.", "12 min / 100° / vel. 1"], ["Aggiungi i ceci e frulla finissimo.", "1 min / vel. 5-10 progressivamente"], ["Aggiungi la crema di riso.", "2 min / 90° / vel. 3"], ["Condisci con l'olio.", ""]] });
  meal("pappa-cannellini", "Crema di fagioli cannellini e zucchine", "🤍", { m: 7, col: "#EDE3C8", tex: "smooth",
    ing: ["3 cucchiai di cannellini cotti (senza sale)", "½ zucchina", "200 ml di brodo vegetale", "2 cucchiai di crema di riso o di mais e tapioca", OIL, "Una fogliolina di salvia (facoltativa)"],
    steps: ["Cuoci la zucchina (e la salvia) nel brodo per 8 minuti; aggiungi i fagioli.", "Togli la salvia, frulla e passa al colino.", "Unisci la crema di cereali e condisci."],
    pezzi: "Fagioli schiacciati con la forchetta su pane morbido.", tip: "I fagioli in barattolo vanno bene: scegli quelli senza sale aggiunto e sciacquali.",
    plate: [["toast", "#EDE3C8", 3]] });
  meal("pappa-ricotta-spinaci", "Pappa con ricotta e verdure", "🧀", { col: "#E8EFD6", al: ["latte"], top: ["ricotta", "oil"],
    ing: ["180 ml di brodo vegetale", "2 cucchiai di crema di riso", "2 cucchiai di verdure passate", "2 cucchiai di ricotta vaccina fresca", OIL],
    steps: ["Prepara la crema di riso nel brodo.", "Aggiungi le verdure passate e la ricotta.", "Mescola bene e condisci con l'olio."],
    pappa: "La ricotta sostituisce carne o pesce nei pasti «di formaggio» (1-2 volte alla settimana).", pezzi: "Ricotta spalmata su bastoncini di pane morbido.",
    tip: "Formaggi freschi e poco salati sono i migliori nel primo anno: ricotta, robiola, mozzarella.", store: "Meglio al momento.",
    plate: [["toast", "#F7F1E2", 3]] });
  meal("pappa-lenticchie-zucca", "Lenticchie decorticate e zucca", "🧡", { col: "#EE9A4A", tex: "smooth", s: ["autunno", "inverno"],
    ing: ["15 g di lenticchie rosse decorticate", "80 g di zucca", "250 ml d'acqua", OIL],
    steps: ["Sciacqua le lenticchie.", "Cuocile con la zucca a cubetti per 15-18 minuti, finché si sfaldano.", "Frulla e condisci con l'olio."],
    pezzi: "Crema densa da prendere con il cucchiaio precaricato, accanto a spicchi di zucca al forno.", tip: "Le lenticchie decorticate non hanno buccia: si digeriscono bene e non vanno passate.",
    plate: [["wedge", "#E8892E", 3]],
    bb: [["Metti nel boccale lenticchie sciacquate, zucca a pezzi e acqua. Cuoci.", "18 min / 100° / vel. 1"], ["Frulla.", "30 sec / vel. 5-8 progressivamente"], ["Condisci con l'olio.", ""]] });

  /* ---------- A pezzi e con la famiglia (7-12 mesi) ---------- */
  const piece = (id, t, e, o) => add({ id, t, e, m: o.m || 8, cat: o.cat || "pezzi", min: o.min || 25, seasons: o.s || [], al: o.al || [],
    ing: o.ing, steps: o.steps, pappa: o.pappa, pezzi: o.pezzi, tip: o.tip, store: o.store || "In frigo 2 giorni; in freezer fino a 1 mese." },
  o.bowl ? { bowl: o.bowl, tex: o.tex || "lumpy", top: o.top || ["oil"], plate: o.plate } : { plate: o.plate }, o.bb);

  piece("polpette-manzo", "Polpette morbide di manzo e zucchina", "🧆", { m: 7,
    ing: ["150 g di macinato magro di manzo", "1 zucchina grattugiata e strizzata", "2 cucchiai di pangrattato (o fiocchi d'avena frullati)", "1 cucchiaio di parmigiano"],
    steps: ["Impasta tutti gli ingredienti.", "Forma polpette allungate, come un dito.", "Cuocile in forno a 180 °C per 15-18 minuti, girandole a metà, finché sono cotte anche dentro."],
    pappa: "Sbriciolate con la forchetta dentro il purè o la crema di verdure.", pezzi: "Intere, allungate: il bimbo le stringe nel pugno e le mordicchia.",
    tip: "Si congelano benissimo crude: ne cuoci poche alla volta.", al: ["latte", "glutine"], plate: [["finger", "#9C5634", 3]],
    bb: [["Metti nel boccale la zucchina a pezzi e grattugia; poi strizzala.", "5 sec / vel. 5"], ["Aggiungi carne, pangrattato e parmigiano e impasta.", "20 sec / antiorario / vel. 3"], ["Forma le polpette e cuocile in forno a 180 °C per 15-18 minuti.", ""]] });
  piece("frittelle-zucchine", "Frittelle di zucchine al forno", "🥒", { m: 8, al: ["uovo", "glutine"],
    ing: ["1 zucchina grattugiata e strizzata", "1 uovo", "3 cucchiai di farina", "1 cucchiaio di parmigiano (facoltativo)"],
    steps: ["Mescola zucchina, uovo, farina e parmigiano.", "Su una teglia con carta forno fai piccoli dischi con un cucchiaio.", "Cuoci a 200 °C per 15 minuti, girandole a metà."],
    pappa: "Sbriciolate nella crema di verdure.", pezzi: "Tagliate a strisce larghe due dita.",
    tip: "Sono un modo semplice per l'uovo ben cotto e per le verdure insieme.", plate: [["disc", "#B9CF7A", 3]] });
  piece("bastoncini-polenta", "Bastoncini di polenta", "🌽", { m: 7, min: 20,
    ing: ["40 g di farina di mais istantanea", "160 ml di acqua o brodo vegetale", "1 cucchiaio di parmigiano (facoltativo)", "Qualche goccia d'olio"],
    steps: ["Porta a bollore il liquido e versa la farina a pioggia, mescolando, per 5-8 minuti.", "Aggiungi il parmigiano e stendi la polenta alta 1,5 cm su un tagliere.", "Quando è fredda tagliala a bastoncini.", "Scaldali in padella antiaderente o in forno a 200 °C per 10 minuti."],
    pappa: "Polenta morbida al cucchiaio, con un sugo di verdure.", pezzi: "Bastoncini lunghi come un dito: si tengono bene in mano.",
    tip: "La polenta è senza glutine (se senza parmigiano, anche senza latte).", plate: [["stick", "#F4CF5A", 4]] });
  piece("crocchette-miglio", "Crocchette di miglio e verdure", "🟡", { m: 8, al: ["latte"],
    ing: ["100 g di miglio cotto", "1 carota grattugiata e cotta", "1 cucchiaio di parmigiano", "Pangrattato o farina di mais per impanare"],
    steps: ["Mescola miglio, carota e parmigiano.", "Forma crocchette allungate e passale nel pangrattato.", "Cuoci in forno a 200 °C per 15 minuti."],
    pappa: "Sbriciolate in una crema di verdure.", pezzi: "Intere: morbide dentro e compatte fuori.",
    tip: "Ottimo modo per usare il miglio avanzato.", plate: [["finger", "#E9C46A", 3]] });
  piece("falafel-forno", "Polpettine di ceci al forno", "🧆", { m: 9, al: ["glutine"],
    ing: ["150 g di ceci cotti (senza sale)", "½ zucchina grattugiata", "2 cucchiai di pangrattato", "Un po' di prezzemolo", "1 cucchiaino di olio"],
    steps: ["Schiaccia o frulla grossolanamente i ceci.", "Aggiungi zucchina strizzata, pangrattato, prezzemolo e olio.", "Forma polpettine schiacciate e cuoci a 190 °C per 18-20 minuti."],
    pappa: "Sbriciolate nello yogurt bianco: una salsa fresca.", pezzi: "Polpettine schiacciate, facili da afferrare.",
    tip: "Più morbide dei falafel classici, perché cotte al forno e non fritte.", plate: [["disc", "#D9A85A", 3]] });
  piece("gnocchi-patate", "Gnocchi di patate al pomodoro", "🥔", { m: 9, cat: "famiglia", min: 45, al: ["glutine"],
    ing: ["1 patata farinosa grande", "60-80 g di farina", "3 cucchiai di passata di pomodoro", OIL, "Una fogliolina di basilico"],
    steps: ["Lessa la patata con la buccia, sbucciala e schiacciala ancora calda.", "Impasta con la farina quanto basta per non appiccicare.", "Forma dei cilindri e tagliali in gnocchi lunghi 3 cm.", "Cuoci in acqua bollente non salata finché salgono a galla, poi scolali.", "Condiscili con la passata cotta 10 minuti con olio e basilico."],
    pappa: "Schiacciati con la forchetta nel sugo.", pezzi: "Interi, allungati: perfetti per le manine.",
    tip: "Gli gnocchi piccoli e tondi sono a rischio: falli allungati.", plate: [["gnocchi", "#EFD9A0", 5]] });
  piece("pasta-broccoli", "Pasta con crema di broccoli", "🥦", { m: 8, cat: "famiglia", min: 20, al: ["glutine", "latte"],
    ing: ["30 g di pasta corta", "4-5 cimette di broccolo", "1 cucchiaino di parmigiano", OIL],
    steps: ["Cuoci la pasta e i broccoli insieme in acqua non salata (i broccoli 10 minuti).", "Scola i broccoli e frullali con un po' d'acqua di cottura, l'olio e il parmigiano.", "Condisci la pasta, cotta un po' più del solito."],
    pappa: "Pasta piccola (ditalini, stelline) frullata con la crema.", pezzi: "Fusilli o penne con la crema: si raccolgono con le dita.",
    tip: "Buono per tutta la famiglia: per i grandi aggiungi sale e peperoncino nel piatto, non in pentola.", bowl: "#7FAE55", tex: "grains", top: ["cheese"], plate: [["fusilli", "#9BBF6A", 6]] });
  piece("risotto-zucchine", "Risottino alle zucchine", "🍚", { m: 7, cat: "famiglia", min: 30, al: ["latte"], s: ["primavera", "estate"],
    ing: ["30 g di riso", "1 zucchina", "Brodo vegetale caldo", "1 cucchiaino di parmigiano", OIL],
    steps: ["Cuoci la zucchina a cubetti piccoli con un mestolo di brodo per 5 minuti.", "Aggiungi il riso e cuoci 20 minuti, unendo brodo poco alla volta: deve restare morbido.", "Manteca fuori dal fuoco con parmigiano e olio."],
    pappa: "Frullato a crema le prime volte, poi schiacciato.", pezzi: "Palline di risotto compatte, da afferrare (quando è tiepido si modellano bene).",
    tip: "Il risotto ben cotto e cremoso è uno dei primi piatti «dei grandi» da condividere.", bowl: "#D6E3A6", tex: "grains", top: ["cheese"], plate: [["ball", "#D6E3A6", 4]],
    bb: [["Metti nel boccale la zucchina a pezzi e trita.", "5 sec / vel. 5"], ["Aggiungi l'olio e un mestolo di brodo.", "5 min / 100° / vel. 1"], ["Aggiungi il riso e 4 volte il suo peso di brodo.", "20 min / 100° / antiorario / vel. soft"], ["Manteca con il parmigiano.", ""]] });
  piece("vellutata-piselli", "Vellutata di piselli con crostini", "🟢", { m: 8, cat: "famiglia", min: 25, al: ["glutine"],
    ing: ["100 g di piselli", "1 patata", "½ porro (parte bianca)", "Brodo vegetale", OIL, "1 fetta di pane"],
    steps: ["Cuoci porro, patata e piselli nel brodo per 15 minuti.", "Frulla e passa al colino.", "Tosta leggermente il pane e taglialo a bastoncini.", "Condisci la vellutata con l'olio."],
    pappa: "La vellutata da sola, al cucchiaio.", pezzi: "Bastoncini di pane da intingere nella vellutata.",
    tip: "Intingere è un bel gioco: il bimbo impara a portare il cibo alla bocca.", bowl: "#93C462", tex: "smooth", plate: [["toast", "#E3B26E", 3]] });
  piece("couscous-verdure", "Couscous con verdure a dadini", "🍲", { m: 9, cat: "famiglia", min: 20, al: ["glutine"],
    ing: ["30 g di couscous", "60 ml di brodo vegetale caldo", "Carota, zucchina e peperone a dadini piccolissimi", OIL],
    steps: ["Cuoci le verdure a dadini a vapore per 10 minuti.", "Versa il brodo bollente sul couscous, copri e lascia riposare 5 minuti.", "Sgrana con la forchetta e unisci le verdure e l'olio."],
    pappa: "Più brodo e verdure schiacciate: diventa una minestrina.", pezzi: "Compattato in palline con un po' di ricotta.",
    tip: "Una consistenza granulosa nuova: aiuta a passare dalle creme ai pezzi.", bowl: "#E9D29A", tex: "grains", plate: [["ball", "#E9D29A", 4]] });
  piece("omelette-arrotolata", "Omelette arrotolata agli spinaci", "🍳", { m: 8, min: 15, al: ["uovo"],
    ing: ["1 uovo", "1 cucchiaio di spinaci cotti e tritati (o zucchine)", "Qualche goccia d'olio"],
    steps: ["Sbatti l'uovo con le verdure.", "Cuoci in padella antiaderente a fuoco basso, con il coperchio, finché è ben rappresa.", "Arrotolala e tagliala a girelle o a strisce."],
    pappa: "Sbriciolata nella crema di verdure.", pezzi: "Strisce o girelle: morbide e facili da tenere.",
    tip: "L'uovo deve essere cotto completamente, senza parti liquide.", plate: [["strip", "#F4CB4F", 3, "#4F8A3A"]] });
  piece("pancake-avena", "Pancake di avena e mela", "🥞", { m: 8, cat: "colazione", min: 15, al: ["uovo", "glutine"],
    ing: ["4 cucchiai di fiocchi d'avena frullati", "1 uovo", "½ mela grattugiata", "2-3 cucchiai di latte materno, formula o acqua"],
    steps: ["Mescola tutti gli ingredienti e lascia riposare 5 minuti.", "Cuoci piccole cucchiaiate in padella antiaderente appena unta, 2-3 minuti per lato.", "Controlla che siano cotti al centro."],
    pappa: "Sbriciolati nello yogurt.", pezzi: "Tagliati a strisce.",
    tip: "Senza zucchero: la mela basta a renderli dolci.", plate: [["disc", "#E2B57A", 3]] });
  piece("muffin-banana", "Muffin di banana e avena (senza zucchero)", "🧁", { m: 9, cat: "merenda", min: 30, al: ["uovo", "glutine"],
    ing: ["2 banane mature", "1 uovo", "120 g di fiocchi d'avena frullati", "1 cucchiaino di lievito per dolci", "1 cucchiaio di olio di semi o extravergine"],
    steps: ["Schiaccia le banane e mescola con uovo e olio.", "Aggiungi avena e lievito.", "Versa in pirottini per mini muffin e cuoci a 180 °C per 18-20 minuti."],
    pappa: "Sbriciolato nel latte o nello yogurt.", pezzi: "Interi o a metà: morbidi e soffici.",
    tip: "Si congelano bene: tirane fuori uno la sera per la merenda del giorno dopo.", plate: [["muffin", "#D9A65E", 3]] });
  piece("pane-hummus-avocado", "Bastoncini di pane con crema di avocado", "🥑", { m: 8, cat: "merenda", min: 5, al: ["glutine"],
    ing: ["1 fetta di pane morbido (senza sale aggiunto, se lo trovi)", "¼ di avocado maturo", "Qualche goccia di limone"],
    steps: ["Schiaccia l'avocado con il limone.", "Taglia il pane a bastoncini e spalma la crema."],
    pappa: "La crema di avocado da sola, al cucchiaio.", pezzi: "Bastoncini lunghi come un dito, crosta compresa.",
    tip: "Il pane comune contiene sale: offrilo in piccole quantità o scegli quello senza sale.", store: "Al momento.", plate: [["toast", "#9DC45F", 3]] });
  piece("yogurt-frutta", "Yogurt bianco con frutta schiacciata", "🥛", { m: 6, cat: "merenda", min: 3, al: ["latte"],
    ing: ["4 cucchiai di yogurt intero bianco, senza zucchero", "2 cucchiai di frutta schiacciata (banana, pera, fragole…)"],
    steps: ["Schiaccia la frutta con la forchetta.", "Mescolala allo yogurt."],
    pappa: "Così com'è: cremoso e fresco.", pezzi: "Yogurt sul cucchiaio precaricato da dargli in mano, frutta a spicchi accanto.",
    tip: "Lo yogurt bianco intero va bene dai 6 mesi; evita quelli zuccherati o «per bambini» con zuccheri aggiunti.", store: "Al momento.",
    bowl: "#F7EEF0", tex: "swirl", top: [], plate: [["wedge", "#E5485A", 3]] });
  piece("ricotta-banana", "Crema di ricotta e banana", "🍌", { m: 6, cat: "merenda", min: 3, al: ["latte"],
    ing: ["2 cucchiai di ricotta fresca", "½ banana matura"],
    steps: ["Schiaccia la banana.", "Mescola con la ricotta fino a una crema."],
    pappa: "Una merenda cremosa e nutriente.", pezzi: "Spalmata su bastoncini di pane o su un biscotto senza zucchero.",
    tip: "Ricotta e banana insieme danno proteine ed energia.", store: "Al momento.",
    bowl: "#F5EBC6", tex: "smooth", top: [], plate: [["banana", "#F6E08A", 1]] });
  piece("bastoncini-pesce", "Bastoncini di pesce fatti in casa", "🐟", { m: 9, al: ["pesce", "glutine"],
    ing: ["150 g di filetto di merluzzo o nasello senza spine", "Pangrattato o fiocchi di mais frullati", "Qualche goccia d'olio"],
    steps: ["Taglia il pesce a bastoncini spessi un dito.", "Passali nel pangrattato premendo bene.", "Cuoci in forno a 200 °C su carta forno per 12-15 minuti, girandoli a metà."],
    pappa: "Sbriciolati nel purè.", pezzi: "Interi: croccanti fuori, morbidi dentro.",
    tip: "Molto meglio di quelli surgelati pronti: niente sale e niente fritto.", plate: [["finger", "#E8B66F", 3]] });
  piece("cubetti-tofu", "Cubetti di tofu dorati", "⬜", { m: 9, al: ["soia"], min: 15,
    ing: ["80 g di tofu al naturale", "Qualche goccia d'olio", "Un pizzico di curcuma (facoltativa)"],
    steps: ["Asciuga il tofu e taglialo a bastoncini.", "Cuocilo in padella antiaderente con poco olio e la curcuma, 3-4 minuti per lato."],
    pappa: "Schiacciato nella crema di verdure.", pezzi: "Bastoncini morbidi, facili da tenere.",
    tip: "Il tofu porta proteine e calcio; la soia è uno degli allergeni da introdurre.", plate: [["stick", "#F3E6B5", 4]] });
  piece("minestrina-stelline", "Minestrina di stelline e verdure", "⭐", { m: 7, cat: "famiglia", min: 30, al: ["glutine", "latte"],
    ing: ["1 carota, 1 zucchina, 1 patata", "400 ml d'acqua", "2 cucchiai di stelline", "1 cucchiaino di parmigiano", OIL],
    steps: ["Cuoci le verdure a cubetti piccolissimi nell'acqua per 20 minuti.", "Aggiungi le stelline e cuoci 1-2 minuti più del normale.", "Condisci con olio e parmigiano."],
    pappa: "Schiaccia le verdure con la forchetta.", pezzi: "Le verdure a cubetti si prendono con le dita.",
    tip: "Un passo in più verso i pezzi: verdure piccole e morbide nella minestra.", bowl: "#EBCB86", tex: "stars", top: ["cheese"], plate: [["cube", "#EE8A3C", 6]] });

  window.RECIPES = (window.RECIPES || []).concat(out);
  window.EXTRA_LOOKS = Object.assign(window.EXTRA_LOOKS || {}, looks);
  window.BIMBY = Object.assign(window.BIMBY || {}, bimby);
})();
