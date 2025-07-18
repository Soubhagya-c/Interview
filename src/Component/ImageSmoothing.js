import React, { useRef, useState } from 'react';

const ImageSmoothing = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [kernelSize, setKernelSize] = useState(3);
  const [milestones, setMilestones] = useState({
    uploaded: false,
    originalDisplayed: false,
    smoothedDisplayed: false,
  });

  const originalCanvasRef = useRef(null);
  const smoothedCanvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setImageSrc(e.target.result);
        setMilestones((prev) => ({ ...prev, uploaded: true }));
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

    setMilestones((prev) => ({ ...prev, originalDisplayed: true }));

    applySmoothingFilter(ctx, img.width, img.height);
  };

  const applySmoothingFilter = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const srcData = imageData.data;
    const destImageData = ctx.createImageData(width, height);
    const destData = destImageData.data;

    const getPixelIndex = (x, y) => (y * width + x) * 4;
    const offset = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let dy = -offset; dy <= offset; dy++) {
          for (let dx = -offset; dx <= offset; dx++) {
            const nx = x + dx;
            const ny = y + dy;
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

    const smoothCanvas = smoothedCanvasRef.current;
    smoothCanvas.width = width;
    smoothCanvas.height = height;
    const smoothCtx = smoothCanvas.getContext('2d');
    smoothCtx.putImageData(destImageData, 0, 0);

    setMilestones((prev) => ({ ...prev, smoothedDisplayed: true }));
  };

  const handleKernelChange = (e) => {
    const size = parseInt(e.target.value);
    setKernelSize(size);

    // Re-process the image if already uploaded
    if (imageSrc) {
      const img = new Image();
      img.onload = () => drawOriginalImage(img);
      img.src = imageSrc;
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>🖼️ Image Smoothing Filter UI</h2>

      <div style={{ marginBottom: 10 }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>Filter Size:</strong>{' '}
        <label>
          <input
            type="radio"
            value={3}
            checked={kernelSize === 3}
            onChange={handleKernelChange}
          />{' '}
          3×3
        </label>{' '}
        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            value={5}
            checked={kernelSize === 5}
            onChange={handleKernelChange}
          />{' '}
          5×5
        </label>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4>✅ Milestones</h4>
        <label>
          <input type="checkbox" checked={milestones.uploaded} readOnly /> Image Uploaded
        </label>
        <br />
        <label>
          <input type="checkbox" checked={milestones.originalDisplayed} readOnly /> Original Image Displayed
        </label>
        <br />
        <label>
          <input type="checkbox" checked={milestones.smoothedDisplayed} readOnly /> Smoothed Image Displayed
        </label>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h3>Original Image</h3>
          <canvas ref={originalCanvasRef} style={{ border: '1px solid black' }} width={500} />
        </div>
        <div>
          <h3>Smoothed Image</h3>
          <canvas ref={smoothedCanvasRef} style={{ border: '1px solid black' }} width={500}/>
        </div>
      </div>
    </div>
  );
};

export default ImageSmoothing;
