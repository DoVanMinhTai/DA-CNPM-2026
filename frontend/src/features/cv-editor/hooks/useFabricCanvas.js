import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";

export default function useFabricCanvas({ canvasWidth, canvasHeight, zoom, currentPage, setCurrentPage }) {
  const [activeTool, setActiveTool] = useState("select");
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [activeColor, setActiveColor] = useState("#008080");
  const [opacity, setOpacity] = useState(85);
  const [pageEdits, setPageEdits] = useState({});

  const fabricCanvasRef = useRef(null);
  const fabricCanvasInstanceRef = useRef(null);

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
      });
    } else {
      fCanvas.renderAll();
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
  };
}
