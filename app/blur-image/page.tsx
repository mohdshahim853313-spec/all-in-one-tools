"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type ToolMode = "full" | "brush" | "rect";
type BlurStyle = "standard" | "pixelate" | "frosted" | "dark" | "vibrant";

export default function BlurImageTool() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("blurred-image");
  
  // Settings
  const [mode, setMode] = useState<ToolMode>("full");
  const [blurStyle, setBlurStyle] = useState<BlurStyle>("standard");
  const [blurAmount, setBlurAmount] = useState<number>(10); 
  const [brushSize, setBrushSize] = useState<number>(40);
  const [isProcessing, setIsProcessing] = useState(false);

  // Canvas Refs (Memory & Display)
  const origCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drawing State
  const drawState = useRef({
    isDrawing: false,
    lastPos: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 }
  });

  // 1. Handle File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
        loadImageToCanvases(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Initialize Canvases
  const loadImageToCanvases = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width;
      const h = img.height;

      const canvases = [origCanvasRef, effectCanvasRef, maskCanvasRef, displayCanvasRef];
      canvases.forEach(ref => {
        if (!ref.current) {
          ref.current = document.createElement("canvas");
        }
        ref.current.width = w;
        ref.current.height = h;
      });

      const origCtx = origCanvasRef.current!.getContext("2d");
      origCtx?.drawImage(img, 0, 0);

      const maskCtx = maskCanvasRef.current!.getContext("2d");
      maskCtx?.clearRect(0, 0, w, h);

      updateEffectCanvas();
    };
    img.src = src;
  };

  // 3. Generate Effect Canvas
  const updateEffectCanvas = () => {
    if (!origCanvasRef.current || !effectCanvasRef.current) return;
    
    const orig = origCanvasRef.current;
    const effect = effectCanvasRef.current;
    const ctx = effect.getContext("2d");
    if (!ctx) return;

    const w = orig.width;
    const h = orig.height;

    ctx.clearRect(0, 0, w, h);

    if (blurStyle === "pixelate") {
      const pixelSize = Math.max(2, Math.floor(blurAmount * 1.5));
      const scaledW = Math.max(1, Math.floor(w / pixelSize));
      const scaledH = Math.max(1, Math.floor(h / pixelSize));

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = scaledW;
      tempCanvas.height = scaledH;
      const tempCtx = tempCanvas.getContext("2d");
      
      tempCtx?.drawImage(orig, 0, 0, scaledW, scaledH);
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
      ctx.imageSmoothingEnabled = true; 
    } else {
      let filterStr = `blur(${blurAmount}px)`;
      if (blurStyle === "frosted") filterStr += " brightness(1.2) contrast(1.1)";
      if (blurStyle === "dark") filterStr += " brightness(0.5)";
      if (blurStyle === "vibrant") filterStr += " saturate(2) brightness(1.1)";

      ctx.filter = filterStr;
      ctx.drawImage(orig, 0, 0);
      ctx.filter = "none";
    }

    renderDisplay();
  };

  // 4. Render Final Display to Screen
  const renderDisplay = () => {
    if (!displayCanvasRef.current || !origCanvasRef.current || !effectCanvasRef.current || !maskCanvasRef.current) return;

    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (mode === "full") {
      ctx.drawImage(effectCanvasRef.current, 0, 0);
    } else {
      ctx.drawImage(origCanvasRef.current, 0, 0);

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w; tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.drawImage(maskCanvasRef.current, 0, 0);

      if (mode === "rect" && drawState.current.isDrawing) {
        const start = drawState.current.startPos;
        const end = drawState.current.currentPos;
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(
          Math.min(start.x, end.x),
          Math.min(start.y, end.y),
          Math.abs(start.x - end.x),
          Math.abs(start.y - end.y)
        );
      }

      tempCtx.globalCompositeOperation = "source-in";
      tempCtx.drawImage(effectCanvasRef.current, 0, 0);

      ctx.drawImage(tempCanvas, 0, 0);
    }
  };

  // 5. Interaction Handlers
  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === "full") return;
    const pos = getMousePos(e);
    drawState.current = {
      isDrawing: true,
      lastPos: pos,
      startPos: pos,
      currentPos: pos
    };
    if (mode === "brush") handleMove(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawState.current.isDrawing || mode === "full") return;
    const pos = getMousePos(e);
    drawState.current.currentPos = pos;

    if (mode === "brush" && maskCanvasRef.current) {
      const mCtx = maskCanvasRef.current.getContext("2d");
      if (mCtx) {
        mCtx.lineCap = "round";
        mCtx.lineJoin = "round";
        mCtx.lineWidth = brushSize;
        mCtx.strokeStyle = "white";

        mCtx.beginPath();
        mCtx.moveTo(drawState.current.lastPos.x, drawState.current.lastPos.y);
        mCtx.lineTo(pos.x, pos.y);
        mCtx.stroke();
      }
      drawState.current.lastPos = pos;
    }
    
    renderDisplay();
  };

  const handleEnd = () => {
    if (!drawState.current.isDrawing) return;
    drawState.current.isDrawing = false;

    if (mode === "rect" && maskCanvasRef.current) {
      const mCtx = maskCanvasRef.current.getContext("2d");
      const start = drawState.current.startPos;
      const end = drawState.current.currentPos;
      if (mCtx) {
        mCtx.fillStyle = "white";
        mCtx.fillRect(
          Math.min(start.x, end.x),
          Math.min(start.y, end.y),
          Math.abs(start.x - end.x),
          Math.abs(start.y - end.y)
        );
      }
      renderDisplay();
    }
  };

  const clearSelection = () => {
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      renderDisplay();
    }
  };

  useEffect(() => {
    if (selectedImage) updateEffectCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blurAmount, blurStyle]);

  const handleDownload = () => {
    if (!displayCanvasRef.current) return;
    setIsProcessing(true);
    try {
      const url = displayCanvasRef.current.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `${fileName}-pro-blurred.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error(e);
      alert("Error saving image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-32 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-4 md:mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">💧</span> Pro Blur Studio
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Poori photo blur karein, brush se paint karein, ya box banakar hide karein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300 w-full md:w-auto text-center">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Editor/Preview Panel */}
          <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col items-center relative w-full min-w-0">
            {selectedImage ? (
              <div className="relative flex flex-col items-center w-full min-w-0">
                <div className="relative w-full flex justify-center mt-4 min-w-0">
                    <canvas
                        ref={displayCanvasRef}
                        onMouseDown={handleStart}
                        onMouseMove={handleMove}
                        onMouseUp={handleEnd}
                        onMouseOut={handleEnd}
                        onTouchStart={handleStart}
                        onTouchMove={handleMove}
                        onTouchEnd={handleEnd}
                        className={`max-w-full max-h-[60vh] lg:max-h-[75vh] w-auto h-auto object-contain touch-none rounded-lg shadow-2xl ${
                            mode === "brush" ? "cursor-crosshair" : mode === "rect" ? "cursor-cell" : "cursor-default"
                        }`}
                    />
                </div>

                <div className="w-full mt-8 max-w-md lg:hidden">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center text-base uppercase tracking-wide"
                  >
                    {isProcessing ? "⏳ Processing..." : "⬇️ Download Final Image"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-800 rounded-2xl w-full min-h-[300px] lg:min-h-[500px]">
                <span className="text-5xl md:text-6xl mb-4 opacity-50">🖼️</span>
                <p className="text-sm md:text-base">Upload an image to start blurring</p>
              </div>
            )}
          </div>

          {/* Controls Panel - 🔥 FIX: Changed wrapper to isolate scroll and prevent flickering */}
          <div className="order-2 lg:order-1 lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-8 z-20 w-full min-w-0">
            <div className="relative group">
              {/* Outer Glow - Separated from scrolling container */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              {/* Inner Container that handles the scrolling */}
              <div className="bg-[#151B2B] rounded-2xl border border-gray-800 shadow-lg relative flex flex-col max-h-[85vh]">
                <div className="p-5 md:p-6 overflow-y-auto overflow-x-hidden custom-scrollbar w-full">
                  
                  {!selectedImage ? (
                    <div className="text-center pb-4">
                      <span className="text-5xl mb-4 block">📸</span>
                      <h3 className="text-white font-bold text-lg mb-2">Upload an Image</h3>
                      <p className="text-sm text-gray-400 mb-6">Pehle ek photo upload karein edit karne ke liye</p>
                      <label className="cursor-pointer bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all inline-block w-full">
                        Choose Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 border-b border-gray-800 pb-4 flex justify-between items-center">
                        <h3 className="text-white font-bold text-base md:text-lg">Pro Tools</h3>
                        <button onClick={() => setSelectedImage(null)} className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-semibold">
                          Change Image
                        </button>
                      </div>

                      <div className="mb-5">
                        <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tool Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "full", label: "Full", icon: "🖼️" },
                            { id: "brush", label: "Brush", icon: "🖌️" },
                            { id: "rect", label: "Area", icon: "🔲" }
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => { setMode(t.id as ToolMode); renderDisplay(); }}
                              className={`p-2 flex flex-col items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                                mode === t.id 
                                ? "bg-green-500/20 border-green-500 text-green-400" 
                                : "bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500"
                              }`}
                            >
                              <span className="text-lg mb-1">{t.icon}</span>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-5 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                        <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Blur Style (5 Options)</label>
                        <select 
                          value={blurStyle}
                          onChange={(e) => setBlurStyle(e.target.value as BlurStyle)}
                          className="w-full p-2 bg-[#151B2B] border border-gray-700 rounded-lg outline-none text-white text-sm focus:border-green-500 transition-colors cursor-pointer"
                        >
                          <option value="standard">Standard Blur</option>
                          <option value="pixelate">Pixelate (Minecraft Style)</option>
                          <option value="frosted">Frosted Glass (Light)</option>
                          <option value="dark">Dark Blur (Anonymous)</option>
                          <option value="vibrant">Vibrant / Colorful</option>
                        </select>
                      </div>

                      <div className="mb-5 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Effect Intensity</label>
                          <span className="text-sm font-bold text-green-400">{blurAmount}</span>
                        </div>
                        <input 
                          type="range" min="1" max="50" value={blurAmount} 
                          onChange={(e) => setBlurAmount(Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                      </div>

                      {mode === "brush" && (
                        <div className="mb-5 bg-[#0B0F19] p-4 rounded-xl border border-teal-500/30">
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-[11px] md:text-xs font-bold text-teal-400 uppercase tracking-wider">Brush Size</label>
                            <span className="text-sm font-bold text-teal-400">{brushSize}px</span>
                          </div>
                          <input 
                            type="range" min="10" max="150" value={brushSize} 
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                          />
                        </div>
                      )}

                      {mode !== "full" && (
                        <button 
                          onClick={clearSelection}
                          className="w-full mb-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                          🗑️ Clear Drawn Areas
                        </button>
                      )}

                      <div className="hidden lg:block">
                        <button
                          onClick={handleDownload}
                          disabled={isProcessing}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center text-lg uppercase tracking-wide shrink-0"
                        >
                          {isProcessing ? "⏳ Processing..." : "⬇️ Download Output"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}