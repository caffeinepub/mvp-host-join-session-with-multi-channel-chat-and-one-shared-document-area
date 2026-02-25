// Client-side image processing for stickers
const STICKER_SIZE = 128;
const MAX_FILE_SIZE = 200 * 1024; // 200KB

export interface ProcessedSticker {
  dataUrl: string;
  size: number;
}

export async function processImageForSticker(file: File): Promise<ProcessedSticker> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      img.src = e.target.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    img.onload = () => {
      try {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = STICKER_SIZE;
        canvas.height = STICKER_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Calculate dimensions to crop to square
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Draw image centered and cropped to square
        ctx.drawImage(
          img,
          x,
          y,
          size,
          size,
          0,
          0,
          STICKER_SIZE,
          STICKER_SIZE
        );

        // Convert to PNG to preserve transparency
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }

            if (blob.size > MAX_FILE_SIZE) {
              reject(new Error(`Sticker must be under ${MAX_FILE_SIZE / 1024}KB`));
              return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
              if (!e.target?.result) {
                reject(new Error('Failed to convert blob'));
                return;
              }
              resolve({
                dataUrl: e.target.result as string,
                size: blob.size,
              });
            };
            reader.onerror = () => {
              reject(new Error('Failed to convert blob'));
            };
            reader.readAsDataURL(blob);
          },
          'image/png',
          0.9
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array<ArrayBuffer> {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
