import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
    if (!originalFileUrlState) throw new Error("No original PDF file URL");

    const response = await fetch(originalFileUrlState);
    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const finalPageEdits = saveCurrentPageEdits();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const scaleFactor = zoom / 100;

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const pageNum = i + 1;
      const pageJson = finalPageEdits[pageNum];
      if (!pageJson || !pageJson.objects || pageJson.objects.length === 0) {
        continue;
      }

      const page = pdfDoc.getPages()[i];
      const { height: pageHeight } = page.getSize();

      for (const obj of pageJson.objects) {
        const normLeft = obj.left / scaleFactor;
        const normTop = obj.top / scaleFactor;
        const normWidth = (obj.width * (obj.scaleX || 1)) / scaleFactor;
        const normHeight = (obj.height * (obj.scaleY || 1)) / scaleFactor;

        const pdfX = normLeft;
        const pdfY = pageHeight - normTop - normHeight;

        if (obj.isEraser || (obj.type === "rect" && obj.fill === "#FFFFFF")) {
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: normWidth,
            height: normHeight,
            color: rgb(1, 1, 1),
          });
        } else if (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text") {
          const isBoldObj = obj.fontWeight === "bold";
          const font = isBoldObj ? helveticaBoldFont : helveticaFont;
          page.drawText(obj.text, {
            x: pdfX,
            y: pdfY + (normHeight * 0.15),
            size: (obj.fontSize || 16) / scaleFactor,
            font: font,
            color: parseColor(obj.fill),
          });
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

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("Saving...");
    try {
      // New logic: Do not compile and upload the PDF file to overwrite the old one.
      // Only save the structured text content (JSON).
      await cvApi.updateCvContent(id, JSON.stringify(cvData));
      setSaveStatus("Saved just now");
    } catch (err) {
      console.error("Save error: ", err);
      setSaveStatus("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVersion = async (navigate) => {
    setSavingVersion(true);
    try {
      const pdfBytes = await generateEditedPdfBytes();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfFile = new File([pdfBlob], cvNameState ? `${cvNameState.replace(/\.[^/.]+$/, "")}_version.pdf` : "cv_version.pdf", { type: "application/pdf" });

      const response = await cvApi.saveCvVersion(id, pdfFile, JSON.stringify(cvData));
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
      link.download = cvNameState || "edited_cv.pdf";
      link.click();
    } catch (err) {
      console.error("Export error: ", err);
    }
  };

  return {
    saving,
    savingVersion,
    handleSave,
    handleSaveVersion,
    handleExportPdf,
  };
}
