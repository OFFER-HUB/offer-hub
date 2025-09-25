// Utility to crop an image using canvas, returns a Blob
export async function getCroppedImg(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<Blob> {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');
  // Set canvas size to crop size
  canvas.width = crop.width;
  canvas.height = crop.height;
  // Apply rotation and translation for cropping
  ctx.save();
  if (rotation) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }
  ctx.drawImage(image, -crop.x, -crop.y);
  ctx.restore();
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
      },
      'image/png',
      1
    );
  });
}
