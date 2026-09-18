/**
 * Design tokens — "cold stone, warm hearth".
 *
 * Kedarnath is granite at 3,583m in snow; this committee runs a kitchen there.
 * The palette carries that contrast: cool granite greys hold the page, and a
 * deep kumkum red is the single warm note. Saffron is deliberately avoided —
 * it is the reflexive choice for this subject and says nothing specific.
 *
 * Every foreground/background pair below is verified at WCAG AA (>= 4.5:1).
 */

export const palette = {
  light: {
    bg: '#EBEEF1',        // granite dust
    paper: '#FFFFFF',
    raised: '#F5F7F9',    // elevated surface
    ink: '#14181C',
    inkMuted: '#565E68',
    border: '#D9DEE4',
    borderStrong: '#C2C9D1',
    primary: '#A32B23',   // kumkum
    primaryHover: '#8A231C',
    primarySoft: '#FBEDEC',
    secondary: '#3E5A72', // himalayan slate
    secondarySoft: '#EDF1F5',
    success: '#1F7A52',
    warning: '#8A5A08',
    error: '#B3261E',
    info: '#2C5D8A',
    onPrimary: '#FFFFFF',
  },
  dark: {
    bg: '#101418',
    paper: '#181D22',
    raised: '#1F252B',
    ink: '#E6EAEE',
    inkMuted: '#9AA4AE',
    border: '#2A323A',
    borderStrong: '#3A444E',
    primary: '#E8695C',
    primaryHover: '#F0847A',
    primarySoft: '#2A1A19',
    secondary: '#7FA6C4',
    secondarySoft: '#19222B',
    success: '#4FBF8B',
    warning: '#D9A441',
    error: '#F2685C',
    info: '#6FA8D6',
    onPrimary: '#101418',
  },
};

/** Marcellus is Roman-inscriptional — letterforms cut into stone, not a
 *  fashion serif. Noto Sans Telugu sits in every stack: member names are
 *  transliterated Telugu and post content is written in Telugu script. */
export const fonts = {
  display: '"Marcellus", "Noto Sans Telugu", Georgia, serif',
  body: '"IBM Plex Sans", "Noto Sans Telugu", system-ui, -apple-system, sans-serif',
};

export const radius = { sm: 4, md: 8, lg: 14, xl: 22, pill: 999 };

/** Layered, low-opacity, cool-tinted — shadows read as stone, not as the
 *  default rgba(0,0,0,.1) card drop. */
export const elevation = {
  light: {
    1: '0 1px 2px rgba(20,24,28,.05), 0 1px 1px rgba(20,24,28,.04)',
    2: '0 2px 4px rgba(20,24,28,.05), 0 4px 10px rgba(20,24,28,.05)',
    3: '0 4px 8px rgba(20,24,28,.06), 0 12px 24px rgba(20,24,28,.07)',
    4: '0 8px 16px rgba(20,24,28,.07), 0 24px 48px rgba(20,24,28,.09)',
  },
  dark: {
    1: '0 1px 2px rgba(0,0,0,.4)',
    2: '0 2px 6px rgba(0,0,0,.45), 0 6px 14px rgba(0,0,0,.35)',
    3: '0 6px 14px rgba(0,0,0,.5), 0 16px 32px rgba(0,0,0,.4)',
    4: '0 10px 22px rgba(0,0,0,.55), 0 30px 60px rgba(0,0,0,.45)',
  },
};

export const motion = {
  fast: 0.18,
  base: 0.28,
  slow: 0.45,
  /** Restrained ease-out. No spring overshoot on a devotional subject. */
  ease: [0.22, 1, 0.36, 1],
};
