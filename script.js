const imageInput = document.getElementById('imageInput');
const opacityInput = document.getElementById('opacity');
const positionXInput = document.getElementById('positionX');
const positionYInput = document.getElementById('positionY');
const watermarkSizeInput = document.getElementById('watermarkSize');
const downloadButton = document.getElementById('download');
const canvasContainer = document.getElementById('canvasContainer');

const watermarkImage = new Image();
watermarkImage.src = 'WechatIMG1276.png'; // 替换为您的水印图片路径

imageInput.addEventListener('change', handleImageUpload);
downloadButton.addEventListener('click', downloadImages);

function handleImageUpload(event) {
    canvasContainer.innerHTML = '';
    Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => createCanvas(e.target.result);
        reader.readAsDataURL(file);
    });
}

function createCanvas(imageSrc) {
    const canvas = document.createElement('canvas');
    canvas.classList.add('image-canvas');
    canvas.setAttribute('data-img-src', imageSrc);
    const ctx = canvas.getContext('2d');
    canvasContainer.appendChild(canvas);

    const img = new Image();
    img.onload = () => {
        canvas.width = Math.min(img.width, 800);
        canvas.height = img.height * (canvas.width / img.width);
        setDefaultWatermarkSize(img, canvas);
        drawImageAndWatermark(canvas, ctx, img);
    };
    img.src = imageSrc;
}

function setDefaultWatermarkSize(img, canvas) {
    const scale = Math.min(img.width / watermarkImage.width, img.height / watermarkImage.height, 0.83);
    watermarkSizeInput.value = scale * 100;
    positionXInput.value = 50;
    positionYInput.value = 50;
}

function drawImageAndWatermark(canvas, ctx, img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = opacityInput.value;
    const positionX = positionXInput.value / 100 * canvas.width;
    const positionY = positionYInput.value / 100 * canvas.height;
    const watermarkScale = watermarkSizeInput.value / 100;
    const scaledWidth = watermarkImage.width * watermarkScale;
    const scaledHeight = watermarkImage.height * watermarkScale;
    ctx.drawImage(watermarkImage, positionX - scaledWidth / 2, positionY - scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.globalAlpha = 1.0;
}

async function downloadImages() {
    const canvasElements = document.querySelectorAll('.image-canvas');
    if (canvasElements.length === 1) {
        // 如果只有一张图片，直接下载
        const canvas = canvasElements[0];
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = 'watermarked_image.png';
        link.href = image;
        link.click();
    } else {
        // 多张图片使用压缩包
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
    input.addEventListener('input', () => {
        document.querySelectorAll('.image-canvas').forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => drawImageAndWatermark(canvas, ctx, img);
            const imgSrc = canvas.getAttribute('data-img-src');
            img.src = imgSrc ? imgSrc : canvas.toDataURL();
        });
    });
});
