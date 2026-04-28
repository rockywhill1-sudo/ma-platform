/**
 * Color theme presets - full overrides.
 * Each theme overrides multiple CSS custom properties that get applied
 * via inline <style> tag in the root layout.
 */

export type ThemeKey =
  | 'vibrant'
  | 'classic'
  | 'forest'
  | 'burgundy'
  | 'midnight'
  | 'ocean'
  | 'bronze';

export type Theme = {
  key: ThemeKey;
  name: string;
  description: string;
  swatch: string; // CSS color string for preview swatch
  vars: Record<string, string>;
};

export const THEMES: Record<ThemeKey, Theme> = {
  vibrant: {
    key: 'vibrant',
    name: 'Vibrant',
    description: 'Default. Bright indigo and violet with rounded edges and energy.',
    swatch: 'linear-gradient(135deg, #6366f1, #a855f7)',
    vars: {
      '--primary': '243 75% 59%',          // indigo-500
      '--primary-foreground': '0 0% 100%',
      '--accent': '262 83% 58%',           // violet-500
      '--accent-foreground': '0 0% 100%',
      '--success': '142 71% 45%',
      '--warning': '38 92% 50%',
      '--info': '217 91% 60%',
      '--destructive': '0 84% 60%',
      '--radius': '0.5rem',
    },
  },
  classic: {
    key: 'classic',
    name: 'Classic',
    description: 'Original look. Slate base with muted indigo accents.',
    swatch: '#3b5475',
    vars: {
      '--primary': '213 35% 37%',
      '--primary-foreground': '0 0% 98%',
      '--accent': '213 35% 37%',
      '--accent-foreground': '0 0% 98%',
      '--success': '142 71% 36%',
      '--warning': '35 92% 50%',
      '--info': '217 91% 51%',
      '--destructive': '0 72% 51%',
      '--radius': '0.375rem',
    },
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    description: 'Deep green. Wealth management.',
    swatch: '#1f6f5c',
    vars: {
      '--primary': '155 50% 25%',
      '--primary-foreground': '0 0% 98%',
      '--accent': '155 50% 35%',
      '--accent-foreground': '0 0% 98%',
      '--success': '142 71% 36%',
      '--warning': '35 92% 50%',
      '--info': '217 91% 51%',
      '--destructive': '0 72% 51%',
      '--radius': '0.5rem',
    },
  },
  burgundy: {
    key: 'burgundy',
    name: 'Burgundy',
    description: 'Deep red and gold. Law firm feel.',
    swatch: '#7a1f1f',
    vars: {
      '--primary': '0 50% 30%',
      '--primary-foreground': '0 0% 98%',
      '--accent': '38 92% 45%',
      '--accent-foreground': '0 0% 100%',
      '--success': '142 71% 36%',
      '--warning': '38 92% 50%',
      '--info': '217 91% 51%',
      '--destructive': '0 72% 51%',
      '--radius': '0.375rem',
    },
  },
  midnight: {
    key: 'midnight',
    name: 'Midnight',
    description: 'Near-black with electric blue. Modern fintech.',
    swatch: '#0f172a',
    vars: {
      '--primary': '215 25% 12%',
      '--primary-foreground': '0 0% 98%',
      '--accent': '199 89% 48%',
      '--accent-foreground': '0 0% 100%',
      '--success': '142 71% 45%',
      '--warning': '38 92% 50%',
      '--info': '217 91% 60%',
      '--destructive': '0 84% 60%',
      '--radius': '0.5rem',
    },
  },
  ocean: {
    key: 'ocean',
    name: 'Ocean',
    description: 'Deep navy and cyan. Corporate banking.',
    swatch: '#1e3a8a',
    vars: {
      '--primary': '215 50% 25%',
      '--primary-foreground': '0 0% 98%',
      '--accent': '189 94% 43%',
      '--accent-foreground': '0 0% 100%',
      '--success': '142 71% 36%',
      '--warning': '35 92% 50%',
      '--info': '199 89% 48%',
      '--destructive': '0 72% 51%',
      '--radius': '0.5rem',
    },
  },
  bronze: {
    key: 'bronze',
    name: 'Bronze',
    description: 'Warm gold and copper. Luxury.',
    swatch: '#a16207',
    vars: {
      '--primary': '30 40% 35%',
      '--primary-foreground': '0 0% 98%',
      '--accent': '38 92% 50%',
      '--accent-foreground': '0 0% 100%',
      '--success': '142 71% 36%',
      '--warning': '35 92% 50%',
      '--info': '217 91% 51%',
      '--destructive': '0 72% 51%',
      '--radius': '0.5rem',
    },
  },
};

export function getTheme(key: string | undefined | null): Theme {
  if (key && key in THEMES) return THEMES[key as ThemeKey];
  return THEMES.vibrant; // New default
}

export function themeStyleString(theme: Theme): string {
  const lines = Object.entries(theme.vars).map(([k, v]) => `  ${k}: ${v};`);
  return `:root, html, body {\n${lines.join('\n')}\n}`;
}
