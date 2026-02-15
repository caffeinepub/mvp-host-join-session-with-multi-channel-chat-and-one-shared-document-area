import type { SessionExport } from '../backend';

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

export function validateTemplate(data: any): data is SessionExport {
  if (!data || typeof data !== 'object') return false;
  
  // Check required fields
  if (!data.session || typeof data.session !== 'object') return false;
  if (!Array.isArray(data.channels)) return false;
  if (!Array.isArray(data.messages)) return false;
  if (!Array.isArray(data.documents)) return false;
  if (!Array.isArray(data.playerDocuments)) return false;
  if (!Array.isArray(data.images)) return false;
  
  return true;
}
