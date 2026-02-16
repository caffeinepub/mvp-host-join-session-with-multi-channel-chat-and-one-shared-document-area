import { AlertTriangle, Download, FileText } from 'lucide-react';
import { parseFileMarkers } from '../../lib/documentFileMarkers';
import type { DocumentFileReference } from '../../backend';
import { Button } from '../ui/button';

type DocumentContentPreviewProps = {
  content: string;
  documentFiles: DocumentFileReference[];
};

export default function DocumentContentPreview({ content, documentFiles }: DocumentContentPreviewProps) {
  // Create a map of file ID to file reference for quick lookup
  const fileMap = new Map(documentFiles.map((f) => [Number(f.id), f]));

  // Parse file markers from content
  const fileMarkers = parseFileMarkers(content);

  // Split content into segments (text and file markers)
  const segments: Array<{ type: 'text' | 'file'; content: string; fileId?: number; filename?: string }> = [];
  let lastIndex = 0;

  fileMarkers.forEach((marker) => {
    // Add text before this marker
    if (marker.position > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, marker.position),
      });
    }

    // Add file marker
    segments.push({
      type: 'file',
      content: '',
      fileId: marker.fileId,
      filename: marker.filename,
    });

    // Update lastIndex to skip the marker text
    const markerText = `[FILE:${marker.fileId}:${marker.filename}]`;
    lastIndex = marker.position + markerText.length;
  });

  // Add remaining text after last marker
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          // Render text with preserved line breaks
          return (
            <div key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
              {segment.content}
            </div>
          );
        }

        // Render file
        const fileRef = fileMap.get(segment.fileId!);

        if (!fileRef) {
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50"
            >
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">File not found: {segment.filename}</p>
              </div>
            </div>
          );
        }

        const fileUrl = fileRef.file.getDirectURL();

        // Render image inline
        if (fileRef.mimeType.startsWith('image/')) {
          return (
            <div key={index} className="my-4">
              <img
                src={fileUrl}
                alt={fileRef.filename}
                className="w-full max-h-[500px] object-contain rounded-lg border border-border bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">{fileRef.filename}</p>
            </div>
          );
        }

        // Render non-image file as attachment row
        return (
          <div
            key={index}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileRef.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {fileRef.mimeType} • {(Number(fileRef.size) / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <a href={fileUrl} download={fileRef.filename} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Open file
              </Button>
            </a>
          </div>
        );
      })}
    </div>
  );
}
