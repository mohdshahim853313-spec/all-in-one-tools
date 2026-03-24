"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const PAGE_SIZES: Record<string, { name: string; w: number; h: number }> = {
  a4: { name: "A4 (21 x 29.7 cm)", w: 210, h: 297 },
  letter: { name: "Letter (21.59 x 27.94 cm)", w: 215.9, h: 279.4 },
  tabloid: { name: "Tabloid (27.94 x 43.18 cm)", w: 279.4, h: 431.8 },
  legal: { name: "Legal (21.59 x 35.56 cm)", w: 215.9, h: 355.6 },
  statement: { name: "Statement (13.97 x 21.59 cm)", w: 139.7, h: 215.9 },
  executive: { name: "Executive (18.41 x 26.67 cm)", w: 184.1, h: 266.7 },
  a3: { name: "A3 (29.7 x 42 cm)", w: 297, h: 420 },
  a5: { name: "A5 (14.8 x 21 cm)", w: 148, h: 210 },
  b4: { name: "B4 JIS (25.7 x 36.4 cm)", w: 257, h: 364 },
  b5: { name: "B5 JIS (18.2 x 25.7 cm)", w: 182, h: 257 },
  env9: { name: "Envelope #9 (9.84 x 22.54 cm)", w: 98.4, h: 225.4 },
  env10: { name: "Envelope #10 (10.48 x 24.13 cm)", w: 104.8, h: 241.3 },
  csheet: { name: "C size sheet (43.18 x 55.87 cm)", w: 431.8, h: 558.7 },
  envdl: { name: "Envelope DL (11 x 22 cm)", w: 110, h: 220 },
  custom: { name: "Custom Size...", w: 0, h: 0 } 
};

const FONT_SIZES = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];

export default function TextToPdfGenerator() {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSize, setSelectedSize] = useState("a4");
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);

  useEffect(() => {
    import("react-quill-new").then((RQ) => {
      const Quill = RQ.default.Quill;
      if (Quill) {
        // Yahan 'as any' lagana hai ts error hatane ke liye
        const Size = Quill.import('attributors/style/size') as any; 
        Size.whitelist = FONT_SIZES;
        Quill.register(Size, true);
      }
    });
  }, []);

  const { currentWidthMm, currentHeightMm } = useMemo(() => {
    if (selectedSize === "custom") {
      return { currentWidthMm: customWidth, currentHeightMm: customHeight };
    }
    return { 
      currentWidthMm: PAGE_SIZES[selectedSize].w, 
      currentHeightMm: PAGE_SIZES[selectedSize].h 
    };
  }, [selectedSize, customWidth, customHeight]);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'size': FONT_SIZES }], 
      [{ 'font': [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }], 
      ["bold", "italic", "underline", "strike"], 
      [{ color: [] }, { background: [] }], 
      [{ script: "sub" }, { script: "super" }], 
      [{ list: "ordered" }, { list: "bullet" }], 
      [{ align: [] }], 
      ["link", "image"], 
      ["clean"], 
    ],
  }), []);

  const generatePDF = async () => {
    if (!content.trim() || content === "<p><br></p>") {
      alert("Please write some text before generating PDF!");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const html2pdf = (await import("html2pdf.js")).default as any;
      const element = document.getElementById("pdf-export-content");
      
      if (!element) return;
      
      const orientation = currentWidthMm > currentHeightMm ? 'landscape' : 'portrait';
      
      // FIX 1: Explicit mapping for Letter and other formats
      let pdfFormat: any = [currentWidthMm, currentHeightMm];
      const standardFormats = ['a3', 'a4', 'a5', 'letter', 'legal', 'tabloid'];
      if (standardFormats.includes(selectedSize)) {
        pdfFormat = selectedSize;
      }
      
      const opt = {
        margin:       0, 
        filename:     `Document.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true, 
            backgroundColor: '#ffffff',
            logging: false
        },
        jsPDF:        { unit: 'mm', format: pdfFormat, orientation: orientation },
        // 🔥 FIX 2: Better Page Break logic
        pagebreak:    { mode: 'avoid-all', before: '.page-break' }
      };

      await html2pdf().set(opt).from(element).save();
      
    } catch (error) {
      console.error(error);
      alert("Error generating PDF!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-teal-500 selection:text-white pb-32">
      <div className="w-full max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">📄</span> Rich Text to PDF
            </h1>
            <p className="text-gray-400">Fixed: Text cutting and Highlight overlap issues.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-8 z-20">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <div className="mb-6 border-b border-gray-800 pb-6 text-center">
                  <span className="text-5xl mb-4">📝</span>
                  <h3 className="text-white font-bold text-lg">Format Document</h3>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Page Size</label>
                  <select 
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-3 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none text-white text-sm focus:border-teal-500 transition-colors"
                  >
                    {Object.entries(PAGE_SIZES).map(([key, data]) => (
                      <option key={key} value={key}>{data.name}</option>
                    ))}
                  </select>
                </div>

                {selectedSize === "custom" && (
                  <div className="mb-6 grid grid-cols-2 gap-3 bg-[#0B0F19] p-3 rounded-xl border border-gray-700">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Width (mm)</label>
                      <input type="number" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm text-center" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Height (mm)</label>
                      <input type="number" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))} className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm text-center" />
                    </div>
                  </div>
                )}

                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all flex justify-center items-center text-lg disabled:opacity-50"
                >
                  {isGenerating ? "⚙️ Processing..." : "⬇️ Download PDF"}
                </button>
                
                {content && (
                  <button onClick={() => setContent("")} className="w-full mt-4 py-2 bg-transparent text-red-400 text-sm font-bold rounded-xl hover:bg-red-500/10 transition-all">
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-200 rounded-xl overflow-x-auto shadow-2xl border border-gray-700 flex flex-col items-center">
            <style jsx global>{`
              .ql-toolbar.ql-snow {
                background-color: #f3f4f6; 
                border: none !important;
                border-bottom: 1px solid #d1d5db !important;
                padding: 12px !important;
                position: sticky;
                top: 0;
                z-index: 50;
                width: 100%;
              }
              .ql-snow .ql-picker.ql-size .ql-picker-label::before,
              .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: attr(data-value) !important; }
              .ql-snow .ql-picker.ql-size .ql-picker-label:not([data-value])::before,
              .ql-snow .ql-picker.ql-size .ql-picker-item:not([data-value])::before { content: '14px' !important; }

              .ql-container.ql-snow {
                border: none !important;
                display: flex;
                justify-content: center;
                background-color: #e5e7eb; 
                padding: 30px 20px;
                width: 100%;
              }
              
              .ql-editor {
                background-color: white;
                color: black;
                box-shadow: 0 15px 35px rgba(0,0,0,0.15);
                padding: 15mm !important; 
                font-size: 14px;
                border-radius: 4px;
                line-height: 1.6; /* Balanced line height */
                background-image: repeating-linear-gradient(
                  to bottom,
                  white,
                  white ${currentHeightMm - 3}mm,
                  #cbd5e1 ${currentHeightMm - 3}mm,
                  #cbd5e1 ${currentHeightMm}mm
                );
              }

              /* 🔥 Highlight fix: Rang ko word ke charo taraf sametne ke liye */
              .ql-editor span[style*="background-color"] {
                display: inline-block;
                line-height: 1.2;
                padding: 1px 0;
              }
            `}</style>

            <div className="w-full flex flex-col items-center">
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%' }}>
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} placeholder="Type document..."/>
                </div>
                <style dangerouslySetInnerHTML={{__html: `
                  .ql-editor { width: ${currentWidthMm}mm !important; min-height: ${currentHeightMm}mm !important; }
                `}} />
              </div>
            </div>
          </div>
        </div>

        {/* --- EXPORT CONTAINER (Styled specially for PDF) --- */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div id="pdf-export-content" className="bg-white" style={{ width: `${currentWidthMm}mm`, padding: '15mm' }}>
            <style>{`
                #pdf-export-content * { 
                    page-break-inside: avoid; 
                    break-inside: avoid;
                }
                #pdf-export-content p, #pdf-export-content li, #pdf-export-content h1, #pdf-export-content h2, #pdf-export-content h3 {
                    margin-bottom: 10px;
                    line-height: 1.5;
                }
                /* 🔥 Highlight Fix for PDF Rendering */
                #pdf-export-content span[style*="background-color"] {
                    display: inline;
                    background-color: inherit;
                    padding: 2px 0;
                    box-decoration-break: clone;
                    -webkit-box-decoration-break: clone;
                }
            `}</style>
            <div 
              className="ql-editor" 
              dangerouslySetInnerHTML={{ __html: content }} 
              style={{ padding: 0, boxShadow: 'none', minHeight: 'auto', backgroundImage: 'none', width: '100%' }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}