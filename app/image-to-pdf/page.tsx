"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

type ImgData = { id: string; url: string; name: string; width: number; height: number };

export default function ImageToPDF() {
  const [images, setImages] = useState<ImgData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fitMode, setFitMode] = useState<"fit" | "stretch">("fit");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop ke liye references
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
          const imgElement = new window.Image();
          imgElement.src = imgUrl;
          imgElement.onload = () => {
            setImages((prev) => [
              ...prev,
              { 
                id: Math.random().toString(36).substring(7),
                url: imgUrl, 
                name: file.name,
                width: imgElement.width,
                height: imgElement.height
              },
            ]);
          };
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idToRemove: string) => {
    setImages(images.filter((img) => img.id !== idToRemove));
  };

  // --- DRAG AND DROP LOGIC STARTS HERE ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    // Drag karte time card thoda transparent dikhega
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    
    // Agar drag successful hua (position change hui)
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const _images = [...images];
      const draggedItemContent = _images.splice(dragItem.current, 1)[0];
      _images.splice(dragOverItem.current, 0, draggedItemContent);
      setImages(_images);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Ye zaroori hai taaki drop allow ho sake
  };
  // --- DRAG AND DROP LOGIC ENDS HERE ---

  const generatePDF = () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    setTimeout(() => {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      images.forEach((img, index) => {
        if (index > 0) doc.addPage();
        
        if (fitMode === "stretch") {
          doc.addImage(img.url, "JPEG", 0, 0, pageWidth, pageHeight);
        } else {
          let renderWidth = pageWidth - (margin * 2);
          let renderHeight = (img.height / img.width) * renderWidth;
          
          if (renderHeight > pageHeight - (margin * 2)) {
            renderHeight = pageHeight - (margin * 2);
            renderWidth = (img.width / img.height) * renderHeight;
          }
          
          const x = (pageWidth - renderWidth) / 2;
          const y = (pageHeight - renderHeight) / 2;
          doc.addImage(img.url, "JPEG", x, y, renderWidth, renderHeight);
        }
      });

      doc.save("AllInOne-Images.pdf");
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-20">
      <div className="w-full max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">🖼️</span> Advanced Image to PDF
            </h1>
            <p className="text-gray-400"> <span className="text-green-400 font-bold">Drag & Drop</span> any image to arrange the order.            .</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Side: Controls & Upload */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500 pointer-events-none"></div>
              <div className="relative text-center">
                <input type="file" multiple accept="image/png, image/jpeg, image/jpg" onChange={handleImageUpload} ref={fileInputRef} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 hover:border-green-500 rounded-xl bg-[#0B0F19] transition-all">
                  <span className="text-4xl mb-3 opacity-70">📁</span>
                  <span className="text-white font-bold mb-1">Add Images</span>
                  <span className="text-xs text-gray-500">JPG, PNG allowed</span>
                </label>
              </div>
            </div>

            {images.length > 0 && (
              <div className="bg-[#151B2B] p-5 rounded-2xl border border-gray-800">
                <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider text-gray-400">PDF Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" name="fitMode" checked={fitMode === "fit"} onChange={() => setFitMode("fit")} className="w-4 h-4 text-green-500 bg-gray-900 border-gray-700 focus:ring-green-500 focus:ring-offset-gray-900" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition">Fit to Page (No Stretch)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" name="fitMode" checked={fitMode === "stretch"} onChange={() => setFitMode("stretch")} className="w-4 h-4 text-green-500 bg-gray-900 border-gray-700 focus:ring-green-500 focus:ring-offset-gray-900" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition">Stretch to Full Page</span>
                  </label>
                </div>

                <button onClick={generatePDF} disabled={isGenerating} className="w-full mt-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
                  {isGenerating ? "⏳ Generating..." : "📄 Download PDF"}
                </button>
                <button onClick={() => setImages([])} className="w-full mt-3 py-2 bg-transparent text-red-400 text-sm font-bold rounded-xl hover:bg-red-500/10 transition-all">
                  Clear All Images
                </button>
              </div>
            )}
          </div>

          {/* Right Side: DRAG AND DROP Image Preview Area */}
          <div className="lg:col-span-3 bg-[#151B2B] p-6 rounded-2xl border border-gray-800 min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
              <span>Pages Preview ({images.length})</span>
            </h2>
            
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
                <span className="text-4xl mb-4 opacity-30">👆</span>
                <p>Images add karein aur unhe drag karke<br/>apni marzi se order set karein.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div 
                    key={img.id} 
                    draggable // Yahan draggable enable kiya hai
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    className="relative group rounded-xl overflow-hidden border border-gray-700 bg-[#0B0F19] aspect-[3/4] flex flex-col cursor-grab active:cursor-grabbing hover:border-green-500 transition-colors"
                  >
                    
                    {/* Header with Page Number */}
                    <div className="absolute top-0 left-0 right-0 bg-black/70 text-xs font-bold px-2 py-1 text-white z-10 flex justify-between items-center pointer-events-none">
                      <span>Page {index + 1}</span>
                    </div>
                    
                    {/* Delete Button (alag se click hone ke liye z-20) */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} 
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>

                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="w-full h-full object-contain p-2 bg-[#0B0F19] opacity-90 group-hover:opacity-100 pointer-events-none" />
                    
                    {/* Drag Handle Icon (Visual Cue) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white text-3xl opacity-80"></span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}