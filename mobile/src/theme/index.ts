export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  primary: '#000000',
  onPrimary: '#FFFFFF',
  accent: '#276EF1',
  background: '#FFFFFF',
  surface: '#F6F6F6',
  surfaceAlt: '#EEEEEE',
  border: '#E2E2E2',
  text: '#000000',
  textMuted: '#6B6B6B',
  textSubtle: '#9E9E9E',
  success: '#05944F',
  successBg: '#E6F4EC',
  warning: '#B26B00',
  warningBg: '#FFF3DC',
  danger: '#E11900',
  dangerBg: '#FDECEA',
  info: '#276EF1',
  infoBg: '#EAF1FE',
  chart: ['#276EF1', '#05944F', '#FFC043', '#E11900', '#7356BF', '#6B6B6B'],
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const radius = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 };

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.4 },
};

export const theme = { colors, spacing, radius, typography };
