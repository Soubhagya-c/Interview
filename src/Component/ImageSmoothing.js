import React, { useRef, useState } from 'react';

const ImageSmoothing = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const originalCanvasRef = useRef(null);
  const smoothedCanvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setImageSrc(e.target.result);
        const img = new Image();
        img.onload = () => drawOriginalImage(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawOriginalImage = (img) => {
    const canvas = originalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    applySmoothingFilter(ctx, img.width, img.height);
  };

  const applySmoothingFilter = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const srcData = imageData.data;
    const destImageData = ctx.createImageData(width, height);
    const destData = destImageData.data;

    const getPixelIndex = (x, y) => (y * width + x) * 4;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        // 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            // Check boundaries
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = getPixelIndex(nx, ny);
              r += srcData[idx];
              g += srcData[idx + 1];
              b += srcData[idx + 2];
              a += srcData[idx + 3];
              count++;
            }
          }
        }

        const destIdx = getPixelIndex(x, y);
        destData[destIdx] = r / count;
        destData[destIdx + 1] = g / count;
        destData[destIdx + 2] = b / count;
        destData[destIdx + 3] = a / count;
      }
    }

    // Draw on second canvas
    const smoothCanvas = smoothedCanvasRef.current;
    smoothCanvas.width = width;
    smoothCanvas.height = height;
    const smoothCtx = smoothCanvas.getContext('2d');
    smoothCtx.putImageData(destImageData, 0, 0);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Image Smoothing Filter (3x3 Average)</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h3>Original Image</h3>
          <canvas ref={originalCanvasRef} style={{ border: '1px solid black' }} />
        </div>
        <div>
          <h3>Smoothed Image</h3>
          <canvas ref={smoothedCanvasRef} style={{ border: '1px solid black' }} />
        </div>
      </div>
    </div>
  );
};

export default ImageSmoothing;
