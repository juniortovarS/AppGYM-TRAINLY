export const colors = {
  background: '#0B0B0B',     // Deep Matte Black
  card: '#141414',           // Premium Dark Gray for Cards
  cardElevated: '#1A1A1A',   // Lighter Gray for Inner elements
  border: '#2C2C2E',         // Subdued border
  borderFocus: '#FFD700',    // Glowing Gold Focus
  
  // Accents
  primary: '#FFD700',        // Premium Gold Main
  secondary: '#FFFFFF',      // Elegant White
  accentGold: '#FFD700',     // Standard Gold
  accentGoldDark: '#B8860B', // Deep Gold for gradients
  accentRed: '#FF3B30',      // Alert Red
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',  // Light silver gray
  textMuted: '#636366',      // Dark slate gray for descriptions
  textInverse: '#000000',    // Black text for high-contrast on gold/white
  
  // Glassmorphic backgrounds
  glassBg: 'rgba(20, 20, 20, 0.75)',
  glassBorder: 'rgba(255, 215, 0, 0.15)',
};

export type ColorsType = typeof colors;
