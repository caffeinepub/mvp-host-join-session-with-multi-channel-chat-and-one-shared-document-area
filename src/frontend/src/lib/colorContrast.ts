// Basic contrast ratio calculation using relative luminance
function getLuminance(color: string): number {
  // Parse hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Convert to linear RGB
  const toLinear = (c: number) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function hasGoodContrast(textColor: string, backgroundColor: string): boolean {
  const ratio = getContrastRatio(textColor, backgroundColor);
  // WCAG AA standard requires 4.5:1 for normal text
  return ratio >= 4.5;
}

export function getContrastWarning(textColor: string, backgroundColor: string): string | null {
  if (!textColor || !backgroundColor) return null;
  
  try {
    if (!hasGoodContrast(textColor, backgroundColor)) {
      return 'Poor contrast - text may be hard to read';
    }
  } catch (error) {
    // Invalid color format
    return null;
  }
  
  return null;
}
