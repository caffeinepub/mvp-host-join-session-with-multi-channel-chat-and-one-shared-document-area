import React from 'react';
import { renderTextSegment } from '../../lib/documentPreviewMarkup';
import { useListDocumentImages } from '../../hooks/useDocumentImages';
import { useListDocumentFiles } from '../../hooks/useDocumentFiles';

type DocumentContentPreviewProps = {
  documentId: bigint;
  content: string;
};

export default function DocumentContentPreview({ documentId, content }: DocumentContentPreviewProps) {
  const { data: images = [] } = useListDocumentImages(documentId);
  const { data: files = [] } = useListDocumentFiles(documentId);

  const imageMap = new Map(images.map((img) => [img.fileId, img]));
  const fileMap = new Map(files.map((f) => [f.id.toString(), f]));

  const segments = tokenizeContent(content);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {segments.map((segment, index) => {
        if (segment.type === 'image') {
          const imageRef = imageMap.get(segment.id);
          if (!imageRef) return null;
          return (
            <div key={index} className="my-4">
              <img
                src={imageRef.fileId}
                alt={imageRef.title || imageRef.caption}
                className="max-w-full rounded-lg"
              />
              {(imageRef.title || imageRef.caption) && (
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {imageRef.title || imageRef.caption}
                </p>
              )}
            </div>
          );
        }

        if (segment.type === 'file') {
          const fileRef = fileMap.get(segment.id);
          if (!fileRef) return null;
          return (
            <div key={index} className="my-2 p-2 border border-border rounded-md flex items-center gap-2">
              <span className="text-sm font-medium">{fileRef.filename}</span>
              <span className="text-xs text-muted-foreground">({fileRef.mimeType})</span>
            </div>
          );
        }

        return (
          <div key={index}>
            {renderTextSegment(segment.text)}
          </div>
        );
      })}
    </div>
  );
}

type Segment =
  | { type: 'text'; text: string }
  | { type: 'image'; id: string }
  | { type: 'file'; id: string };

function tokenizeContent(content: string): Segment[] {
  const segments: Segment[] = [];
  const imagePattern = /\[IMAGE:([^\]]+)\]/g;
  const filePattern = /\[FILE:([^\]]+)\]/g;

  const allMatches: { index: number; length: number; type: 'image' | 'file'; id: string }[] = [];

  let match;
  while ((match = imagePattern.exec(content)) !== null) {
    allMatches.push({ index: match.index, length: match[0].length, type: 'image', id: match[1] });
  }
  while ((match = filePattern.exec(content)) !== null) {
    allMatches.push({ index: match.index, length: match[0].length, type: 'file', id: match[1] });
  }

  allMatches.sort((a, b) => a.index - b.index);

  let lastIndex = 0;
  for (const m of allMatches) {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', text: content.slice(lastIndex, m.index) });
    }
    segments.push({ type: m.type, id: m.id });
    lastIndex = m.index + m.length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', text: content.slice(lastIndex) });
  }

  return segments;
}
