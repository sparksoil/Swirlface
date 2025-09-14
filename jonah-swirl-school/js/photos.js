// photos.js — gentle client-side image compression for Jonah
// Usage:
//   import { compressFileToDataUrl } from './photos.js';
//   const { dataUrl, width, height } = await compressFileToDataUrl(file, { max:1024, quality:.72 });

export async function compressFileToDataUrl(file, { max = 1024, quality = 0.72 } = {}){
  if(!file || !file.type?.startsWith('image/')) throw new Error('Not an image');

  const img = await fileToImage(file);
  const { canvas, w, h } = fitCanvas(img, max);
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(img, 0, 0, w, h);

  const mime = 'image/jpeg'; // consistent export
  const dataUrl = canvas.toDataURL(mime, quality);
  return { dataUrl, width: w, height: h };
}

function fileToImage(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function fitCanvas(img, max){
  const ratio = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  return { canvas, w, h };
}
