export type FileMarker = {
  fileId: number;
  filename: string;
  position: number;
};

const FILE_MARKER_REGEX = /\[FILE:(\d+):([^\]]*)\]/g;

export function createFileMarker(fileId: number, filename: string): string {
  const sanitizedFilename = filename.replace(/[\[\]]/g, '');
  return `[FILE:${fileId}:${sanitizedFilename}]`;
}

export function parseFileMarkers(content: string): FileMarker[] {
  const markers: FileMarker[] = [];
  let match;
  
  FILE_MARKER_REGEX.lastIndex = 0;
  while ((match = FILE_MARKER_REGEX.exec(content)) !== null) {
    markers.push({
      fileId: parseInt(match[1], 10),
      filename: match[2],
      position: match.index,
    });
  }
  
  return markers;
}

export function insertFileMarker(content: string, cursorPosition: number, marker: string): string {
  return content.slice(0, cursorPosition) + '\n' + marker + '\n' + content.slice(cursorPosition);
}

export function removeFileMarker(content: string, fileId: number): string {
  const regex = new RegExp(`\\[FILE:${fileId}:[^\\]]*\\]`, 'g');
  return content.replace(regex, '');
}
