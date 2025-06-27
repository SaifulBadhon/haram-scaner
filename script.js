const haramList = [
  'gelatin', 'alcohol', 'enzymes', 'e120', 'carmine', 'lard', 'rennet',
  'lipase', 'glycerin', 'mono- and diglycerides', 'pepsin', 'trypsin',
  'whey', 'casein', 'cochineal', 'emulsifier e471', 'emulsifier e472',
  'vanilla extract', 'shortening', 'animal fat', 'animal-derived', 'pork',
  'bacon', 'ham', 'beer', 'wine', 'rum', 'brandy', 'whiskey', 'ethanol',
  'margarine', 'natural flavors', 'yeast extract', 'cysteine', 'e1105',
  'e904', 'e913', 'e920', 'e921'
];

function scanImage() {
  const imageInput = document.getElementById('imageInput');
  const imageFile = imageInput.files[0];
  const resultBox = document.getElementById('result');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  if (!imageFile) {
    alert("Please select an image.");
    return;
  }

  resultBox.innerText = "🔍 Scanning...";
  resultBox.style.color = "black";

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    Tesseract.recognize(img.src, 'eng', { logger: m => console.log(m) })
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

        // Draw boxes on detected words
        ctx.font = "18px Arial";
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.lineWidth = 2;

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
}
