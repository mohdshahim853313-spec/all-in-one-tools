"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ImageUpscaleTool() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("upscaled-image");
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
        
        const img = new Image();
        img.onload = () => {
          setOrigW(img.width);
          setOrigH(img.height);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 🔥 LIVE PREVIEW GENERATOR: Jab bhi photo ya scale factor badle, live render karo
  useEffect(() => {
    if (!selectedImage) {
        setUpscaledImage(null);
        return;
    }

    setIsGenerating(true);
    
    // Thoda timeout dete hain taaki UI freeze na ho aur "Processing..." text dikhe
    const timer = setTimeout(() => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            
            if (ctx) {
                // High Quality Smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                try {
                    const url = canvas.toDataURL("image/png", 1.0);
                    setUpscaledImage(url);
                } catch (error) {
                    console.error("Canvas to Data URL failed:", error);
                    alert("Image bahut badi hai live preview ke liye! Thoda chhota scale try karein.");
                }
            }
            setIsGenerating(false);
        };
        img.src = selectedImage;
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedImage, scaleFactor]);

  const downloadUpscaledImage = () => {
    if (!upscaledImage) return;
    
    const link = document.createElement("a");
    link.download = `${fileName}-${scaleFactor}x-upscaled.png`;
    link.href = upscaledImage;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">⬆️</span> Image Upscale <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-md ml-3 border border-green-500/30">Basic</span>
            </h1>
            <p className="text-gray-400">Apni chhoti photo ka resolution bada karein aur Live Preview dekhein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* Main Tool Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Controls Panel (Left Side - 1 Column) */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-8 z-20">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                {!selectedImage ? (
                  <div className="text-center pb-4">
                    <span className="text-5xl mb-4 block">📸</span>
                    <h3 className="text-white font-bold text-lg mb-2">Upload an Image</h3>
                    <p className="text-sm text-gray-400 mb-4">Upscale karne ke liye photo select karein</p>
                    <label className="cursor-pointer bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all inline-block w-full">
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 border-b border-gray-800 pb-4 flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg">Upscale Settings</h3>
                      <button onClick={() => setSelectedImage(null)} className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        Change
                      </button>
                    </div>

                    <div className="mb-6 bg-[#0B0F19] p-5 rounded-xl border border-gray-700">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Scale Factor</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[2, 3, 4].map((factor) => (
                          <button
                            key={factor}
                            onClick={() => setScaleFactor(factor)}
                            disabled={isGenerating}
                            className={`py-3 rounded-lg text-sm font-bold transition-all border ${
                              scaleFactor === factor
                                ? "bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                : "bg-[#151B2B] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white disabled:opacity-50"
                            }`}
                          >
                            {factor}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6 bg-[#0B0F19] p-4 rounded-xl border border-gray-800 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500">Original Size:</span>
                        <span className="text-gray-300 font-mono">{origW} x {origH}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 font-semibold">New Size:</span>
                        <span className="text-green-400 font-mono font-bold">{origW * scaleFactor} x {origH * scaleFactor}</span>
                      </div>
                    </div>

                    <button
                      onClick={downloadUpscaledImage}
                      disabled={isGenerating || !upscaledImage}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? "⏳ Rendering..." : `⬇️ Download ${scaleFactor}x PNG`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editor/Preview Panel (Right Side - 3 Columns for wider view) */}
          <div className="lg:col-span-3 bg-[#151B2B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[500px] flex items-center justify-center p-6 relative">
            
            {selectedImage ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full">
                
                {/* 1. Original Preview */}
                <div className="flex flex-col items-center w-full h-full bg-[#0B0F19] border border-gray-700 rounded-xl p-3">
                    <div className="w-full flex justify-between items-center mb-3 px-2">
                        <span className="text-sm font-bold text-gray-300">Original</span>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{origW}x{origH}</span>
                    </div>
                    <div className="flex-1 w-full flex items-center justify-center bg-[#151B2B] rounded-lg overflow-hidden relative">
                        <img
                            ref={imgRef}
                            alt="Original Preview"
                            src={selectedImage}
                            className="max-h-[60vh] w-auto object-contain"
                        />
                    </div>
                </div>

                {/* 2. Upscaled Live Preview */}
                <div className="flex flex-col items-center w-full h-full bg-[#0B0F19] border border-green-500/30 rounded-xl p-3 relative">
                    <div className="w-full flex justify-between items-center mb-3 px-2">
                        <span className="text-sm font-bold text-green-400 flex items-center">
                           <span className="animate-pulse mr-2 h-2 w-2 bg-green-500 rounded-full"></span> 
                           Upscaled ({scaleFactor}x)
                        </span>
                        <span className="text-xs text-green-400/70 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">{origW * scaleFactor}x{origH * scaleFactor}</span>
                    </div>
                    
                    <div className="flex-1 w-full flex items-center justify-center bg-[#151B2B] rounded-lg overflow-hidden relative">
                        {isGenerating ? (
                            <div className="flex flex-col items-center text-green-500">
                                <span className="text-4xl animate-spin mb-3">⚙️</span>
                                <span className="text-sm font-bold animate-pulse">Generating Live Preview...</span>
                            </div>
                        ) : (
                            upscaledImage && (
                                <img
                                    alt="Upscaled Preview"
                                    src={upscaledImage}
                                    className="max-h-[60vh] w-auto object-contain"
                                />
                            )
                        )}
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 text-center mt-2">
                    <p className="text-xs text-gray-500">
                        * Note: Dono images screen par fit hone ke liye chhoti dikh rahi hain, par right wali image ke actual pixels {scaleFactor} guna zyada hain.
                    </p>
                </div>

              </div>
            ) : (
              <div className="text-gray-600 flex flex-col items-center">
                <span className="text-6xl mb-4 opacity-50">🖼️</span>
                <p>Side-by-side preview will appear here</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}