import type { SessionExport } from '../backend';

const EXPORT_VERSION = '1.0';

type ExportFileFormat = {
  version: string;
  exportedAt: string;
  data: SessionExport;
};

export function createExportFile(sessionExport: SessionExport): Blob {
  const exportData: ExportFileFormat = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: sessionExport,
  };
  
  const json = JSON.stringify(exportData, null, 2);
  return new Blob([json], { type: 'application/json' });
}

export function downloadExportFile(sessionExport: SessionExport, sessionName: string): void {
  const blob = createExportFile(sessionExport);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sessionName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseImportFile(file: File): Promise<SessionExport> {
  try {
    const text = await file.text();
    const parsed: ExportFileFormat = JSON.parse(text);
    
    if (!parsed.version) {
      throw new Error('Invalid file format: missing version');
    }
    
    if (parsed.version !== EXPORT_VERSION) {
      throw new Error(`Incompatible version: expected ${EXPORT_VERSION}, got ${parsed.version}`);
    }
    
    if (!parsed.data) {
      throw new Error('Invalid file format: missing data');
    }
    
    // Validate structure
    if (!parsed.data.session || !Array.isArray(parsed.data.channels)) {
      throw new Error('Invalid file format: corrupted session data');
    }
    
    return parsed.data;
  } catch (error: any) {
    if (error.message.includes('Invalid') || error.message.includes('Incompatible')) {
      throw error;
    }
    throw new Error('Failed to parse file: ' + error.message);
  }
}
