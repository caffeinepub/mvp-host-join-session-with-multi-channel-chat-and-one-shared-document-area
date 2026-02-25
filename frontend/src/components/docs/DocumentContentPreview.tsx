import { renderTextSegment } from '../../lib/documentPreviewMarkup';
import type { DocumentFileReference } from '../../types/session';
import { parseFileMarkers } from '../../lib/documentFileMarkers';
import { FileText, Download } from 'lucide-react';

type DocumentContentPreviewProps = {
  content: string;
  documentFiles: DocumentFileReference[];
};

export default function DocumentContentPreview({ content, documentFiles }: DocumentContentPreviewProps) {
  const fileMap = new Map(documentFiles.map((f) => [Number(f.id), f]));
  const fileMarkers = parseFileMarkers(content);

  // Split content into text segments and file markers
  const segments: Array<
    { type: 'text'; text: string } | { type: 'file'; fileId: number; filename: string }
  > = [];

  let remaining = content;
  for (const marker of fileMarkers) {
    const markerStr = `[FILE:${marker.fileId}:${marker.filename}]`;
    const idx = remaining.indexOf(markerStr);
    if (idx === -1) continue;
    if (idx > 0) {
      segments.push({ type: 'text', text: remaining.slice(0, idx) });
    }
    segments.push({ type: 'file', fileId: marker.fileId, filename: marker.filename });
    remaining = remaining.slice(idx + markerStr.length);
  }
  if (remaining) {
    segments.push({ type: 'text', text: remaining });
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return (
            <div key={i} className="whitespace-pre-wrap break-words">
              {renderTextSegment(seg.text)}
            </div>
          );
        }

        const fileRef = fileMap.get(seg.fileId);
        if (!fileRef) {
          return (
            <div key={i} className="text-muted-foreground text-sm italic">
              [File not found: {seg.filename}]
            </div>
          );
        }

        const url = fileRef.file.getDirectURL();
        const isImage = fileRef.mimeType.startsWith('image/');

        if (isImage) {
          return (
            <div key={i} className="my-4">
              <img
                src={url}
                alt={fileRef.filename}
                className="max-w-full rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">{fileRef.filename}</p>
            </div>
          );
        }

        return (
          <div
            key={i}
            className="my-2 flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30"
          >
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm truncate">{fileRef.filename}</span>
            <a href={url} download={fileRef.filename} className="shrink-0">
              <Download className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
