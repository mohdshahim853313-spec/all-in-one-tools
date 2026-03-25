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

  // Live Dimensions & Corner Radius
  const [liveW, setLiveW] = useState<number>(0);
  const [liveH, setLiveH] = useState<number>(0);
  const [cornerRadius, setCornerRadius] = useState<number>(0); // 0 to 50 percent

  // Download Format State
  const [downloadFormat, setDownloadFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");

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
      setCornerRadius(0);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(file);
    }
  };

  const applyTransform = (action: "rotate-left" | "rotate-right" | "flip-h" | "flip-v") => {
    if (!imgSrc) return;

    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (action === "rotate-left" || action === "rotate-right") {
        canvas.width = image.height;
        canvas.height = image.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((action === "rotate-right" ? 90 : -90) * Math.PI / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
      } else if (action === "flip-h") {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0);
      } else if (action === "flip-v") {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(image, 0, 0);
      }

      setImgSrc(canvas.toDataURL("image/png", 1.0));
      setCrop(undefined); 
      setCompletedCrop(undefined);
    };
  };

  const handleRatioClick = (newAspect: number | undefined, circle: boolean = false) => {
    setAspect(newAspect);
    setIsCircle(circle);
    if (circle) setCornerRadius(0); 
    
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

    if (downloadFormat === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

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
    } else if (cornerRadius > 0) {
      const radius = Math.min(canvas.width, canvas.height) * (cornerRadius / 100);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
      } else {
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
      }
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

    const base64Image = canvas.toDataURL(downloadFormat, 1.0);
    const extension = downloadFormat === "image/jpeg" ? "jpg" : downloadFormat.split('/')[1];

    const link = document.createElement("a");
    link.download = `${fileName}-cropped.${extension}`;
    link.href = base64Image;
    link.click();
  };

  const aspectRatios = [
    { label: "Free Size", value: undefined, icon: "📐" },
    { label: "Square (1:1)", value: 1, icon: "⏹️" },
    { label: "Circle", value: 1, circle: true, icon: "⏺️" },
    { label: "Portrait (9:16)", value: 9 / 16, icon: "📱" },
    { label: "Landscape (16:9)", value: 16 / 9, icon: "📺" },
    { label: "Standard (4:3)", value: 4 / 3, icon: "📷" },
    { label: "Classic (3:4)", value: 3 / 4, icon: "🖼️" },
    { label: "Social (4:5)", value: 4 / 5, icon: "📱" },
    { label: "Photo (3:2)", value: 3 / 2, icon: "📸" },
    { label: "Cinema (21:9)", value: 21 / 9, icon: "🎬" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-6xl mx-auto">
        
        <style>{`
          .ReactCrop__crop-selection {
            border: 2px dashed #22c55e !important;
            background-color: rgba(34, 197, 94, 0.1);
            border-radius: ${isCircle ? '50%' : `${cornerRadius}%`} !important;
            transition: border-radius 0.2s ease;
          }
          .ReactCrop__drag-handle {
            background-color: #22c55e !important;
            border: 2px solid white !important;
            width: 12px !important;
            height: 12px !important;
          }
        `}</style>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-4 md:mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">✂️</span> Crop Image Pro
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Crop, rotate, and flip images. Adjust corner radius and select download format.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300 w-full md:w-auto text-center">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Editor/Preview Panel - No Background Box */}
          <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col items-center relative w-full">
            {imgSrc ? (
              <div className="relative flex flex-col items-center w-full">
                {(liveW > 0 && liveH > 0) && (
                  <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#0B0F19]/90 backdrop-blur-sm border border-green-500 text-green-400 text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)] flex items-center gap-2 pointer-events-none">
                    <span>📐</span> {liveW}px <span className="text-gray-500">×</span> {liveH}px
                  </div>
                )}
                
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  circularCrop={isCircle}
                  className="max-h-[50vh] lg:max-h-[70vh] w-auto flex justify-center rounded-lg overflow-hidden shadow-2xl mt-4"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    className="max-h-[50vh] lg:max-h-[70vh] w-auto object-contain mx-auto"
                  />
                </ReactCrop>

                {/* Download Button right under the image */}
                <div className="w-full mt-6 max-w-md">
                  <button
                    onClick={downloadCroppedImage}
                    disabled={!completedCrop?.width || !completedCrop?.height}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    ⬇️ Download {downloadFormat === "image/jpeg" ? "JPG" : downloadFormat.split('/')[1].toUpperCase()}
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-gray-600 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-800 rounded-2xl w-full min-h-[300px] lg:min-h-[500px]">
                <span className="text-5xl md:text-6xl mb-4 opacity-50">🖼️</span>
                <p className="text-sm md:text-base">Upload an image to start cropping</p>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="order-2 lg:order-1 lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-8 z-20">
            <div className="bg-[#151B2B] p-5 md:p-6 rounded-2xl border border-gray-800 shadow-lg relative group overflow-y-auto max-h-[85vh] custom-scrollbar">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                {!imgSrc ? (
                  <div className="text-center pb-4">
                    <span className="text-5xl mb-4 block">📸</span>
                    <h3 className="text-white font-bold text-lg mb-2">Upload an Image</h3>
                    <p className="text-sm text-gray-400 mb-6">First upload an image to start cropping</p>
                    <label className="cursor-pointer bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all inline-block w-full">
                      Choose Image
                      <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 border-b border-gray-800 pb-4 flex justify-between items-center">
                      <h3 className="text-white font-bold text-base md:text-lg">Crop Settings</h3>
                      <button onClick={() => setImgSrc("")} className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-semibold">
                        Change Image
                      </button>
                    </div>

                    <div className="mb-5 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                      <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rotate & Flip</label>
                      <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => applyTransform("rotate-left")} className="py-2.5 bg-[#151B2B] rounded-lg border border-gray-700 hover:border-green-500 hover:text-green-400 transition-colors flex justify-center" title="Rotate Left">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                        </button>
                        <button onClick={() => applyTransform("rotate-right")} className="py-2.5 bg-[#151B2B] rounded-lg border border-gray-700 hover:border-green-500 hover:text-green-400 transition-colors flex justify-center" title="Rotate Right">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                        </button>
                        <button onClick={() => applyTransform("flip-h")} className="py-2.5 bg-[#151B2B] rounded-lg border border-gray-700 hover:border-green-500 hover:text-green-400 transition-colors font-bold flex justify-center" title="Flip Horizontal">
                          <span className="text-lg leading-none">↔️</span>
                        </button>
                        <button onClick={() => applyTransform("flip-v")} className="py-2.5 bg-[#151B2B] rounded-lg border border-gray-700 hover:border-green-500 hover:text-green-400 transition-colors font-bold flex justify-center" title="Flip Vertical">
                          <span className="text-lg leading-none">↕️</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preset Ratios</label>
                      <div className="grid grid-cols-2 gap-2">
                        {aspectRatios.map((ratio, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleRatioClick(ratio.value, ratio.circle)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                              aspect === ratio.value && isCircle === (ratio.circle || false) && !customW && !customH
                                ? "bg-green-500/20 border-green-500 text-green-400"
                                : "bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                            }`}
                          >
                            <span className="text-base md:text-lg">{ratio.icon}</span>
                            <span className="text-[11px] md:text-xs font-semibold">{ratio.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Round Corners</label>
                        <span className="text-xs text-green-400 font-bold">{cornerRadius}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(Number(e.target.value))}
                        disabled={isCircle}
                        className={`w-full accent-green-500 h-2 rounded-lg ${isCircle ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      />
                    </div>

                    <div className="mb-5 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                      <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Type Custom Ratio</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="W (e.g. 9)" 
                          value={customW} 
                          onChange={(e) => setCustomW(e.target.value)}
                          className="w-full bg-[#151B2B] text-white p-2.5 rounded-lg outline-none border border-gray-700 focus:border-green-500 text-center text-sm"
                        />
                        <span className="text-gray-500 font-bold">:</span>
                        <input 
                          type="number" 
                          placeholder="H (e.g. 4)" 
                          value={customH} 
                          onChange={(e) => setCustomH(e.target.value)}
                          className="w-full bg-[#151B2B] text-white p-2.5 rounded-lg outline-none border border-gray-700 focus:border-green-500 text-center text-sm"
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Download Format</label>
                      <div className="flex gap-2">
                        {(["image/png", "image/jpeg", "image/webp"] as const).map((format) => (
                          <button
                            key={format}
                            onClick={() => setDownloadFormat(format)}
                            className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold border transition-all ${
                              downloadFormat === format
                                ? "bg-green-500/20 border-green-500 text-green-400"
                                : "bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                            }`}
                          >
                            {format === "image/jpeg" ? "JPG" : format.split('/')[1].toUpperCase()}
                          </button>
                        ))}
                      </div>
                      {downloadFormat === "image/jpeg" && (isCircle || cornerRadius > 0) && (
                        <p className="text-[10px] md:text-xs text-yellow-500 mt-2 text-center">
                          ⚠️ JPG does not support transparency. White background will be applied.
                        </p>
                      )}
                    </div>

                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}