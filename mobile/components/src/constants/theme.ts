// src/constants/Theme.ts

export const COLORS = {
  // Carousell / OLX Style Minimalist Primary Palette
  primary: '#FF5A5F',       // Vibrant action red/coral for CTA buttons & branding
  secondary: '#00A699',     // Clean teal for success states, active tracking, or verified badges
  background: '#F7F7F7',    // Light grey backdrop to let cards pop
  surface: '#FFFFFF',       // Pure white card faces
  textPrimary: '#222222',   // Charcoal black for headers and primary typography
  textSecondary: '#717171', // Muted grey for subtexts and secondary descriptions
  border: '#EBEBEB',        // Thin subtle borders dividing list cards
  accent: '#484848',        // Heavy grey text accents
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOWS = {
  // Elegant modern card lift
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
};
