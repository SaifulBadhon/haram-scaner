const haramList = [
  'gelatin', 'alcohol', 'enzymes', 'e120', 'carmine', 'lard', 'rennet',
  'lipase', 'glycerin', 'mono- and diglycerides', 'pepsin', 'trypsin',
  'whey', 'casein', 'cochineal', 'emulsifier e471', 'emulsifier e472',
  'vanilla extract', 'shortening', 'animal fat', 'animal-derived', 'pork',
  'bacon', 'ham', 'beer', 'wine', 'rum', 'brandy', 'whiskey', 'ethanol',
  'margarine', 'natural flavors', 'yeast extract', 'cysteine', 'e1105',
  'e904', 'e913', 'e920', 'e921'
];

const imageInput = document.getElementById('imageInput');
const resultBox = document.getElementById('result');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  resultBox.textContent = '🔍 Scanning...';
  resultBox.style.color = 'black';
  canvas.style.display = 'none';

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Resize image if too large (for phones)
      const MAX_WIDTH = 800;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.style.display = 'block';

      const imageDataURL = canvas.toDataURL('image/jpeg');

      Tesseract.recognize(imageDataURL, 'eng', {
        logger: m => console.log(m)
      })
        .then(({ data }) => {
          const found = haramList.filter(haram =>
            data.text.toLowerCase().includes(haram)
          );

          if (found.length > 0) {
            resultBox.textContent = `❌ Haram Ingredients Found: ${found.join(', ')}`;
            resultBox.style.color = 'red';
          } else {
            resultBox.textContent = `✅ No Haram Ingredients Found.`;
            resultBox.style.color = 'green';
          }

          // Draw bounding boxes
          ctx.strokeStyle = 'red';
          ctx.fillStyle = 'red';
          ctx.lineWidth = 2;
          ctx.font = '16px Arial';

          data.words.forEach(word => {
            const clean = word.text.toLowerCase().replace(/[^a-z0-9\-]/g, '');
            if (haramList.includes(clean)) {
              const { x0, y0, x1, y1 } = word.bbox;
              ctx.strokeRect(x0 * scale, y0 * scale, (x1 - x0) * scale, (y1 - y0) * scale);
              ctx.fillText(clean, x0 * scale, y0 * scale - 5);
            }
          });
        })
        .catch(err => {
          resultBox.textContent = '❗ OCR failed: ' + err.message;
          resultBox.style.color = 'red';
        });
    };

    img.onerror = () => {
      resultBox.textContent = "❗ Image could not be loaded";
      resultBox.style.color = "red";
    };

    img.src = reader.result;
  };

  reader.onerror = () => {
    resultBox.textContent = "❗ Failed to read file.";
    resultBox.style.color = "red";
  };

  reader.readAsDataURL(file);
});
