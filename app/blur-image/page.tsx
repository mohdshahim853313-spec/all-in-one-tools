"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function BlurImageTool() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [blurAmount, setBlurAmount] = useState<number>(5); // Default blur intensity (preview based)
  const [fileName, setFileName] = useState<string>("blurred-image");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadBlurredImage = () => {
    if (!selectedImage || !canvasRef.current || !imgRef.current) return;
    
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    
    // Set canvas dimensions to match the ORIGINAL image dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    if (!ctx) return;

    // 🔥 FIX: Calculate scaling ratio to match preview blur on high-res image
    // Asli image kitni badi hai preview se?
    const scaleRatio = img.naturalWidth / img.width; 
    // Blur ko usi guna badha do, taaki high-res image par wahi effect aaye
    const scaledBlur = blurAmount * scaleRatio;

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply the SCALED blur filter directly to the canvas context
    ctx.filter = `blur(${scaledBlur}px)`;
    
    // Draw the image onto the canvas with the scaled filter applied
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 PNG and trigger download
    try {
        const blurredUrl = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.download = `${fileName}-blurred.png`;
        link.href = blurredUrl;
        link.click();
    } catch (error) {
        console.error("Error generating blurred image:", error);
        alert("Could not generate blurred image. The image might be too large or corrupted.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Preset blur amounts for quick selection
  const presets = [
    { label: "None", value: 0 },
    { label: "Low", value: 2 },
    { label: "Medium", value: 8 },
    { label: "High", value: 20 },
    { label: "Hidden", value: 45 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">💧</span> Blur Image
            </h1>
            <p className="text-gray-400">Kisi bhi photo ko blur karke privacy protect karein ya artistic effect dein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* Main Tool Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Controls Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-8 z-20">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                {!selectedImage ? (
                  <div className="text-center pb-4">
                    <span className="text-5xl mb-4 block">📸</span>
                    <h3 className="text-white font-bold text-lg mb-2">Upload an Image</h3>
                    <p className="text-sm text-gray-400 mb-4">Pehle ek photo upload karein usey blur karne ke liye</p>
                    <label className="cursor-pointer bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all inline-block w-full">
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 border-b border-gray-800 pb-4 flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg">Blur Settings</h3>
                      <button onClick={() => setSelectedImage(null)} className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        Change Image
                      </button>
                    </div>

                    {/* Blur Intensity Slider */}
                    <div className="mb-6 bg-[#0B0F19] p-5 rounded-xl border border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Blur Intensity</label>
                        <span className="text-2xl font-extrabold text-green-400 tabular-nums">
                          {blurAmount}<span className="text-sm text-gray-500 font-medium">px</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        step="1" 
                        value={blurAmount} 
                        onChange={(e) => setBlurAmount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                        <span>Min (0)</span>
                        <span>Max (50)</span>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Presets</label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map(preset => (
                                <button 
                                    key={preset.value}
                                    onClick={() => setBlurAmount(preset.value)}
                                    className={`px-4 py-2 text-xs rounded-full border transition-all ${
                                        blurAmount === preset.value 
                                        ? "bg-green-500 border-green-500 text-white font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                                        : "bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                      onClick={downloadBlurredImage}
                      disabled={isProcessing}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "⏳ Processing..." : "⬇️ Download Blurred PNG"}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center mt-3">
                      * Downloads as high-quality PNG to preserve detail and transparency.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editor/Preview Panel */}
          <div className="lg:col-span-2 bg-[#151B2B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[500px] flex items-center justify-center p-4 relative">
            
            {selectedImage ? (
              <div className="relative flex flex-col items-center">
                
                {/* Visual Preview with CSS Blur (Fast) */}
                <div className="relative max-h-[75vh] rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
                    <img
                        ref={imgRef}
                        alt="Preview"
                        src={selectedImage}
                        style={{ filter: `blur(${blurAmount}px)` }} // Real-time preview blur
                        className="max-h-[75vh] w-auto object-contain transition-filter duration-100 ease-out"
                    />
                    {/* Optional text to see blur effect better */}
                    {blurAmount > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl font-black text-white/20 select-none pointer-events-none"></span>
                        </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 flex flex-col items-center">
                <span className="text-6xl mb-4 opacity-50">🖼️</span>
                <p>Image preview will appear here</p>
              </div>
            )}
          </div>

        </div>

        {/* Hidden Canvas for High-Quality Processing */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}