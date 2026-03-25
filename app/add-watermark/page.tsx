"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from "react-konva";

type WatermarkConfig = {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  id: string;
};

// Custom Image Loader
function useCustomImageLoader(file: File | null) {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setImage(undefined);
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    const img = new window.Image();
    img.src = objectUrl;
    img.onload = () => {
      setImage(img);
    };

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return [image, url] as const;
}

export default function InteractiveWatermarkGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [konvaImage, previewUrl] = useCustomImageLoader(file);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings inputs
  const [inputText, setInputText] = useState("© Your Brand");
  const [inputColor, setInputColor] = useState("#FFFFFF");
  const [inputOpacity, setInputOpacity] = useState(60);

  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Container sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0, scale: 1 });

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const textRef = useRef<any>(null);

  // Attach Transformer
  useEffect(() => {
    if (selectedId === watermarkConfig?.id && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, watermarkConfig]);

  // LIVE UPDATE
  useEffect(() => {
    if (konvaImage) {
      setWatermarkConfig((prev) => {
        if (!prev) {
          return {
            x: konvaImage.width / 4, 
            y: konvaImage.height / 4,
            text: inputText || "© Your Brand",
            fontSize: Math.max(30, konvaImage.width / 15),
            color: inputColor,
            opacity: inputOpacity / 100,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            id: "watermark-1",
          };
        } else {
          return {
            ...prev,
            text: inputText,
            color: inputColor,
            opacity: inputOpacity / 100,
          };
        }
      });
      if (!watermarkConfig) setSelectedId("watermark-1");
    }
  }, [konvaImage, inputText, inputColor, inputOpacity]);

  // 🔥 FIX: Native Konva Canvas Scaling (Removes the bulky background box)
  useEffect(() => {
    const updateSize = () => {
      if (konvaImage && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Image width ke hisaab se scale calculate karenge
        const scale = Math.min(containerWidth / konvaImage.width, 1);
        
        setStageSize({
          width: konvaImage.width * scale,
          height: konvaImage.height * scale,
          scale: scale,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [konvaImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setWatermarkConfig(null); 
      setSelectedId(null);
    }
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.attrs.image;
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleDownload = () => {
    if (!stageRef.current) return;
    
    setSelectedId(null); // Hide transformer box before downloading
    
    setTimeout(() => {
      // Scale ke inverse se multiply karke high-quality original resolution download karenge
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 1 / stageSize.scale }); 
      const link = document.createElement("a");
      link.download = `Watermarked_${file?.name || "image.png"}`;
      link.href = dataURL;
      link.click();
    }, 100);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-gray-200 selection:bg-orange-500 selection:text-white pb-32 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-4 md:mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">©️</span> Pro Watermark Image
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Upload an image, drag to position, scale, and rotate your watermark easily.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300 w-full md:w-auto text-center">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
          {/* Editor/Preview Panel - ORDER 1 ON MOBILE, ORDER 2 ON DESKTOP */}
          <div className="order-1 lg:order-2 lg:col-span-3 flex flex-col items-center relative w-full">
            {konvaImage ? (
              <div className="relative flex flex-col items-center w-full max-w-full">
                <div 
                  ref={containerRef}
                  className="w-full flex justify-center rounded-xl overflow-hidden shadow-2xl"
                >
                  {stageSize.width > 0 && (
                    <Stage
                      width={stageSize.width}
                      height={stageSize.height}
                      scale={{ x: stageSize.scale, y: stageSize.scale }}
                      onMouseDown={checkDeselect}
                      onTouchStart={checkDeselect}
                      ref={stageRef}
                    >
                      <Layer>
                        <KonvaImage 
                          image={konvaImage} 
                          width={konvaImage.width} 
                          height={konvaImage.height} 
                        />
                        
                        {watermarkConfig && (
                          <>
                            <Text
                              ref={textRef}
                              {...watermarkConfig}
                              text={watermarkConfig.text}
                              fill={watermarkConfig.color}
                              opacity={watermarkConfig.opacity}
                              fontSize={watermarkConfig.fontSize}
                              draggable
                              onClick={() => setSelectedId(watermarkConfig.id)}
                              onTap={() => setSelectedId(watermarkConfig.id)}
                              onDragEnd={(e) => {
                                setWatermarkConfig({
                                  ...watermarkConfig,
                                  x: e.target.x(),
                                  y: e.target.y(),
                                });
                              }}
                              onTransformEnd={() => {
                                const node = textRef.current;
                                const scaleX = node.scaleX();
                                node.scaleX(1); 
                                node.scaleY(1);
                                setWatermarkConfig({
                                  ...watermarkConfig,
                                  x: node.x(),
                                  y: node.y(),
                                  rotation: node.rotation(),
                                  fontSize: Math.max(10, watermarkConfig.fontSize * scaleX), 
                                });
                              }}
                            />
                            {selectedId === watermarkConfig.id && (
                              <Transformer
                                ref={transformerRef}
                                keepRatio={true} 
                                enabledAnchors={[
                                  "top-left",
                                  "top-right",
                                  "bottom-left",
                                  "bottom-right",
                                ]}
                                boundBoxFunc={(oldBox, newBox) => {
                                  if (newBox.width < 10) return oldBox;
                                  return newBox;
                                }}
                              />
                            )}
                          </>
                        )}
                      </Layer>
                    </Stage>
                  )}
                </div>

                {/* Download Button right under the image */}
                <div className="w-full mt-6 max-w-md">
                  <button 
                    onClick={handleDownload} 
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all flex justify-center items-center text-base md:text-lg shadow-lg uppercase tracking-wide"
                  >
                    <span className="mr-2">⬇️</span> Download Final Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-800 rounded-2xl w-full min-h-[300px] lg:min-h-[500px]">
                <span className="text-5xl md:text-6xl mb-4 opacity-50">🖼️</span>
                <p className="text-sm md:text-base">Upload an image to start watermarking</p>
              </div>
            )}
          </div>

          {/* Controls Panel - ORDER 2 ON MOBILE, ORDER 1 ON DESKTOP */}
          <div className="order-2 lg:order-1 lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-8 z-20">
            <div className="bg-[#151B2B] p-5 md:p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 hover:border-orange-500 rounded-xl bg-[#0B0F19] transition-all mb-6">
                  <span className="text-4xl mb-3 opacity-70">📁</span>
                  <span className="text-white font-bold mb-1 text-center">{file ? `File selected` : "Upload Image"}</span>
                  <span className="text-xs text-gray-500">{file ? formatSize(file.size) : "JPG, PNG, WEBP allowed"}</span>
                </label>

                <div className="mb-5 border-b border-gray-800 pb-4">
                  <h3 className="text-white font-bold text-base md:text-lg">Watermark Settings</h3>
                </div>

                <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Watermark Text
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-white placeholder-gray-600 transition-all mb-5 text-sm"
                  placeholder="e.g., © Your Brand"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Text Colour
                    </label>
                    <input 
                      type="color" 
                      value={inputColor} 
                      onChange={(e) => setInputColor(e.target.value)} 
                      className="w-full h-12 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Opacity
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={inputOpacity} 
                      onChange={(e) => setInputOpacity(Number(e.target.value))} 
                      className="w-full p-3 bg-[#0B0F19] border border-gray-700 rounded-xl text-center text-white outline-none focus:border-orange-500 h-12" 
                    />
                  </div>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-2 text-center">Settings update automatically.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}