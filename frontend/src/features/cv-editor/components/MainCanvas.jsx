export default function MainCanvas({
  loading,
  error,
  canvasWidth,
  canvasHeight,
  pdfCanvasRef,
  fabricCanvasRef,
}) {
  return (
    <main className="flex-1 overflow-auto p-6 lg:p-10 flex justify-center items-start relative bg-surface-container-highest">
      {loading && (
        <div className="absolute inset-0 bg-surface-container-highest/80 flex flex-col items-center justify-center gap-3 z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-xs text-outline font-semibold">
            Loading PDF content...
          </p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-surface-container-highest/80 flex flex-col items-center justify-center text-center p-4 gap-2 z-50">
          <p className="text-sm font-bold text-error">{error}</p>
        </div>
      )}

      <div
        className="bg-white shadow-lg relative select-none"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        <canvas ref={pdfCanvasRef} className="absolute top-0 left-0 z-0" />
        <canvas ref={fabricCanvasRef} className="absolute top-0 left-0 z-10" />
      </div>
    </main>
  );
}
