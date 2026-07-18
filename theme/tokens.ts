// Keel design tokens — civic + warm, traces of glass, calm by default.
export const palette = {
  paper: '#FAF7F2',
  paperDark: '#12171A',
  ink: '#1E2A32',
  inkDark: '#F2EFEA',
  keel: '#1FA187',
  keelDeep: '#157A66',
  coral: '#FF6B5E',
  amber: '#FFB84D',
  periwinkle: '#6C7BFF',
};

export type ThemeColors = typeof lightColors;

export const lightColors = {
  background: palette.paper,
  surface: '#FFFFFF',
  glass: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.6)',
  text: palette.ink,
  textMuted: 'rgba(30,42,50,0.62)',
  textFaint: 'rgba(30,42,50,0.4)',
  primary: palette.keel,
  primaryDeep: palette.keelDeep,
  onPrimary: '#FFFFFF',
  coral: palette.coral,
  amber: palette.amber,
  periwinkle: palette.periwinkle,
  hairline: 'rgba(30,42,50,0.1)',
  danger: '#D64545',
  success: palette.keel,
  tabBar: 'rgba(255,255,255,0.9)',
};

export const darkColors: ThemeColors = {
  background: palette.paperDark,
  surface: '#1B2226',
  glass: 'rgba(27,34,38,0.62)',
  glassBorder: 'rgba(255,255,255,0.12)',
  text: palette.inkDark,
  textMuted: 'rgba(242,239,234,0.65)',
  textFaint: 'rgba(242,239,234,0.4)',
  primary: '#2BB89B',
  primaryDeep: palette.keel,
  onPrimary: '#0C1210',
  coral: '#FF7E72',
  amber: '#FFC470',
  periwinkle: '#8A96FF',
  hairline: 'rgba(255,255,255,0.1)',
  danger: '#E06B6B',
  success: '#2BB89B',
  tabBar: 'rgba(18,23,26,0.92)',
};

// Category accents (used sparingly — badges, rings, chips)
export const categoryColors: Record<string, string> = {
  medication: palette.coral,
  appointment: palette.periwinkle,
  task: palette.keel,
  respite: palette.keel,
  food: palette.amber,
  mental_health: palette.periwinkle,
  legal: '#8B6ED6',
  financial: '#3E9BD6',
  training: palette.coral,
};

export const radius = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const type = {
  display: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 30, lineHeight: 38 },
  title: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, lineHeight: 29 },
  heading: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 17, lineHeight: 24 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15.5, lineHeight: 23 },
  bodyBold: { fontFamily: 'Inter_600SemiBold', fontSize: 15.5, lineHeight: 23 },
  small: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  smallBold: { fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 19 },
  micro: { fontFamily: 'Inter_600SemiBold', fontSize: 11, lineHeight: 15, letterSpacing: 0.4 },
} as const;

export const shadow = {
  soft: {
    shadowColor: '#1E2A32',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  card: {
    shadowColor: '#1E2A32',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
};

export const touch = { minTarget: 44 };
