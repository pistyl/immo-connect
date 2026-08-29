/**
 * Utility to compress images client-side before storing or uploading.
 * Essential for low-bandwidth 3G connections in Dakar, Senegal.
 */
export async function compressImage(
  dataUrlOrFile: File | string,
  maxWidth = 1000,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // If it's already a small string or URL, convert to HTMLImageElement
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale down proportionally if larger than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export compressed Data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Fallback
      if (typeof dataUrlOrFile === 'string') {
        resolve(dataUrlOrFile);
      } else {
        resolve('');
      }
    };

    if (typeof dataUrlOrFile === 'string') {
      img.src = dataUrlOrFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(dataUrlOrFile);
    }
  });
}
