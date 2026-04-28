/**
 * Color theme presets.
 * Each theme defines CSS custom property values that get injected via inline <style> tag.
 *
 * To add a new theme, add an entry here and update the dropdown in admin page.
 */

export type ThemeKey = 'default' | 'forest' | 'burgundy' | 'midnight' | 'ocean' | 'bronze';

export type Theme = {
  key: ThemeKey;
  name: string;
  description: string;
  vars: Record<string, string>;
};

export const THEMES: Record<ThemeKey, Theme> = {
  default: {
    key: 'default',
    name: 'Slate Indigo',
    description: 'Default. Slate base with indigo accents. Classic SaaS feel.',
    vars: {
      '--primary': '213 35% 37%',
      '--primary-foreground': '0 0% 98%',
      '--accent-from': '99 102 241', // indigo-500 RGB for gradients
      '--accent-to': '59 130 246',   // blue-500
    },
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    description: 'Deep green primary. Wealth management feel.',
    vars: {
      '--primary': '155 50% 25%',
      '--primary-foreground': '0 0% 98%',
      '--accent-from': '5 150 105',  // emerald-600
      '--accent-to': '16 185 129',   // emerald-500
    },
  },
  burgundy: {
    key: 'burgundy',
    name: 'Burgundy',
    description: 'Deep red with gold. Traditional banking and law firm aesthetic.',
    vars: {
      '--primary': '0 50% 30%',
      '--primary-foreground': '0 0% 98%',
      '--accent-from': '153 27 27',   // red-900
      '--accent-to': '180 83 9',      // amber-700
    },
  },
  midnight: {
    key: 'midnight',
    name: 'Midnight',
    description: 'Near-black with electric blue. Modern fintech feel.',
    vars: {
      '--primary': '215 25% 12%',
      '--primary-foreground': '0 0% 98%',
      '--accent-from': '37 99 235',   // blue-600
      '--accent-to': '6 182 212',     // cyan-500
    },
  },
  ocean: {
    key: 'ocean',
    name: 'Ocean',
    description: 'Deep navy with cyan. Corporate banking aesthetic.',
    vars: {
      '--primary': '215 50% 25%',
      '--primary-foreground': '0 0% 98%',
      '--accent-from': '30 64 175',   // blue-800
      '--accent-to': '8 145 178',     // cyan-700
    },
  },
  bronze: {
    key: 'bronze',
    name: 'Bronze',
    description: 'Warm gold and copper. Luxury and hospitality feel.',
    vars: {
      '--primary': '30 40% 35%',
      '--primary-foreground': '0 0% 98%',
      '--accent-from': '180 83 9',    // amber-700
      '--accent-to': '217 119 6',     // amber-600
    },
  },
};

export function getTheme(key: string | undefined | null): Theme {
  if (key && key in THEMES) return THEMES[key as ThemeKey];
  return THEMES.default;
}

export function themeStyleString(theme: Theme): string {
  const lines = Object.entries(theme.vars).map(([k, v]) => `  ${k}: ${v};`);
  return `:root {\n${lines.join('\n')}\n}`;
}
