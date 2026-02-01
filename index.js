import { jsPDF } from "jspdf";

/* ---------------- IMAGE RESIZER ---------------- */

export async function resizeImage(file, options = {}) {
  const {
    width,
    height,
    percent,
    quality = 0.8,
    format = "image/jpeg",
    keepAspectRatio = true,
    mode = "contain" // contain | cover | fill
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let targetW = img.width;
      let targetH = img.height;

      if (percent) {
        targetW *= percent / 100;
        targetH *= percent / 100;
      } else if (width || height) {
        if (keepAspectRatio) {
          const ratio = img.width / img.height;
          if (width) {
            targetW = width;
            targetH = width / ratio;
          } else {
            targetH = height;
            targetW = height * ratio;
          }
        } else {
          targetW = width || img.width;
          targetH = height || img.height;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");

      if (mode === "cover") {
        const scale = Math.max(
          targetW / img.width,
          targetH / img.height
        );
        const x = (targetW / scale - img.width) / 2;
        const y = (targetH / scale - img.height) / 2;
        ctx.scale(scale, scale);
        ctx.drawImage(img, x, y);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }

      canvas.toBlob(
        blob => resolve(blob),
        format,
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/* ---------------- BATCH RESIZE ---------------- */

export async function resizeMultiple(files, options) {
  return Promise.all(
    [...files].map(file => resizeImage(file, options))
  );
}

/* ---------------- IMAGES TO PDF ---------------- */

export async function imagesToPDF(files, options = {}) {
  const {
    pageSize = "a4",
    margin = 10,
    orientation = "portrait"
  } = options;

  const pdf = new jsPDF({ orientation, format: pageSize });

  for (let i = 0; i < files.length; i++) {
    const imgData = await fileToDataURL(files[i]);

    if (i !== 0) pdf.addPage();

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    pdf.addImage(
      imgData,
      "JPEG",
      margin,
      margin,
      pageW - margin * 2,
      0
    );
  }

  return pdf;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}