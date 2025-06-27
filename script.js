const haramList = [
  'gelatin',
  'alcohol',
  'enzymes',
  'e120',
  'carmine',
  'lard',
  'rennet',
  'lipase',
  'glycerin',
  'mono- and diglycerides',
  'pepsin',
  'trypsin',
  'whey',
  'casein',
  'cochineal',
  'emulsifier e471',
  'emulsifier e472',
  'vanilla extract',
  'shortening',
  'animal fat',
  'animal-derived',
  'pork',
  'bacon',
  'ham',
  'beer',
  'wine',
  'rum',
  'brandy',
  'whiskey',
  'ethanol',
  'margarine',
  'natural flavors',
  'yeast extract',
  'cysteine',
  'e1105',
  'e904',
  'e913',
  'e920',
  'e921'
];

function resizeImage(file, maxWidth = 800, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        const blobUrl = URL.createObjectURL(blob);
        callback(blobUrl);
      }, 'image/jpeg');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function scanImage() {
  const imageInput = document.getElementById('imageInput');
  const imageFile = imageInput.files[0];
  const resultBox = document.getElementById('result');

  if (!imageFile) {
    alert("Please select an image.");
    return;
  }

  resultBox.innerText = "🔍 Scanning...";
  resultBox.style.color = "black";

  resizeImage(imageFile, 800, (resizedURL) => {
    Tesseract.recognize(resizedURL, 'eng')
      .then(({ data: { text } }) => {
        const lowerText = text.toLowerCase();
        const found = haramList.filter(item => lowerText.includes(item));
        
        if (found.length > 0) {
          resultBox.innerText = `❌ Haram Ingredients Found: ${found.join(', ')}`;
          resultBox.style.color = 'red';
        } else {
          resultBox.innerText = `✅ No Haram Ingredients Found.`;
          resultBox.style.color = 'green';
        }

        URL.revokeObjectURL(resizedURL); // clean up
      })
      .catch(err => {
        resultBox.innerText = "❗ OCR failed: " + err.message;
        resultBox.style.color = 'red';
      });
  });
}
