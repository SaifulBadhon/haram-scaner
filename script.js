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
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Image preprocessing: grayscale + threshold
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const value = avg > 150 ? 255 : 0; // basic binarization
        data[i] = data[i + 1] = data[i + 2] = value;
      }
      ctx.putImageData(imageData, 0, 0);

      canvas.style.display = 'block';
      const processedImage = canvas.toDataURL('image/png');

      Tesseract.recognize(processedImage, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ',
        preserve_interword_spaces: 1,
      })
        .then(({ data }) => {
          const cleanText = data.text.toLowerCase();
          const found = haramList.filter(item => cleanText.includes(item));

          if (found.length > 0) {
            resultBox.textContent = `❌ Haram Ingredients Found: ${found.join(', ')}`;
            resultBox.style.color = 'red';
          } else {
            resultBox.textContent = `✅ No Haram Ingredients Found.`;
            resultBox.style.color = 'green';
          }

          // Draw boxes
          ctx.strokeStyle = 'red';
          ctx.fillStyle = 'red';
          ctx.lineWidth = 2;
          ctx.font = '16px Arial';

          data.words.forEach(word => {
            const text = word.text.toLowerCase().replace(/[^a-z0-9\-]/g, '');
            if (haramList.includes(text)) {
              const { x0, y0, x1, y1 } = word.bbox;
              ctx.strokeRect(x0 * scale, y0 * scale, (x1 - x0) * scale, (y1 - y0) * scale);
              ctx.fillText(text, x0 * scale, y0 * scale - 5);
            }
          });
        })
        .catch(err => {
          resultBox.textContent = '❗ OCR failed: ' + err.message;
          resultBox.style.color = 'red';
        });
    };
    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});
