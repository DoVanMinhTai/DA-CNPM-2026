import { useState, useRef, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import usePdfRenderer from "../../features/cv-editor/hooks/usePdfRenderer";
import useFabricCanvas from "../../features/cv-editor/hooks/useFabricCanvas";
import usePdfExport from "../../features/cv-editor/hooks/usePdfExport";

import EditorHeader from "../../features/cv-editor/components/EditorHeader";
import LeftSidebar from "../../features/cv-editor/components/LeftSidebar";
import MainCanvas from "../../features/cv-editor/components/MainCanvas";
import RightProperties from "../../features/cv-editor/components/RightProperties";
import ImageUploadModal from "../../features/cv-editor/components/ImageUploadModal";
import { fontOptions } from "../../features/cv-editor/utils/editorConstants";
import { toast } from "sonner";

export default function CVEditorPage() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    cvData: stateCvData,
    cvId: stateCvId,
    originalFileUrl: stateOriginalFileUrl,
    cvName: stateCvName,
  } = location.state || {};

  const [zoom, setZoom] = useState(100);
  const [saveStatus, setSaveStatus] = useState(id ? "All changes saved" : "Unsaved changes");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [extractedTexts, setExtractedTexts] = useState({});
  const [modifiedTexts, setModifiedTexts] = useState({});
  const [activeTextId, setActiveTextId] = useState(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Hook 1: PDF Renderer
  const {
    cvData,
    cvNameState,
    setCvNameState,
    originalFileUrlState,
    setOriginalFileUrlState,
    loading,
    error,
    numPages,
    currentPage,
    setCurrentPage,
    pdfCanvasRef,
    pdfDocRef,
    canvasWidth,
    canvasHeight,
    handleAddPage,
    handleDeletePage,
    handleMovePage,
    extractTextFromAllPages,
  } = usePdfRenderer(id, stateCvId, stateCvData, stateOriginalFileUrl, stateCvName, zoom, setZoom, containerRef);

  // Hook 2: Fabric Canvas overlay & properties state
  const {
    fabricCanvasRef,
    fabricCanvasInstanceRef,
    activeTool,
    setActiveTool,
    selectedElement,
    selectedFont,
    setSelectedFont,
    fontSize,
    setFontSize,
    isBold,
    setIsBold,
    isItalic,
    setIsItalic,
    textAlign,
    setTextAlign,
    activeColor,
    setActiveColor,
    opacity,
    setOpacity,
    handlePageChange,
    addShape,
    addText,
    handleDeleteElement,
    handleImageConfirm,
    saveCurrentPageEdits,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    deletePageEdits,
    movePageEdits,
    resetCanvas,
  } = useFabricCanvas({
    canvasWidth,
    canvasHeight,
    zoom,
    currentPage,
    setCurrentPage,
    initialPageEdits: cvData?.pageEdits,
    modifiedTexts,
    setModifiedTexts,
  });

  // Hook 3: Export & save PDF compilation
  const {
    saving,
    savingVersion,
    handleSaveWithFormat,
    handleExportPdf,
    handleExportWord,
    handleExportImage,
  } = usePdfExport({
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
    extractedTexts,
    modifiedTexts,
    numPages,
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 10));
  const handleSetZoom = (val) => setZoom(val);

  const onAddPage = async () => {
    await handleAddPage();
  };

  const onDeletePage = async (pageNum) => {
    await handleDeletePage(pageNum);
    deletePageEdits(pageNum);
  };

  const onMovePage = async (fromPage, toPage) => {
    await handleMovePage(fromPage, toPage);
    movePageEdits(fromPage, toPage);
  };

  const handleExtractAllText = async () => {
    const allTexts = await extractTextFromAllPages(zoom);
    if (allTexts && Object.keys(allTexts).length > 0) {
      setExtractedTexts(allTexts);
      toast.info("Đã bóc chữ. Lưu ý: Màu chữ mặc định được gán là màu đen do hạn chế trích xuất màu từ PDF.", {
        duration: 5000,
      });
    }
  };

  const handleTextModify = (id, newText) => {
    setModifiedTexts((prev) => {
      const existing = prev[id];
      const base = typeof existing === "string" ? { text: existing } : (existing || {});
      return { ...prev, [id]: { ...base, text: newText } };
    });
  };

  // Sync RightProperties to activeTextId when clicked
  useEffect(() => {
    if (activeTextId) {
      const item = extractedTexts[currentPage]?.find((i) => i.id === activeTextId);
      if (item) {
        const mods = modifiedTexts[activeTextId];
        const modsObj = typeof mods === "string" ? { text: mods } : (mods || {});
        setSelectedFont(modsObj.fontFamily || item.fontFamily || fontOptions[0]);
        setFontSize(modsObj.fontSize || item.fontSize || 16);
        setIsBold(
          modsObj.isBold !== undefined
            ? modsObj.isBold
            : Boolean(item.fontFamily && item.fontFamily.toLowerCase().includes("bold"))
        );
        setIsItalic(modsObj.isItalic || false);
        setActiveColor(modsObj.color || item.color || "#000000");
      }
    }
  }, [activeTextId, extractedTexts, currentPage]);

  // Style Wrappers for DOM Text
  const handleFontChange = (font) => {
    setSelectedFont(font);
    if (activeTextId) {
      setModifiedTexts((prev) => {
        const existing = prev[activeTextId];
        const base = typeof existing === "string" ? { text: existing } : (existing || {});
        return { ...prev, [activeTextId]: { ...base, fontFamily: font } };
      });
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    if (activeTextId) {
      setModifiedTexts((prev) => {
        const existing = prev[activeTextId];
        const base = typeof existing === "string" ? { text: existing } : (existing || {});
        return { ...prev, [activeTextId]: { ...base, fontSize: size } };
      });
    }
  };

  const handleBoldToggle = () => {
    const newVal = !isBold;
    setIsBold(newVal);
    if (activeTextId) {
      setModifiedTexts((prev) => {
        const existing = prev[activeTextId];
        const base = typeof existing === "string" ? { text: existing } : (existing || {});
        return { ...prev, [activeTextId]: { ...base, isBold: newVal } };
      });
    }
  };

  const handleItalicToggle = () => {
    const newVal = !isItalic;
    setIsItalic(newVal);
    if (activeTextId) {
      setModifiedTexts((prev) => {
        const existing = prev[activeTextId];
        const base = typeof existing === "string" ? { text: existing } : (existing || {});
        return { ...prev, [activeTextId]: { ...base, isItalic: newVal } };
      });
    }
  };

  const handleColorChange = (color) => {
    setActiveColor(color);
    if (activeTextId) {
      setModifiedTexts((prev) => {
        const existing = prev[activeTextId];
        const base = typeof existing === "string" ? { text: existing } : (existing || {});
        return { ...prev, [activeTextId]: { ...base, color: color } };
      });
    }
  };

  const handleTextAlignChange = (align) => {
    setTextAlign(align);
    if (activeTextId) {
      setModifiedTexts((prev) => {
        const existing = prev[activeTextId];
        const base = typeof existing === "string" ? { text: existing } : (existing || {});
        return { ...prev, [activeTextId]: { ...base, textAlign: align } };
      });
    }
  };

  useEffect(() => {
    if (activeTextId || selectedElement) {
      setShowRightPanel(true);
    } else {
      setShowRightPanel(false);
    }
  }, [activeTextId, selectedElement]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input or contenteditable
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveWithFormat('pdf', navigate);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete active object
        handleDeleteElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSaveWithFormat, navigate, handleDeleteElement]);

  return (
    <div className="flex flex-col h-screen w-full bg-surface-container-highest overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .canvas-container {
          position: absolute !important;
          top: 0;
          left: 0;
          z-index: 10;
        }
      `}} />

      <EditorHeader
        cvName={cvNameState}
        onCvNameChange={setCvNameState}
        originalFileUrl={originalFileUrlState}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSetZoom={handleSetZoom}
        onSaveWithFormat={(format) => handleSaveWithFormat(format, navigate)}
        onExportPdf={handleExportPdf}
        onExportWord={handleExportWord}
        onExportImage={handleExportImage}
        saving={saving}
        savingVersion={savingVersion}
        saveStatus={saveStatus}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExtractAllText={handleExtractAllText}
        isCreateMode={!id}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          activePage={currentPage}
          onPageChange={handlePageChange}
          numPages={numPages}
          onAddShape={addShape}
          onAddText={addText}
          onShowUploadModal={setShowUploadModal}
          onAddPage={onAddPage}
          onDeletePage={onDeletePage}
          onMovePage={onMovePage}
          pdfDocRef={pdfDocRef}
        />

        <MainCanvas
          loading={loading}
          error={error}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          pdfCanvasRef={pdfCanvasRef}
          fabricCanvasRef={fabricCanvasRef}
          containerRef={containerRef}
          extractedTexts={extractedTexts[currentPage] || []}
          modifiedTexts={modifiedTexts}
          onTextModify={handleTextModify}
          activeTextId={activeTextId}
          setActiveTextId={setActiveTextId}
        />

        <RightProperties
          selectedFont={selectedFont}
          onFontChange={handleFontChange}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          isBold={isBold}
          onBoldToggle={handleBoldToggle}
          isItalic={isItalic}
          onItalicToggle={handleItalicToggle}
          textAlign={textAlign}
          onTextAlignChange={handleTextAlignChange}
          activeColor={activeColor}
          onColorChange={handleColorChange}
          opacity={opacity}
          onOpacityChange={setOpacity}
          onDeleteElement={handleDeleteElement}
          isOpen={showRightPanel}
          onClose={() => setShowRightPanel(false)}
        />
      </div>

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={() => handleImageConfirm(fileInputRef, setShowUploadModal)}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}
