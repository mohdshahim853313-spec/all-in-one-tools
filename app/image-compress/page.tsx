"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ImageCompressor() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Dimensions and Settings
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [quality, setQuality] = useState(80); // 80% default quality
  
  // Result
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new window.Image();
    img.src = objectUrl;
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
      setOptimizedUrl(null); 
    };
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  // --- LIVE PREVIEW LOGIC (Real-time update) ---
  useEffect(() => {
    if (!previewUrl || width === 0 || height === 0) return;

    setIsProcessing(true);

    // Debounce timer (Taki type karte waqt browser hang na ho, aur rukne par turant process ho)
    const timer = setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const img = new window.Image();
      img.src = previewUrl;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
        setOptimizedUrl(dataUrl);
        const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
        setOptimizedSize(sizeInBytes);
        setIsProcessing(false);
      };
    }, 300); // 300ms ka delay typing khatam hone tak

    return () => clearTimeout(timer); // Purana timer clear karega agar user continue type kar raha hai
  }, [width, height, quality, previewUrl]);
  // ----------------------------------------------

  const downloadImage = () => {
    if (!optimizedUrl) return;
    const link = document.createElement("a");
    link.href = optimizedUrl;
    link.download = `Optimized_${image?.name || "image.jpg"}`;
    link.click();
  };

  const clearAll = () => {
    setImage(null);
    setPreviewUrl(null);
    setOptimizedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-orange-500 selection:text-white pb-20">
      <div className="w-full max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">🗜️</span> Image Resize & Compress
            </h1>
            <p className="text-gray-400">Settings change karein aur turant (Live) preview dekhein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
              
              <div className="relative text-center">
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} ref={fileInputRef} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 hover:border-orange-500 rounded-xl bg-[#0B0F19] transition-all">
                  <span className="text-4xl mb-3 opacity-70">📤</span>
                  <span className="text-white font-bold mb-1">{image ? "Change Image" : "Upload Image"}</span>
                  <span className="text-xs text-gray-500">JPG, PNG, WEBP allowed</span>
                </label>
              </div>
            </div>

            {image && (
              <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 relative">
                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="absolute top-4 right-4 text-orange-500 text-sm font-bold flex items-center animate-pulse">
                    <span className="mr-2">⏳</span> Updating...
                  </div>
                )}

                <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-3">Settings</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-300 font-medium">Resize (Pixels)</span>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} className="w-4 h-4 text-orange-500 bg-gray-900 border-gray-700 rounded focus:ring-orange-500" />
                      <span className="text-xs text-gray-400">Lock Ratio</span>
                    </label>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Width (W)</label>
                      <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full p-2 bg-[#0B0F19] border border-gray-700 rounded-lg outline-none focus:border-orange-500 text-white text-center transition-colors" />
                    </div>
                    <div className="flex items-end pb-2 text-gray-500">✕</div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Height (H)</label>
                      <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full p-2 bg-[#0B0F19] border border-gray-700 rounded-lg outline-none focus:border-orange-500 text-white text-center transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300 font-medium">Compression Quality</span>
                    <span className="text-orange-400 font-bold text-sm">{quality}%</span>
                  </div>
                  <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                  <p className="text-[10px] text-gray-500 mt-2">Adjusting this updates the preview instantly.</p>
                </div>

                {/* Hata diya purana Process button, ab seedha Clear button hai */}
                <button onClick={clearAll} className="w-full mt-2 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  Clear Image
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {!image ? (
              <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 min-h-[400px] flex flex-col items-center justify-center text-center">
                <span className="text-5xl mb-4 opacity-30">🖼️</span>
                <p className="text-gray-500">Left side se koi image upload karein<br/>use compress aur resize karne ke liye.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-[#151B2B] p-5 rounded-2xl border border-gray-800 flex flex-col">
                  <h3 className="text-white font-bold mb-3 flex items-center justify-between border-b border-gray-800 pb-3">
                    <span>Original</span>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{formatSize(image.size)}</span>
                  </h3>
                  <div className="flex-1 flex items-center justify-center bg-[#0B0F19] rounded-xl overflow-hidden border border-gray-700 min-h-[250px] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl!} alt="Original" className="max-w-full max-h-full object-contain p-2" />
                  </div>
                  <div className="mt-3 text-center text-xs text-gray-400">
                    Dimensions: {originalWidth} x {originalHeight}px
                  </div>
                </div>

                <div className="bg-[#151B2B] p-5 rounded-2xl border border-orange-500/30 shadow-[0_0_20px_rgba(234,88,12,0.05)] flex flex-col">
                  <h3 className="text-white font-bold mb-3 flex items-center justify-between border-b border-gray-800 pb-3">
                    <span className="text-orange-400">Optimized Result</span>
                    {optimizedSize > 0 && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-bold border border-orange-500/30 transition-all">
                        {formatSize(optimizedSize)}
                      </span>
                    )}
                  </h3>
                  <div className="flex-1 flex items-center justify-center bg-[#0B0F19] rounded-xl overflow-hidden border border-gray-700 min-h-[250px] relative">
                    {optimizedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={optimizedUrl} alt="Optimized" className="max-w-full max-h-full object-contain p-2 transition-opacity duration-300" style={{ opacity: isProcessing ? 0.5 : 1 }} />
                    ) : (
                      <div className="text-gray-600 text-sm flex flex-col items-center">
                        <span className="text-3xl mb-2 animate-spin">⚙️</span>
                        <p>Loading...</p>
                      </div>
                    )}
                  </div>
                  
                  {optimizedUrl ? (
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-gray-400 px-1">
                        <span>New Size: {width} x {height}px</span>
                        <span className="text-green-400 font-bold">Saved: {100 - Math.round((optimizedSize / image.size) * 100)}%</span>
                      </div>
                      <button onClick={downloadImage} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all flex justify-center items-center">
                        <span className="mr-2">⬇️</span> Download Image
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 h-[44px]"></div>
                  )}
                </div>

              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  );
}