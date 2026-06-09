import { useState, useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import { cvApi } from "../../../api/cvApi";
import { sampleCV } from "../../../data/mockData";

pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

async function getCvDataFromApi(id) {
  return await cvApi.getCvById(id);
}

export default function usePdfRenderer(id, stateCvId, stateCvData, stateOriginalFileUrl, stateCvName, zoom) {
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
        setLoading(false);
        await renderPdfPage(pdf, 1, zoom);
      } catch (err) {
        console.error("Error loading PDF: ", err);
        setError("Không thể tải file PDF gốc.");
        setLoading(false);
      }
    };
    loadPdf();
  }, [originalFileUrlState]);

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
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Error rendering PDF page: ", err);
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
  };
}
