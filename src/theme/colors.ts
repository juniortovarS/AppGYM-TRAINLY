export const colors = {
  background: '#000000',     // Pure Obsidian Black
  card: '#121212',           // Rich obsidian gray for cards
  cardElevated: '#1C1C1E',   // Slate gray for inner cards/inputs
  border: '#2C2C2E',         // Deep slate border
  borderFocus: '#D4AF37',    // Premium Gold focus border
  
  // Accents
  primary: '#D4AF37',        // Premium Metallic Gold
  secondary: '#FFFFFF',      // Elegant White
  accentGold: '#E5C158',     // Lighter Champagne Gold for gradients/accents
  accentRed: '#FF3B30',      // Alert Red
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',  // Light silver gray
  textMuted: '#636366',      // Dark slate gray for descriptions
  textInverse: '#000000',    // Black text for high-contrast on gold/white
  
  // Glassmorphic backgrounds
  glassBg: 'rgba(18, 18, 18, 0.8)',
  glassBorder: 'rgba(212, 175, 55, 0.15)',
};

export type ColorsType = typeof colors;
