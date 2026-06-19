import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { cvApi } from "../../../api/cvApi";

export default function usePdfExport({
  originalFileUrlState,
  cvNameState,
  cvData,
  id,
  zoom,
  fabricCanvasInstanceRef,
  saveCurrentPageEdits,
  setSaveStatus,
  setOriginalFileUrlState,
  pdfCanvasRef,
  currentPage,
  extractedTexts = {},
  modifiedTexts = {},
}) {
  const [saving, setSaving] = useState(false);

  // Helper function to parse hex/rgba strings into pdf-lib rgb format
  const parseColor = (colorStr) => {
    if (!colorStr) return rgb(0, 0, 0);
    if (colorStr.startsWith("#")) {
      let r = 0, g = 0, b = 0;
      if (colorStr.length === 4) {
        r = parseInt(colorStr[1] + colorStr[1], 16) / 255;
        g = parseInt(colorStr[2] + colorStr[2], 16) / 255;
        b = parseInt(colorStr[3] + colorStr[3], 16) / 255;
      } else if (colorStr.length === 7) {
        r = parseInt(colorStr.substring(1, 3), 16) / 255;
        g = parseInt(colorStr.substring(3, 5), 16) / 255;
        b = parseInt(colorStr.substring(5, 7), 16) / 255;
      }
      return rgb(r, g, b);
    }
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return rgb(
        parseInt(rgbMatch[1]) / 255,
        parseInt(rgbMatch[2]) / 255,
        parseInt(rgbMatch[3]) / 255
      );
    }
    return rgb(0, 0, 0);
  };

  const generateEditedPdfBytes = async () => {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
    let pdfDoc;

    if (originalFileUrlState) {
      const response = await fetch(originalFileUrlState);
      const arrayBuffer = await response.arrayBuffer();
      pdfDoc = await PDFDocument.load(arrayBuffer);
    } else {
      pdfDoc = await PDFDocument.create();
      const edits = saveCurrentPageEdits();
      const numPages = Object.keys(edits).length > 0 ? Math.max(...Object.keys(edits).map(Number)) : 1;
      for (let i = 0; i < numPages; i++) {
        pdfDoc.addPage([595.28, 841.89]); // Standard A4 size
      }
    }

    const finalPageEdits = saveCurrentPageEdits();

    // Đăng ký fontkit để nhúng file .ttf
    pdfDoc.registerFontkit(fontkit);

    // Tải và nhúng font Roboto chuẩn hỗ trợ tiếng Việt (Identity-H)
    const robotoBytes = await fetch("/fonts/Roboto-Regular.ttf").then((res) => res.arrayBuffer());
    const robotoFont = await pdfDoc.embedFont(robotoBytes);

    const robotoBoldBytes = await fetch("/fonts/Roboto-Bold.ttf").then((res) => res.arrayBuffer());
    const robotoBoldFont = await pdfDoc.embedFont(robotoBoldBytes);

    const scaleFactor = zoom / 100;

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const pageNum = i + 1;
      const page = pdfDoc.getPages()[i];
      const { height: pageHeight } = page.getSize();

      // 1. Draw extracted texts and mask original text
      const items = extractedTexts[pageNum];
      if (items && items.length > 0) {
        for (const item of items) {
          const mods = modifiedTexts[item.id];
          const isEdited = mods !== undefined;

          if (!isEdited) continue;

          const modsObj = typeof mods === "string" ? { text: mods } : mods;
          const currentText = modsObj.text !== undefined ? modsObj.text : item.text;

          const normLeft = item.left / scaleFactor;
          const normTop = item.top / scaleFactor;
          const normWidth = item.width / scaleFactor;
          const normHeight = item.height / scaleFactor;
          const itemFontSize = modsObj.fontSize || item.fontSize || 16;
          const fontSize = itemFontSize / scaleFactor;

          const paddingX = 2; // Bù trừ chiều rộng cho chữ in đậm
          const maskWidth = normWidth + (paddingX * 2);

          const maskHeight = fontSize * 1.25;
          const pdfX = normLeft - paddingX;
          const pdfY = pageHeight - normTop - maskHeight;

          // Mask
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: maskWidth,
            height: maskHeight,
            color: rgb(1, 1, 1),
          });

          // Font
          const isOriginalBold = item.fontFamily && item.fontFamily.toLowerCase().includes("bold");
          const isBold = modsObj.isBold !== undefined ? modsObj.isBold : isOriginalBold;
          const finalFont = isBold ? robotoBoldFont : robotoFont;

          // Color
          const hexColor = modsObj.color || item.color || "#000000";

          page.drawText(currentText, {
            x: pdfX,
            y: pdfY + (normHeight * 0.15),
            size: fontSize,
            font: finalFont,
            color: parseColor(hexColor),
          });
        }
      }

      // 2. Draw fabric canvas objects
      const pageJson = finalPageEdits[pageNum];
      if (!pageJson || !pageJson.objects || pageJson.objects.length === 0) {
        continue;
      }

      for (const obj of pageJson.objects) {
        const normLeft = obj.left / scaleFactor;
        const normTop = obj.top / scaleFactor;
        const normWidth = (obj.width * (obj.scaleX || 1)) / scaleFactor;
        const normHeight = (obj.height * (obj.scaleY || 1)) / scaleFactor;

        const pdfX = normLeft;
        const pdfY = pageHeight - normTop - normHeight;

        if (obj.isEraser || (obj.type === "rect" && obj.fill === "#FFFFFF")) {
          try {
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: normWidth,
              height: normHeight,
              color: rgb(1, 1, 1),
            });
          } catch (e) { console.error(e); }
        } else if (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text") {
          try {
            if (!obj.text) continue;
            const isBoldObj = obj.fontWeight === "bold";
            const font = isBoldObj ? robotoBoldFont : robotoFont;
            page.drawText(obj.text, {
              x: pdfX,
              y: pdfY + (normHeight * 0.15),
              size: (obj.fontSize || 16) / scaleFactor,
              font: font,
              color: parseColor(obj.fill),
            });
          } catch (e) { console.error(e); }
        } else if (obj.type === "image") {
          try {
            const src = obj.src;
            let pdfImage;
            if (src.includes("image/png")) {
              pdfImage = await pdfDoc.embedPng(src);
            } else {
              pdfImage = await pdfDoc.embedJpg(src);
            }
            page.drawImage(pdfImage, {
              x: pdfX,
              y: pdfY,
              width: normWidth,
              height: normHeight,
            });
          } catch (imgErr) {
            console.error("Error drawing image in PDF: ", imgErr);
          }
        } else if (obj.type === "path") {
          try {
            const pathStr = obj.path.map(seg => seg.join(" ")).join(" ");
            page.drawSvgPath(pathStr, {
              x: pdfX,
              y: pdfY + normHeight,
              scale: 1 / scaleFactor,
              borderColor: parseColor(obj.stroke || obj.fill),
              borderWidth: (obj.strokeWidth || 1) / scaleFactor,
            });
          } catch (pathErr) {
            console.error("Error drawing path in PDF: ", pathErr);
          }
        } else if (obj.type === "rect") {
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: normWidth,
            height: normHeight,
            color: parseColor(obj.fill),
            opacity: obj.opacity || 1,
          });
        } else if (obj.type === "circle") {
          const radius = (obj.radius * (obj.scaleX || 1)) / scaleFactor;
          page.drawCircle({
            x: pdfX + radius,
            y: pdfY + radius,
            radius: radius,
            color: parseColor(obj.fill),
            opacity: obj.opacity || 1,
          });
        }
      }
    }

    return await pdfDoc.save();
  };

  const [savingVersion, setSavingVersion] = useState(false);

  const handleSaveWithFormat = async (format, navigate) => {
    setSavingVersion(true);
    setSaveStatus("Saving...");
    try {
      const baseName = cvNameState ? cvNameState.replace(/\.[^/.]+$/, "") : "Untitled CV";
      let fileToUpload;

      if (format === 'pdf') {
        const pdfBytes = await generateEditedPdfBytes();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        fileToUpload = new File([blob], `${baseName}.pdf`, { type: "application/pdf" });
      } else if (format === 'word') {
        const blob = await generateWordBlob();
        fileToUpload = new File([blob], `${baseName}.docx`, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      } else {
        throw new Error("Unsupported format");
      }

      const finalPageEdits = saveCurrentPageEdits();
      const dataToSave = { 
        ...cvData, 
        pageEdits: finalPageEdits,
        extractedTexts,
        modifiedTexts
      };

      let response;
      if (id) {
        response = await cvApi.saveCvVersion(id, fileToUpload, JSON.stringify(dataToSave));
      } else {
        response = await cvApi.uploadCv(fileToUpload);
      }
      
      setSaveStatus("Saved just now");
      if (response && response.cvId) {
        if (navigate) {
          navigate(`/cv/editor/${response.cvId}`, {
            state: {
              cvData: response.content,
              cvId: response.cvId,
              originalFileUrl: response.originalFileUrl,
              cvName: response.title
            }
          });
        }
        return response;
      }
    } catch (err) {
      console.error("Failed to save CV version:", err);
      setSaveStatus("Failed to save");
      throw err;
    } finally {
      setSavingVersion(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const pdfBytes = await generateEditedPdfBytes();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const baseName = cvNameState ? cvNameState.replace(/\.[^/.]+$/, "") : "Untitled CV";
      link.download = `${baseName}.pdf`;
      link.click();
    } catch (err) {
      console.error("Export error: ", err);
      alert("Lỗi xuất PDF: " + (err.message || err.toString()));
    }
  };

  const generateWordBlob = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const finalPageEdits = saveCurrentPageEdits();

    const children = [];

    // Process extracted texts first
    Object.keys(extractedTexts).forEach(pageNum => {
      const items = extractedTexts[pageNum];
      if (items && items.length > 0) {
        const sortedItems = [...items].sort((a, b) => a.top - b.top);
        sortedItems.forEach(item => {
          const currentText = modifiedTexts[item.id] !== undefined ? modifiedTexts[item.id] : item.text;
          const textLines = currentText.split('\n');
          textLines.forEach(line => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: (item.fontSize || 16) * 2, // docx uses half-points
                  }),
                ],
              })
            );
          });
        });
      }
    });

    // Process fabric edits
    Object.keys(finalPageEdits).forEach(pageNum => {
      const page = finalPageEdits[pageNum];
      if (page && page.objects) {
        const sortedObjects = [...page.objects].sort((a, b) => a.top - b.top);

        sortedObjects.forEach(obj => {
          if ((obj.type === "i-text" || obj.type === "textbox" || obj.type === "text") && obj.text) {
            const textLines = obj.text.split('\n');
            textLines.forEach(line => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      bold: obj.fontWeight === "bold",
                      italics: obj.fontStyle === "italic",
                      size: (obj.fontSize || 16) * 2, // docx uses half-points
                    }),
                  ],
                })
              );
            });
          }
        });
      }
    });

    if (children.length === 0) {
      children.push(new Paragraph({ text: "Tài liệu này không chứa nội dung văn bản nào." }));
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    return await Packer.toBlob(doc);
  };

  const handleExportWord = async () => {
    try {
      const blob = await generateWordBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const baseName = cvNameState ? cvNameState.replace(/\.[^/.]+$/, "") : "Untitled CV";
      link.download = `${baseName}.docx`;
      link.click();
    } catch (err) {
      console.error("Export Word error: ", err);
    }
  };

  const handleExportImage = async () => {
    try {
      if (!pdfCanvasRef || !pdfCanvasRef.current) return;
      if (!fabricCanvasInstanceRef || !fabricCanvasInstanceRef.current) return;

      const pdfCanvas = pdfCanvasRef.current;
      const fabricCanvas = fabricCanvasInstanceRef.current;

      const mergedCanvas = document.createElement("canvas");
      mergedCanvas.width = pdfCanvas.width;
      mergedCanvas.height = pdfCanvas.height;
      const ctx = mergedCanvas.getContext("2d");

      ctx.drawImage(pdfCanvas, 0, 0);

      // Safe export of fabric canvas
      const fabricDataUrl = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
      const img = new Image();
      img.src = fabricDataUrl;
      await new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image load fails
      });
      ctx.drawImage(img, 0, 0, pdfCanvas.width, pdfCanvas.height);

      const dataUrl = mergedCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      const baseName = cvNameState ? cvNameState.replace(/\.[^/.]+$/, "") : "Untitled CV";
      link.download = `${baseName}_page_${currentPage || 1}.png`;
      link.click();
    } catch (err) {
      console.error("Export Image error:", err);
    }
  };

  return {
    saving,
    savingVersion,
    handleSaveWithFormat,
    handleExportPdf,
    handleExportWord,
    handleExportImage,
  };
}
