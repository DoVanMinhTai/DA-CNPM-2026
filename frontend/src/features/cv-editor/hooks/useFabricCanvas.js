import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";

export default function useFabricCanvas({ 
  canvasWidth, canvasHeight, zoom, currentPage, setCurrentPage, initialPageEdits, 
  modifiedTexts, setModifiedTexts 
}) {
  const [activeTool, setActiveTool] = useState("select");
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(12);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [activeColor, setActiveColor] = useState("#000000");
  const [opacity, setOpacity] = useState(85);
  const [pageEdits, setPageEdits] = useState({});

  const fabricCanvasRef = useRef(null);
  const fabricCanvasInstanceRef = useRef(null);

  const [historyIndexState, setHistoryIndexState] = useState(-1);
  const [historyLengthState, setHistoryLengthState] = useState(0);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const pageEditsRef = useRef({});
  const currentPageRef = useRef(currentPage);
  const isHistoryAction = useRef(false);
  const modifiedTextsRef = useRef(modifiedTexts);
  const prevModifiedTexts = useRef(modifiedTexts);

  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { pageEditsRef.current = pageEdits; }, [pageEdits]);
  useEffect(() => { modifiedTextsRef.current = modifiedTexts; }, [modifiedTexts]);

  // Tự động lưu lịch sử khi modifiedTexts thay đổi (do user sửa chữ trên DOM)
  useEffect(() => {
    if (modifiedTexts !== prevModifiedTexts.current) {
      if (!isHistoryAction.current) {
         saveState(modifiedTexts);
      }
      prevModifiedTexts.current = modifiedTexts;
    }
  }, [modifiedTexts]);

  const saveState = (explicitModifiedTexts = null) => {
    if (isHistoryAction.current) return;
    const fCanvas = fabricCanvasInstanceRef.current;
    if (!fCanvas) return;

    const json = fCanvas.toJSON(["isEraser"]);
    const newPageEdits = { ...pageEditsRef.current, [currentPageRef.current]: json };
    const currentModifiedTexts = explicitModifiedTexts || modifiedTextsRef.current || {};

    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({ 
      pageEdits: newPageEdits, 
      modifiedTexts: { ...currentModifiedTexts },
      currentPage: currentPageRef.current 
    });

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHistoryIndexState(historyIndexRef.current);
    setHistoryLengthState(historyRef.current.length);
    setPageEdits(newPageEdits);
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isHistoryAction.current = true;
      historyIndexRef.current -= 1;
      setHistoryIndexState(historyIndexRef.current);
      const state = historyRef.current[historyIndexRef.current];
      
      setPageEdits(state.pageEdits);
      if (setModifiedTexts) {
        setModifiedTexts(state.modifiedTexts || {});
      }
      
      if (state.currentPage !== currentPageRef.current) {
        setCurrentPage(state.currentPage);
        // The currentPage useEffect will handle loading the JSON and resetting isHistoryAction
      } else {
        const fCanvas = fabricCanvasInstanceRef.current;
        if (fCanvas) {
          fCanvas.clear();
          if (state.pageEdits[currentPageRef.current]) {
            fCanvas.loadFromJSON(state.pageEdits[currentPageRef.current], () => {
              fCanvas.renderAll();
              isHistoryAction.current = false;
            });
          } else {
            fCanvas.renderAll();
            isHistoryAction.current = false;
          }
        } else {
          isHistoryAction.current = false;
        }
      }
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isHistoryAction.current = true;
      historyIndexRef.current += 1;
      setHistoryIndexState(historyIndexRef.current);
      const state = historyRef.current[historyIndexRef.current];
      
      setPageEdits(state.pageEdits);
      if (setModifiedTexts) {
        setModifiedTexts(state.modifiedTexts || {});
      }
      
      if (state.currentPage !== currentPageRef.current) {
        setCurrentPage(state.currentPage);
      } else {
        const fCanvas = fabricCanvasInstanceRef.current;
        if (fCanvas) {
          fCanvas.clear();
          if (state.pageEdits[currentPageRef.current]) {
            fCanvas.loadFromJSON(state.pageEdits[currentPageRef.current], () => {
              fCanvas.renderAll();
              isHistoryAction.current = false;
            });
          } else {
            fCanvas.renderAll();
            isHistoryAction.current = false;
          }
        } else {
          isHistoryAction.current = false;
        }
      }
    }
  };

  // Khởi tạo state rỗng ban đầu để có thể Undo về trạng thái nguyên thủy
  useEffect(() => {
    if (historyRef.current.length === 0) {
      const initialState = { 
        pageEdits: initialPageEdits || {}, 
        modifiedTexts: {}, 
        currentPage: currentPage 
      };
      historyRef.current = [initialState];
      historyIndexRef.current = 0;
      setHistoryIndexState(0);
      setHistoryLengthState(1);

      if (initialPageEdits && Object.keys(initialPageEdits).length > 0) {
        setPageEdits(initialPageEdits);
        const fCanvas = fabricCanvasInstanceRef.current;
        if (fCanvas && initialPageEdits[currentPage]) {
          fCanvas.loadFromJSON(initialPageEdits[currentPage], () => {
            fCanvas.setZoom(zoom / 100);
            fCanvas.renderAll();
          });
        }
      }
    }
  }, [initialPageEdits]);

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(fabricCanvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "transparent",
      selection: true,
    });

    fabricCanvasInstanceRef.current = canvas;

    const handleSelection = (target) => {
      if (!target) return;
      setSelectedElement(target);
      if (target.type === "i-text" || target.type === "textbox") {
        setSelectedFont(target.fontFamily || "Inter");
        setFontSize(target.fontSize || 16);
        setIsBold(target.fontWeight === "bold");
        setIsItalic(target.fontStyle === "italic");
        setTextAlign(target.textAlign || "left");
        setActiveColor(target.fill || "#008080");
      } else {
        setActiveColor(target.fill || "#008080");
        setOpacity(Math.round((target.opacity || 1) * 100));
      }
    };

    canvas.on("selection:created", (e) => handleSelection(e.target));
    canvas.on("selection:updated", (e) => handleSelection(e.target));
    canvas.on("selection:cleared", () => setSelectedElement(null));

    canvas.on("object:added", (e) => {
      if (e.target && e.target.isEraser) return; 
      saveState();
    });
    canvas.on("object:modified", saveState);
    canvas.on("object:removed", saveState);
    canvas.on("path:created", saveState);

    return () => {
      canvas.dispose();
      fabricCanvasInstanceRef.current = null;
    };
  }, []);

  // Update Fabric canvas dimensions state change
  useEffect(() => {
    const fCanvas = fabricCanvasInstanceRef.current;
    if (fCanvas) {
      fCanvas.setWidth(canvasWidth);
      fCanvas.setHeight(canvasHeight);
      fCanvas.renderAll();
    }
  }, [canvasWidth, canvasHeight]);

  // Sync Properties to Active Object
  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === "i-text" || active.type === "textbox")) {
      active.set("fontFamily", selectedFont);
      canvas.renderAll();
    }
  }, [selectedFont]);

  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === "i-text" || active.type === "textbox")) {
      active.set("fontSize", fontSize);
      canvas.renderAll();
    }
  }, [fontSize]);

  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === "i-text" || active.type === "textbox")) {
      active.set("fontWeight", isBold ? "bold" : "normal");
      canvas.renderAll();
    }
  }, [isBold]);

  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === "i-text" || active.type === "textbox")) {
      active.set("fontStyle", isItalic ? "italic" : "normal");
      canvas.renderAll();
    }
  }, [isItalic]);

  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === "i-text" || active.type === "textbox")) {
      active.set("textAlign", textAlign);
      canvas.renderAll();
    }
  }, [textAlign]);

  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      active.set("fill", activeColor);
      canvas.renderAll();
    }
  }, [activeColor]);

  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      active.set("opacity", opacity / 100);
      canvas.renderAll();
    }
  }, [opacity]);

  // Handle Active Tool Setup
  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });

    if (activeTool === "select") {
      // standard select
    } else if (activeTool === "pan") {
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    } else if (activeTool === "draw") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = 3;
    } else if (activeTool === "highlight") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = hexToRgba(activeColor, 0.4);
      canvas.freeDrawingBrush.width = 15;
    } else if (activeTool === "signature") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = "#000000";
      canvas.freeDrawingBrush.width = 2;
    }
  }, [activeTool, activeColor]);

  // Handle Eraser Custom drawing rect logic
  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    if (!canvas) return;

    let isDrawingRect = false;
    let startX = 0;
    let startY = 0;
    let rect = null;

    const handleMouseDown = (o) => {
      if (activeTool !== "eraser") return;
      isDrawingRect = true;
      const pointer = canvas.getPointer(o.e);
      startX = pointer.x;
      startY = pointer.y;

      rect = new fabric.Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        fill: "#FFFFFF",
        strokeWidth: 0,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        isEraser: true,
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);
    };

    const handleMouseMove = (o) => {
      if (!isDrawingRect || activeTool !== "eraser") return;
      const pointer = canvas.getPointer(o.e);

      if (startX > pointer.x) {
        rect.set({ left: Math.abs(pointer.x) });
      }
      if (startY > pointer.y) {
        rect.set({ top: Math.abs(pointer.y) });
      }

      rect.set({ width: Math.abs(startX - pointer.x) });
      rect.set({ height: Math.abs(startY - pointer.y) });

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (activeTool !== "eraser") return;
      isDrawingRect = false;
      rect = null;
      setActiveTool("select");
      saveState();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [activeTool]);

  // Handle Pan viewport dragging
  useEffect(() => {
    const canvas = fabricCanvasInstanceRef.current;
    if (!canvas) return;

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt) => {
      const e = opt.e;
      if (activeTool === "pan") {
        isDragging = true;
        canvas.selection = false;
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    };

    const handleMouseMove = (opt) => {
      if (isDragging && activeTool === "pan") {
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [activeTool]);

  // Save edits of current active page to memory
  const saveCurrentPageEdits = () => {
    const fCanvas = fabricCanvasInstanceRef.current;
    if (fCanvas) {
      const json = fCanvas.toJSON(["isEraser"]);
      return { ...pageEdits, [currentPage]: json };
    }
    return pageEdits;
  };

  // Render PDF page and load saved modifications when page changes
  useEffect(() => {
    const fCanvas = fabricCanvasInstanceRef.current;
    if (!fCanvas) return;

    fCanvas.clear();
    const edits = pageEdits[currentPage];
    if (edits) {
      fCanvas.loadFromJSON(edits, () => {
        fCanvas.setZoom(zoom / 100);
        fCanvas.renderAll();
        isHistoryAction.current = false;
      });
    } else {
      fCanvas.renderAll();
      isHistoryAction.current = false;
    }
  }, [currentPage]);

  // Zoom changes
  useEffect(() => {
    const fCanvas = fabricCanvasInstanceRef.current;
    if (fCanvas) {
      fCanvas.setZoom(zoom / 100);
      fCanvas.renderAll();
    }
  }, [zoom]);

  const handlePageChange = (newPageNum) => {
    const fCanvas = fabricCanvasInstanceRef.current;
    if (fCanvas) {
      const json = fCanvas.toJSON(["isEraser"]);
      setPageEdits((prev) => ({ ...prev, [currentPage]: json }));
    }
    setCurrentPage(newPageNum);
  };

  const addShape = (type) => {
    const canvas = fabricCanvasInstanceRef.current;
    if (!canvas) return;

    let shape;
    if (type === "rect") {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 80,
        height: 80,
        opacity: opacity / 100,
      });
    } else {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 40,
        opacity: opacity / 100,
      });
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const addText = () => {
    const canvas = fabricCanvasInstanceRef.current;
    if (!canvas) return;

    const text = new fabric.IText("Double click to edit", {
      left: 100,
      top: 100,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: activeColor,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };



  const handleDeleteElement = () => {
    const canvas = fabricCanvasInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.remove(active);
      setSelectedElement(null);
      canvas.renderAll();
    }
  };

  const handleImageConfirm = (fileInputRef, setShowUploadModal) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setShowUploadModal(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new window.Image();
      imgObj.src = event.target.result;
      imgObj.onload = () => {
        const fabricImg = new fabric.Image(imgObj, {
          left: 100,
          top: 100,
        });
        if (fabricImg.width > 300) {
          fabricImg.scaleToWidth(300);
        }
        const canvas = fabricCanvasInstanceRef.current;
        if (canvas) {
          canvas.add(fabricImg);
          canvas.setActiveObject(fabricImg);
          canvas.renderAll();
        }
      };
    };
    reader.readAsDataURL(file);
    setShowUploadModal(false);
  };

  const deletePageEdits = (pageNum) => {
    setPageEdits(prev => {
      const next = { ...prev };
      
      const fCanvas = fabricCanvasInstanceRef.current;
      if (fCanvas) {
        next[currentPage] = fCanvas.toJSON(["isEraser"]);
      }

      delete next[pageNum];
      const maxPage = Math.max(0, ...Object.keys(next).map(Number));
      for(let i = pageNum + 1; i <= maxPage; i++) {
        if (next[i]) {
          next[i - 1] = next[i];
          delete next[i];
        }
      }
      return next;
    });
  };

  const movePageEdits = (fromPage, toPage) => {
    setPageEdits(prev => {
      const next = { ...prev };
      
      const fCanvas = fabricCanvasInstanceRef.current;
      if (fCanvas) {
        next[currentPage] = fCanvas.toJSON(["isEraser"]);
      }

      const maxPage = Math.max(0, ...Object.keys(next).map(Number), fromPage, toPage);
      
      const arr = [];
      for(let i=1; i<=maxPage; i++) arr.push(next[i] || null);
      
      const element = arr.splice(fromPage - 1, 1)[0];
      arr.splice(toPage - 1, 0, element);
      
      const newObj = {};
      arr.forEach((item, index) => {
        if (item) newObj[index + 1] = item;
      });
      return newObj;
    });
  };

  const resetCanvas = () => {
    setPageEdits({});
    pageEditsRef.current = {};
    historyRef.current = [];
    historyIndexRef.current = -1;
    setHistoryIndexState(-1);
    setHistoryLengthState(0);
    const fCanvas = fabricCanvasInstanceRef.current;
    if (fCanvas) {
      fCanvas.clear();
      fCanvas.renderAll();
    }
  };

  return {
    fabricCanvasRef,
    fabricCanvasInstanceRef,
    activeTool,
    setActiveTool,
    selectedElement,
    setSelectedElement,
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
    pageEdits,
    setPageEdits,
    handlePageChange,
    addShape,
    addText,
    handleDeleteElement,
    handleImageConfirm,
    saveCurrentPageEdits,
    handleUndo,
    handleRedo,
    canUndo: historyIndexState > 0,
    canRedo: historyIndexState < historyLengthState - 1,
    deletePageEdits,
    movePageEdits,
    resetCanvas,
  };
}
