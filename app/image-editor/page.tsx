"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactCrop, { type Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// --- TYPES ---
type Tab = "basic" | "hsl" | "blur" | "draw" | "crop";
type HslColor = "red" | "orange" | "yellow" | "green" | "aqua" | "blue" | "purple" | "magenta";
type BlurStyle = "standard" | "pixelate" | "frost" | "glass" | "liquid";

const HSL_COLORS: { id: HslColor, hex: string }[] = [
    { id: "red", hex: "#ef4444" }, { id: "orange", hex: "#f97316" }, { id: "yellow", hex: "#eab308" },
    { id: "green", hex: "#22c55e" }, { id: "aqua", hex: "#06b6d4" }, { id: "blue", hex: "#3b82f6" },
    { id: "purple", hex: "#a855f7" }, { id: "magenta", hex: "#d946ef" }
];

export default function ImageEditorPro() {
  // --- DEFAULT DEMO IMAGE ---
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop";
  
  const [imgSrc, setImgSrc] = useState<string>(DEFAULT_IMAGE);
  const [fileName, setFileName] = useState("edited-image");
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- REFS ---
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 🔥 Hidden canvas to store the final combined drawing (matching original image size)
  const memoDrawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Visible transparent canvas overlaying the image for drawing interaction
  const visibleDrawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- STATE: Basic Adjustments ---
  const [temp, setTemp] = useState(0); 
  const [tint, setTint] = useState(0); 
  const [saturation, setSaturation] = useState(100); 
  const [exposure, setExposure] = useState(100); 
  const [contrast, setContrast] = useState(100); 
  const [highlights, setHighlights] = useState(0); 
  const [shadows, setShadows] = useState(0); 
  const [whites, setWhites] = useState(0); 
  const [blacks, setBlacks] = useState(0); 
  const [brilliance, setBrilliance] = useState(0); 
  const [clarity, setClarity] = useState(0); 
  const [fade, setFade] = useState(0); 
  const [vignette, setVignette] = useState(0); 

  // --- STATE: Advanced Blur (4 Types + Standard) ---
  const [blurStyle, setBlurStyle] = useState<BlurStyle>("standard");
  const [blurAmount, setBlurAmount] = useState<number>(0); 

  // --- STATE: HSL (Cumulative Logic) ---
  const [activeHsl, setActiveHsl] = useState<HslColor>("red");
  const [hslData, setHslData] = useState<Record<HslColor, { h: number, s: number, l: number }>>({
    red: { h: 0, s: 0, l: 0 }, orange: { h: 0, s: 0, l: 0 }, yellow: { h: 0, s: 0, l: 0 },
    green: { h: 0, s: 0, l: 0 }, aqua: { h: 0, s: 0, l: 0 }, blue: { h: 0, s: 0, l: 0 },
    purple: { h: 0, s: 0, l: 0 }, magenta: { h: 0, s: 0, l: 0 }
  });

  // --- STATE: Painting / Drawing ---
  const [drawingColor, setDrawingColor] = useState("#ffffff");
  const [drawingSize, setDrawingSize] = useState(10);
  const isDrawing = useRef(false);
  const lastDrawPos = useRef({ x: 0, y: 0 });

  // --- STATE: Crop & Transform ---
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  // --- CORE ENGINE FUNCTIONS ---

  // Handle image load, initializes drawing canvases
  const onImageLoad = (img: HTMLImageElement) => {
    // Clear crop, filters
    resetAll();
    
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    // 1. Initialize hidden memo canvas matching original image resolution
    if (!memoDrawingCanvasRef.current) {
        memoDrawingCanvasRef.current = document.createElement("canvas");
    }
    memoDrawingCanvasRef.current.width = w;
    memoDrawingCanvasRef.current.height = h;

    // 2. Initialize visible display canvas matching displayed image resolution
    const visibleCanvas = visibleDrawingCanvasRef.current;
    if (visibleCanvas) {
        visibleCanvas.width = img.width;
        visibleCanvas.height = img.height;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = () => {
        setImgSrc(reader.result as string);
        // Clear previous drawing
        if (memoDrawingCanvasRef.current) {
            memoDrawingCanvasRef.current.getContext("2d")?.clearRect(0,0,99999,99999);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAll = () => {
    setTemp(0); setTint(0); setSaturation(100);
    setExposure(100); setContrast(100); setHighlights(0); setShadows(0); 
    setWhites(0); setBlacks(0); setBrilliance(0);
    setClarity(0); setFade(0); setVignette(0); 
    setBlurStyle("standard"); setBlurAmount(0);
    setDrawingColor("#ffffff"); setDrawingSize(10);
    setHslData({
        red: { h: 0, s: 0, l: 0 }, orange: { h: 0, s: 0, l: 0 }, yellow: { h: 0, s: 0, l: 0 },
        green: { h: 0, s: 0, l: 0 }, aqua: { h: 0, s: 0, l: 0 }, blue: { h: 0, s: 0, l: 0 },
        purple: { h: 0, s: 0, l: 0 }, magenta: { h: 0, s: 0, l: 0 }
    });
    setCrop(undefined); setCompletedCrop(undefined); setAspect(undefined);
  };

  // 🔥 CORE: CSS Filters Calculation for Ultra-Fast Preview
  const getFiltersString = () => {
    // Calculate cumulative HSL effect
    const totalHue = Object.values(hslData).reduce((sum, val) => sum + val.h, 0);
    const totalSat = Object.values(hslData).reduce((sum, val) => sum + val.s, 0);
    const totalLight = Object.values(hslData).reduce((sum, val) => sum + val.l, 0);

    const extBrightness = exposure + (whites * 0.5) + (highlights * 0.25) + (brilliance * 0.5) + totalLight;
    const extContrast = contrast + (clarity * 0.25) + (blacks * -0.5) + (shadows * -0.25);
    const finalSaturation = Math.max(0, saturation + totalSat);

    let filterStr = `brightness(${extBrightness}%) contrast(${extContrast}%) saturate(${finalSaturation}%) hue-rotate(${totalHue}deg)`;

    // Apply Standard Blur only in preview
    if (blurAmount > 0) filterStr += ` blur(${blurAmount}px)`;
    
    // Pixelate can be simulated on Canvas (preview is blurry, download logic pixelates)
    if (blurStyle === 'pixelate' && blurAmount > 0) filterStr += ` blur(${blurAmount}px) contrast(150%)`;

    // Apply specific blur styles on download via Canvas iterative operations
    
    return filterStr;
  };

  // Temp/Tint Overlay Logic for Preview
  const getOverlaysStyle = () => {
    let r = 128, g = 128, b = 128, a = 0;
    if (temp > 0) { r = 255; g = 136; b = 0; a = temp / 200; } 
    else if (temp < 0) { r = 0; g = 136; b = 255; a = Math.abs(temp) / 200; }

    if (tint > 0) { r = 255; g = 0; b = 255; a = Math.max(a, tint / 200); } 
    else if (tint < 0) { r = 0; g = 255; b = 0; a = Math.max(a, Math.abs(tint) / 200); } 

    // Special blur styles preview overlays
    if (blurStyle === 'frost') {
        return `rgba(255, 255, 255, ${blurAmount / 100})`;
    }
    if (blurStyle === 'liquid') {
        return `rgba(0, 255, 255, ${blurAmount / 150})`; // subtle cyan for liquid
    }

    return `rgba(${r},${g},${b},${a})`;
  };

  // Rotation & Flip
  const applyTransform = (action: "rotate-left" | "rotate-right" | "flip-h" | "flip-v") => {
    if (!imgSrc) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imgSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (action === "rotate-left" || action === "rotate-right") {
        canvas.width = image.height; canvas.height = image.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((action === "rotate-right" ? 90 : -90) * Math.PI / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
      } else if (action === "flip-h") {
        canvas.width = image.width; canvas.height = image.height;
        ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0);
      } else if (action === "flip-v") {
        canvas.width = image.width; canvas.height = image.height;
        ctx.translate(0, canvas.height); ctx.scale(1, -1);
        ctx.drawImage(image, 0, 0);
      }

      setImgSrc(canvas.toDataURL("image/png", 1.0));
      setCrop(undefined); setCompletedCrop(undefined);
    };
  };

  // --- DRAWING ENGINE IMPLEMENTATION ---

  const getOriginalCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = visibleDrawingCanvasRef.current!.getBoundingClientRect();
    const img = imgRef.current;
    
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } 
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }

    // Position on visible canvas
    const visibleX = clientX - rect.left;
    const visibleY = clientY - rect.top;

    // Scale visible position to original image size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    return { x: visibleX * scaleX, y: visibleY * scaleY };
  };

  const drawOnCanvases = (x: number, y: number, isStarting = false) => {
    const hiddenCtx = memoDrawingCanvasRef.current?.getContext("2d");
    const visibleCtx = visibleDrawingCanvasRef.current?.getContext("2d");
    const img = imgRef.current;

    if (!hiddenCtx || !visibleCtx || !img) return;

    // Drawing settings
    [hiddenCtx, visibleCtx].forEach(ctx => {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = drawingColor;
    });

    hiddenCtx.lineWidth = drawingSize;
    // Visually scale the line width for the preview
    visibleCtx.lineWidth = drawingSize * (img.width / img.naturalWidth);

    // Scaling coordinates for visible canvas
    const scaleX_inv = img.width / img.naturalWidth;
    const scaleY_inv = img.height / img.naturalHeight;
    const visibleX = x * scaleX_inv;
    const visibleY = y * scaleY_inv;

    if (isStarting) {
        lastDrawPos.current = { x, y };
        // visibleDrawStartPos = { x: visibleX, y: visibleY }; // needed if you use standard line drawing
    }

    // Draw on original-resolution canvas
    hiddenCtx.beginPath();
    hiddenCtx.moveTo(lastDrawPos.current.x, lastDrawPos.current.y);
    hiddenCtx.lineTo(x, y);
    hiddenCtx.stroke();

    // Draw on displayed-resolution canvas
    visibleCtx.beginPath();
    const vLastX = lastDrawPos.current.x * scaleX_inv;
    const vLastY = lastDrawPos.current.y * scaleY_inv;
    visibleCtx.moveTo(vLastX, vLastY);
    visibleCtx.lineTo(visibleX, visibleY);
    visibleCtx.stroke();

    lastDrawPos.current = { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTab !== "draw" || !imgSrc) return;
    const coords = getOriginalCoordinates(e);
    isDrawing.current = true;
    drawOnCanvases(coords.x, coords.y, true);
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || activeTab !== "draw" || !imgSrc) return;
    if ('touches' in e && e.touches.length > 1) return; // Prevent multi-touch interference

    // Stop propagation on mobile so screen doesn't scroll while drawing
    if ('touches' in e) {
        e.preventDefault(); 
    }

    const coords = getOriginalCoordinates(e);
    drawOnCanvases(coords.x, coords.y);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearDrawing = () => {
    memoDrawingCanvasRef.current?.getContext("2d")?.clearRect(0,0,99999,99999);
    visibleDrawingCanvasRef.current?.getContext("2d")?.clearRect(0,0,99999,99999);
  };

  // Ensure drawing canvases stay sync on resize (re-draws visible canvas)
  useEffect(() => {
    const handleResize = () => {
        const visibleCanvas = visibleDrawingCanvasRef.current;
        const memoCanvas = memoDrawingCanvasRef.current;
        const img = imgRef.current;
        if (!visibleCanvas || !memoCanvas || !img) return;

        // Resize visible canvas to new image dimensions
        visibleCanvas.width = img.width;
        visibleCanvas.height = img.height;

        // Redraw content from memo canvas onto visible canvas scaled
        const visibleCtx = visibleCanvas.getContext("2d");
        visibleCtx?.drawImage(memoCanvas, 0, 0, memoCanvas.width, memoCanvas.height, 0, 0, visibleCanvas.width, visibleCanvas.height);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 

  // --- DOWNLOAD / SAVE LOGIC WITH COMPLEX EFFECTS ---

  const handleDownload = () => {
    if (!imgSrc || !imgRef.current) return;
    setIsProcessing(true);

    setTimeout(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;
        const memoDrawCanvas = memoDrawingCanvasRef.current;

        if (!ctx || !img) return;

        // Original source dimensions for Canvas operations
        let sw = img.naturalWidth;
        let sh = img.naturalHeight;
        let sx = 0, sy = 0;

        // Destination canvas size
        let dw = img.naturalWidth;
        let dh = img.naturalHeight;

        // Apply crop dimensions
        if (completedCrop && completedCrop.width && completedCrop.height) {
            const scaleX = img.naturalWidth / img.width;
            const scaleY = img.naturalHeight / img.height;
            sw = completedCrop.width * scaleX;
            sh = completedCrop.height * scaleY;
            sx = completedCrop.x * scaleX;
            sy = completedCrop.y * scaleY;
            dw = sw;
            dh = sh;
        }

        canvas.width = dw;
        canvas.height = dh;

        // 1. COMPLEX EFFECT PROCESSING (Download only, heavier logic)
        
        // Pixelate Logic on hidden temp canvas before drawing to final
        if (blurStyle === 'pixelate' && blurAmount > 0) {
            const pixelSize = blurAmount * 2;
            const scaledW = Math.ceil(sw / pixelSize);
            const scaledH = Math.ceil(sh / pixelSize);

            const pixelTempCanvas = document.createElement("canvas");
            pixelTempCanvas.width = scaledW; pixelTempCanvas.height = scaledH;
            const pCtx = pixelTempCanvas.getContext("2d");
            
            pCtx?.drawImage(img, sx, sy, sw, sh, 0, 0, scaledW, scaledH);
            
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(pixelTempCanvas, 0, 0, scaledW, scaledH, 0, 0, dw, dh);
            ctx.imageSmoothingEnabled = true; // reset
        } else {
            // Draw original image with basic filters
            ctx.filter = getFiltersString();
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
            ctx.filter = "none";
        }

        // 2. Diffused Glass / Smooth liquid simulation iterative passes
        if (blurAmount > 0) {
            if (blurStyle === 'standard' || blurStyle === 'frost') {
                // Iterative blurring for softer edges on high resolution export
                for(let i=0; i<Math.ceil(blurAmount/5); i++) {
                    ctx.drawImage(canvas, 0,0,dw,dh);
                    ctx.filter = `blur(2px)`;
                }
                ctx.filter = 'none';
            } else if (blurStyle === 'liquid') {
                // High sat blur + slight offset iterative drawing for chaotic refraction feel
                ctx.globalCompositeOperation = 'multiply';
                for(let i=0; i<Math.ceil(blurAmount/4); i++) {
                    ctx.filter = `blur(10px) saturate(110%)`;
                    // subtle chaotic offsets
                    const offset = blurAmount * 0.1 * (i+1); 
                    ctx.drawImage(canvas, offset, -offset, dw - (offset*2), dh + (offset*2), offset, offset, dw, dh);
                }
                ctx.filter = 'none';
                ctx.globalCompositeOperation = 'source-over';
            }
        }

        // 3. OVERLAYS (Temp/Tint, Fade, Vignette)
        
        // Temp/Tint (Color Mix mode for standard behavior)
        ctx.fillStyle = getOverlaysStyle();
        ctx.globalCompositeOperation = "color";
        ctx.fillRect(0, 0, dw, dh);
        ctx.globalCompositeOperation = "source-over"; // reset

        // Fade Overlay (Lighten blend mode)
        if (fade > 0) {
            ctx.fillStyle = `rgba(128, 128, 128, ${fade / 200})`;
            ctx.globalCompositeOperation = "lighten";
            ctx.fillRect(0, 0, dw, dh);
            ctx.globalCompositeOperation = "source-over";
        }

        // Vignette
        if (vignette > 0) {
            ctx.globalCompositeOperation = "multiply";
            const gradient = ctx.createRadialGradient( dw/2, dh/2, Math.min(dw,dh)*0.4, dw/2, dh/2, Math.min(dw,dh)*0.8 );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, `rgba(0,0,0,${vignette/100})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, dw, dh);
            ctx.globalCompositeOperation = "source-over";
        }

        // 4. 🔥 MERGE DRAWING CANVAS
        if (memoDrawCanvas) {
            if (completedCrop && completedCrop.width) {
                // If cropped, need to draw specific memo area onto export canvas
                ctx.drawImage(memoDrawCanvas, sx, sy, sw, sh, 0, 0, dw, dh);
            } else {
                ctx.drawImage(memoDrawCanvas, 0, 0, dw, dh);
            }
        }

        try {
            const url = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.download = `${fileName}-pro-edit.png`;
            link.href = url;
            link.click();
        } catch (e) {
            console.error(e);
            alert("Error processing image. Upload your own image for best results.");
        } finally {
            setIsProcessing(false);
        }
    }, 100);
  };

  // 🔥 CORE FIX: Smooth Sliders CSS
  const SliderRow = ({ label, val, set, min, max, zeroCentered = false }: any) => (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] font-semibold text-gray-400 tracking-wide">{label}</span>
            <span className="text-[12px] font-mono text-gray-300 bg-gray-800 px-2 py-0.5 rounded tabular-nums">{val}</span>
        </div>
        <div className="relative flex items-center h-4">
            <input 
                type="range" min={min} max={max} value={val} 
                onChange={(e) => set(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer outline-none custom-slider"
                style={{
                  '--val': `${((val - min) / (max - min)) * 100}%`,
                  '--accent': zeroCentered && val === 0 ? '#9ca3af' : '#ffffff'
                } as any}
            />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] font-sans text-gray-200 selection:bg-gray-700 selection:text-white flex flex-col overflow-hidden h-screen">
      
      {/* Global Sliders Style */}
      <style dangerouslySetInnerHTML={{__html: `
          input[type=range].custom-slider::-webkit-slider-thumb {
              -webkit-appearance: none; appearance: none;
              width: 22px; height: 22px;
              border-radius: 50%; background: var(--accent);
              cursor: grab; border: 2px solid #000;
              box-shadow: 0 0 5px rgba(0,0,0,0.5);
              transition: background 0.1s;
          }
          input[type=range].custom-slider::-webkit-slider-thumb:active { cursor: grabbing; background: #3b82f6; }
          input[type=range].custom-slider::-moz-range-thumb {
              width: 22px; height: 22px; border-radius: 50%;
              background: var(--accent); cursor: grab;
              border: 2px solid #000; box-shadow: 0 0 5px rgba(0,0,0,0.5);
          }
          input[type=range].custom-slider::-moz-range-thumb:active { cursor: grabbing; background: #3b82f6; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 5px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}} />

      {/* Top Navbar */}
      <div className="h-14 bg-[#111111] border-b border-[#222] flex justify-between items-center px-4 md:px-8 shrink-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <h1 className="text-lg md:text-xl font-black text-gray-100 tracking-tight">Image Studio<span className="text-blue-500"> Pro</span></h1>
        </div>
        <div className="flex items-center gap-4">
            <label className="cursor-pointer text-xs md:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg transition-colors shadow-lg">
                Choose Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors hidden md:block">Close</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row h-full">
        
        {/* 🔥 FIX: ALL SETTINGS ON LEFT SIDEBAR */}
        <div className="w-full lg:w-[320px] xl:w-[380px] bg-[#111111] border-r border-[#222] flex flex-col shrink-0 order-2 lg:order-1 z-20 h-[50vh] lg:h-auto pb-6">
            
            {/* TABS */}
            <div className="flex border-b border-[#222] bg-[#000] gap-0.5 shrink-0 px-2 py-1.5">
                {[{ id: "basic", label: "Basic" }, { id: "hsl", label: "HSL" }, { id: "blur", label: "Blur FX" }, { id: "draw", label: "Draw" }, { id: "crop", label: "Crop" }].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as Tab)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${ activeTab === t.id ? "bg-[#2a2a2a] text-white shadow-sm" : "text-gray-400 hover:text-gray-200 hover:bg-[#111]" }`}
                    > {t.label} </button>
                ))}
            </div>

            {/* SCROLLABLE SETTINGS AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {/* --- TAB: BASIC ADJUSTMENTS --- */}
                {activeTab === "basic" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-200">Adjustments</span>
                            <button onClick={resetAll} className="text-xs text-gray-500 hover:text-white bg-gray-800 px-3 py-1.5 rounded" title="Reset All Basic">Reset</button>
                        </div>
                        
                        <div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4 border-b border-[#2a2a2a] pb-1">Color</div>
                        <SliderRow label="Temp" min={-100} max={100} val={temp} set={setTemp} zeroCentered />
                        <SliderRow label="Tint" min={-100} max={100} val={tint} set={setTint} zeroCentered />
                        <SliderRow label="Saturation" min={0} max={200} val={saturation} set={setSaturation} /></div>

                        <div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4 border-b border-[#2a2a2a] pb-1 mt-6">Lightness</div>
                        <SliderRow label="Exposure" min={0} max={200} val={exposure} set={setExposure} />
                        <SliderRow label="Contrast" min={0} max={200} val={contrast} set={setContrast} />
                        <SliderRow label="Highlights" min={-100} max={100} val={highlights} set={setHighlights} zeroCentered />
                        <SliderRow label="Shadows" min={-100} max={100} val={shadows} set={setShadows} zeroCentered />
                        <SliderRow label="Whites" min={-100} max={100} val={whites} set={setWhites} zeroCentered />
                        <SliderRow label="Blacks" min={-100} max={100} val={blacks} set={setBlacks} zeroCentered />
                        <SliderRow label="Brilliance" min={-100} max={100} val={brilliance} set={setBrilliance} zeroCentered /></div>

                        <div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4 border-b border-[#2a2a2a] pb-1 mt-6">Effects</div>
                        <SliderRow label="Clarity" min={-100} max={100} val={clarity} set={setClarity} zeroCentered />
                        <SliderRow label="Fade" min={0} max={100} val={fade} set={setFade} />
                        <SliderRow label="Vignette" min={0} max={100} val={vignette} set={setVignette} /></div>
                    </div>
                )}

                {/* --- TAB: HSL (Combined Logic) --- */}
                {activeTab === "hsl" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6"><span className="text-sm font-bold text-gray-200">Color Mix (HSL) Cumulative</span>
                        <button onClick={() => setHslData({...hslData, [activeHsl]: {h:0, s:0, l:0}})} className="text-xs text-gray-500 hover:text-white bg-gray-800 px-3 py-1 rounded" title="Reset Current Color">Reset Color</button></div>
                        
                        <div className="flex justify-between gap-1 mb-8">
                            {HSL_COLORS.map(c => (
                                <button key={c.id} onClick={() => setActiveHsl(c.id)} className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-[3px] transition-all ${activeHsl === c.id ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: c.hex }} />
                            ))}
                        </div>

                        <SliderRow label="Hue" min={-100} max={100} zeroCentered val={hslData[activeHsl].h} set={(v: number) => setHslData({...hslData, [activeHsl]: {...hslData[activeHsl], h: v}})} />
                        <SliderRow label="Saturation" min={-100} max={100} zeroCentered val={hslData[activeHsl].s} set={(v: number) => setHslData({...hslData, [activeHsl]: {...hslData[activeHsl], s: v}})} />
                        <SliderRow label="Lightness" min={-100} max={100} zeroCentered val={hslData[activeHsl].l} set={(v: number) => setHslData({...hslData, [activeHsl]: {...hslData[activeHsl], l: v}})} />
                    </div>
                )}

                {/* --- TAB: ADVANCED BLUR FX --- */}
                {activeTab === "blur" && (
                    <div className="space-y-6">
                        <span className="text-sm font-bold text-gray-200 mb-6 block">Blur FX</span>
                        
                        <div className="mb-5 bg-[#000] p-4 rounded-xl border border-[#222]">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Blur Type (4 Options)</label>
                            <select value={blurStyle} onChange={(e) => setBlurStyle(e.target.value as BlurStyle)}
                                className="w-full p-2.5 bg-[#111] border border-[#2a2a2a] rounded-lg outline-none text-white text-sm focus:border-gray-500 transition-colors cursor-pointer"
                            >
                                <option value="standard">Gaussian Blur (Standard)</option>
                                <option value="pixelate">Pixelate (Liquid Glass Vibe)</option>
                                <option value="frost">Frost Glass (Diffuse)</option>
                                <option value="liquid">Liquid Glass (Refraction simulation)</option>
                            </select>
                        </div>
                        <SliderRow label="Blur Intensity" min={0} max={ blurStyle === 'pixelate' ? 20 : 50 } val={blurAmount} set={setBlurAmount} />
                    </div>
                )}

                {/* --- TAB: DRAWING / PAINTING --- */}
                {activeTab === "draw" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-gray-200">Painting Tool</span>
                            <button onClick={clearDrawing} className="text-xs text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded" title="Reset All Painting">Clear Canvas</button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-3">Brush Color</label>
                            <div className="grid grid-cols-6 gap-2">
                                {["#ffffff", "#000000", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#f97316", "#a855f7", "#06b6d4"].map(c => (
                                    <button key={c} onClick={() => setDrawingColor(c)} className={`w-full aspect-square rounded-md border-2 transition-all ${drawingColor === c ? 'border-blue-500 scale-110' : 'border-[#2a2a2a]'}`} style={{ backgroundColor: c }} />
                                ))}
                                <input type="color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} className="w-full aspect-square bg-[#000] p-0.5 rounded-md border border-[#2a2a2a] cursor-pointer" title="Custom Color" />
                            </div>
                        </div>
                        <SliderRow label="Brush Size" min={1} max={50} val={drawingSize} set={setDrawingSize} />
                    </div>
                )}

                {/* --- TAB: CROP & TRANSFORM --- */}
                {activeTab === "crop" && (
                    <div className="space-y-6">
                        <span className="text-sm font-bold text-gray-200 block mb-6">Geometry & Crop</span>
                        <div><label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Rotate & Flip</label>
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => applyTransform("rotate-left")} className="py-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors flex justify-center"><svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg></button>
                            <button onClick={() => applyTransform("rotate-right")} className="py-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors flex justify-center"><svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg></button>
                            <button onClick={() => applyTransform("flip-h")} className="py-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors text-gray-300 font-bold flex justify-center text-lg">↔️</button>
                            <button onClick={() => applyTransform("flip-v")} className="py-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors text-gray-300 font-bold flex justify-center text-lg">↕️</button>
                        </div></div>
                        <div><label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3 mt-8">Aspect Ratios</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[ { label: "Free Form", val: undefined }, { label: "1:1 Square", val: 1 }, { label: "9:16 Story", val: 9/16 }, { label: "16:9 Video", val: 16/9 }, { label: "4: classic Photo", val: 4/3 }, { label: "5:4 Social", val: 5/4 } ].map((r, i) => (
                                <button key={i} onClick={() => setAspect(r.val)} className={`py-3 px-3 text-xs font-bold rounded-lg border transition-all ${ aspect === r.val ? "bg-white text-black border-white shadow-lg" : "bg-[#2a2a2a] text-gray-400 border-transparent hover:bg-[#333]" }`}> {r.label} </button>
                            ))}
                        </div></div>
                    </div>
                )}
            </div>

            {/* Desktop Download Button */}
            <div className="p-5 border-t border-[#222] bg-[#111] hidden lg:block shrink-0">
                <button onClick={handleDownload} disabled={isProcessing} className="w-full py-4 bg-white text-black font-extrabold rounded-lg shadow-lg hover:bg-gray-200 transition-all text-sm uppercase tracking-wider">
                    {isProcessing ? "Processing..." : "Export Image"}
                </button>
            </div>
        </div>

        {/* Workspace / Image Preview Area */}
        <div className="flex-1 bg-[#000000] flex flex-col items-center justify-center relative p-4 overflow-hidden order-1 lg:order-2">
            
            <div className="relative max-w-full max-h-full flex items-center justify-center min-w-0 min-h-0 drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <ReactCrop
                    crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}
                    disabled={activeTab !== "crop"} 
                    locked={activeTab !== "crop"}
                    className="max-w-full max-h-[80vh]"
                >
                    <div className="relative inline-block overflow-hidden rounded-md shadow-2xl">
                        {/* Base Image with Preview Filters */}
                        <img
                            ref={imgRef}
                            alt="Workspace"
                            src={imgSrc}
                            crossOrigin="anonymous"
                            onLoad={(e) => onImageLoad(e.currentTarget)}
                            style={{ filter: getFiltersString() }}
                            className="max-w-full max-h-[80vh] w-auto h-auto object-contain transition-none"
                        />
                        
                        {/* Overlays */}
                        <div className="absolute inset-0 pointer-events-none mix-blend-color transition-opacity" style={{ backgroundColor: getOverlaysStyle() }}></div>
                        <div className="absolute inset-0 pointer-events-none mix-blend-lighten transition-opacity" style={{ backgroundColor: `rgba(128,128,128,${fade/200})` }}></div>
                        <div className="absolute inset-0 pointer-events-none mix-blend-multiply transition-opacity" style={{ 
                            background: vignette > 0 ? `radial-gradient(circle, transparent ${100 - vignette}%, rgba(0,0,0,${vignette/100}) 100%)` : 'none' 
                        }}></div>

                        {/* 🔥 FIX: Drawing Canvas */}
                        <canvas
                            ref={visibleDrawingCanvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={drawMove}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={drawMove}
                            onTouchEnd={stopDrawing}
                            className={`absolute inset-0 z-20 w-full h-full transition-none ${ activeTab === "draw" ? "cursor-crosshair touch-none pointer-events-auto" : "pointer-events-none" }`}
                        />
                    </div>
                </ReactCrop>
            </div>
            
            {/* Mobile Export Button */}
            <div className="w-full mt-4 lg:hidden pb-4 shrink-0">
                <button onClick={handleDownload} disabled={isProcessing} className="w-full py-4 bg-white text-black font-extrabold rounded-lg shadow-lg text-sm uppercase tracking-wider">
                    {isProcessing ? "Processing..." : "Export Image"}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}