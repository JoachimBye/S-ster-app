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
// Message library — filtered by needs + interests
// ─────────────────────────────────────────────────────────────────────
const LIBRARY = [
  { tone: 'calm',       body: "Morgenen krever ingenting av deg ennå. Sitt litt med teen. Dagen kan vente." },
  { tone: 'calm',       body: "Du har lov til å bevege deg sakte i dag. Saktmodighet er ikke det motsatte av fremgang — det er teksturen i den." },
  { tone: 'warmth',     body: "Et sted, akkurat nå, tenker noen varmt på deg. Det lover jeg. Også jeg." },
  { tone: 'warmth',     body: "Du er noens favorittmenneske. Du er det varme lyset i et annet rom av noens liv." },
  { tone: 'motivation', body: "Hva det enn er — begynn med den minste versjonen av det. Én setning. Ett skritt. Ett pust. Det er hele trikset." },
  { tone: 'motivation', body: "Den versjonen av deg fra ett år siden ville stille blitt forundret over hvor du står i dag." },
  { tone: 'humor',      body: "Påminnelse: du har overlevd 100 % av dine verste morgener. En ganske imponerende statistikk, må jeg si." },
  { tone: 'humor',      body: "Hvis noen spør: du gjør en flott jobb. Hvis ingen spør: du gjør fortsatt en flott jobb." },
  { tone: 'courage',    body: "Det du unngår er mindre enn bekymringen for det. Alltid. Åpne døren." },
  { tone: 'courage',    body: "Du trenger ikke føle deg modig for å være modig. Du må bare gjøre den neste lille, ærlige tingen." },
  { tone: 'perspective',body: "Om ti år vil i dag være et mykt, uskarpt fotografi. Behandle det varsomt mens det fortsatt er i fokus." },
  { tone: 'perspective',body: "Du er ikke på etterskudd. Det finnes ingen strek. Bare din egen stille, vakre vei." },
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
      background: palette.page,
      color: palette.ink,
      paddingTop: 60,
    }}>
      {/* Top: progress + back */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 22px 0', gap: 12, height: 28 }}>
        <button
          onClick={onBack}
          disabled={!onBack}
          style={{
            background: 'transparent', border: 'none', cursor: onBack ? 'pointer' : 'default',
            color: onBack ? palette.muted : 'transparent', padding: 0, display: 'flex', alignItems: 'center',
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

      {/* Body */}
      <div style={{ flex: 1, padding: '36px 28px 0', display: 'flex', flexDirection: 'column' }}>
        {eyebrow && (
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase',
            color: palette.muted, marginBottom: 14,
          }}>{eyebrow}</div>
        )}
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 34, lineHeight: 1.15, letterSpacing: -0.5,
          marginBottom: 12, textWrap: 'pretty',
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 15.5, lineHeight: 1.5,
            color: palette.muted, marginBottom: 28, textWrap: 'pretty',
          }}>{subtitle}</div>
        )}
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '14px 22px 38px' }}>
        <button
          onClick={canNext ? onNext : undefined}
          disabled={!canNext}
          style={{
            width: '100%', height: 56, borderRadius: 28,
            border: 'none',
            background: canNext ? palette.ink : palette.line,
            color: palette.paper,
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 20, fontStyle: 'italic', letterSpacing: 0.3,
            cursor: canNext ? 'pointer' : 'default',
            transition: 'all 300ms ease',
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
      paddingTop: 60,
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
      <div style={{ marginTop: 8 }}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="navnet ditt, eller det dine kjære kaller deg"
          style={{
            width: '100%',
            border: 'none',
            borderBottom: `1px solid ${palette.line}`,
            background: 'transparent',
            outline: 'none',
            padding: '14px 0',
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 28,
            fontStyle: 'italic',
            color: palette.ink,
          }}
        />
        <div style={{
          marginTop: 16, fontFamily: 'DM Sans, system-ui, sans-serif',
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
  if (step === 3) return (
    <OnboardScreen
      palette={palette} step={3} total={TOTAL}
      eyebrow="ditt myke sted"
      title={<>Hvor slipper <em style={{ color: palette.accent, fontStyle: 'italic' }}>skuldrene ned?</em></>}
      subtitle="Stemningen du ønsker at brevene skal leve i."
      onBack={() => setStep(2)}
      onNext={() => setStep(4)}
      canNext={!!haven}
    >
      <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
        {HAVENS.map(h => {
          const on = haven === h.key;
          return (
            <button
              key={h.key}
              onClick={() => setHaven(h.key)}
              style={{
                textAlign: 'left',
                padding: '16px 18px',
                borderRadius: 18,
                border: `1px solid ${on ? palette.ink : palette.line}`,
                background: on ? palette.ink : palette.paper,
                color: on ? palette.paper : palette.ink,
                cursor: 'pointer',
                transition: 'all 220ms ease',
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
                  color: on ? 'rgba(255,255,255,0.7)' : palette.muted,
                }}>{h.hint}</div>
              </div>
              {on && <Icon name="check" size={20} />}
            </button>
          );
        })}
      </div>
    </OnboardScreen>
  );

  // Step 4 — Interests
  if (step === 4) return (
    <OnboardScreen
      palette={palette} step={4} total={TOTAL}
      eyebrow="de små tingene"
      title={<>Hva <em style={{ color: palette.accent, fontStyle: 'italic' }}>løfter deg?</em></>}
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
            palette={palette}
            onClick={() => setInterests(s => s.includes(it.key) ? s.filter(x => x !== it.key) : [...s, it.key])}
          >{it.label}</Chip>
        ))}
      </div>
    </OnboardScreen>
  );

  // Step 5 — Time
  if (step === 5) return (
    <OnboardScreen
      palette={palette} step={5} total={TOTAL}
      eyebrow="vårt morgenritual"
      title={<>Når skal jeg <em style={{ color: palette.accent, fontStyle: 'italic' }}>banke på?</em></>}
      subtitle="Jeg kommer stille. Aldri to ganger."
      onBack={() => setStep(4)}
      onNext={() => setStep(6)}
      nextLabel="det er tiden"
    >
      <TimePicker palette={palette} hour={hour} minute={minute} setHour={setHour} setMinute={setMinute} />
    </OnboardScreen>
  );

  // Step 6 — Closing
  if (step === 6) {
    const hourStr = String(hour).padStart(1, '0');
    const minStr = String(minute).padStart(2, '0');
    return (
      <div style={{
        height: '100%',
        background: `radial-gradient(ellipse at 50% 100%, ${palette.blush}55 0%, ${palette.page} 60%)`,
        color: palette.ink,
        display: 'flex', flexDirection: 'column',
        paddingTop: 60,
      }}>
        <div style={{ flex: 1, padding: '110px 32px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            color: palette.muted, marginBottom: 16,
          }}>alt er klart, {name.trim() || 'venn'}</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 38, lineHeight: 1.15, letterSpacing: -0.6, textWrap: 'pretty',
          }}>
            I morgen kl. <span style={{ color: palette.accent, fontStyle: 'italic' }}>{hourStr}:{minStr}</span> venter ditt første brev.
          </div>
          <div style={{
            marginTop: 24, fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 16, lineHeight: 1.55, color: palette.muted, textWrap: 'pretty',
          }}>
            Inntil da — det ligger en liten en klar til deg i dag, siden vi allerede har møttes.
          </div>
        </div>
        <div style={{ padding: '14px 22px 38px' }}>
          <button
            onClick={finish}
            style={{
              width: '100%', height: 56, borderRadius: 28, border: 'none',
              background: palette.ink, color: palette.paper,
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

Object.assign(window, { Onboarding, PALETTES, LIBRARY, pickMessage, Icon, Chip, loadState, saveState, NEEDS, HAVENS, INTERESTS });
