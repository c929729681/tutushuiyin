const imageInput = document.getElementById('imageInput');
const opacityInput = document.getElementById('opacity');
const positionXInput = document.getElementById('positionX');
const positionYInput = document.getElementById('positionY');
const watermarkSizeInput = document.getElementById('watermarkSize');
const downloadButton = document.getElementById('download');
const applyAllCheckbox = document.getElementById('applyAll');
const canvasContainer = document.getElementById('canvasContainer');

const watermarkImage = new Image();
watermarkImage.src = 'WechatIMG1276.png'; // 替换为您的水印图片路径
let selectedCanvas = null;
let canvasSettings = {};

imageInput.addEventListener('change', handleImageUpload);
downloadButton.addEventListener('click', downloadImages);

function handleImageUpload(event) {
    canvasContainer.innerHTML = '';
    Array.from(event.target.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = e => createCanvas(e.target.result, 'canvas' + index);
        reader.readAsDataURL(file);
    });
    selectedCanvas = null;
}

function createCanvas(imageSrc, canvasId) {
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.classList.add('image-canvas');
    canvas.setAttribute('data-img-src', imageSrc);
    canvas.addEventListener('click', () => selectCanvas(canvas));
    const ctx = canvas.getContext('2d');
    canvasContainer.appendChild(canvas);

    const img = new Image();
    img.onload = () => {
        canvas.width = Math.min(img.width, 800);
        canvas.height = img.height * (canvas.width / img.width);
        initializeCanvasSettings(canvasId);
        drawImageAndWatermark(canvas, ctx, img);
    };
    img.src = imageSrc;
}

function initializeCanvasSettings(canvasId) {
    canvasSettings[canvasId] = {
        opacity: 0.5,
        positionX: 50,
        positionY: 50,
        size: 83
    };
}

function selectCanvas(canvas) {
    selectedCanvas = canvas;
    const settings = canvasSettings[canvas.id];
    opacityInput.value = settings.opacity;
    positionXInput.value = settings.positionX;
    positionYInput.value = settings.positionY;
    watermarkSizeInput.value = settings.size;
    updateCanvas();
}

function drawImageAndWatermark(canvas, ctx, img) {
    const settings = canvasSettings[canvas.id];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = settings.opacity;
    const positionX = settings.positionX / 100 * canvas.width;
    const positionY = settings.positionY / 100 * canvas.height;
    const watermarkScale = settings.size / 100;
    const scaledWidth = watermarkImage.width * watermarkScale;
    const scaledHeight = watermarkImage.height * watermarkScale;
    ctx.drawImage(watermarkImage, positionX - scaledWidth / 2, positionY - scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.globalAlpha = 1.0;
}

function updateCanvas() {
    if (applyAllCheckbox.checked) {
        document.querySelectorAll('.image-canvas').forEach(canvas => updateCanvasSettings(canvas));
    } else if (selectedCanvas) {
        updateCanvasSettings(selectedCanvas);
    }
}

function updateCanvasSettings(canvas) {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => drawImageAndWatermark(canvas, ctx, img);
    img.src = canvas.getAttribute('data-img-src');

    const settings = canvasSettings[canvas.id];
    settings.opacity = opacityInput.value;
    settings.positionX = positionXInput.value;
    settings.positionY = positionYInput.value;
    settings.size = watermarkSizeInput.value;
}

async function downloadImages() {
    const canvasElements = document.querySelectorAll('.image-canvas');
    if (canvasElements.length === 1) {
        const canvas = canvasElements[0];
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = 'watermarked_image.png';
        link.href = image;
        link.click();
    } else {
        const zip = new JSZip();
        for (let i = 0; i < canvasElements.length; i++) {
            const canvas = canvasElements[i];
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            zip.file(`watermarked_image_${i}.png`, blob);
        }
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            saveAs(content, "watermarked_images.zip");
        });
    }
}

[opacityInput, positionXInput, positionYInput, watermarkSizeInput].forEach(input => {
    input.addEventListener('input', updateCanvas);
});
