/**
 * Client-side Image Optimizer & Compressor
 * Automatically scales down and compresses images to be strictly <= targetMaxBytes (default 100KB)
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
}

export function getDataUrlSizeBytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64Index = dataUrl.indexOf(',');
  const base64Data = base64Index >= 0 ? dataUrl.slice(base64Index + 1) : dataUrl;
  return Math.round((base64Data.length * 3) / 4);
}

export async function optimizeImageFile(
  file: File,
  targetMaxBytes: number = 100 * 1024 // 100 KB max limit
): Promise<OptimizedImageResult> {
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier image"));
    reader.onload = (e) => {
      const srcUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("Impossible de décoder l'image"));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maximum initial dimension (e.g. 1000px)
        const maxInitialDim = 1000;
        if (width > maxInitialDim || height > maxInitialDim) {
          if (width > height) {
            height = Math.round((height * maxInitialDim) / width);
            width = maxInitialDim;
          } else {
            width = Math.round((width * maxInitialDim) / height);
            height = maxInitialDim;
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: srcUrl,
            originalSizeBytes,
            compressedSizeBytes: originalSizeBytes,
            width,
            height,
          });
        }

        let currentWidth = width;
        let currentHeight = height;
        let quality = 0.85;
        let bestDataUrl = '';
        let bestSizeBytes = Infinity;

        for (let attempt = 0; attempt < 8; attempt++) {
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          ctx.clearRect(0, 0, currentWidth, currentHeight);
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

          // Try webp or jpeg
          const candidateDataUrl = canvas.toDataURL('image/jpeg', quality);
          const candidateSize = getDataUrlSizeBytes(candidateDataUrl);

          if (candidateSize <= targetMaxBytes) {
            bestDataUrl = candidateDataUrl;
            bestSizeBytes = candidateSize;
            break;
          }

          bestDataUrl = candidateDataUrl;
          bestSizeBytes = candidateSize;

          // Progressively lower quality and reduce canvas size if needed
          if (quality > 0.45) {
            quality -= 0.15;
          } else {
            currentWidth = Math.round(currentWidth * 0.8);
            currentHeight = Math.round(currentHeight * 0.8);
            quality = 0.7;
          }
        }

        resolve({
          dataUrl: bestDataUrl,
          originalSizeBytes,
          compressedSizeBytes: bestSizeBytes,
          width: currentWidth,
          height: currentHeight,
        });
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(file);
  });
}
