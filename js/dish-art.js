/* Illustrazioni delle ricette: ciotola (versione pappa) e piatto (versione a pezzi).
   Non sono foto: mostrano colore, consistenza e forma dei pezzi che ci si può aspettare. */
(function () {
  const C = {
    carota: "#EE8A3C", zucca: "#F2A23C", zucchina: "#7BA84E", patata: "#EFD9A0", batata: "#EC7D3A", mela: "#F1E2A8",
    banana: "#F6E08A", avocado: "#9DC45F", broccolo: "#5E9A44", tacchino: "#E9D3B4", pesce: "#F6F0E4", salmone: "#F39A7B",
    uovo: "#F4CB4F", pomodoro: "#D9553A", lenticchie: "#E68E48", cereali: "#ECDDB8", ricotta: "#FBF7EE", pane: "#E3B26E",
    polenta: "#F4CF5A", piselli: "#79B957", fagioli: "#A0603F", ragu: "#9C5634", olio: "#D9C24A"
  };

  /* Aspetto di ogni ricetta. bowl: colore della pappa, tex: consistenza, top: guarnizioni; plate: pezzi */
  const LOOKS = {
    "brodo-vegetale": { bowl: "#EFCB7A", tex: "broth", chunks: [C.carota, C.zucchina, C.patata], plate: [["stick", C.carota, 2], ["stick", C.zucchina, 2], ["stick", C.patata, 1]] },
    "prima-pappa": { bowl: "#EAD9A6", tex: "smooth", top: ["oil"], plate: [["stick", C.carota, 1]] },
    "zucca-mais": { bowl: C.zucca, tex: "smooth", top: ["oil"], plate: [["wedge", "#E8892E", 3]] },
    "patata-dolce": { bowl: C.batata, tex: "lumpy", plate: [["stick", "#E2742C", 4]] },
    "mela-pera": { bowl: C.mela, tex: "smooth", plate: [["wedge", "#EFE0A0", 4]] },
    "banana": { bowl: C.banana, tex: "lumpy", plate: [["banana", C.banana, 1]] },
    "cachi-yogurt": { bowl: "#F59A3E", tex: "swirl", swirl: "#FFF8EC" },
    "lenticchie-rosse": { bowl: C.lenticchie, tex: "smooth", top: ["oil"], plate: [["toast", C.lenticchie, 3]] },
    "tacchino-zucchine": { bowl: "#D8D19A", tex: "smooth", top: ["oil"], plate: [["strip", C.tacchino, 2], ["stick", C.zucchina, 2]] },
    "merluzzo-patate": { bowl: "#EEE5CF", tex: "lumpy", top: ["herb"], plate: [["flakes", C.pesce, 4], ["stick", C.patata, 2]] },
    "pastina-brodo": { bowl: "#F0D58C", tex: "stars", top: ["cheese"], plate: [["fusilli", "#F1D27A", 6]] },
    "frittatina-forno": { bowl: "#E9D27A", tex: "lumpy", plate: [["strip", C.uovo, 4, "#6E9B45"]] },
    "ricotta-pera": { bowl: C.ricotta, tex: "lumpy", lump: "#EADDB4", plate: [["toast", C.ricotta, 2], ["wedge", "#EDE2B0", 2]] },
    "avocado": { bowl: "#B6D16C", tex: "smooth", plate: [["wedge", C.avocado, 3, "#D9E89A"]] },
    "broccoli-alberelli": { bowl: "#86B455", tex: "smooth", top: ["oil"], plate: [["floret", C.broccolo, 4]] },
    "porridge-mela": { bowl: "#E9D8B0", tex: "oats", plate: [["square", "#E2CB98", 4]] },
    "yogurt-arachidi": { bowl: "#FBF6EC", tex: "swirl", swirl: "#B87D45" },
    "risotto-zucca": { bowl: "#F3A94E", tex: "grains", top: ["cheese"], plate: [["ball", "#F0A54C", 4]] },
    "polpettine-lenticchie": { plate: [["finger", "#C9783D", 5]] },
    "pancake-banana": { plate: [["disc", "#E2A55A", 3]] },
    "hummus": { bowl: "#E9D4A3", tex: "smooth", top: ["oil", "herb"], plate: [["toast", "#E9D4A3", 3]] },
    "fusilli-pomodoro": { bowl: C.pomodoro, tex: "fusilli", fusilli: "#F0B866", top: ["ricotta"], plate: [["fusilli", "#E4733F", 7]] },
    "salmone-pure": { bowl: "#F1E4C9", tex: "flaked", flake: C.salmone, plate: [["flakes", C.salmone, 4], ["stick", C.patata, 2]] },
    "gnocchetti-ricotta": { bowl: "#9DBF73", tex: "lumpy", plate: [["gnocchi", "#86AE5E", 7]] },
    "polenta-ragu": { bowl: C.polenta, tex: "smooth", top: ["ragu"], plate: [["stick", "#F0C445", 4]] },
    "risi-bisi": { bowl: "#DCE5B0", tex: "grains", peas: true, top: ["cheese"], plate: [["peas", C.piselli, 14]] },
    "muffin-zucchine": { plate: [["muffin", "#E4B35C", 3, "#6E9B45"]] },
    "pasta-fagioli": { bowl: "#B98A63", tex: "ditalini", top: ["oil"], plate: [["ditalini", "#F1D27A", 8], ["beans", C.fagioli, 6]] },
    "hamburger-pollo": { plate: [["strip", "#D6AE80", 4, "#6E9B45"]] },
    "polpette-merluzzo": { plate: [["ball", "#E2C08A", 5]] },
    "minestrone": { bowl: "#E6B864", tex: "broth", chunks: [C.carota, C.zucchina, C.patata, C.zucca, C.fagioli], plate: [["cube", "mix", 14]] },
    "biscotti-avena": { plate: [["cookie", "#D9AF78", 4]] }
  };
  Object.assign(LOOKS, window.EXTRA_LOOKS || {});

  /* --- utilità --- */
  // Mescola un colore con il bianco (k = quanto bianco): fondo pastello diverso per ogni piatto
  function tint(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    return "#" + [16, 8, 0].map(sh => Math.round(((n >> sh) & 255) * (1 - k) + 255 * k).toString(16).padStart(2, "0")).join("");
  }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
    return "#" + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, "0")).join("");
  }
  function rng(seed) {
    let h = 2166136261;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  }
  const MIX = [C.carota, C.zucchina, C.patata, C.zucca, C.piselli];

  /* --- ciotola --- */
  function bowl(id, look, cx, cy, r) {
    const rx = 66, ry = 18, fx = 57, fy = 13.5;
    const clip = "c-" + id;
    let tex = "";
    const col = look.bowl;
    const pts = n => Array.from({ length: n }, () => [cx + (r() * 2 - 1) * fx * 0.82, cy + 2 + (r() * 2 - 1) * fy * 0.7]);
    switch (look.tex) {
      case "lumpy":
        tex = pts(10).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${4 + r() * 4}" ry="${2 + r() * 1.8}" fill="${look.lump || shade(col, 0.88)}"/>`).join("") +
              pts(6).map(([x, y]) => `<ellipse cx="${x}" cy="${y - 1}" rx="3" ry="1.2" fill="#fff" opacity=".35"/>`).join("");
        break;
      case "oats":
        tex = pts(22).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="1.6" fill="${shade(col, 0.86)}" transform="rotate(${r() * 180} ${x} ${y})"/>`).join("");
        break;
      case "grains":
        tex = pts(26).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.5" fill="#FFF7E6" opacity=".9" transform="rotate(${r() * 180} ${x} ${y})"/>`).join("") +
              (look.peas ? pts(9).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${C.piselli}"/><circle cx="${x - 1}" cy="${y - 1}" r="1" fill="#fff" opacity=".5"/>`).join("") : "");
        break;
      case "stars":
        tex = pts(16).map(([x, y]) => `<path d="M${x} ${y - 2.6}l.8 1.8 1.9.2-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.2z" fill="#F7E3A6"/>`).join("");
        break;
      case "ditalini":
        tex = pts(14).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.4" fill="none" stroke="#F3D98A" stroke-width="2"/>`).join("");
        break;
      case "fusilli":
        tex = pts(10).map(([x, y]) => `<path d="M${x - 6} ${y}q1.5-3 3 0t3 0 3 0 3 0" fill="none" stroke="${look.fusilli}" stroke-width="2.6" stroke-linecap="round"/>`).join("");
        break;
      case "broth":
        tex = pts(14).map(([x, y], i) => `<rect x="${x - 3}" y="${y - 2.5}" width="6" height="5" rx="1.2" fill="${look.chunks[i % look.chunks.length]}"/>`).join("") +
              `<ellipse cx="${cx - 18}" cy="${cy - 3}" rx="16" ry="3" fill="#fff" opacity=".25"/>`;
        break;
      case "flaked":
        tex = pts(8).map(([x, y]) => `<path d="M${x - 5} ${y}q2-4 6-2 4 1 4 3-3 3-6 2-4-1-4-3z" fill="${look.flake}"/>`).join("");
        break;
      case "swirl":
        tex = `<path d="M${cx - 30} ${cy + 2}c10-12 40-12 46-2s-14 12-26 6-6-12 8-10" fill="none" stroke="${look.swirl}" stroke-width="6" stroke-linecap="round" opacity=".95"/>`;
        break;
      default: // liscia
        tex = `<path d="M${cx - 34} ${cy}c12-8 44-9 58-2" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
    }
    let top = "";
    (look.top || []).forEach(t => {
      if (t === "oil") top += `<path d="M${cx + 6} ${cy - 1}c8-4 20-2 22 2s-10 6-18 4-8-4-4-6z" fill="${C.olio}" opacity=".55"/>`;
      if (t === "cheese") top += pts(14).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#FFF6D6"/>`).join("");
      if (t === "herb") top += pts(5).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.2" fill="#4F8A3A" transform="rotate(${r() * 180} ${x} ${y})"/>`).join("");
      if (t === "ragu") top += `<ellipse cx="${cx + 2}" cy="${cy + 1}" rx="22" ry="7" fill="${C.ragu}"/>` + pts(10).map(([x, y]) => `<circle cx="${cx + (x - cx) * 0.35}" cy="${cy + 1 + (y - cy) * 0.4}" r="1.6" fill="${shade(C.ragu, 0.75)}"/>`).join("");
      if (t === "ricotta") top += `<ellipse cx="${cx + 4}" cy="${cy}" rx="10" ry="5" fill="${C.ricotta}"/><ellipse cx="${cx + 1}" cy="${cy - 1.5}" rx="4" ry="1.6" fill="#fff"/>`;
    });
    return `<g>
      <ellipse cx="${cx}" cy="${cy + 58}" rx="62" ry="8" fill="#000" opacity=".1"/>
      <path d="M${cx - rx} ${cy}Q${cx - rx + 6} ${cy + 58} ${cx} ${cy + 58}Q${cx + rx - 6} ${cy + 58} ${cx + rx} ${cy}Z" fill="#FFFFFF" stroke="#E7D8C9" stroke-width="1.5"/>
      <path d="M${cx - rx + 7} ${cy + 24}Q${cx} ${cy + 36} ${cx + rx - 7} ${cy + 24}" fill="none" stroke="#9DC4E0" stroke-width="3" opacity=".7"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF" stroke="#E7D8C9" stroke-width="1.5"/>
      <clipPath id="${clip}"><ellipse cx="${cx}" cy="${cy + 2}" rx="${fx}" ry="${fy}"/></clipPath>
      <ellipse cx="${cx}" cy="${cy + 2}" rx="${fx}" ry="${fy}" fill="${col}"/>
      <ellipse cx="${cx}" cy="${cy + 6}" rx="${fx}" ry="${fy - 3}" fill="${shade(col, 0.93)}" opacity=".6" clip-path="url(#${clip})"/>
      <g clip-path="url(#${clip})">${tex}${top}</g>
      <path d="M${cx + 30} ${cy - 6}l46-30" stroke="#C9B8A6" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="${cx + 24}" cy="${cy - 2}" rx="11" ry="6" fill="#D8C8B6" transform="rotate(-33 ${cx + 24} ${cy - 2})"/>
    </g>`;
  }

  /* --- pezzi nel piatto --- */
  function piece(kind, color, x, y, rot, r, extra) {
    const dk = color === "mix" ? "#888" : shade(color, 0.82);
    const T = `transform="rotate(${rot} ${x} ${y})"`;
    switch (kind) {
      case "stick": return `<g ${T}><rect x="${x - 24}" y="${y - 5.5}" width="48" height="11" rx="5" fill="${color}"/><rect x="${x - 22}" y="${y - 4.5}" width="44" height="3" rx="1.5" fill="#fff" opacity=".25"/><rect x="${x - 24}" y="${y + 2}" width="48" height="3.5" rx="1.7" fill="${dk}" opacity=".5"/></g>`;
      case "wedge": return `<g ${T}><path d="M${x - 20} ${y + 4}Q${x} ${y - 16} ${x + 20} ${y + 4}Z" fill="${extra || color}"/><path d="M${x - 20} ${y + 4}Q${x} ${y - 10} ${x + 20} ${y + 4}Q${x} ${y + 1} ${x - 20} ${y + 4}Z" fill="${extra ? color : dk}" opacity=".9"/></g>`;
      case "banana": return `<g ${T}><path d="M${x - 34} ${y - 4}Q${x} ${y + 16} ${x + 34} ${y - 6}Q${x + 30} ${y + 6} ${x} ${y + 10}Q${x - 26} ${y + 8} ${x - 34} ${y - 4}Z" fill="${color}"/><path d="M${x + 6} ${y + 4}Q${x + 20} ${y + 4} ${x + 34} ${y - 6}Q${x + 30} ${y + 7} ${x + 4} ${y + 10}Z" fill="#E8C85A"/><path d="M${x + 4} ${y + 2}l2 9" stroke="#8C6A2A" stroke-width="1.5"/></g>`;
      case "floret": return `<g ${T}><rect x="${x - 3}" y="${y - 2}" width="6" height="16" rx="2.5" fill="#A6C77A"/><circle cx="${x - 7}" cy="${y - 4}" r="7" fill="${color}"/><circle cx="${x + 6}" cy="${y - 5}" r="7.5" fill="${color}"/><circle cx="${x}" cy="${y - 10}" r="7.5" fill="${shade(color, 1.1)}"/><circle cx="${x - 2}" cy="${y - 12}" r="2" fill="#fff" opacity=".2"/></g>`;
      case "ball": return `<g><circle cx="${x}" cy="${y}" r="10.5" fill="${color}"/><circle cx="${x + 2}" cy="${y + 3}" r="9" fill="${dk}" opacity=".35"/><circle cx="${x - 3.5}" cy="${y - 3.5}" r="3" fill="#fff" opacity=".35"/></g>`;
      case "finger": return `<g ${T}><rect x="${x - 17}" y="${y - 6}" width="34" height="12" rx="6" fill="${color}"/><rect x="${x - 15}" y="${y - 5}" width="30" height="3" rx="1.5" fill="#fff" opacity=".22"/>${[0, 1, 2].map(i => `<circle cx="${x - 9 + i * 9}" cy="${y + 1}" r="1.2" fill="${dk}"/>`).join("")}</g>`;
      case "disc": return `<g><ellipse cx="${x}" cy="${y + 4}" rx="22" ry="8" fill="${dk}"/><ellipse cx="${x}" cy="${y}" rx="22" ry="8" fill="${color}"/><ellipse cx="${x - 3}" cy="${y - 1}" rx="12" ry="3.5" fill="#F2C987" opacity=".7"/></g>`;
      case "toast": return `<g ${T}><rect x="${x - 22}" y="${y - 7}" width="44" height="14" rx="3" fill="${C.pane}"/><rect x="${x - 20}" y="${y - 7}" width="40" height="7" rx="3" fill="${color}"/><rect x="${x - 22}" y="${y + 3}" width="44" height="4" rx="2" fill="#B98446"/></g>`;
      case "strip": return `<g ${T}><rect x="${x - 22}" y="${y - 6.5}" width="44" height="13" rx="3.5" fill="${color}"/><rect x="${x - 22}" y="${y + 2}" width="44" height="4.5" rx="2" fill="${dk}" opacity=".5"/>${extra ? [0, 1, 2, 3, 4].map(i => `<circle cx="${x - 16 + i * 8}" cy="${y - 1 + (i % 2) * 2}" r="1.4" fill="${extra}"/>`).join("") : ""}</g>`;
      case "flakes": return `<g ${T}><path d="M${x - 12} ${y}q4-9 13-6 11 3 9 9-8 6-14 4-10-3-8-7z" fill="${color}"/><path d="M${x - 6} ${y - 2}l10 2M${x - 4} ${y + 2}l9 1" stroke="${dk}" stroke-width="1" opacity=".6"/></g>`;
      case "fusilli": return `<g ${T}><path d="M${x - 11} ${y}q2-5 4 0t4 0 4 0 4 0 4 0" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/></g>`;
      case "square": return `<g ${T}><rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="4" fill="${color}"/>${[0, 1, 2].map(i => `<ellipse cx="${x - 5 + i * 5}" cy="${y - 2 + (i % 2) * 5}" rx="2.4" ry="1.2" fill="${dk}"/>`).join("")}</g>`;
      case "gnocchi": return `<g ${T}><ellipse cx="${x}" cy="${y}" rx="10" ry="6.5" fill="${color}"/>${[0, 1, 2].map(i => `<path d="M${x - 5 + i * 5} ${y - 5}v10" stroke="${dk}" stroke-width="1.2"/>`).join("")}</g>`;
      case "peas": return `<g><circle cx="${x}" cy="${y}" r="4.6" fill="${color}"/><circle cx="${x - 1.4}" cy="${y - 1.4}" r="1.4" fill="#fff" opacity=".45"/></g>`;
      case "ditalini": return `<g ${T}><rect x="${x - 5}" y="${y - 4}" width="10" height="8" rx="2" fill="${color}"/><ellipse cx="${x + 5}" cy="${y}" rx="1.8" ry="3.2" fill="${dk}"/></g>`;
      case "beans": return `<g ${T}><path d="M${x - 7} ${y}q0-6 7-5 7 1 7 5-5 4-7 2-7 3-7-2z" fill="${color}"/><path d="M${x - 2} ${y - 3}q3 1 5 0" stroke="#E9C9A8" stroke-width="1" fill="none"/></g>`;
      case "muffin": return `<g><path d="M${x - 14} ${y}l3 16h22l3-16z" fill="#F4EEE4"/>${[0, 1, 2, 3].map(i => `<path d="M${x - 10 + i * 7} ${y + 1}v14" stroke="#DCCFBF" stroke-width="1.2"/>`).join("")}<ellipse cx="${x}" cy="${y}" rx="17" ry="11" fill="${color}"/><circle cx="${x - 5}" cy="${y - 3}" r="1.6" fill="${extra || dk}"/><circle cx="${x + 4}" cy="${y - 5}" r="1.6" fill="${extra || dk}"/><circle cx="${x + 1}" cy="${y + 2}" r="1.6" fill="${extra || dk}"/></g>`;
      case "cookie": return `<g ${T}><ellipse cx="${x}" cy="${y}" rx="16" ry="10" fill="${color}"/>${[0, 1, 2, 3].map(i => `<ellipse cx="${x - 8 + i * 5}" cy="${y - 2 + (i % 2) * 4}" rx="2.4" ry="1.2" fill="${dk}"/>`).join("")}</g>`;
      case "cube": { const c = color === "mix" ? MIX[Math.floor(r() * MIX.length)] : color; return `<g ${T}><rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2" fill="${c}"/><rect x="${x - 5}" y="${y + 2}" width="10" height="3" rx="1" fill="${shade(c, 0.8)}"/></g>`; }
      default: return "";
    }
  }

  function plate(look, cx, cy, r, big) {
    const rx = big ? 98 : 72, ry = big ? 36 : 28;
    const items = [];
    look.plate.forEach(([kind, color, n, extra]) => { for (let i = 0; i < n; i++) items.push([kind, color, extra]); });
    const total = items.length;
    const small = ["peas", "ditalini", "beans", "cube", "fusilli", "gnocchi"];
    const out = items.map(([kind, color, extra], i) => {
      let x, y;
      if (small.includes(kind)) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); x = cx + Math.cos(a) * d * rx * 0.62; y = cy + Math.sin(a) * d * ry * 0.5; }
      else {
        const cols = Math.min(total, big ? 3 : 2), row = Math.floor(i / cols), col = i % cols, rows = Math.ceil(total / cols);
        x = cx + (col - (cols - 1) / 2) * (big ? 56 : 44) + (r() - 0.5) * 8;
        y = cy + (row - (rows - 1) / 2) * (rows > 2 ? 13 : 18) + (r() - 0.5) * 4;
      }
      return piece(kind, color, x, y, (r() - 0.5) * 40, r, extra);
    }).join("");
    return `<g>
      <ellipse cx="${cx}" cy="${cy + ry + 6}" rx="${rx - 4}" ry="7" fill="#000" opacity=".1"/>
      <ellipse cx="${cx}" cy="${cy + 3}" rx="${rx}" ry="${ry}" fill="#FFFFFF" stroke="#E7D8C9" stroke-width="1.5"/>
      <ellipse cx="${cx}" cy="${cy + 3}" rx="${rx * 0.74}" ry="${ry * 0.7}" fill="none" stroke="#EFE3D6" stroke-width="1.5"/>
      ${out}
    </g>`;
  }

  let seq = 0;   // ogni disegno ha id interni unici: la stessa ricetta può comparire più volte nella pagina
  /* opts.fill: riempie il contenitore (ritaglia invece di lasciare bordi), senza etichette, su fondo pastello.
     opts.tile: solo la ciotola (o, con opts.plate, il piatto) in alto, per le miniature. */
  window.dishArt = function (id, opts) {
    const look = LOOKS[id];
    if (!look) return "";
    opts = opts || {};
    const r = rng(id), uid = id + "-" + (++seq);
    const hasBowl = !!look.bowl, hasPlate = !!look.plate;
    const base = look.bowl || (look.plate && look.plate[0][1]) || "#F1E0CB";
    const top = opts.tile || opts.fill ? tint(base, 0.84) : "#FBF1E4", bot = opts.tile || opts.fill ? tint(base, 0.72) : "#F1E0CB";
    const bg = `<defs><linearGradient id="bg-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>`;
    if (opts.tile) {
      const usePlate = hasPlate && (opts.plate || !hasBowl);
      const body = usePlate ? plate(look, 100, 62, r, false) : bowl(uid, look, 100, 50, r);
      return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMin slice" class="dish-art" role="img" aria-label="Illustrazione del piatto">
        ${bg}<rect x="-100" y="-100" width="400" height="400" fill="url(#bg-${uid})"/>${body}</svg>`;
    }
    let body;
    if (hasBowl && hasPlate) body = bowl(uid, look, 100, 92, r) + plate(look, 238, 118, r, false);
    else if (hasBowl) body = bowl(uid, look, 160, 92, r);
    else body = plate(look, 160, 108, r, true);
    if (opts.fill) return `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" class="dish-art" role="img" aria-label="Illustrazione: come dovrebbe venire">
      ${bg}<rect x="-200" y="-200" width="720" height="580" fill="url(#bg-${uid})"/>
      <rect x="-200" y="140" width="720" height="240" fill="${tint(base, 0.6)}" opacity=".55"/>${body}</svg>`;
    return `<svg viewBox="0 0 320 180" class="dish-art" role="img" aria-label="Illustrazione: come dovrebbe venire">
      ${bg}
      <rect width="320" height="180" rx="18" fill="url(#bg-${uid})"/>
      <path d="M0 140h320v22a18 18 0 0 1-18 18H18A18 18 0 0 1 0 162z" fill="#EAD6BF" opacity=".6"/>
      ${body}
      ${hasBowl && hasPlate ? `<text x="100" y="172" text-anchor="middle" class="dish-lbl">pappa</text><text x="238" y="172" text-anchor="middle" class="dish-lbl">a pezzi</text>` : ""}
    </svg>`;
  };
})();
