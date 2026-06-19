import {
  MousePointer2,
  Hand,
  Type,
  PenLine,
  Highlighter,
  Eraser,
  Shapes,
  Image,
  PenTool,
} from "lucide-react";

export const tools = [
  { icon: MousePointer2, label: "Select", id: "select" },
  { icon: Hand, label: "Pan", id: "pan" },
  { icon: Type, label: "Text", id: "text" },
  { icon: PenLine, label: "Draw", id: "draw" },
  { icon: Highlighter, label: "Highlight", id: "highlight" },
  { icon: Eraser, label: "Eraser", id: "eraser" },
  { icon: Shapes, label: "Shapes", id: "shapes" },
  { icon: Image, label: "Image", id: "image" },
  { icon: PenTool, label: "Signature", id: "signature" },
];

export const fontOptions = ["Inter", "Roboto", "Lora", "Space Mono"];

export const colorSwatches = [
  { color: "#008080", label: "Primary" },
  { color: "#181C1C", label: "Dark" },
  { color: "#4E6073", label: "Secondary" },
  { color: "#ba1a1a", label: "Error" },
];
