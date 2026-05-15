// Søster — a digital hug for my older sister
// Single React app for the iOS frame. Onboarding → Home → Archive → You.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────────────
// Palette resolver (driven by Tweaks)
// ─────────────────────────────────────────────────────────────────────
const PALETTES = {
  goldenHour: {
    name: 'Gyllen time',
    canvas: '#F4E6D2',
    page:   '#FBF5EA',
    paper:  '#FFFCF5',
    ink:    '#3A2A24',
    muted:  '#8A7166',
    line:   'rgba(58,42,36,0.10)',
    accent: '#C9904A',   // golden
    blush:  '#E8A87C',   // peach
    sun:    '#F2C66A',
  },
  duskRose: {
    name: 'Skumringsrose',
    canvas: '#F2E0DA',
    page:   '#FBF1EE',
    paper:  '#FFF8F5',
    ink:    '#3F2A2E',
    muted:  '#8B6E72',
    line:   'rgba(63,42,46,0.10)',
    accent: '#B86A6E',
    blush:  '#D89090',
    sun:    '#E8B4A9',
  },
  sagebrush: {
    name: 'Salvielin',
    canvas: '#E3E4D4',
    page:   '#F5F4E8',
    paper:  '#FBFAF1',
    ink:    '#2E3526',
    muted:  '#74795F',
    line:   'rgba(46,53,38,0.10)',
    accent: '#6B7A4E',
    blush:  '#A8B086',
    sun:    '#D7CB7A',
  },
  morningMist: {
    name: 'Morgentåke',
    canvas: '#DDE1E2',
    page:   '#EEF0F0',
    paper:  '#F8F9F8',
    ink:    '#2A3338',
    muted:  '#6E7B81',
    line:   'rgba(42,51,56,0.10)',
    accent: '#5C7A86',
    blush:  '#A9BCC2',
    sun:    '#E2D9C4',
  },
};

// ─────────────────────────────────────────────────────────────────────
// Haven → Palette mapping
// Each safe haven evokes a mood that maps naturally to a colour world.
// kitchen  → goldenHour   (warm, sunny, buttery morning light)
// sea      → morningMist  (salt haze, grey-blue, cool clarity)
// forest   → sagebrush    (pine, moss, earthy green)
// garden   → duskRose     (roses, soft pinks, grandmother warmth)
// library  → morningMist  (cool quiet, dusty calm)
// attic    → duskRose     (warm lamp light, creative blush)
// ─────────────────────────────────────────────────────────────────────
const HAVEN_PALETTES = {
  kitchen: 'goldenHour',
  sea:     'morningMist',
  forest:  'sagebrush',
  garden:  'duskRose',
  library: 'morningMist',
  attic:   'duskRose',
};

// ─────────────────────────────────────────────────────────────────────
// Message library — filtered by needs + interests
// ─────────────────────────────────────────────────────────────────────
const LIBRARY = [
  // ── Original 12 ──────────────────────────────────────────────────
  { tone: 'calm',        body: "Morgenen krever ingenting av deg ennå. Sitt litt med teen. Dagen kan vente." },
  { tone: 'calm',        body: "Du har lov til å bevege deg sakte i dag. Saktmodighet er ikke det motsatte av fremgang — det er teksturen i den." },
  { tone: 'warmth',      body: "Et sted, akkurat nå, tenker noen varmt på deg. Det lover jeg. Også jeg." },
  { tone: 'warmth',      body: "Du er noens favorittmenneske. Du er det varme lyset i et annet rom av noens liv." },
  { tone: 'motivation',  body: "Hva det enn er — begynn med den minste versjonen av det. Én setning. Ett skritt. Ett pust. Det er hele trikset." },
  { tone: 'motivation',  body: "Den versjonen av deg fra ett år siden ville stille blitt forundret over hvor du står i dag." },
  { tone: 'humor',       body: "Påminnelse: du har overlevd 100 % av dine verste morgener. En ganske imponerende statistikk, må jeg si." },
  { tone: 'humor',       body: "Hvis noen spør: du gjør en flott jobb. Hvis ingen spør: du gjør fortsatt en flott jobb." },
  { tone: 'courage',     body: "Det du unngår er mindre enn bekymringen for det. Alltid. Åpne døren." },
  { tone: 'courage',     body: "Du trenger ikke føle deg modig for å være modig. Du må bare gjøre den neste lille, ærlige tingen." },
  { tone: 'perspective', body: "Om ti år vil i dag være et mykt, uskarpt fotografi. Behandle det varsomt mens det fortsatt er i fokus." },
  { tone: 'perspective', body: "Du er ikke på etterskudd. Det finnes ingen strek. Bare din egen stille, vakre vei." },

  // ── 30 nye meldinger ─────────────────────────────────────────────

  // calm (5)
  { tone: 'calm',        body: "Det er ikke alle dager som skal til noe. Noen er bare til å puste i — og det er nok." },
  { tone: 'calm',        body: "Du trenger ikke løse alt i dag. Du trenger egentlig ikke løse noe som helst. Bare vær her litt." },
  { tone: 'calm',        body: "La skuldrene synke. Bare det. Alt annet kan vente til skuldrene er nede." },
  { tone: 'calm',        body: "Stillhet er ikke tom. Den er full av muligheter som hviler seg." },
  { tone: 'calm',        body: "I dag kan du tillate deg å gjøre akkurat nok. Ingenting mer, og det er ikke det minste synd." },

  // warmth (6)
  { tone: 'warmth',      body: "Du har gitt bort mer varme enn du vet. Mer enn du noensinne vil få vite. Det teller." },
  { tone: 'warmth',      body: "Det du er — akkurat slik, akkurat nå — er mer enn godt nok. Det er faktisk ganske flott." },
  { tone: 'warmth',      body: "Verden er litt bedre med deg i den. Ikke fordi du er perfekt, men nettopp fordi du er deg." },
  { tone: 'warmth',      body: "Noen der ute bærer på et minne av deg som er rent lys. Du er det minnet for noen." },
  { tone: 'warmth',      body: "Du er den som andre tenker på når de trenger mot. Det er ingen tilfeldighet. Det er deg." },
  { tone: 'warmth',      body: "Kjærligheten du har vist er ikke glemt. Den lever i mennesker som ennå ikke har fortalt deg det." },

  // motivation (5)
  { tone: 'motivation',  body: "Ett lite skritt er fortsatt bevegelse. Og bevegelse er alt som trengs for å komme seg videre." },
  { tone: 'motivation',  body: "Det du holder på med — selv om det er smått og rotete — betyr noe. Fortsett." },
  { tone: 'motivation',  body: "Du er ikke for sent ute. Du er akkurat i tide — din tid, som ingen andre har krav på." },
  { tone: 'motivation',  body: "Begynn ufullstendig. Begynn uferdig. Begynn bare. Resten ordner seg underveis." },
  { tone: 'motivation',  body: "Fremgang er ikke alltid synlig. Noen ganger vokser det under overflaten, som røtter om vinteren." },

  // humor (5)
  { tone: 'humor',       body: "Kaffe er teknisk sett en varm bønnesuppe. Uansett: god morgen til deg og din suppe." },
  { tone: 'humor',       body: "Hverdagen er satt sammen av tusenvis av små, umulige ting du faktisk klarer. Litt imponerende, egentlig." },
  { tone: 'humor',       body: "Du trenger ikke ha alt under kontroll. Fra utsiden ser det faktisk ganske bra ut, lover." },
  { tone: 'humor',       body: "Noen dager er det nok å ha kommet seg ut av sengen. Registrert — og stille applaudert." },
  { tone: 'humor',       body: "Påminnelse: du har en favorittkopp, et favorittteppe og et hjørne som er ditt. Det er egentlig rikdom." },

  // courage (5)
  { tone: 'courage',     body: "Den vanskelige samtalen du utsetter? Den er lettere i morgen, men du er modigere i dag." },
  { tone: 'courage',     body: "Frykt og mot bor i samme kropp. Det er din kropp. Du velger hvem som får gå foran." },
  { tone: 'courage',     body: "Noen ganger er mot å si nei. Andre ganger er det å si ja. Du vet allerede hvilket det er i dag." },
  { tone: 'courage',     body: "Det du er redd for å begynne, er allerede begynt i det øyeblikket du tenker på det." },
  { tone: 'courage',     body: "Modige mennesker er ikke de som ikke er redde. De er de som gjør det uansett — akkurat som deg." },

  // perspective (4)
  { tone: 'perspective', body: "Du er midt i historien din, ikke på slutten. Husk det neste gang det ser mørkt ut." },
  { tone: 'perspective', body: "Om ett år vil i dag bare være 'den gangen'. Og du vil smile litt stille av deg selv." },
  { tone: 'perspective', body: "De fleste tingene du bekymrer deg for i dag, vil du ikke huske om ti år. Pust ut, litt." },
  { tone: 'perspective', body: "Livet ditt er ikke et etterslep av noen annens versjon. Det er et original — og ingen er lik din." },
];

// Pick a deterministic message of the day given prefs + a date seed
function pickMessage(prefs, dateSeed) {
  const tones = (prefs.needs && prefs.needs.length) ? prefs.needs : ['warmth','calm'];
  const pool = LIBRARY.filter(m => tones.includes(m.tone));
  const list = pool.length ? pool : LIBRARY;
  // simple hash
  let h = 0;
  for (let i = 0; i < dateSeed.length; i++) h = (h * 31 + dateSeed.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % list.length;
  return list[idx];
}

// ─────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'soster.state.v1';
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

// ─────────────────────────────────────────────────────────────────────
// Tiny icon set (line, hand-drawn-ish, no emoji)
// ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = 'currentColor', strokeWidth = 1.4 }) => {
  const s = size;
  const sw = strokeWidth;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'sun':       return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>;
    case 'archive':   return <svg {...common}><path d="M4 8h16M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8M9 12h6"/><path d="M4 5h16v3H4z"/></svg>;
    case 'heart':     return <svg {...common}><path d="M12 19s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 9c0 5.5-7 10-7 10z"/></svg>;
    case 'heartFill': return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 19s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 9c0 5.5-7 10-7 10z" fill={color}/></svg>;
    case 'user':      return <svg {...common}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></svg>;
    case 'chevron':   return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'arrow':     return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'back':      return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'check':     return <svg {...common}><path d="M5 12l4.5 4.5L19 7"/></svg>;
    case 'clock':     return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'share':     return <svg {...common}><path d="M12 4v12M7 9l5-5 5 5M5 20h14"/></svg>;
    case 'sparkle':   return <svg {...common}><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5L12 4zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7L19 16z"/></svg>;
    case 'leaf':      return <svg {...common}><path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 16-1 0-2 0-2 0z"/><path d="M4 20l8-8"/></svg>;
    case 'moon':      return <svg {...common}><path d="M20 14a8 8 0 11-10-10 7 7 0 0010 10z"/></svg>;
    case 'cup':       return <svg {...common}><path d="M5 8h12v6a5 5 0 01-5 5h-2a5 5 0 01-5-5V8z"/><path d="M17 10h2a2 2 0 010 4h-2M8 4c0 1 1 1 1 2s-1 1-1 2M12 4c0 1 1 1 1 2s-1 1-1 2"/></svg>;
    case 'book':      return <svg {...common}><path d="M5 4h7v16H5a1 1 0 01-1-1V5a1 1 0 011-1zM19 4h-5a2 2 0 00-2 2v14a2 2 0 012-2h5V4z"/></svg>;
    case 'music':     return <svg {...common}><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/></svg>;
    case 'paw':       return <svg {...common}><circle cx="6" cy="10" r="1.5"/><circle cx="10" cy="6" r="1.5"/><circle cx="14" cy="6" r="1.5"/><circle cx="18" cy="10" r="1.5"/><path d="M8 18c0-3 2-5 4-5s4 2 4 5a2 2 0 01-2 2c-1 0-1.5-.5-2-.5s-1 .5-2 .5a2 2 0 01-2-2z"/></svg>;
    case 'palette':   return <svg {...common}><path d="M12 3a9 9 0 100 18 3 3 0 003-3 2 2 0 012-2h1a3 3 0 003-3 9 9 0 00-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>;
    case 'walk':      return <svg {...common}><circle cx="13" cy="4.5" r="1.5"/><path d="M9 21l3-7-2-3 4-3 3 4-2 2 2 5"/></svg>;
    case 'bake':      return <svg {...common}><path d="M6 13c0-3 2.5-6 6-6s6 3 6 6H6z"/><path d="M5 13h14M7 16h10M9 19h6"/></svg>;
    default: return null;
  }
};

// ─────────────────────────────────────────────────────────────────────
// Reusable chip
// ─────────────────────────────────────────────────────────────────────
function Chip({ active, onClick, children, icon, palette }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 16px',
        borderRadius: 999,
        border: `1px solid ${active ? palette.ink : palette.line}`,
        background: active ? palette.ink : palette.paper,
        color: active ? palette.paper : palette.ink,
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: 14.5, fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 220ms ease',
      }}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Onboarding
// ─────────────────────────────────────────────────────────────────────
const NEEDS = [
  { key: 'calm',        label: 'litt ro',           icon: 'leaf' },
  { key: 'warmth',      label: 'litt varme',        icon: 'sun'  },
  { key: 'motivation',  label: 'små dytt',          icon: 'arrow'},
  { key: 'humor',       label: 'et lite smil',     icon: 'sparkle' },
  { key: 'courage',     label: 'litt mot',          icon: 'heart' },
  { key: 'perspective', label: 'perspektiv',         icon: 'moon' },
];

const HAVENS = [
  { key: 'kitchen', label: 'Solfylt kjøkken',  hint: 'Kaffe. En lingardin. Fuglesang ute.' },
  { key: 'sea',     label: 'Ved sjøen',        hint: 'Saltluft. En falmet blå dør.' },
  { key: 'forest',  label: 'Skogshytte',       hint: 'Furu, ullpledd, lange ettermiddager.' },
  { key: 'garden',  label: 'Mormors hage',     hint: 'Roser, tomater, en trebenk.' },
  { key: 'library', label: 'Stille bibliotek', hint: 'Lamper, gammelt papir, en fløyelsstol.' },
  { key: 'attic',   label: 'Atelier på loftet', hint: 'Takvindu, støvfnugg, keramikk.' },
];

const INTERESTS = [
  { key: 'reading',   label: 'Lesing',       icon: 'book' },
  { key: 'music',     label: 'Musikk',       icon: 'music' },
  { key: 'walks',     label: 'Turer',        icon: 'walk' },
  { key: 'baking',    label: 'Baking',       icon: 'bake' },
  { key: 'animals',   label: 'Dyr',          icon: 'paw' },
  { key: 'art',       label: 'Kunst',        icon: 'palette' },
  { key: 'tea',       label: 'Te og kaffe',  icon: 'cup' },
  { key: 'garden',    label: 'Hagestell',    icon: 'leaf' },
];

function OnboardScreen({ palette, step, total, eyebrow, title, subtitle, children, onBack, onNext, nextLabel = 'fortsett', canNext = true }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',                // contain everything — no page-level scroll
      background: palette.page,
      color: palette.ink,
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)',
      transition: 'background 400ms ease, color 400ms ease',
    }}>

      {/* ── Progress bar + back btn (never scrolls) ───────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: '4px 22px 0', gap: 12, height: 32,
      }}>
        <button
          onClick={onBack}
          disabled={!onBack}
          style={{
            background: 'transparent', border: 'none',
            cursor: onBack ? 'pointer' : 'default',
            color: onBack ? palette.muted : 'transparent',
            padding: 0, display: 'flex', alignItems: 'center',
          }}
        ><Icon name="back" size={20} /></button>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 2, borderRadius: 2,
              background: i < step ? palette.ink : palette.line,
              transition: 'background 400ms ease',
            }}/>
          ))}
        </div>
        <div style={{ width: 20 }} />
      </div>

      {/* ── Fixed header: eyebrow + title + subtitle (never scrolls) ─ */}
      <div style={{
        flexShrink: 0,
        padding: '22px 28px 0',
      }}>
        {eyebrow && (
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase',
            color: palette.muted, marginBottom: 10,
          }}>{eyebrow}</div>
        )}
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 32, lineHeight: 1.15, letterSpacing: -0.5,
          marginBottom: 10, textWrap: 'pretty',
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14.5, lineHeight: 1.5,
            color: palette.muted, marginBottom: 0, textWrap: 'pretty',
          }}>{subtitle}</div>
        )}
      </div>

      {/* ── Scrollable content zone ───────────────────────────────── */}
      {/* minHeight: 0 is essential — without it flexbox won't shrink  */}
      {/* this child and the scroll never kicks in on iOS/Android.     */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '16px 28px 12px',
      }}>
        {children}
      </div>

      {/* ── CTA footer (always anchored at bottom, always reachable) ─ */}
      <div style={{
        flexShrink: 0,
        padding: `10px 22px calc(env(safe-area-inset-bottom, 0px) + 22px)`,
        background: palette.page,
        // subtle fade-up so content doesn't hard-cut behind the button
        boxShadow: `0 -16px 24px 8px ${palette.page}`,
      }}>
        <button
          onClick={canNext ? onNext : undefined}
          disabled={!canNext}
          style={{
            width: '100%', height: 54, borderRadius: 27,
            border: 'none',
            background: canNext ? palette.ink : palette.line,
            color: palette.paper,
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 20, fontStyle: 'italic', letterSpacing: 0.3,
            cursor: canNext ? 'pointer' : 'default',
            transition: 'background 300ms ease, transform 120ms ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          {nextLabel} <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}

function Onboarding({ palette, onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [needs, setNeeds] = useState([]);
  const [haven, setHaven] = useState(null);
  const [interests, setInterests] = useState([]);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);

  // Derive a live preview palette from the chosen haven so the screen
  // transitions smoothly as the user selects their safe haven.
  const activePalette = useMemo(() => {
    if (!haven) return palette;
    const key = HAVEN_PALETTES[haven];
    return PALETTES[key] || palette;
  }, [haven, palette]);

  const TOTAL = 6;

  function finish() {
    onDone({
      name: name.trim() || 'Venn',
      needs: needs.length ? needs : ['warmth','calm'],
      haven: haven || 'kitchen',
      interests,
      time: { h: hour, m: minute },
      createdAt: new Date().toISOString(),
    });
  }

  // Step 0 — Welcome
  if (step === 0) return (
    <div style={{
      height: '100%',
      background: `radial-gradient(ellipse at 50% 0%, ${palette.sun}55 0%, ${palette.page} 55%)`,
      color: palette.ink,
      display: 'flex', flexDirection: 'column',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
    }}>
      <div style={{ flex: 1, padding: '90px 32px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* sun */}
        <div style={{ marginBottom: 36, position: 'relative', width: 96, height: 96 }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${palette.sun}, ${palette.blush})`,
            boxShadow: `0 0 40px ${palette.sun}80`,
            animation: 'soster-breathe 5s ease-in-out infinite',
          }}/>
        </div>
        <div style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
          color: palette.muted, marginBottom: 16,
        }}>Søster</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 42, lineHeight: 1.1, letterSpacing: -0.8,
          textWrap: 'pretty',
        }}>
          En liten, snill stemme<br/>
          <span style={{ fontStyle: 'italic', color: palette.accent }}>hver morgen.</span>
        </div>
        <div style={{
          marginTop: 20,
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 16, lineHeight: 1.55,
          color: palette.muted, maxWidth: 320, textWrap: 'pretty',
        }}>
          La oss bruke noen minutter på å bli litt kjent. Det finnes ingen gale svar — bare det som føles godt.
        </div>
      </div>
      <div style={{ padding: '14px 22px 38px' }}>
        <button
          onClick={() => setStep(1)}
          style={{
            width: '100%', height: 56, borderRadius: 28, border: 'none',
            background: palette.ink, color: palette.paper,
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 20, fontStyle: 'italic', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >begynn forsiktig <Icon name="arrow" size={18} /></button>
      </div>
    </div>
  );

  // Step 1 — Name
  if (step === 1) return (
    <OnboardScreen
      palette={palette} step={1} total={TOTAL}
      eyebrow="først, en liten hilsen"
      title={<>Hva skal jeg <em style={{ color: palette.accent, fontStyle: 'italic' }}>kalle deg?</em></>}
      subtitle="Slik at brevene føles skrevet til nettopp deg."
      onBack={() => setStep(0)}
      onNext={() => setStep(2)}
      canNext={!!name.trim()}
    >
      <div style={{ marginTop: 12 }}>
        {/* Injected CSS targets the placeholder font-size independently  */}
        {/* so the typed text stays large while the hint stays readable.  */}
        <style>{`#onboard-name-input::placeholder { font-size: 17px; opacity: 1; }`}</style>
        <input
          id="onboard-name-input"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="fornavnet ditt, eller et kallenavn"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: 'none',
            borderBottom: `1px solid ${palette.line}`,
            background: 'transparent',
            outline: 'none',
            padding: '12px 0',
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 26,
            fontStyle: 'italic',
            color: palette.ink,
          }}
        />
        <div style={{
          marginTop: 14, fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 13, color: palette.muted,
        }}>Dette forblir på enheten din.</div>
      </div>
    </OnboardScreen>
  );

  // Step 2 — Needs
  if (step === 2) return (
    <OnboardScreen
      palette={palette} step={2} total={TOTAL}
      eyebrow={`hei, ${name.trim() || 'venn'}`}
      title={<>Hva trenger du <em style={{ color: palette.accent, fontStyle: 'italic' }}>å høre?</em></>}
      subtitle="Velg så mange som kjennes sanne. Du kan endre dem når som helst."
      onBack={() => setStep(1)}
      onNext={() => setStep(3)}
      canNext={needs.length > 0}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
        {NEEDS.map(n => (
          <Chip
            key={n.key}
            icon={n.icon}
            active={needs.includes(n.key)}
            palette={palette}
            onClick={() => setNeeds(s => s.includes(n.key) ? s.filter(x => x !== n.key) : [...s, n.key])}
          >{n.label}</Chip>
        ))}
      </div>
    </OnboardScreen>
  );

  // Step 3 — Safe haven
  // Uses activePalette so colours shift live as she picks her haven.
  if (step === 3) return (
    <OnboardScreen
      palette={activePalette} step={3} total={TOTAL}
      eyebrow="ditt myke sted"
      title={<>Hvor slipper <em style={{ color: activePalette.accent, fontStyle: 'italic' }}>skuldrene ned?</em></>}
      subtitle="Stemningen du ønsker at brevene skal leve i — og som farger hele appen din."
      onBack={() => setStep(2)}
      onNext={() => setStep(4)}
      canNext={!!haven}
    >
      <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
        {HAVENS.map(h => {
          const on = haven === h.key;
          // Show a tiny colour swatch so the user can sense the palette shift.
          const havenPaletteKey = HAVEN_PALETTES[h.key];
          const hp = PALETTES[havenPaletteKey] || activePalette;
          return (
            <button
              key={h.key}
              onClick={() => setHaven(h.key)}
              style={{
                textAlign: 'left',
                padding: '16px 18px',
                borderRadius: 18,
                border: `1px solid ${on ? activePalette.ink : activePalette.line}`,
                background: on ? activePalette.ink : activePalette.paper,
                color: on ? activePalette.paper : activePalette.ink,
                cursor: 'pointer',
                transition: 'all 280ms ease',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}
            >
              <div>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 22, fontStyle: 'italic', letterSpacing: -0.2,
                }}>{h.label}</div>
                <div style={{
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  fontSize: 13, marginTop: 3,
                  color: on ? 'rgba(255,255,255,0.7)' : activePalette.muted,
                }}>{h.hint}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* Mini palette preview chips */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {[hp.canvas, hp.accent, hp.blush].map((c, i) => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: c,
                      boxShadow: `0 0 0 .5px rgba(0,0,0,0.12)`,
                      opacity: on ? 0.7 : 1,
                    }}/>
                  ))}
                </div>
                {on && <Icon name="check" size={20} />}
              </div>
            </button>
          );
        })}
      </div>
    </OnboardScreen>
  );

  // Step 4 — Interests
  if (step === 4) return (
    <OnboardScreen
      palette={activePalette} step={4} total={TOTAL}
      eyebrow="de små tingene"
      title={<>Hva <em style={{ color: activePalette.accent, fontStyle: 'italic' }}>løfter deg?</em></>}
      subtitle="Velg noen — brevene vil veve dem inn."
      onBack={() => setStep(3)}
      onNext={() => setStep(5)}
      canNext={interests.length > 0}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
        {INTERESTS.map(it => (
          <Chip
            key={it.key}
            icon={it.icon}
            active={interests.includes(it.key)}
            palette={activePalette}
            onClick={() => setInterests(s => s.includes(it.key) ? s.filter(x => x !== it.key) : [...s, it.key])}
          >{it.label}</Chip>
        ))}
      </div>
    </OnboardScreen>
  );

  // Step 5 — Time
  if (step === 5) return (
    <OnboardScreen
      palette={activePalette} step={5} total={TOTAL}
      eyebrow="vårt morgenritual"
      title={<>Når skal jeg <em style={{ color: activePalette.accent, fontStyle: 'italic' }}>banke på?</em></>}
      subtitle="Jeg kommer stille. Aldri to ganger."
      onBack={() => setStep(4)}
      onNext={() => setStep(6)}
      nextLabel="det er tiden"
    >
      <TimePicker palette={activePalette} hour={hour} minute={minute} setHour={setHour} setMinute={setMinute} />
    </OnboardScreen>
  );

  // Step 6 — Closing
  if (step === 6) {
    const hourStr = String(hour).padStart(1, '0');
    const minStr = String(minute).padStart(2, '0');
    return (
      <div style={{
        height: '100%',
        background: `radial-gradient(ellipse at 50% 100%, ${activePalette.blush}55 0%, ${activePalette.page} 60%)`,
        color: activePalette.ink,
        display: 'flex', flexDirection: 'column',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
      }}>
        <div style={{ flex: 1, padding: '110px 32px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            color: activePalette.muted, marginBottom: 16,
          }}>alt er klart, {name.trim() || 'venn'}</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 38, lineHeight: 1.15, letterSpacing: -0.6, textWrap: 'pretty',
          }}>
            I morgen kl. <span style={{ color: activePalette.accent, fontStyle: 'italic' }}>{hourStr}:{minStr}</span> venter ditt første brev.
          </div>
          <div style={{
            marginTop: 24, fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 16, lineHeight: 1.55, color: activePalette.muted, textWrap: 'pretty',
          }}>
            Inntil da — det ligger en liten en klar til deg i dag, siden vi allerede har møttes.
          </div>
        </div>
        <div style={{ padding: '14px 22px 38px' }}>
          <button
            onClick={finish}
            style={{
              width: '100%', height: 56, borderRadius: 28, border: 'none',
              background: activePalette.ink, color: activePalette.paper,
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 20, fontStyle: 'italic', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >åpne dagens brev <Icon name="arrow" size={18} /></button>
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────
// Time picker (column wheels, simplified)
// ─────────────────────────────────────────────────────────────────────
function TimePicker({ palette, hour, minute, setHour, setMinute }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const mins = [0, 15, 30, 45];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, marginTop: 18, padding: '20px 0',
      background: palette.paper, borderRadius: 22,
      border: `1px solid ${palette.line}`,
    }}>
      <Wheel palette={palette} values={hours} value={hour} onChange={setHour} format={(v) => String(v).padStart(2, '0')} />
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 40, color: palette.ink,
      }}>:</div>
      <Wheel palette={palette} values={mins} value={minute} onChange={setMinute} format={(v) => String(v).padStart(2, '0')} />
    </div>
  );
}
function Wheel({ palette, values, value, onChange, format }) {
  return (
    <div style={{
      width: 90, height: 140, overflow: 'hidden', position: 'relative',
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        transform: `translateY(${-values.indexOf(value) * 44 - 22}px)`,
        transition: 'transform 400ms cubic-bezier(.2,.8,.2,1)',
      }}>
        {values.map(v => (
          <div
            key={v}
            onClick={() => onChange(v)}
            style={{
              height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: v === value ? 36 : 26,
              fontStyle: 'italic',
              color: v === value ? palette.ink : palette.muted,
              opacity: v === value ? 1 : 0.5,
              cursor: 'pointer',
              transition: 'all 240ms ease',
            }}>{format ? format(v) : v}</div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding, PALETTES, HAVEN_PALETTES, LIBRARY, pickMessage, Icon, Chip, loadState, saveState, NEEDS, HAVENS, INTERESTS });
