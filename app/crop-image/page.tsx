"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactCrop, { type Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function CropImageTool() {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [isCircle, setIsCircle] = useState(false);
  
  // Custom Ratio States
  const [customW, setCustomW] = useState<string>("");
  const [customH, setCustomH] = useState<string>("");

  // Live Dimensions State
  const [liveW, setLiveW] = useState<number>(0);
  const [liveH, setLiveH] = useState<number>(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const [fileName, setFileName] = useState("cropped-image");

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name.split('.')[0]);
      setCrop(undefined); 
      setCustomW("");
      setCustomH("");
      setLiveW(0);
      setLiveH(0);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(file);
    }
  };

  const handleRatioClick = (newAspect: number | undefined, circle: boolean = false) => {
    setAspect(newAspect);
    setIsCircle(circle);
    
    // Clear custom inputs if a preset button is clicked
    if (!newAspect || newAspect !== Number(customW) / Number(customH)) {
        setCustomW("");
        setCustomH("");
    }

    if (newAspect) {
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const cropWidth = width > height ? height * newAspect : width;
        const cropHeight = cropWidth / newAspect;
        setCrop({
          unit: "px",
          width: cropWidth * 0.8,
          height: cropHeight * 0.8,
          x: (width - cropWidth * 0.8) / 2,
          y: (height - cropHeight * 0.8) / 2,
        });
      }
    } else {
      setCrop(undefined); 
    }
  };

  // Handle Custom Input changes
  useEffect(() => {
    const w = parseFloat(customW);
    const h = parseFloat(customH);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        setAspect(w / h);
        setIsCircle(false);
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            const newAspect = w / h;
            let cropWidth = width * 0.8;
            let cropHeight = cropWidth / newAspect;
            
            if (cropHeight > height * 0.8) {
                cropHeight = height * 0.8;
                cropWidth = cropHeight * newAspect;
            }

            setCrop({
              unit: "px",
              width: cropWidth,
              height: cropHeight,
              x: (width - cropWidth) / 2,
              y: (height - cropHeight) / 2,
            });
        }
    }
  }, [customW, customH]);

  const handleCropChange = (pixelCrop: PixelCrop, percentCrop: Crop) => {
    setCrop(pixelCrop);
    
    // Calculate real-time actual image pixels
    if (imgRef.current && pixelCrop.width && pixelCrop.height) {
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        setLiveW(Math.round(pixelCrop.width * scaleX));
        setLiveH(Math.round(pixelCrop.height * scaleY));
    }
  };

  const downloadCroppedImage = () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const image = imgRef.current;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isCircle) {
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const base64Image = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = `${fileName}-cropped.png`;
    link.href = base64Image;
    link.click();
  };

  const aspectRatios = [
    { label: "Free (Custom)", value: undefined, icon: "📐" },
    { label: "Square (1:1)", value: 1, icon: "⏹️" },
    { label: "Circle", value: 1, circle: true, icon: "⏺️" },
    { label: "Portrait (9:16)", value: 9 / 16, icon: "📱" },
    { label: "Landscape (16:9)", value: 16 / 9, icon: "📺" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">✂️</span> Crop Image Pro
            </h1>
            <p className="text-gray-400">Image ko custom size, 16:9, 9:16 ya Circle shape mein crop karein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Controls Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-8 z-20">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                {!imgSrc ? (
                  <div className="text-center pb-4">
                    <span className="text-5xl mb-4 block">📸</span>
                    <h3 className="text-white font-bold text-lg mb-2">Upload an Image</h3>
                    <p className="text-sm text-gray-400 mb-4">First upload an image to start cropping</p>
                    <label className="cursor-pointer bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all inline-block w-full">
                      Choose Image
                      <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 border-b border-gray-800 pb-4 flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg">Crop Settings</h3>
                      <button onClick={() => setImgSrc("")} className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        Change Image
                      </button>
                    </div>

                    {/* Presets Grid */}
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preset Aspect Ratios</label>
                      <div className="grid grid-cols-2 gap-2">
                        {aspectRatios.map((ratio, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleRatioClick(ratio.value, ratio.circle)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                              aspect === ratio.value && isCircle === (ratio.circle || false) && !customW && !customH
                                ? "bg-green-500/20 border-green-500 text-green-400"
                                : "bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                            }`}
                          >
                            <span className="text-xl mb-1">{ratio.icon}</span>
                            <span className="text-xs font-semibold">{ratio.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Text Input for Aspect Ratio */}
                    <div className="mb-6 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Type Custom Ratio</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="W (e.g. 9)" 
                          value={customW} 
                          onChange={(e) => setCustomW(e.target.value)}
                          className="w-full bg-[#151B2B] text-white p-2 rounded-lg outline-none border border-gray-700 focus:border-green-500 text-center text-sm"
                        />
                        <span className="text-gray-500 font-bold">:</span>
                        <input 
                          type="number" 
                          placeholder="H (e.g. 4)" 
                          value={customH} 
                          onChange={(e) => setCustomH(e.target.value)}
                          className="w-full bg-[#151B2B] text-white p-2 rounded-lg outline-none border border-gray-700 focus:border-green-500 text-center text-sm"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 text-center">Auto-applies when you type both numbers</p>
                    </div>

                    <button
                      onClick={downloadCroppedImage}
                      disabled={!completedCrop?.width || !completedCrop?.height}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⬇️ Download PNG
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editor/Preview Panel */}
          <div className="lg:col-span-2 bg-[#151B2B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-4 relative">
            <style jsx global>{`
              .ReactCrop__crop-selection {
                border: 2px dashed #22c55e !important;
                background-color: rgba(34, 197, 94, 0.1);
              }
              .ReactCrop__drag-handle {
                background-color: #22c55e !important;
                border: 2px solid white !important;
                width: 12px !important;
                height: 12px !important;
              }
            `}</style>
            
            {imgSrc ? (
              <div className="relative flex flex-col items-center">
                {/* Live Dimensions Badge */}
                {(liveW > 0 && liveH > 0) && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#0B0F19]/90 backdrop-blur-sm border border-green-500 text-green-400 text-xs font-bold px-4 py-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)] flex items-center gap-2 pointer-events-none">
                    <span>📐</span> {liveW}px <span className="text-gray-500">×</span> {liveH}px
                  </div>
                )}
                
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  circularCrop={isCircle}
                  className="max-h-[70vh] rounded-lg overflow-hidden"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    className="max-h-[70vh] w-auto object-contain"
                  />
                </ReactCrop>
              </div>
            ) : (
              <div className="text-gray-600 flex flex-col items-center">
                <span className="text-6xl mb-4 opacity-50">🖼️</span>
                <p>Image preview will appear here</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}