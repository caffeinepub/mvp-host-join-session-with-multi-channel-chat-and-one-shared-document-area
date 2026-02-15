export type ImageMarker = {
  imageId: number;
  caption: string;
  position: number;
};

const IMAGE_MARKER_REGEX = /\[IMAGE:(\d+):([^\]]*)\]/g;

export function createImageMarker(imageId: number, caption: string): string {
  const sanitizedCaption = caption.replace(/[\[\]]/g, '');
  return `[IMAGE:${imageId}:${sanitizedCaption}]`;
}

export function parseImageMarkers(content: string): ImageMarker[] {
  const markers: ImageMarker[] = [];
  let match;
  
  IMAGE_MARKER_REGEX.lastIndex = 0;
  while ((match = IMAGE_MARKER_REGEX.exec(content)) !== null) {
    markers.push({
      imageId: parseInt(match[1], 10),
      caption: match[2],
      position: match.index,
    });
  }
  
  return markers;
}

export function insertImageMarker(content: string, cursorPosition: number, marker: string): string {
  return content.slice(0, cursorPosition) + marker + content.slice(cursorPosition);
}

export function removeImageMarker(content: string, imageId: number): string {
  const regex = new RegExp(`\\[IMAGE:${imageId}:[^\\]]*\\]`, 'g');
  return content.replace(regex, '');
}
