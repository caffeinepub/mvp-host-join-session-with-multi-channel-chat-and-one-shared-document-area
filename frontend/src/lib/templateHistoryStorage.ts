import type { SessionExport } from '../types/session';

const TEMPLATE_KEY = 'rpg_template_history';

export function saveTemplate(template: SessionExport): void {
  try {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
  } catch (error) {
    console.error('Failed to save template:', error);
    throw new Error('Failed to save template to local storage');
  }
}

export function loadTemplate(): SessionExport | null {
  try {
    const stored = localStorage.getItem(TEMPLATE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load template:', error);
    return null;
  }
}

export function clearTemplate(): void {
  try {
    localStorage.removeItem(TEMPLATE_KEY);
  } catch (error) {
    console.error('Failed to clear template:', error);
  }
}

export function validateTemplate(data: unknown): data is SessionExport {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (!d.session || typeof d.session !== 'object') return false;
  if (!Array.isArray(d.channels)) return false;
  if (!Array.isArray(d.messages)) return false;
  if (!Array.isArray(d.documents)) return false;
  if (!Array.isArray(d.playerDocuments)) return false;
  if (!Array.isArray(d.images)) return false;
  return true;
}
