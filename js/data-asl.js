/* Azienda sanitaria (ASL / ULSS / ATS / ASP…) in base al comune e alla provincia.
   Dove una provincia ha più aziende, si usano elenchi di comuni; se il comune non è in elenco
   l'app mostra le possibili aziende e invita a verificare. Aggiornato a ottobre 2026. */
(function () {
  // [parole chiave della provincia (come la scrive OpenStreetMap), nome dell'azienda, certa?]
  const BY_PROVINCE = [
    // Veneto (le province con più ULSS sono gestite più sotto, comune per comune)
    [["Belluno"], "ULSS 1 Dolomiti", true], [["Treviso"], "ULSS 2 Marca Trevigiana", true], [["Rovigo"], "ULSS 5 Polesana", true],
    [["Padova"], "ULSS 6 Euganea", true], [["Verona"], "ULSS 9 Scaligera", true],
    // Lombardia (prevenzione e vaccinazioni: ASST del territorio)
    [["Milano", "Lodi"], "ATS Città Metropolitana di Milano", true], [["Bergamo"], "ATS Bergamo", true], [["Brescia"], "ATS Brescia", false],
    [["Monza", "Brianza", "Lecco"], "ATS Brianza", true], [["Como", "Varese"], "ATS Insubria", true], [["Sondrio"], "ATS della Montagna", true],
    [["Pavia"], "ATS Pavia", true], [["Cremona", "Mantova"], "ATS Val Padana", true],
    // Piemonte e Valle d'Aosta
    [["Alessandria"], "ASL AL", true], [["Asti"], "ASL AT", true], [["Biella"], "ASL BI", true], [["Novara"], "ASL NO", true],
    [["Verbano", "Cusio", "Ossola"], "ASL VCO", true], [["Vercelli"], "ASL VC", true], [["Cuneo"], "ASL CN1 o ASL CN2 (Alba-Bra)", false],
    [["Torino"], "ASL Città di Torino, TO3, TO4 o TO5", false], [["Aosta", "Valle d'Aosta", "Vallée d'Aoste"], "Azienda USL Valle d'Aosta", true],
    // Liguria
    [["Imperia"], "ASL 1 Imperiese", true], [["Savona"], "ASL 2 Savonese", true], [["La Spezia", "Spezia"], "ASL 5 Spezzino", true],
    [["Genova"], "ASL 3 Genovese o ASL 4 Chiavarese", false],
    // Trentino-Alto Adige e Friuli Venezia Giulia
    [["Trento", "Trentino"], "Azienda Provinciale per i Servizi Sanitari (APSS)", true], [["Bolzano", "Bozen", "Alto Adige", "Südtirol"], "Azienda Sanitaria dell'Alto Adige", true],
    [["Trieste", "Gorizia"], "ASUGI – Azienda Sanitaria Universitaria Giuliano Isontina", true], [["Udine"], "ASUFC – Azienda Sanitaria Universitaria Friuli Centrale", true],
    [["Pordenone"], "ASFO – Azienda Sanitaria Friuli Occidentale", true],
    // Emilia-Romagna (Bologna gestita più sotto)
    [["Piacenza"], "AUSL di Piacenza", true], [["Parma"], "AUSL di Parma", true], [["Reggio nell'Emilia", "Reggio Emilia"], "AUSL di Reggio Emilia", true],
    [["Modena"], "AUSL di Modena", true], [["Ferrara"], "AUSL di Ferrara", true], [["Ravenna", "Forlì", "Cesena", "Rimini"], "AUSL della Romagna", true],
    // Toscana
    [["Firenze", "Prato", "Pistoia"], "Azienda USL Toscana Centro", true], [["Massa", "Carrara", "Lucca", "Pisa", "Livorno"], "Azienda USL Toscana Nord Ovest", true],
    [["Siena", "Arezzo", "Grosseto"], "Azienda USL Toscana Sud Est", true],
    // Umbria e Marche
    [["Terni"], "USL Umbria 2", true], [["Perugia"], "USL Umbria 1 o USL Umbria 2", false],
    [["Pesaro", "Urbino"], "AST Pesaro Urbino", true], [["Ancona"], "AST Ancona", true], [["Macerata"], "AST Macerata", true],
    [["Fermo"], "AST Fermo", true], [["Ascoli"], "AST Ascoli Piceno", true],
    // Lazio
    [["Roma"], "ASL Roma (1-6, in base alla zona)", false], [["Frosinone"], "ASL Frosinone", true], [["Latina"], "ASL Latina", true],
    [["Rieti"], "ASL Rieti", true], [["Viterbo"], "ASL Viterbo", true],
    // Abruzzo e Molise
    [["L'Aquila", "Aquila"], "ASL 1 Avezzano-Sulmona-L'Aquila", true], [["Teramo"], "ASL Teramo", true], [["Pescara"], "ASL Pescara", true],
    [["Chieti"], "ASL Lanciano-Vasto-Chieti", true], [["Campobasso", "Isernia", "Molise"], "ASREM – Azienda Sanitaria Regionale del Molise", true],
    // Campania
    [["Napoli"], "ASL Napoli 1 Centro, 2 Nord o 3 Sud", false], [["Caserta"], "ASL Caserta", true], [["Benevento"], "ASL Benevento", true],
    [["Avellino"], "ASL Avellino", true], [["Salerno"], "ASL Salerno", true],
    // Puglia
    [["Barletta", "Andria", "Trani"], "ASL BT (Barletta-Andria-Trani)", true], [["Bari"], "ASL Bari", true], [["Brindisi"], "ASL Brindisi", true],
    [["Foggia"], "ASL Foggia", true], [["Lecce"], "ASL Lecce", true], [["Taranto"], "ASL Taranto", true],
    // Basilicata e Calabria
    [["Potenza"], "ASP Basilicata", true], [["Matera"], "ASM Matera", true],
    [["Cosenza"], "ASP Cosenza", true], [["Catanzaro"], "ASP Catanzaro", true], [["Crotone"], "ASP Crotone", true],
    [["Vibo"], "ASP Vibo Valentia", true], [["Reggio di Calabria", "Reggio Calabria"], "ASP Reggio Calabria", true],
    // Sicilia
    [["Agrigento"], "ASP Agrigento", true], [["Caltanissetta"], "ASP Caltanissetta", true], [["Catania"], "ASP Catania", true],
    [["Enna"], "ASP Enna", true], [["Messina"], "ASP Messina", true], [["Palermo"], "ASP Palermo", true],
    [["Ragusa"], "ASP Ragusa", true], [["Siracusa"], "ASP Siracusa", true], [["Trapani"], "ASP Trapani", true],
    // Sardegna
    [["Gallura"], "ASL 2 Gallura", true], [["Sassari"], "ASL 1 Sassari", true], [["Nuoro"], "ASL 3 Nuoro", true], [["Ogliastra"], "ASL 4 Ogliastra", true],
    [["Oristano"], "ASL 5 Oristano", true], [["Medio Campidano"], "ASL 6 Medio Campidano", true], [["Sulcis"], "ASL 7 Sulcis", true],
    [["Cagliari"], "ASL 8 Cagliari", true], [["Sud Sardegna"], "ASL 6 Medio Campidano o ASL 7 Sulcis", false]
  ];

  // Province divise tra più aziende: elenchi dei comuni
  const SPLIT = {
    Vicenza: {
      lists: [
        ["ULSS 7 Pedemontana", ["Bassano del Grappa", "Asiago", "Gallio", "Enego", "Foza", "Lusiana Conco", "Roana", "Rotzo", "Cassola", "Romano d'Ezzelino", "Rosà", "Rossano Veneto",
          "Tezze sul Brenta", "Cartigliano", "Nove", "Pove del Grappa", "Solagna", "Valbrenta", "Marostica", "Mason Vicentino", "Colceresa", "Pianezze", "Schiavon", "Mussolente",
          "Thiene", "Schio", "Malo", "Marano Vicentino", "Santorso", "Zanè", "Zugliano", "Carrè", "Chiuppano", "Piovene Rocchette", "Caltrano", "Calvene", "Lugo di Vicenza",
          "Breganze", "Fara Vicentino", "Salcedo", "Sarcedo", "Montecchio Precalcino", "Villaverla", "Arsiero", "Velo d'Astico", "Valdastico", "Pedemonte", "Posina", "Laghi",
          "Tonezza del Cimone", "Cogollo del Cengio", "Valli del Pasubio", "Torrebelvicino", "San Vito di Leguzzano", "Monte di Malo"]],
        ["ULSS 8 Berica", ["Vicenza", "Montecchio Maggiore", "Arzignano", "Valdagno", "Chiampo", "Lonigo", "Noventa Vicentina", "Creazzo", "Sovizzo", "Altavilla Vicentina", "Brendola",
          "Trissino", "Montebello Vicentino", "Torri di Quartesolo", "Camisano Vicentino", "Arcugnano", "Recoaro Terme", "Cornedo Vicentino", "Castelgomberto", "Brogliano",
          "Montorso Vicentino", "Zermeghedo", "Gambellara", "Sarego", "Alonte", "Orgiano", "Sossano", "Barbarano Mossano", "Longare", "Grumolo delle Abbadesse",
          "Bolzano Vicentino", "Quinto Vicentino", "Monticello Conte Otto", "Costabissara", "Caldogno", "Gambugliano", "Monteviale", "Altissimo", "Crespadoro",
          "San Pietro Mussolino", "Nogarole Vicentino", "Castegnero", "Nanto", "Albettone", "Agugliaro", "Campiglia dei Berici", "Pojana Maggiore", "Asigliano Veneto",
          "Villaga", "Grisignano di Zocco", "Montegalda", "Montegaldella", "Torri di Quartesolo"]]
      ],
      fallback: "ULSS 7 Pedemontana o ULSS 8 Berica"
    },
    Venezia: {
      lists: [
        ["ULSS 4 Veneto Orientale", ["San Donà di Piave", "Portogruaro", "Jesolo", "Caorle", "Eraclea", "San Michele al Tagliamento", "Concordia Sagittaria", "Fossalta di Portogruaro",
          "Teglio Veneto", "Gruaro", "Cinto Caomaggiore", "Pramaggiore", "Annone Veneto", "San Stino di Livenza", "Santo Stino di Livenza", "Torre di Mosto", "Ceggia",
          "Noventa di Piave", "Fossalta di Piave", "Musile di Piave", "Meolo"]],
        ["ULSS 3 Serenissima", ["Venezia", "Mirano", "Dolo", "Spinea", "Martellago", "Noale", "Scorzè", "Salzano", "Santa Maria di Sala", "Mira", "Stra", "Fiesso d'Artico",
          "Fossò", "Vigonovo", "Campagna Lupia", "Camponogara", "Pianiga", "Campolongo Maggiore", "Cona", "Chioggia", "Cavarzere", "Marcon", "Quarto d'Altino"]]
      ],
      fallback: "ULSS 3 Serenissima o ULSS 4 Veneto Orientale"
    },
    Bologna: {
      lists: [["AUSL di Imola", ["Imola", "Castel San Pietro Terme", "Medicina", "Dozza", "Mordano", "Casalfiumanese", "Borgo Tossignano", "Fontanelice", "Castel del Rio", "Castel Guelfo di Bologna"]]],
      fallback: "AUSL di Bologna", fallbackCertain: true
    }
  };

  const norm = s => String(s || "").replace(/^(Provincia (autonoma )?(di|del|della|dell')\s*|Città [Mm]etropolitana di\s*|Libero consorzio comunale di\s*)/, "").replace("Roma Capitale", "Roma").trim();

  // Restituisce { name, certain, site } per il comune scelto
  window.aslFor = function (home) {
    if (!home) return null;
    const prov = norm(home.prov), comune = String(home.name || "").trim();
    const find = txt => BY_PROVINCE.find(([keys]) => keys.some(k => txt.toLowerCase().includes(k.toLowerCase())));
    const splitKey = Object.keys(SPLIT).find(k => prov.toLowerCase() === k.toLowerCase() || (!prov && comune === k));
    let name = null, certain = false;
    if (splitKey) {
      const sp = SPLIT[splitKey];
      const hit = sp.lists.find(([, list]) => list.some(c => c.toLowerCase() === comune.toLowerCase()));
      if (hit) { name = hit[0]; certain = true; } else { name = sp.fallback; certain = !!sp.fallbackCertain; }
    } else {
      // prima la provincia, poi (se manca) la regione: «Trentino-Alto Adige» non deve decidere tra Trento e Bolzano
      const row = (prov && find(prov)) || (!prov && home.region ? find(home.region) : null);
      if (row) { name = row[1]; certain = row[2]; }
    }
    if (!name) return { name: "la vostra azienda sanitaria (ASL)", certain: false, site: null };
    const veneto = name.match(/^ULSS (\d)\b/);
    return { name, certain, site: certain && veneto ? "https://www.aulss" + veneto[1] + ".veneto.it/" : null };
  };
})();
