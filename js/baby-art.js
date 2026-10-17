/* Illustrazione del bimbo per la guida mese per mese: cambia con l'età
   (occhi chiusi da neonato, poi capelli, dentini, sonaglino, palla). Non è un ritratto. */
(function () {
  let seq = 0;
  const BG = [["#F9DCCB", "#EDB9A2"], ["#DCEAF5", "#B4CFE4"], ["#E4F0DA", "#BFD9AC"], ["#F7E6C4", "#E8C88E"], ["#ECDFF4", "#CDB5E2"], ["#F9DAE2", "#E9B2C2"]];
  const SUIT = ["#FFFFFF", "#BFD9EE", "#CFE6C0", "#F6D79A", "#D9C6EC", "#F4BFCB"];
  window.babyArt = function (m) {
    m = Math.max(0, Math.min(36, Number(m) || 0));
    const id = "ba" + (++seq), [b1, b2] = BG[m % BG.length], suit = SUIT[(m + 2) % SUIT.length];
    const hair = "#9A6A45", ink = "#3A2A24";
    // capelli: qualche ricciolo, poi ciuffi, poi una vera chioma
    let hairSvg;
    if (m < 3) hairSvg = `<path d="M138 66q8-20 24-8M150 62q12-16 24-2M126 72q4-16 18-12" fill="none" stroke="${hair}" stroke-width="4" stroke-linecap="round" opacity=".75"/>`;
    else if (m < 10) hairSvg = `<path d="M84 112q16-52 70-56q50 0 64 50q-26-30-66-30q-40 0-68 36z" fill="${hair}" opacity=".55"/><path d="M146 58q14-22 30-6" fill="none" stroke="${hair}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    else hairSvg = `<path d="M64 146q-6-90 86-92q92 2 86 92q-10-42-40-54q-10 18-46 20q-36-2-46-20q-30 12-40 54z" fill="${hair}" opacity=".85"/>`;
    const eyes = m === 0
      ? `<path d="M104 158q14 11 28 0M168 158q14 11 28 0" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/><path d="M108 164l-3 5M118 167v6M128 164l3 5M172 164l-3 5M182 167v6M192 164l3 5" stroke="${ink}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`
      : `<ellipse cx="118" cy="158" rx="10" ry="12" fill="${ink}"/><ellipse cx="182" cy="158" rx="10" ry="12" fill="${ink}"/><circle cx="121" cy="153" r="3.5" fill="#fff"/><circle cx="185" cy="153" r="3.5" fill="#fff"/>
         <path d="M104 134q14-8 28-2M168 132q14-6 28 2" fill="none" stroke="${hair}" stroke-width="3" stroke-linecap="round" opacity=".45"/>`;
    let mouth;
    if (m === 0) mouth = `<path d="M140 206q10 6 20 0" fill="none" stroke="#B5544A" stroke-width="3.5" stroke-linecap="round"/>`;
    else if (m < 6) mouth = `<path d="M132 200q18 18 36 0" fill="none" stroke="#B5544A" stroke-width="4" stroke-linecap="round"/>`;
    else {
      const top = m >= 9 ? `<rect x="142" y="199" width="7" height="7" rx="2" fill="#fff"/><rect x="151" y="199" width="7" height="7" rx="2" fill="#fff"/>` : "";
      mouth = `<path d="M130 198q20 32 40 0z" fill="#A4443C"/><ellipse cx="150" cy="214" rx="10" ry="5" fill="#E7857C"/>${top}
        <rect x="143" y="209" width="6" height="6" rx="2" fill="#fff"/><rect x="151" y="209" width="6" height="6" rx="2" fill="#fff"/>`;
    }
    // mano vicino alla guancia da piccolissimo; poi un sonaglino; dopo l'anno una palla
    let extra;
    if (m < 5) extra = `<g><ellipse cx="226" cy="236" rx="28" ry="24" fill="url(#${id}s)"/>${[0, 1, 2, 3].map(i => `<ellipse cx="${206 + i * 13}" cy="${214 - (i === 1 || i === 2 ? 4 : 0)}" rx="7" ry="11" fill="url(#${id}s)"/>`).join("")}</g>`;
    else if (m < 12) extra = `<g transform="rotate(-25 228 230)"><rect x="223" y="222" width="10" height="56" rx="5" fill="#F2B84B"/><circle cx="228" cy="214" r="22" fill="#E8735A"/><circle cx="221" cy="207" r="6" fill="#fff" opacity=".4"/></g><ellipse cx="226" cy="258" rx="24" ry="20" fill="url(#${id}s)"/>`;
    else extra = `<circle cx="236" cy="246" r="34" fill="#5B9BD5"/><path d="M204 238q32 10 64 0M236 212q-12 34 0 68" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/><ellipse cx="210" cy="262" rx="22" ry="18" fill="url(#${id}s)"/>`;
    return `<svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" class="baby-art" role="img" aria-label="Illustrazione del bimbo a ${m} mesi">
      <defs>
        <radialGradient id="${id}b" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></radialGradient>
        <radialGradient id="${id}s" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FBDCC6"/><stop offset=".7" stop-color="#F1BC9C"/><stop offset="1" stop-color="#E3A383"/></radialGradient>
      </defs>
      <rect x="-150" y="-150" width="600" height="600" fill="url(#${id}b)"/>
      <circle cx="40" cy="60" r="70" fill="#fff" opacity=".18"/><circle cx="270" cy="40" r="40" fill="#fff" opacity=".14"/>
      <ellipse cx="150" cy="335" rx="130" ry="92" fill="${suit}"/><path d="M118 252q32 22 64 0" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="6"/>
      <circle cx="62" cy="158" r="17" fill="url(#${id}s)"/><circle cx="238" cy="158" r="17" fill="url(#${id}s)"/>
      <circle cx="150" cy="150" r="90" fill="url(#${id}s)"/>
      ${hairSvg}${eyes}
      <ellipse cx="150" cy="182" rx="8" ry="5.5" fill="#E09A7C"/>
      <ellipse cx="106" cy="190" rx="17" ry="10" fill="#F08A8A" opacity=".33"/><ellipse cx="194" cy="190" rx="17" ry="10" fill="#F08A8A" opacity=".33"/>
      ${mouth}${extra}
    </svg>`;
  };
})();
