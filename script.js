const haramList = ['gelatin', 'alcohol', 'enzymes', 'e120', 'carmine', 'lard', 'rennet'];

function scanImage() {
  const image = document.getElementById('imageInput').files[0];
  if (!image) return alert("Please select an image.");

  Tesseract.recognize(image, 'eng')
    .then(({ data: { text } }) => {
      const lowerText = text.toLowerCase();
      const found = haramList.filter(item => lowerText.includes(item));
      const resultBox = document.getElementById('result');

      if (found.length > 0) {
        resultBox.innerText = `❌ Haram Ingredients Found: ${found.join(', ')}`;
        resultBox.style.color = 'red';
      } else {
        resultBox.innerText = `✅ No Haram Ingredients Found.`;
        resultBox.style.color = 'green';
      }
    })
    .catch(err => alert("OCR failed: " + err));
}
