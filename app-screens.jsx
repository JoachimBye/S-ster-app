// Søster — main app shell: Today (letter reveal) / Archive / You

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────────────
// Letter (the daily message + unfold reveal)
// ─────────────────────────────────────────────────────────────────────
function LetterCard({ palette, name, message, sealed, onOpen, onSave, saved }) {
  // sealed = folded, unopened
  // unsealed = unfolded, message visible
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 5) return 'god tidlig morgen';
    if (hr < 11) return 'god morgen';
    if (hr < 17) return 'god dag';
    if (hr < 21) return 'god kveld';
    return 'god natt';
  }, []);

  const dateStr = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('nb-NO', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  return (
    <div style={{
      width: '100%',
      perspective: 1200,
      marginTop: 8,
    }}>
      <div
        onClick={sealed ? onOpen : undefined}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: sealed ? 220 : 360,
          borderRadius: 22,
          background: palette.paper,
          boxShadow: sealed
            ? `0 30px 50px -20px ${palette.ink}25, 0 0 0 1px ${palette.line}`
            : `0 40px 70px -30px ${palette.ink}30, 0 0 0 1px ${palette.line}`,
          overflow: 'hidden',
          transition: 'all 700ms cubic-bezier(.2,.8,.2,1)',
          cursor: sealed ? 'pointer' : 'default',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Wax seal / unfold visualization */}
        {sealed ? (
          <SealedLetter palette={palette} dateStr={dateStr} greeting={greeting} name={name} />
        ) : (
          <UnfoldedLetter palette={palette} dateStr={dateStr} greeting={greeting} name={name} message={message} onSave={onSave} saved={saved} />
        )}
      </div>
    </div>
  );
}

function SealedLetter({ palette, dateStr, greeting, name }) {
  return (
    <div style={{
      padding: '28px 26px 30px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      position: 'relative',
    }}>
      {/* Postmark date stamp */}
      <div style={{
        position: 'absolute', top: 22, right: 22,
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
        color: palette.muted,
        border: `1px dashed ${palette.muted}80`,
        padding: '4px 8px', borderRadius: 4,
        transform: 'rotate(-3deg)',
        opacity: 0.7,
      }}>{dateStr}</div>

      <div style={{
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
        color: palette.muted, marginTop: 4, marginBottom: 36, alignSelf: 'flex-start',
      }}>dagens brev til {name}</div>

      {/* Wax seal */}
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${palette.blush}, ${palette.accent} 75%, ${palette.ink}50 100%)`,
        boxShadow: `inset 0 -6px 12px ${palette.ink}40, 0 8px 24px ${palette.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
        animation: 'soster-breathe 4s ease-in-out infinite',
      }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 40, fontStyle: 'italic',
          color: palette.paper, lineHeight: 1, marginTop: 6,
          textShadow: `0 1px 2px ${palette.ink}40`,
        }}>s</div>
      </div>

      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 19, fontStyle: 'italic', color: palette.muted, marginBottom: 6,
      }}>{greeting}</div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 24, color: palette.ink, lineHeight: 1.2,
      }}>trykk for å åpne</div>
    </div>
  );
}

function UnfoldedLetter({ palette, dateStr, greeting, name, message, onSave, saved }) {
  return (
    <div style={{
      padding: '32px 30px 28px',
      animation: 'soster-fadeUp 800ms cubic-bezier(.2,.8,.2,1) both',
      position: 'relative',
    }}>
      {/* Faux paper texture: subtle horizontal rule on the right */}
      <div style={{
        position: 'absolute', top: 24, right: 28,
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
        color: palette.muted, opacity: 0.7,
      }}>{dateStr}</div>

      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 22, fontStyle: 'italic', color: palette.muted, marginBottom: 2,
      }}>{greeting},</div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 32, color: palette.ink, lineHeight: 1.1, letterSpacing: -0.4, marginBottom: 22,
      }}>kjære {name}.</div>

      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 21, lineHeight: 1.45, color: palette.ink,
        textWrap: 'pretty', letterSpacing: -0.1,
      }}>
        {message}
      </div>

      <div style={{
        marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 18, fontStyle: 'italic', color: palette.accent,
        }}>— søster</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onSave}
            aria-label={saved ? 'Lagret i gledesarkivet' : 'Lagre i gledesarkivet'}
            style={{
              width: 42, height: 42, borderRadius: 21,
              border: `1px solid ${palette.line}`,
              background: saved ? palette.blush + '40' : palette.page,
              color: saved ? palette.accent : palette.muted,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 300ms ease',
            }}
          >
            <Icon name={saved ? 'heartFill' : 'heart'} size={18} color={saved ? palette.accent : palette.muted} />
          </button>
          <button
            aria-label="Del"
            style={{
              width: 42, height: 42, borderRadius: 21,
              border: `1px solid ${palette.line}`,
              background: palette.page,
              color: palette.muted,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Today screen
// ─────────────────────────────────────────────────────────────────────
function TodayScreen({ palette, prefs, opened, message, onOpen, onSave, saved, streak }) {
  const dateLong = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('nb-NO', { weekday: 'long' }).toLowerCase();
  }, []);
  const dateNum = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('nb-NO', { month: 'long', day: 'numeric' }).toLowerCase();
  }, []);

  return (
    <div style={{
      minHeight: '100%',
      background: `linear-gradient(180deg, ${palette.sun}30 0%, ${palette.page} 30%, ${palette.page} 100%)`,
      color: palette.ink,
      paddingTop: 60,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            color: palette.muted, marginBottom: 6,
          }}>{dateLong}</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 30, letterSpacing: -0.4, lineHeight: 1, color: palette.ink,
          }}>{dateNum}</div>
        </div>
        {/* Tiny sun */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${palette.sun}, ${palette.blush})`,
          boxShadow: `0 0 24px ${palette.sun}80`,
          animation: 'soster-breathe 5s ease-in-out infinite',
          marginTop: 4,
        }}/>
      </div>

      {/* Letter */}
      <div style={{ padding: '24px 22px 8px' }}>
        <LetterCard
          palette={palette}
          name={prefs.name}
          message={message.body}
          sealed={!opened}
          onOpen={onOpen}
          onSave={onSave}
          saved={saved}
        />
      </div>

      {/* Streak / gentle stat */}
      <div style={{
        margin: '16px 22px 24px',
        padding: '16px 18px',
        background: palette.paper,
        borderRadius: 18,
        border: `1px solid ${palette.line}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: palette.canvas,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: palette.accent,
        }}>
          <Icon name="sparkle" size={20} color={palette.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 18, color: palette.ink, lineHeight: 1.1,
          }}>{streak} morgener sammen</div>
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 13, color: palette.muted, marginTop: 2,
          }}>stille, jevnt, uten press.</div>
        </div>
      </div>

      {/* Tomorrow's preview */}
      <div style={{ padding: '0 22px 100px' }}>
        <div style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
          color: palette.muted, marginBottom: 10, padding: '0 4px',
        }}>i morgen</div>
        <div style={{
          padding: '14px 18px',
          background: 'transparent',
          borderRadius: 16,
          border: `1px dashed ${palette.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon name="clock" size={18} color={palette.muted} />
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14, color: palette.muted, flex: 1,
          }}>
            kommer kl. <span style={{ color: palette.ink, fontWeight: 500 }}>
              {String(prefs.time.h).padStart(2,'0')}:{String(prefs.time.m).padStart(2,'0')}
            </span>
          </div>
          <Icon name="chevron" size={16} color={palette.muted} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Archive screen
// ─────────────────────────────────────────────────────────────────────
function ArchiveScreen({ palette, archive, onUnsave }) {
  return (
    <div style={{
      minHeight: '100%',
      background: palette.page,
      color: palette.ink,
      paddingTop: 60,
    }}>
      <div style={{ padding: '20px 24px 12px' }}>
        <div style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
          color: palette.muted, marginBottom: 6,
        }}>din samling</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, letterSpacing: -0.6, lineHeight: 1.05,
        }}>Gledesarkiv</div>
        <div style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 14, color: palette.muted, marginTop: 8, textWrap: 'pretty',
        }}>Morgenene som fikk deg til å stoppe opp. Les dem igjen når dagen ber om det.</div>
      </div>

      {archive.length === 0 ? (
        <div style={{
          margin: '40px 24px',
          padding: '36px 24px',
          background: palette.paper,
          borderRadius: 22,
          border: `1px dashed ${palette.line}`,
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28, margin: '0 auto 14px',
            background: palette.canvas,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="heart" size={22} color={palette.accent} />
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 22, color: palette.ink, lineHeight: 1.2, marginBottom: 6,
          }}>Ingenting lagt til side ennå.</div>
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14, color: palette.muted, textWrap: 'pretty',
          }}>Når et brev kjennes ekstra ditt, trykk på det lille hjertet for å beholde det her.</div>
        </div>
      ) : (
        <div style={{ padding: '8px 22px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {archive.map((a, i) => (
            <ArchiveCard key={a.id} palette={palette} item={a} onUnsave={() => onUnsave(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArchiveCard({ palette, item, onUnsave }) {
  const d = new Date(item.savedAt);
  const date = d.toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' });
  return (
    <div style={{
      padding: '20px 20px 18px',
      background: palette.paper,
      borderRadius: 20,
      border: `1px solid ${palette.line}`,
      position: 'relative',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
          color: palette.muted,
        }}>{date} · {item.tone}</div>
        <button
          onClick={onUnsave}
          aria-label="Fjern fra arkivet"
          style={{
            width: 32, height: 32, borderRadius: 16, border: 'none',
            background: 'transparent', color: palette.accent, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        ><Icon name="heartFill" size={16} color={palette.accent} /></button>
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 19, lineHeight: 1.4, color: palette.ink, letterSpacing: -0.1,
        textWrap: 'pretty',
      }}>{item.body}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// You / Settings screen
// ─────────────────────────────────────────────────────────────────────
function YouScreen({ palette, prefs, archive, setPrefs, onReset }) {
  const initials = (prefs.name || 'S').slice(0, 1).toUpperCase();
  return (
    <div style={{
      minHeight: '100%',
      background: palette.page,
      color: palette.ink,
      paddingTop: 60,
    }}>
      <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          background: `radial-gradient(circle at 35% 30%, ${palette.sun}, ${palette.blush})`,
          color: palette.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 32, fontStyle: 'italic',
          boxShadow: `0 6px 18px ${palette.blush}50`,
        }}>{initials}</div>
        <div>
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
            color: palette.muted, marginBottom: 4,
          }}>du er</div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 30, lineHeight: 1, letterSpacing: -0.4,
          }}>{prefs.name}</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatBox palette={palette} value={archive.length} label="lagrede brev" />
        <StatBox palette={palette} value={prefs.streak || 1} label="dager på rad" />
      </div>

      {/* Sections */}
      <SectionHeader palette={palette}>din morgen</SectionHeader>
      <Row palette={palette} label="leveringstid" value={`${String(prefs.time.h).padStart(2,'0')}:${String(prefs.time.m).padStart(2,'0')}`} icon="clock" />
      <Row palette={palette} label="mitt myke sted" value={(window.HAVENS.find(h => h.key === prefs.haven) || {}).label || prefs.haven} icon="leaf" />

      <SectionHeader palette={palette}>hva du trenger å høre</SectionHeader>
      <div style={{ padding: '4px 22px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {window.NEEDS.map(n => {
          const on = prefs.needs.includes(n.key);
          return (
            <Chip
              key={n.key}
              icon={n.icon}
              active={on}
              palette={palette}
              onClick={() => {
                const newNeeds = on
                  ? prefs.needs.filter(x => x !== n.key)
                  : [...prefs.needs, n.key];
                if (newNeeds.length === 0) return;
                setPrefs({ ...prefs, needs: newNeeds });
              }}
            >{n.label}</Chip>
          );
        })}
      </div>

      <SectionHeader palette={palette}>hva som løfter deg</SectionHeader>
      <div style={{ padding: '4px 22px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {window.INTERESTS.map(it => {
          const on = prefs.interests.includes(it.key);
          return (
            <Chip
              key={it.key}
              icon={it.icon}
              active={on}
              palette={palette}
              onClick={() => {
                setPrefs({
                  ...prefs,
                  interests: on
                    ? prefs.interests.filter(x => x !== it.key)
                    : [...prefs.interests, it.key],
                });
              }}
            >{it.label}</Chip>
          );
        })}
      </div>

      <div style={{ padding: '34px 22px 100px' }}>
        <button
          onClick={onReset}
          style={{
            width: '100%', padding: '14px', border: `1px solid ${palette.line}`,
            background: palette.paper, color: palette.muted,
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: 14, borderRadius: 14, cursor: 'pointer',
          }}
        >start på nytt</button>
      </div>
    </div>
  );
}

function StatBox({ palette, value, label }) {
  return (
    <div style={{
      padding: '16px 18px',
      background: palette.paper,
      borderRadius: 18,
      border: `1px solid ${palette.line}`,
    }}>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 34, lineHeight: 1, color: palette.ink, letterSpacing: -0.5,
      }}>{value}</div>
      <div style={{
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: 12, color: palette.muted, marginTop: 6,
      }}>{label}</div>
    </div>
  );
}

function SectionHeader({ palette, children }) {
  return (
    <div style={{
      padding: '24px 26px 10px',
      fontFamily: 'DM Sans, system-ui, sans-serif',
      fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase',
      color: palette.muted,
    }}>{children}</div>
  );
}

function Row({ palette, label, value, icon }) {
  return (
    <div style={{
      margin: '0 22px',
      padding: '14px 16px',
      background: palette.paper,
      borderRadius: 14,
      border: `1px solid ${palette.line}`,
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 8,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: palette.canvas,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: palette.accent,
      }}>
        <Icon name={icon} size={16} color={palette.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 14, color: palette.ink,
        }}>{label}</div>
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontStyle: 'italic',
        fontSize: 17, color: palette.muted,
      }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Bottom tab bar
// ─────────────────────────────────────────────────────────────────────
function TabBar({ palette, tab, setTab }) {
  const tabs = [
    { key: 'today',   label: 'I dag',   icon: 'sun' },
    { key: 'archive', label: 'Arkiv',   icon: 'heart' },
    { key: 'you',     label: 'Deg',     icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 18, right: 18, bottom: 18,
      borderRadius: 28,
      background: palette.ink + 'F2',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '8px',
      display: 'flex', gap: 4,
      boxShadow: `0 18px 40px -10px ${palette.ink}50`,
      zIndex: 30,
    }}>
      {tabs.map(t => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, height: 48,
              border: 'none',
              background: active ? palette.paper : 'transparent',
              color: active ? palette.ink : palette.paper + 'B0',
              borderRadius: 22,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: 13, fontWeight: 500,
              transition: 'all 300ms ease',
            }}
          >
            <Icon name={t.icon} size={18} color={active ? palette.ink : palette.paper + 'B0'} />
            {active && <span>{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { TodayScreen, ArchiveScreen, YouScreen, TabBar, LetterCard });
