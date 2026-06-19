import { useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import usePdfRenderer from "../../features/cv-editor/hooks/usePdfRenderer";
import useFabricCanvas from "../../features/cv-editor/hooks/useFabricCanvas";
import usePdfExport from "../../features/cv-editor/hooks/usePdfExport";

import EditorHeader from "../../features/cv-editor/components/EditorHeader";
import LeftSidebar from "../../features/cv-editor/components/LeftSidebar";
import MainCanvas from "../../features/cv-editor/components/MainCanvas";
import RightProperties from "../../features/cv-editor/components/RightProperties";
import ImageUploadModal from "../../features/cv-editor/components/ImageUploadModal";

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
  const [saveStatus, setSaveStatus] = useState("Saved 2 minutes ago");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);

  // Hook 1: PDF Renderer
  const {
    cvData,
    cvNameState,
    originalFileUrlState,
    setOriginalFileUrlState,
    loading,
    error,
    numPages,
    currentPage,
    setCurrentPage,
    pdfCanvasRef,
    canvasWidth,
    canvasHeight,
  } = usePdfRenderer(id, stateCvId, stateCvData, stateOriginalFileUrl, stateCvName, zoom);

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
  } = useFabricCanvas({
    canvasWidth,
    canvasHeight,
    zoom,
    currentPage,
    setCurrentPage,
  });

  // Hook 3: Export & save PDF compilation
  const {
    saving,
    savingVersion,
    handleSave,
    handleSaveVersion,
    handleExportPdf,
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
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 30));

  return (
    <div className="flex flex-col h-full min-h-screen bg-surface-container-highest overflow-hidden">
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
        originalFileUrl={originalFileUrlState}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSave={handleSave}
        onSaveVersion={() => handleSaveVersion(navigate)}
        onExportPdf={handleExportPdf}
        saving={saving}
        savingVersion={savingVersion}
        saveStatus={saveStatus}
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
        />

        <MainCanvas
          loading={loading}
          error={error}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          pdfCanvasRef={pdfCanvasRef}
          fabricCanvasRef={fabricCanvasRef}
        />

        <RightProperties
          selectedFont={selectedFont}
          onFontChange={setSelectedFont}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isBold={isBold}
          onBoldToggle={() => setIsBold(!isBold)}
          isItalic={isItalic}
          onItalicToggle={() => setIsItalic(!isItalic)}
          textAlign={textAlign}
          onTextAlignChange={setTextAlign}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          opacity={opacity}
          onOpacityChange={setOpacity}
          onDeleteElement={handleDeleteElement}
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
