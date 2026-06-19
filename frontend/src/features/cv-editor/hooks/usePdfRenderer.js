import { useState, useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import { cvApi } from "../../../api/cvApi";
import { sampleCV } from "../../../data/mockData";

pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

async function getCvDataFromApi(id) {
  return await cvApi.getCvById(id);
}

export default function usePdfRenderer(id, stateCvId, stateCvData, stateOriginalFileUrl, stateCvName, zoom, setZoom, containerRef) {
  const [cvData, setCvData] = useState(stateCvData || sampleCV);
  const [cvNameState, setCvNameState] = useState(stateCvName || "");
  const [originalFileUrlState, setOriginalFileUrlState] = useState(
    stateOriginalFileUrl || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pdfCanvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [canvasWidth, setCanvasWidth] = useState(794);
  const [canvasHeight, setCanvasHeight] = useState(1123);

  // Fetch CV structure and details
  useEffect(() => {
    const fetchCv = async () => {
      if (!id) return;
      if (stateCvId === id && stateCvData) {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getCvDataFromApi(id);
        if (data && data.content) {
          setCvData(data.content);
          setCvNameState(data.title);
          setOriginalFileUrlState(data.originalFileUrl);
        }
      } catch (err) {
        console.error("Failed to fetch CV details:", err);
        setError("Không thể tải dữ liệu CV thực tế từ hệ thống.");
      } finally {
        setLoading(false);
      }
    };
    fetchCv();
  }, [id, stateCvId, stateCvData]);

  // Load and render PDF using PDF.js
  useEffect(() => {
    const loadPdf = async () => {
      if (!originalFileUrlState) return;
      try {
        setLoading(true);
        const response = await fetch(originalFileUrlState);
        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);

        let initialZoom = 100;
        if (containerRef && containerRef.current && setZoom) {
          try {
            const page1 = await pdf.getPage(1);
            const unscaledViewport = page1.getViewport({ scale: 1 });
            const paddingX = window.innerWidth >= 1024 ? 80 : 32; // p-10 = 40*2
            const availableWidth = containerRef.current.clientWidth - paddingX;
            if (availableWidth > 0) {
              let fitZoom = Math.floor((availableWidth / unscaledViewport.width) * 100);
              // Giới hạn tối đa là 100% để file luôn hiển thị kích thước gốc (vẫn 100%)
              initialZoom = Math.min(100, Math.max(30, fitZoom));
              setZoom(initialZoom);
            }
          } catch (e) {
            console.error("Error calculating fit zoom:", e);
            setZoom(100);
          }
        } else if (setZoom) {
          setZoom(100);
        }

        setLoading(false);
        await renderPdfPage(pdf, 1, initialZoom);
      } catch (err) {
        console.error("Error loading PDF: ", err);
        setError("Không thể tải file PDF gốc.");
        setLoading(false);
      }
    };
    loadPdf();
  }, [originalFileUrlState]);

  useEffect(() => {
    if (pdfDocRef.current && !loading) {
      renderPdfPage(pdfDocRef.current, currentPage, zoom);
    }
  }, [currentPage, zoom]);

  // Render a specific page of PDF
  const renderPdfPage = async (pdf, pageNum, currentZoom) => {
    if (!pdf) return;
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentZoom / 100 });

      setCanvasWidth(viewport.width);
      setCanvasHeight(viewport.height);

      const canvas = pdfCanvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Clear canvas just to be safe
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error("Error rendering PDF page: ", err);
      }
    }
  };

  const handleAddPage = async () => {
    try {
      setLoading(true);
      const { PDFDocument } = await import("pdf-lib");
      let pdfDoc;

      if (originalFileUrlState) {
        const response = await fetch(originalFileUrlState);
        const arrayBuffer = await response.arrayBuffer();
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } else {
        pdfDoc = await PDFDocument.create();
        const currentPages = Math.max(1, numPages);
        for (let i = 0; i < currentPages; i++) {
          pdfDoc.addPage([595.28, 841.89]);
        }
      }
      
      pdfDoc.addPage([595.28, 841.89]);
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setOriginalFileUrlState(URL.createObjectURL(blob));
      setCurrentPage(Math.max(1, numPages) + 1);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageNum) => {
    if (!originalFileUrlState || numPages <= 1) return;
    try {
      setLoading(true);
      const { PDFDocument } = await import("pdf-lib");
      const response = await fetch(originalFileUrlState);
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      pdfDoc.removePage(pageNum - 1);
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setOriginalFileUrlState(URL.createObjectURL(blob));
      if (currentPage >= pageNum && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleMovePage = async (fromPage, toPage) => {
    if (!originalFileUrlState || fromPage === toPage || toPage < 1 || toPage > numPages) return;
    try {
      setLoading(true);
      const { PDFDocument } = await import("pdf-lib");
      const response = await fetch(originalFileUrlState);
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const newPdfDoc = await PDFDocument.create();
      const pagesOrder = [];
      for(let i=1; i<=numPages; i++) pagesOrder.push(i-1);
      
      const element = pagesOrder.splice(fromPage - 1, 1)[0];
      pagesOrder.splice(toPage - 1, 0, element);
      
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesOrder);
      copiedPages.forEach((page) => newPdfDoc.addPage(page));
      
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setOriginalFileUrlState(URL.createObjectURL(blob));
      
      if (currentPage === fromPage) {
          setCurrentPage(toPage);
      } else if (currentPage > fromPage && currentPage <= toPage) {
          setCurrentPage(currentPage - 1);
      } else if (currentPage < fromPage && currentPage >= toPage) {
          setCurrentPage(currentPage + 1);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const extractTextFromPage = async (pageNum, currentZoom, updateLoadingState = true) => {
    if (!pdfDocRef.current) return [];
    try {
      if (updateLoadingState) setLoading(true);
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentZoom / 100 });
      const textContent = await page.getTextContent();

      const rawItems = textContent.items.map((item) => {
        const tx = item.transform[4];
        const ty = item.transform[5];
        // Calculate font size in original PDF points
        const fontHeight = Math.sqrt(
          item.transform[2] * item.transform[2] + item.transform[3] * item.transform[3]
        );
        
        // Convert to canvas/viewport coordinates
        const [x, y] = viewport.convertToViewportPoint(tx, ty);
        // Khôi phục lại hệ số font gốc (1.0) vì hạ xuống 0.88 làm chữ quá nhỏ
        const scaledFontSize = fontHeight * (currentZoom / 100) * 1.0;
        
        // In PDF.js, the y coordinate is the baseline. We offset it to get the top-left corner.
        return {
          id: `text-${pageNum}-${Math.random().toString(36).substring(2, 9)}`,
          text: item.str,
          left: x - scaledFontSize * 0.05, // Chỉnh nhẹ x để khớp lề
          top: y - scaledFontSize * 1.05, // Cân bằng lại trục y
          width: item.width * (currentZoom / 100),
          height: item.height * (currentZoom / 100),
          fontSize: scaledFontSize,
          fontFamily: item.fontName || "Helvetica",
          color: "#000000" // PDF text color extraction is complex, default to black
        };
      }).filter(item => item.text.trim().length > 0);

      // Group fragmented text items into full lines
      const THRESHOLD_Y = 5; // Pixels tolerance for same line
      const lines = [];
      
      // Sort primarily by top (Y), then left (X)
      rawItems.sort((a, b) => {
        if (Math.abs(a.top - b.top) > THRESHOLD_Y) {
          return a.top - b.top;
        }
        return a.left - b.left;
      });

      let currentLine = null;

      for (const item of rawItems) {
        if (!currentLine) {
          currentLine = { ...item };
          lines.push(currentLine);
          continue;
        }

        const yDiff = Math.abs(currentLine.top - item.top);
        const xDiff = item.left - (currentLine.left + currentLine.width);

        // If on the same visual line and close enough horizontally
        if (yDiff <= THRESHOLD_Y && xDiff < currentLine.fontSize * 2.5) {
          // Add a space if there's a visible gap
          const needsSpace = xDiff > currentLine.fontSize * 0.2;
          currentLine.text += (needsSpace ? " " : "") + item.text;
          currentLine.width = (item.left + item.width) - currentLine.left;
          currentLine.height = Math.max(currentLine.height, item.height);
          currentLine.fontSize = Math.max(currentLine.fontSize, item.fontSize);
          currentLine.top = Math.min(currentLine.top, item.top);
        } else {
          currentLine = { ...item };
          lines.push(currentLine);
        }
      }

      return lines;
    } catch (err) {
      console.error("Extract text error:", err);
      return [];
    } finally {
      if (updateLoadingState) setLoading(false);
    }
  };

  const extractTextFromAllPages = async (currentZoom) => {
    if (!pdfDocRef.current) return {};
    try {
      setLoading(true);
      const allExtractedTexts = {};
      const totalPages = pdfDocRef.current.numPages;
      for (let i = 1; i <= totalPages; i++) {
        const lines = await extractTextFromPage(i, currentZoom, false);
        allExtractedTexts[i] = lines;
      }
      return allExtractedTexts;
    } catch (err) {
      console.error("Extract all text error:", err);
      return {};
    } finally {
      setLoading(false);
    }
  };

  return {
    cvData,
    setCvData,
    cvNameState,
    setCvNameState,
    originalFileUrlState,
    setOriginalFileUrlState,
    loading,
    setLoading,
    error,
    setError,
    numPages,
    setNumPages,
    currentPage,
    setCurrentPage,
    pdfCanvasRef,
    pdfDocRef,
    canvasWidth,
    canvasHeight,
    renderPdfPage,
    handleAddPage,
    handleDeletePage,
    handleMovePage,
    extractTextFromPage,
    extractTextFromAllPages,
  };
}
