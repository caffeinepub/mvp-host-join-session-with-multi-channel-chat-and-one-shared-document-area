import { AlertTriangle, Download, FileText } from 'lucide-react';
import type { DocumentFileReference } from '../../backend';
import { Button } from '../ui/button';
import { tokenizeContent, renderTextSegment } from '../../lib/documentPreviewMarkup';

type DocumentContentPreviewProps = {
  content: string;
  documentFiles: DocumentFileReference[];
};

export default function DocumentContentPreview({ content, documentFiles }: DocumentContentPreviewProps) {
  // Create a map of file ID to file reference for quick lookup
  const fileMap = new Map(documentFiles.map((f) => [Number(f.id), f]));

  // Tokenize content into text and file markers
  const tokens = tokenizeContent(content);

  return (
    <div className="space-y-4">
      {tokens.map((token, index) => {
        if (token.type === 'text') {
          // Render text with line-aware markup
          return (
            <div key={index} className="text-sm whitespace-pre-wrap">
              {renderTextSegment(token.content)}
            </div>
          );
        }

        // Render file marker
        const fileRef = fileMap.get(token.fileId!);

        if (!fileRef) {
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50"
            >
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">File not found: {token.filename}</p>
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
