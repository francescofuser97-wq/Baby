/* Giochi e attività. min/max: età in mesi; area: area di sviluppo. */
window.AREAS = {
  motoria: { n: "Movimento", e: "🤸", c: "green" },
  mani: { n: "Manualità", e: "✋", c: "yellow" },
  linguaggio: { n: "Linguaggio", e: "💬", c: "blue" },
  sensi: { n: "Sensi", e: "🌈", c: "pink" },
  mente: { n: "Scoperta", e: "🧠", c: "purple" },
  affetti: { n: "Relazione", e: "💛", c: "peach" },
  aperto: { n: "All'aperto", e: "🌳", c: "green" }
};

window.ACTIVITIES = [
  {
    id: "tummy-specchio", t: "Pancia in giù davanti allo specchio", e: "🪞", min: 4, max: 7, area: "motoria", dur: "3-5 min, più volte al giorno",
    mat: ["Tappetino o coperta", "Specchio infrangibile", "Un gioco colorato"],
    how: ["Mettilo a pancia in giù sul tappeto, quando è sveglio e di buon umore.", "Appoggia lo specchio davanti a lui, in verticale.", "Sdraiati anche tu alla sua altezza: parlagli e chiamalo per nome.", "Smetti appena si stanca: meglio tante volte brevi."],
    why: "Rinforza collo, schiena e braccia: sono i muscoli che gli serviranno per stare seduto e gattonare. Vedersi allo specchio lo affascina.",
    safe: "La pancia in giù si fa solo da svegli e con un adulto presente."
  },
  {
    id: "sonaglio", t: "Afferra il sonaglio", e: "🪇", min: 4, max: 7, area: "mani", dur: "5 min",
    mat: ["Un sonaglio o un anello leggero"],
    how: ["Porgigli il sonaglio al centro, all'altezza del petto.", "Poi un po' più a destra, poi a sinistra.", "Quando lo afferra, scuotilo insieme a lui e sorridi.", "Prova a porgerglielo alla mano che ha già occupata: proverà a passarlo all'altra."],
    why: "Allena la coordinazione occhio-mano e il passaggio degli oggetti da una mano all'altra."
  },
  {
    id: "rotolare", t: "Il gioco del rotolamento", e: "🔄", min: 4, max: 7, area: "motoria", dur: "5 min",
    mat: ["Tappeto", "Un gioco che lo attira"],
    how: ["Mettilo sulla schiena e posa il gioco al suo fianco, un po' fuori portata.", "Incoraggialo a girarsi per prenderlo.", "Se serve, aiutalo spingendo dolcemente l'anca.", "Festeggia ogni tentativo!"],
    why: "Rotolare è la sua prima forma di spostamento autonomo e rinforza gli addominali."
  },
  {
    id: "bottiglie-sensoriali", t: "Bottiglie sensoriali fai da te", e: "🫙", min: 4, max: 12, area: "sensi", dur: "10 min",
    mat: ["Bottigliette di plastica piccole e lisce", "Acqua, olio e colorante alimentare", "Glitter, perline, bottoni, riso", "Colla a caldo o nastro forte per il tappo"],
    how: ["Riempi ogni bottiglia con un contenuto diverso: acqua e glitter, acqua e olio colorato, riso secco.", "Sigilla il tappo con colla a caldo e nastro.", "Falle rotolare davanti a lui quando è a pancia in giù, oppure lascia che le scuota."],
    why: "Colori, movimento e suoni diversi stimolano vista e udito, e il desiderio di raggiungerle lo spinge a muoversi.",
    safe: "Controlla sempre che il tappo sia ben sigillato."
  },
  {
    id: "cucu", t: "Cucù… settete!", e: "🙈", min: 5, max: 12, area: "mente", dur: "Quando volete",
    mat: ["Le tue mani o un foulard leggero"],
    how: ["Copriti il viso con le mani o con il foulard.", "Chiedi: «Dov'è la mamma? Dov'è il papà?»", "Scopriti con un sorriso: «Cucù… settete!»", "Più avanti, copri lui con il foulard e lascia che se lo tolga da solo."],
    why: "Insegna che le cose e le persone esistono anche quando non si vedono (permanenza dell'oggetto) e rende più facili i piccoli distacchi."
  },
  {
    id: "lettura-cartonati", t: "Leggiamo insieme", e: "📚", min: 4, max: 24, area: "linguaggio", dur: "5-10 min al giorno",
    mat: ["Libri cartonati con immagini grandi e chiare", "Libri tattili con materiali diversi"],
    how: ["Tienilo in braccio, così vede il libro e sente la tua voce vicina.", "Indica le figure e nominale: «Guarda, il cane! Bau bau!»", "Lascia che tocchi, giri le pagine e assaggi il libro (sì, anche quello!).", "Ripeti gli stessi libri: ai bambini piccoli piace ritrovare ciò che conoscono."],
    why: "La lettura ad alta voce fin dai primi mesi sviluppa linguaggio, attenzione e legame affettivo. È il cuore del programma Nati per Leggere."
  },
  {
    id: "conversazione", t: "Conversazioni a turno", e: "🗣️", min: 4, max: 10, area: "linguaggio", dur: "Durante il cambio o il bagnetto",
    mat: ["Nessuno: bastate voi due"],
    how: ["Mettiti faccia a faccia, a circa 30 cm.", "Quando fa un verso, rispondigli imitandolo.", "Fai una pausa e aspetta il suo «turno».", "Aggiungi ogni tanto un suono nuovo («ma-ma», «ba-ba») e guarda se prova a copiarti."],
    why: "Così impara il ritmo della conversazione e capisce che la sua voce ha un effetto sugli altri."
  },
  {
    id: "filastrocche", t: "Filastrocche con i gesti", e: "🎶", min: 4, max: 24, area: "affetti", dur: "5 min",
    mat: ["Le tue ginocchia e la tua voce"],
    how: ["«Trotta trotta cavallino»: tienilo seduto sulle ginocchia e fallo ballonzolare piano.", "«Batti batti le manine»: batti le sue manine a ritmo.", "«Arriva la formichina»: fai camminare le dita sul suo braccio fino al solletico.", "«Giro giro tondo» in braccio, girando piano su te stesso."],
    why: "Ritmo, rime e attesa della sorpresa allenano memoria e linguaggio, e lo fanno ridere di gusto."
  },
  {
    id: "massaggio", t: "Massaggio dopo il bagnetto", e: "🤲", min: 0, max: 9, area: "affetti", dur: "10 min",
    mat: ["Olio vegetale (di mandorle o di girasole)", "Asciugamano caldo", "Stanza tiepida"],
    how: ["Scegli un momento tranquillo, non subito dopo la pappa.", "Scaldati un po' d'olio tra le mani.", "Massaggia gambe, piedini, pancia (in senso orario), braccia e schiena, con movimenti lenti.", "Guardalo negli occhi e parlagli piano. Se si agita, fermati."],
    why: "Rilassa, aiuta a conoscere il proprio corpo e rafforza il legame. Molti bambini dormono meglio dopo."
  },
  {
    id: "bolle", t: "Bolle di sapone", e: "🫧", min: 4, max: 24, area: "sensi", dur: "5-10 min",
    mat: ["Flacone per bolle di sapone"],
    how: ["Soffia le bolle lentamente davanti a lui, non sul viso.", "Nomina: «Bolla! Pop!» quando scoppiano.", "Da più grande proverà a prenderle e a scoppiarle con le mani."],
    why: "Allena lo sguardo che segue gli oggetti in movimento, la coordinazione e la gioia della sorpresa."
  },
  {
    id: "specchio-corpo", t: "Allo specchio: dov'è il naso?", e: "👃", min: 5, max: 18, area: "linguaggio", dur: "5 min",
    mat: ["Uno specchio grande"],
    how: ["Mettetevi davanti allo specchio insieme.", "Tocca il suo naso e il tuo: «Ecco il naso di… e quello di mamma/papà!»", "Fai lo stesso con occhi, bocca, orecchie, mani.", "Fai facce buffe e guarda se ti imita."],
    why: "Aiuta a riconoscersi e a imparare i nomi delle parti del corpo."
  },
  {
    id: "cestino-tesori", t: "Il cestino dei tesori", e: "🧺", min: 6, max: 12, area: "mente", dur: "15-20 min",
    mat: ["Un cestino basso e robusto", "10-15 oggetti di uso quotidiano e naturali: cucchiaio di legno, frusta piccola in metallo, spazzola, pigna grande, palla di lana, anello di legno, mestolino, spugna naturale"],
    how: ["Quando sta seduto (anche con un cuscino dietro), mettigli il cestino accanto.", "Lascialo scegliere ed esplorare con mani e bocca.", "Tu resta vicino, tranquillo, senza dirigere il gioco.", "Cambia qualche oggetto ogni tanto per mantenere viva la curiosità."],
    why: "È un classico della pedagogia per la prima infanzia: pesi, temperature, suoni e consistenze diverse nutrono la sua curiosità e la concentrazione.",
    safe: "Usa oggetti più grandi di un rotolo di carta igienica, senza parti staccabili, puliti e controllati spesso."
  },
  {
    id: "foulard", t: "La scatola dei foulard", e: "🧣", min: 6, max: 12, area: "mani", dur: "10 min",
    mat: ["Una scatola di fazzoletti vuota", "Foulard leggeri o pezzi di stoffa colorati"],
    how: ["Annoda i foulard uno all'altro, oppure lasciali separati.", "Infilali nella scatola lasciandone sporgere un angolo.", "Lascia che li tiri fuori uno dopo l'altro.", "Puoi anche lanciarli in aria e farli cadere lentamente su di lui."],
    why: "Allena la presa, la forza delle dita e l'idea di causa-effetto.",
    safe: "Mettili via finito il gioco: le stoffe non vanno lasciate nel lettino."
  },
  {
    id: "musica-pentole", t: "L'orchestra di cucina", e: "🥁", min: 6, max: 24, area: "sensi", dur: "10 min",
    mat: ["Pentole e coperchi", "Cucchiai di legno", "Bottigliette sigillate con riso o pasta (maracas)"],
    how: ["Siediti con lui sul pavimento della cucina.", "Mostragli come battere il cucchiaio sulla pentola.", "Cantate una canzone e suonate a tempo, piano e poi forte.", "Prova a fermarti: «Stop!» e poi ripartite."],
    why: "Scopre i suoni, il ritmo e che le sue azioni producono effetti. Fermarsi e ripartire allena l'autocontrollo."
  },
  {
    id: "pasticciare", t: "Pasticciare con il cibo", e: "🍝", min: 6, max: 12, area: "sensi", dur: "Durante il pasto",
    mat: ["Seggiolone", "Telo sotto il seggiolone", "Cibi morbidi di consistenze diverse"],
    how: ["Metti sul vassoio piccole quantità di cibi diversi: pasta, purè, pezzetti di frutta cotta.", "Lascia che li tocchi, li schiacci, li faccia cadere.", "Nomina le consistenze: «morbido», «liscio», «appiccicoso»."],
    why: "Toccare il cibo è il primo passo per accettarlo in bocca. È anche un'ottima esperienza sensoriale."
  },
  {
    id: "torre-bicchieri", t: "Costruisci e abbatti", e: "🏗️", min: 6, max: 14, area: "mente", dur: "10 min",
    mat: ["Bicchieri di plastica impilabili o cubi morbidi"],
    how: ["Costruisci una torre davanti a lui.", "Lascia che la butti giù e festeggiate insieme: «Bum!»", "Ricostruisci e ricominciate.", "Più avanti proverà a impilare due pezzi da solo."],
    why: "Causa-effetto, coordinazione e tanto divertimento. Ripetere lo stesso gioco gli dà sicurezza."
  },
  {
    id: "seduto-cuscini", t: "Seduto nel nido di cuscini", e: "🛋️", min: 5, max: 8, area: "motoria", dur: "5-10 min",
    mat: ["Cuscino da allattamento o cuscini morbidi", "Qualche gioco"],
    how: ["Fallo sedere sul tappeto, con il cuscino attorno ai fianchi e dietro.", "Metti i giochi davanti, a portata di mano.", "Lascia che provi a sporgersi per prenderli e a ritrovare l'equilibrio."],
    why: "Allena l'equilibrio da seduto, che arriva in genere tra i 6 e gli 8 mesi."
  },
  {
    id: "passeggiata-sensoriale", t: "Passeggiata delle scoperte", e: "🍂", min: 4, max: 24, area: "aperto", dur: "20-30 min",
    mat: ["Fascia, marsupio o passeggino", "Vestiti a strati"],
    how: ["Durante la passeggiata fermati spesso: fagli toccare una foglia, la corteccia di un albero, un sasso liscio.", "In autunno fagli sentire il rumore delle foglie secche sotto i piedi.", "Nomina tutto: «Questa è una foglia gialla, senti come scrocchia!»", "Ascoltate insieme i suoni: uccellini, campane, cani."],
    why: "La natura è il laboratorio sensoriale più ricco che esista. All'aperto il bimbo si calma, osserva e dorme meglio.",
    safe: "Attento che non metta in bocca foglie, sassolini o bacche."
  },
  {
    id: "album-famiglia", t: "L'album della famiglia", e: "📸", min: 6, max: 24, area: "linguaggio", dur: "5-10 min",
    mat: ["Un piccolo album con foto stampate di mamma, papà, nonni, zii, animali di casa"],
    how: ["Sfogliatelo insieme: «Questa è la nonna! E qui c'è il nonno!»", "Imita i versi degli animali di casa.", "Più avanti chiedigli: «Dov'è il papà?» e lascia che lo indichi."],
    why: "Riconoscere i volti cari lo rassicura, e i nomi delle persone sono spesso tra le prime parole."
  },
  {
    id: "nascondi-gioco", t: "Dov'è finito il gioco?", e: "🎁", min: 7, max: 12, area: "mente", dur: "5-10 min",
    mat: ["Un gioco che gli piace", "Un panno o una tazza capovolta"],
    how: ["Mostragli il gioco, poi coprilo con il panno mentre ti guarda.", "Chiedi: «Dov'è?»", "Aspetta che sollevi il panno; se non lo fa, lascia sporgere un pezzetto di gioco.", "Più avanti nascondilo sotto una di due tazze."],
    why: "Allena la memoria e la comprensione che gli oggetti continuano a esistere anche se non si vedono."
  },
  {
    id: "dentro-fuori", t: "Dentro e fuori", e: "🫙", min: 8, max: 15, area: "mani", dur: "10 min",
    mat: ["Un contenitore largo (scatola, barattolo di plastica)", "Palline grandi, tappi grandi, mollette di legno"],
    how: ["Mostragli come mettere un oggetto nel contenitore: «Dentro!»", "Rovescia tutto: «Fuori!»", "Lascia che ripeta il gioco quante volte vuole."],
    why: "Allena la presa fine, la coordinazione e i primi concetti di spazio.",
    safe: "Usa solo oggetti che non entrano in un rotolo di carta igienica."
  },
  {
    id: "percorso-cuscini", t: "Il percorso del gattonatore", e: "🐛", min: 7, max: 14, area: "motoria", dur: "10-15 min",
    mat: ["Cuscini del divano", "Coperte arrotolate", "Una scatola grande aperta come tunnel"],
    how: ["Disponi sul pavimento cuscini e coperte da scavalcare.", "Mettiti in fondo al percorso con il suo gioco preferito.", "Chiamalo e incoraggialo a raggiungerti.", "Aggiungi un tunnel fatto con una scatola aperta dai due lati."],
    why: "Rinforza braccia e gambe, la coordinazione e la fiducia nel proprio corpo."
  },
  {
    id: "pinza", t: "Raccogli i pezzetti", e: "🤏", min: 8, max: 12, area: "mani", dur: "Durante il pasto",
    mat: ["Pezzetti morbidi di cibo grandi come un cece (piselli schiacciati, pasta, banana)"],
    how: ["Metti pochi pezzetti alla volta sul vassoio del seggiolone.", "Lascia che provi a prenderli con pollice e indice.", "Non aiutarlo troppo: la fatica fa parte del gioco."],
    why: "La presa a pinza è una tappa importante per la manualità fine, e sarà la base per disegnare e allacciarsi le scarpe.",
    safe: "Sempre seduto, sempre con un adulto vicino."
  },
  {
    id: "ciao-ciao", t: "Ciao ciao, batti le mani, indica", e: "👋", min: 8, max: 15, area: "linguaggio", dur: "Durante la giornata",
    mat: ["Nessuno"],
    how: ["Fai «ciao» con la mano ogni volta che qualcuno arriva o va via.", "Batti le mani quando c'è qualcosa da festeggiare.", "Indica spesso le cose e nominale: «Guarda, l'aereo!»", "Quando lui indica, rispondi nominando ciò che ha indicato."],
    why: "Gesti e indicazione sono un ponte verso le parole: chi indica di più tende a parlare prima."
  },
  {
    id: "palla", t: "Rotoliamo la palla", e: "⚽", min: 8, max: 18, area: "motoria", dur: "10 min",
    mat: ["Una palla morbida, grande"],
    how: ["Sedetevi a terra uno di fronte all'altro, con le gambe aperte.", "Fai rotolare la palla verso di lui: «A te!»", "Incoraggialo a rimandarla: «A me!»"],
    why: "Insegna il fare a turno, la coordinazione e lo sguardo condiviso. È una delle prime forme di gioco sociale."
  },
  {
    id: "in-piedi-divano", t: "Su, in piedi al divano", e: "🧍", min: 9, max: 14, area: "motoria", dur: "10 min",
    mat: ["Divano o tavolino basso e stabile", "Giochi"],
    how: ["Metti alcuni giochi sul divano, poco più in alto della sua testa quando è in ginocchio.", "Lascia che si aggrappi e si tiri su per prenderli.", "Sposta i giochi lungo il divano per incoraggiarlo a fare qualche passo laterale."],
    why: "Prepara il cammino: forza delle gambe, equilibrio e spostamento laterale tenendosi."
  },
  {
    id: "travasi-bagnetto", t: "Travasi nel bagnetto", e: "🛁", min: 9, max: 24, area: "mani", dur: "Durante il bagnetto",
    mat: ["Bicchieri di plastica", "Imbuto", "Spugne", "Annaffiatoio giocattolo"],
    how: ["Durante il bagnetto dagli bicchieri e contenitori.", "Mostra come riempire e svuotare, come strizzare la spugna.", "Nomina: «pieno», «vuoto», «piove!»"],
    why: "Allena i movimenti delle mani e introduce i concetti di quantità, causa ed effetto.",
    safe: "Mai lasciarlo solo nell'acqua, nemmeno per un attimo."
  },
  {
    id: "pittura-yogurt", t: "Pittura commestibile", e: "🎨", min: 9, max: 18, area: "sensi", dur: "10-15 min",
    mat: ["Yogurt bianco", "Coloranti naturali: barbabietola (rosa), curcuma (giallo), spinaci frullati (verde)", "Vassoio del seggiolone o un cartoncino"],
    how: ["Dividi lo yogurt in ciotoline e colora ciascuna.", "Mettine qualche cucchiaio sul vassoio.", "Lascia che dipinga con le mani: se assaggia, nessun problema!"],
    why: "Un'esperienza sensoriale sicura e un primo approccio al colore e alla creatività."
  },
  {
    id: "incastri", t: "Anelli e incastri", e: "🧩", min: 10, max: 18, area: "mente", dur: "10 min",
    mat: ["Piramide di anelli", "Incastri semplici di legno con pomelli (cerchio, quadrato)"],
    how: ["Mostragli come sfilare gli anelli: all'inizio sarà la parte più divertente.", "Poi aiutalo a rimetterli, senza preoccuparti dell'ordine.", "Con gli incastri, inizia dal cerchio: è il più facile."],
    why: "Allena la coordinazione occhio-mano, la soluzione di piccoli problemi e la pazienza."
  },
  {
    id: "spingi-scatola", t: "Spingi la scatola", e: "📦", min: 10, max: 16, area: "motoria", dur: "10 min",
    mat: ["Una scatola robusta con dentro qualche libro, per darle peso", "Oppure un carrellino primi passi"],
    how: ["Metti la scatola davanti a lui mentre è in piedi aggrappato.", "Lascia che la spinga camminando dietro.", "Mettiti a qualche metro di distanza e chiamalo."],
    why: "Dà sicurezza nei primi passi e rinforza le gambe."
  },
  {
    id: "imitazione", t: "Facciamo finta", e: "☎️", min: 10, max: 24, area: "affetti", dur: "Durante la giornata",
    mat: ["Oggetti di casa: un telefono giocattolo, una spazzola, un cucchiaio, una pentolina"],
    how: ["Fai finta di telefonare: «Pronto, nonna?» e passagli il telefono.", "Pettinati, poi pettina lui, poi il peluche.", "Dai «da mangiare» all'orsetto con il cucchiaio."],
    why: "Il gioco di finzione nasce dall'imitazione: sviluppa immaginazione, linguaggio ed empatia."
  },
  {
    id: "emozioni", t: "Dare un nome alle emozioni", e: "😊", min: 6, max: 24, area: "affetti", dur: "Durante la giornata",
    mat: ["Nessuno"],
    how: ["Quando piange o si arrabbia, dai un nome a ciò che prova: «Sei arrabbiato perché il gioco è caduto.»", "Fai lo stesso con le emozioni belle: «Che felice sei quando arriva il papà!»", "Nei libri, indica i volti dei personaggi: «È triste? È contento?»"],
    why: "Sentirsi capito lo calma, e piano piano imparerà a riconoscere e gestire le proprie emozioni."
  },
  {
    id: "routine-nanna", t: "Il rituale della nanna", e: "🌙", min: 4, max: 24, area: "affetti", dur: "15-20 min ogni sera",
    mat: ["Luce soffusa", "Un libro", "Una ninna nanna"],
    how: ["Ogni sera la stessa sequenza: bagnetto o lavaggio, pigiama, latte, libro, canzone, nanna.", "Abbassa le luci e i rumori di casa.", "Usa sempre le stesse parole per la buonanotte."],
    why: "La ripetizione lo rassicura e lo aiuta a capire che è ora di dormire."
  },
  {
    id: "altalena", t: "Al parco giochi", e: "🛝", min: 8, max: 24, area: "aperto", dur: "30 min",
    mat: ["Altalena a cestello per i piccoli", "Vestiti comodi"],
    how: ["Quando sta seduto ben stabile, prova l'altalena a cestello, spingendo piano.", "Guardalo negli occhi e fai «cucù» a ogni oscillazione.", "Lascia che guardi gli altri bambini giocare: anche osservare è imparare."],
    why: "Il dondolio stimola l'equilibrio e il sistema vestibolare; il parco è la sua prima occasione di stare con altri bambini."
  },
  {
    id: "scarabocchi", t: "I primi scarabocchi", e: "🖍️", min: 12, max: 24, area: "mani", dur: "10 min",
    mat: ["Pastelli a cera grossi (atossici)", "Fogli grandi fissati al tavolo con lo scotch"],
    how: ["Fissa il foglio al tavolo o al pavimento.", "Mostragli come lasciare un segno.", "Commenta con entusiasmo i suoi segni, senza chiedere «cos'è?»."],
    why: "Lasciare una traccia lo affascina: allena la mano e la creatività."
  },
  {
    id: "cucinare-insieme", t: "Il piccolo aiuto-cuoco", e: "👩‍🍳", min: 15, max: 24, area: "mani", dur: "15 min",
    mat: ["Ciotola", "Cucchiaio di legno", "Ingredienti sicuri: banana da schiacciare, fiocchi d'avena da mescolare"],
    how: ["Mettilo in sicurezza al tavolo o su una torre di apprendimento.", "Lascia che versi, mescoli e schiacci.", "Poi assaggiate insieme quello che avete preparato."],
    why: "Autonomia, manualità, nuovi sapori e la soddisfazione di aver aiutato."
  },
  {
    id: "ballare", t: "Balliamo!", e: "💃", min: 6, max: 24, area: "motoria", dur: "5-10 min",
    mat: ["Musica allegra"],
    how: ["Tienilo in braccio e ballate piano, poi più veloce.", "Quando sta in piedi, tienilo per le mani e ondeggiate insieme.", "Usate la «musica-stop»: ci si ferma quando la musica si spegne."],
    why: "Ritmo, equilibrio, coordinazione e tanta allegria condivisa."
  }
];
