/**
 * Color theme presets - VERY high specificity application.
 * Uses multiple selectors to force override default :root vars from globals.css.
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
  swatch: string;
  vars: Record<string, string>;
};

export const THEMES: Record<ThemeKey, Theme> = {
  vibrant: {
    key: 'vibrant',
    name: 'Vibrant',
    description: 'Indigo + violet, gradients, modern',
    swatch: 'linear-gradient(135deg, #6366f1, #a855f7)',
    vars: {
      '--primary': '243 75% 59%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '262 83% 58%',
      '--accent-foreground': '0 0% 100%',
      '--success': '142 71% 45%',
      '--warning': '38 92% 50%',
      '--info': '217 91% 60%',
      '--destructive': '0 84% 60%',
      '--ring': '243 75% 59%',
      '--radius': '0.5rem',
    },
  },
  classic: {
    key: 'classic',
    name: 'Classic',
    description: 'Slate, original look',
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
      '--ring': '213 35% 37%',
      '--radius': '0.375rem',
    },
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    description: 'Deep green, wealth mgmt',
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
      '--ring': '155 50% 25%',
      '--radius': '0.5rem',
    },
  },
  burgundy: {
    key: 'burgundy',
    name: 'Burgundy',
    description: 'Deep red, law firm',
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
      '--ring': '0 50% 30%',
      '--radius': '0.375rem',
    },
  },
  midnight: {
    key: 'midnight',
    name: 'Midnight',
    description: 'Dark + electric blue',
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
      '--ring': '215 25% 12%',
      '--radius': '0.5rem',
    },
  },
  ocean: {
    key: 'ocean',
    name: 'Ocean',
    description: 'Navy + cyan, banking',
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
      '--ring': '215 50% 25%',
      '--radius': '0.5rem',
    },
  },
  bronze: {
    key: 'bronze',
    name: 'Bronze',
    description: 'Gold + copper, luxury',
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
      '--ring': '30 40% 35%',
      '--radius': '0.5rem',
    },
  },
};

export function getTheme(key: string | undefined | null): Theme {
  if (key && key in THEMES) return THEMES[key as ThemeKey];
  return THEMES.vibrant;
}

/**
 * Generate a high-specificity CSS string that overrides :root vars.
 * Uses `html` and `body` selectors plus a [data-theme] attribute selector
 * for maximum override priority.
 */
export function themeStyleString(theme: Theme): string {
  const lines = Object.entries(theme.vars).map(([k, v]) => `${k}: ${v} !important;`).join(' ');
  return `:root, html, body, [data-theme="${theme.key}"] { ${lines} }`;
}
