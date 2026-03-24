"use client";
import { useState, useRef, useMemo } from "react";
import Link from "next/link";

export default function AdvancedBase64Converter() {
  // --- States ---
  const [base64Input, setBase64Input] = useState("");
  const [generatedBase64, setGeneratedBase64] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- File Generator Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setGeneratedBase64(reader.result);
        setBase64Input(reader.result); // Auto-fill the input box too
      }
    };
    reader.readAsDataURL(file); 
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setBase64Input("");
    setGeneratedBase64("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Smart Preview Logic ---
  // Ye logic input box ke code ko analyze karke batata hai ki kya dikhana hai
  const previewData = useMemo(() => {
    if (!base64Input.trim()) {
      return { type: "empty", src: null };
    }

    // Check if it's a Data URL (Image/Video/Audio)
    if (base64Input.startsWith("data:")) {
      const mimeMatch = base64Input.match(/^data:([^;]+);base64,/);
      if (mimeMatch) {
        const fullMime = mimeMatch[1]; // e.g., 'video/mp4'
        const broadType = fullMime.split('/')[0]; // e.g., 'video'
        
        if (['image', 'video', 'audio'].includes(broadType)) {
          return { type: broadType, src: base64Input };
        }
      }
      return { type: "invalid_media", src: null }; // Format looks like media, but unsupported
    }

    // Agar 'data:' se start nahi hota, matlab ya toh encoded text hai, ya plain text hai
    // Hum koshish karenge usay decode karne ki
    try {
      const decodedText = decodeURIComponent(escape(atob(base64Input)));
      return { type: "decoded_text", text: decodedText };
    } catch (error) {
      // Agar decode nahi hua, toh user normal text type kar raha hai jisko encode karna hai
      try {
        const encodedText = btoa(unescape(encodeURIComponent(base64Input)));
        return { type: "encoded_text", text: encodedText };
      } catch (err) {
        return { type: "error", src: null };
      }
    }
  }, [base64Input]);


  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-purple-500 selection:text-white pb-32">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">⚙️</span> Ultimate Base64 Studio
            </h1>
            <p className="text-gray-400">Paste any code left, preview media or see text results right. All in one place.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* --- MAIN STUDIO UI --- */}
        <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-2xl relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
          
          <div className="relative">
            
            {/* Quick Tools Bar (Top) */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <input type="file" onChange={handleFileUpload} ref={fileInputRef} className="hidden" id="quick-upload" />
                <label htmlFor="quick-upload" className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 text-sm w-full md:w-auto justify-center">
                  <span>📁</span> Generate from File
                </label>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => copyToClipboard(generatedBase64 || base64Input)} className="flex-1 md:flex-none py-2.5 px-6 bg-gray-800 text-white font-bold rounded-lg text-sm border border-gray-600 hover:bg-gray-700 transition-all">
                  {copied ? "✓ Copied" : "📋 Copy Code"}
                </button>
                <button onClick={clearAll} className="flex-1 md:flex-none py-2.5 px-6 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-lg text-sm border border-red-500/20 transition-all">
                  ✕ Clear All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch h-[600px]">
              
              {/* --- LEFT SIDE: INPUT EDITOR --- */}
              <div className="flex flex-col h-full">
                <div className="bg-gray-800 rounded-t-xl px-4 py-2 border border-gray-700 border-b-0 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Input Box (Paste / Edit Here)</span>
                  <span className="text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded">Editable</span>
                </div>
                <textarea
                  className="flex-1 w-full p-5 bg-[#0B0F19] border border-gray-700 rounded-b-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-gray-300 font-mono text-xs leading-relaxed transition-all shadow-inner"
                  placeholder="Paste your Base64 Code here...
                  
For Media: Must start with 'data:image/png;base64...' or 'data:video/mp4;base64...'
For Text: Paste Base64 string to decode, or type normal text to encode."
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  spellCheck="false"
                ></textarea>
              </div>

              {/* --- RIGHT SIDE: SMART PREVIEW PANEL --- */}
              <div className="flex flex-col h-full">
                <div className="bg-gray-800 rounded-t-xl px-4 py-2 border border-gray-700 border-b-0 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live Preview / Result</span>
                  {previewData.type !== 'empty' && (
                    <span className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded font-bold border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active
                    </span>
                  )}
                </div>
                
                <div className="flex-1 w-full bg-black/40 border border-gray-700 rounded-b-xl p-4 flex justify-center items-center overflow-hidden shadow-inner relative">
                  
                  {/* Empty State */}
                  {previewData.type === 'empty' && (
                    <div className="text-center text-gray-600 flex flex-col items-center">
                      <span className="text-5xl mb-4 opacity-30">👁️</span>
                      <p className="font-medium text-gray-500">Preview Panel Ready</p>
                      <p className="text-xs mt-2 max-w-[250px] text-gray-600">Paste your code on the left to see the magic happen.</p>
                    </div>
                  )}

                  {/* Invalid Media State */}
                  {previewData.type === 'invalid_media' && (
                    <div className="text-center text-red-500 flex flex-col items-center p-6 bg-red-950/20 rounded-xl border border-red-900/50">
                      <span className="text-4xl mb-3">⚠️</span>
                      <p className="font-bold text-sm">Unsupported Media Format</p>
                      <p className="text-xs mt-1 text-red-400/70">The code looks like media but cannot be previewed.</p>
                    </div>
                  )}

                  {/* Image Preview */}
                  {previewData.type === 'image' && previewData.src && (
                    <div className="w-full h-full flex items-center justify-center p-2">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewData.src} alt="Base64 Preview" className="max-w-full max-h-full object-contain rounded drop-shadow-2xl" />
                    </div>
                  )}
                  
                  {/* Video Preview (with Fullscreen controls built-in browser player) */}
                  {previewData.type === 'video' && previewData.src && (
                    <div className="w-full h-full flex items-center justify-center">
                      <video 
                        src={previewData.src} 
                        controls 
                        className="w-full max-h-full rounded-lg shadow-2xl border border-gray-800 bg-black" 
                        playsInline
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  
                  {/* Audio Preview */}
                  {previewData.type === 'audio' && previewData.src && (
                    <div className="w-full flex flex-col justify-center items-center p-8 bg-gray-900 rounded-xl border border-gray-700">
                      <span className="text-5xl mb-6 text-purple-500">🎵</span>
                      <audio src={previewData.src} controls className="w-full max-w-sm"></audio>
                    </div>
                  )}

                  {/* Decoded Text Preview */}
                  {previewData.type === 'decoded_text' && previewData.text && (
                     <div className="w-full h-full flex flex-col">
                       <span className="text-[10px] text-gray-500 mb-2">Decoded Text Result:</span>
                       <textarea className="flex-1 w-full p-4 bg-[#0B0F19] border border-gray-700 rounded-lg outline-none resize-none text-green-400 font-mono text-sm" value={previewData.text} readOnly></textarea>
                     </div>
                  )}

                  {/* Encoded Text Preview */}
                  {previewData.type === 'encoded_text' && previewData.text && (
                     <div className="w-full h-full flex flex-col">
                       <span className="text-[10px] text-gray-500 mb-2">Encoded Base64 Result:</span>
                       <textarea className="flex-1 w-full p-4 bg-[#0B0F19] border border-gray-700 rounded-lg outline-none resize-none text-purple-400 font-mono text-xs" value={previewData.text} readOnly></textarea>
                     </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}