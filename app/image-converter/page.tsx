"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function ImageConverter() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.split('.')[0]); // Save name without extension
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadConvertedImage = () => {
    if (!selectedImage || !canvasRef.current) return;
    
    setIsConverting(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // If converting to JPEG, set a white background first (since JPEG doesn't support transparency)
      if (format === "jpeg") {
        ctx!.fillStyle = "#FFFFFF";
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw image onto canvas
      ctx!.drawImage(img, 0, 0);
      
      // Convert and download
      const convertedUrl = canvas.toDataURL(`image/${format}`, 0.9); // 0.9 is quality for jpeg/webp
      
      const link = document.createElement("a");
      link.download = `${fileName || "converted-image"}.${format === "jpeg" ? "jpg" : format}`;
      link.href = convertedUrl;
      link.click();
      
      setIsConverting(false);
    };
    
    img.src = selectedImage;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">🔄</span> Img to JPG/PNG
            </h1>
            <p className="text-gray-400">Easily convert any image to JPG, PNG, or WEBP.            </p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* Main Tool Area */}
        <div className="bg-[#151B2B] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-lg relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500 pointer-events-none"></div>
          
          <div className="relative">
            {/* Upload Box */}
            {!selectedImage ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer bg-[#0B0F19] hover:border-green-500 hover:bg-gray-900/50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <span className="text-5xl mb-3">📂</span>
                  <p className="mb-2 text-sm text-gray-400 font-semibold">Click to upload image</p>
                  <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP, GIF, SVG</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Preview Box */}
                <div className="relative w-full h-64 bg-[#0B0F19] rounded-xl border border-gray-700 p-2 flex justify-center items-center overflow-hidden">
                  <img src={selectedImage} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                  <button 
                    onClick={() => setSelectedImage(null)} 
                    className="absolute top-2 right-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    title="Remove Image"
                  >
                    ✕
                  </button>
                </div>

                {/* Conversion Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0B0F19] p-5 rounded-xl border border-gray-800">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Convert To</label>
                    <div className="flex gap-2">
                      {(["jpeg", "png", "webp"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setFormat(fmt)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                            format === fmt 
                            ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                            : "bg-[#151B2B] text-gray-400 border border-gray-700 hover:bg-gray-800"
                          }`}
                        >
                          {fmt === "jpeg" ? "JPG" : fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={downloadConvertedImage}
                      disabled={isConverting}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center disabled:opacity-50"
                    >
                      {isConverting ? "⏳ Converting..." : `⬇️ Download as ${format === "jpeg" ? "JPG" : format.toUpperCase()}`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}