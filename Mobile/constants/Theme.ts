/**
 * Unified theme exports
 * This file brings together all theme-related constants
 */

import { Colors, palette } from './Colors';
import { Typography } from './Typography';
import { Spacing, Layout } from './Spacing';

export const Theme = {
  colors: Colors,
  palette,
  typography: Typography,
  spacing: Spacing,
  layout: Layout,
};

// Export individual parts as well
export { Colors, palette, Typography, Spacing, Layout }; 