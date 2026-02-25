import type { CommunityTheme } from '../types/community';

export const DEFAULT_THEME: CommunityTheme = {
  primaryColor: '#6B46C1',
  accentColor: '#10B981',
  backgroundColor: '#1a0a2e',
  textColor: '#ffffff',
  fontFamily: 'Inter',
  layoutStyle: 'Card-based',
};

export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Cinzel', label: 'Cinzel (Fantasy)' },
];

export const BACKGROUND_PRESETS = [
  { name: 'Dark Starry', value: '#1a0a2e', gradient: 'linear-gradient(180deg, #1a0a2e 0%, #0f0520 100%)' },
  { name: 'Deep Purple', value: '#2d1b69', gradient: 'linear-gradient(180deg, #2d1b69 0%, #1a0f3d 100%)' },
  { name: 'Midnight Blue', value: '#0a1929', gradient: 'linear-gradient(180deg, #0a1929 0%, #020817 100%)' },
  { name: 'Dark Void', value: '#0d0d0d', gradient: 'linear-gradient(180deg, #0d0d0d 0%, #000000 100%)' },
];

export function applyCommunityTheme(theme: CommunityTheme, containerElement: HTMLElement) {
  containerElement.style.setProperty('--community-primary', theme.primaryColor);
  containerElement.style.setProperty('--community-accent', theme.accentColor);
  containerElement.style.setProperty('--community-bg', theme.backgroundColor);
  containerElement.style.setProperty('--community-text', theme.textColor);
  containerElement.style.setProperty('--community-font', theme.fontFamily);
  
  if (theme.backgroundGradient) {
    containerElement.style.background = theme.backgroundGradient;
  } else {
    containerElement.style.backgroundColor = theme.backgroundColor;
  }
}

export function getCommunityCardStyle(theme?: CommunityTheme) {
  if (!theme) return {};
  
  return {
    borderColor: theme.primaryColor,
    borderWidth: '2px',
  };
}
