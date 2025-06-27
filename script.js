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
  const imageFile = imageInput.files[0];
  if (!imageFile) return;

  resultBox.innerText = "🔍 Scanning...";
  resultBox.style.color = "black";
  canvas.style.display = 'none'; // hide canvas until image is ready

  const img = new Image();
  img.onload = () => {
    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.style.display = 'block'; // show only after image is drawn

    Tesseract.recognize(img.src, 'eng')
      .then(({ data }) => {
        const lowerText = data.text.toLowerCase();
        const found = haramList.filter(item => lowerText.includes(item));

        if (found.length > 0) {
          resultBox.innerText = `❌ Haram Ingredients Found: ${found.join(', ')}`;
          resultBox.style.color = 'red';
        } else {
          resultBox.innerText = `✅ No Haram Ingredients Found.`;
          resultBox.style.color = 'green';
        }

        // Draw boxes
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.lineWidth = 2;
        ctx.font = '20px Arial';

        data.words.forEach(word => {
          const cleanWord = word.text.toLowerCase().replace(/[^a-z0-9\-]/g, '');
          if (haramList.includes(cleanWord)) {
            const { x0, y0, x1, y1 } = word.bbox;
            ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
            ctx.fillText(cleanWord, x0, y0 - 5);
          }
        });
      })
      .catch(err => {
        resultBox.innerText = "❗ OCR failed: " + err.message;
        resultBox.style.color = 'red';
      });
  };

  img.src = URL.createObjectURL(imageFile);
});
