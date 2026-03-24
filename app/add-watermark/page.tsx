"use client";
import { useState, useRef, useMemo } from "react";
import Link from "next/link";

export default function AdvancedBase64Converter() {
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");

  // --- 1. Text Generator States ---
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [genCopiedText, setGenCopiedText] = useState(false);

  // --- 2. File Generator States ---
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const [fileGeneratedBase64, setFileGeneratedBase64] = useState("");
  const [genCopiedFile, setGenCopiedFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 3. Preview Section (PASTE ZONE) States (NEW) ---
  const [previewPasteInput, setPreviewPasteInput] = useState("");

  // Logic: Parse the pasted Base64 Data URL to determine type and source
  const { mediaPreviewType, mediaPreviewSrc } = useMemo(() => {
    // Basic validation: must start with 'data:' and contain ';base64,'
    if (!previewPasteInput || !previewPasteInput.startsWith("data:") || !previewPasteInput.includes(";base64,")) {
      return { mediaPreviewType: null, mediaPreviewSrc: null };
    }

    // Try extracting mime type from "data:video/mp4;base64,..."
    const mimeMatch = previewPasteInput.match(/^data:([^;]+);base64,/);
    if (mimeMatch) {
      const fullMime = mimeMatch[1]; // e.g., 'video/mp4'
      const broadType = fullMime.split('/')[0]; // e.g., 'video'
      
      if (['image', 'video', 'audio'].includes(broadType)) {
        return { mediaPreviewType: broadType, mediaPreviewSrc: previewPasteInput };
      }
    }
    
    // Valid data URL, but type not image/video/audio
    return { mediaPreviewType: 'invalid', mediaPreviewSrc: null };

  }, [previewPasteInput]);


  // --- Logic: Text to Base64 ---
  const encodeText = () => {
    if (!textInput) return;
    try {
      setTextOutput(btoa(unescape(encodeURIComponent(textInput))));
    } catch (error) {
      setTextOutput("Error: Cannot encode this text.");
    }
  };

  const decodeText = () => {
    if (!textInput) return;
    try {
      setTextOutput(decodeURIComponent(escape(atob(textInput))));
    } catch (error) {
      setTextOutput("Error: Invalid Base64 String!");
    }
  };

  // --- Logic: File to Base64 ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileDetails({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB", // Changed to MB for better scale
      type: file.type || "Unknown File"
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFileGeneratedBase64(reader.result);
      }
    };
    reader.readAsDataURL(file); 
  };

  // Clipboard helper
  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    if (!text || text.startsWith("Error")) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const clearGenerator = () => {
    setTextInput("");
    setTextOutput("");
    setFileDetails(null);
    setFileGeneratedBase64("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearPreviewer = () => {
    setPreviewPasteInput("");
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-purple-500 selection:text-white pb-32">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">⚙️</span> Pro Base64 Converter & Preview
            </h1>
            <p className="text-gray-400">Step 1: Generate Code | Step 2: Paste below for Preview!</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* --- SECTION 1: CODE GENERATOR (UPAR WALA PART) --- */}
        <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg mb-10">
          
          <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-purple-500 pl-3">Step 1: Generate Base64 Code</h2>

          {/* Tabs */}
          <div className="flex bg-[#0B0F19] p-1 rounded-xl mb-8 max-w-sm">
            <button onClick={() => setActiveTab("text")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "text" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              Text Mode
            </button>
            <button onClick={() => setActiveTab("file")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "file" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              File Mode
            </button>
          </div>

          {/* GENERATOR UI (Output generates here) */}
          <div className="bg-[#0B0F19] p-5 rounded-xl border border-gray-700">
            {activeTab === "text" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <textarea className="h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 outline-none resize-none text-white text-sm" placeholder="Paste normal text..." value={textInput} onChange={(e) => setTextInput(e.target.value)}></textarea>
                <textarea className="h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg outline-none resize-none text-green-400 text-xs font-mono" placeholder="Base64 will generate here..." value={textOutput} readOnly></textarea>
                <div className="md:col-span-2 flex gap-3">
                  <button onClick={encodeText} className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-all text-sm">Encode to Base64</button>
                  <button onClick={() => copyToClipboard(textOutput, setGenCopiedText)} disabled={!textOutput} className="py-2.5 px-6 bg-gray-800 text-white font-bold rounded-lg text-sm border border-gray-700 hover:border-gray-600 disabled:opacity-50">
                    {genCopiedText ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
              </div>
            )}
            {activeTab === "file" && (
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <input type="file" onChange={handleFileUpload} ref={fileInputRef} className="hidden" id="file-upload-gen" />
                  <label htmlFor="file-upload-gen" className="cursor-pointer flex flex-col items-center justify-center p-6 h-32 border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl bg-gray-900 transition-all">
                    <span className="text-2xl mb-1">Upload File</span>
                    <span className="text-xs text-gray-500">{fileDetails ? fileDetails.name : "Select Image/Video/Audio"}</span>
                    {fileDetails && <span className="text-[10px] text-purple-400 mt-1">{fileDetails.size}</span>}
                  </label>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <textarea className="flex-1 h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg outline-none resize-none text-green-400 text-xs font-mono" placeholder="Generated code will appear here..." value={fileGeneratedBase64} readOnly></textarea>
                  <button onClick={() => copyToClipboard(fileGeneratedBase64, setGenCopiedFile)} disabled={!fileGeneratedBase64} className="py-2.5 bg-gray-800 text-white font-bold rounded-lg text-sm border border-gray-700 hover:border-gray-600 disabled:opacity-50 flex justify-center items-center gap-2">
                    {genCopiedFile ? "✓ Code Copied!" : "📋 Copy Generated Base64"}
                  </button>
                </div>
              </div>
            )}
            {(textOutput || fileGeneratedBase64) && (
              <button onClick={clearGenerator} className="mt-4 text-xs text-red-400 hover:text-red-300 w-full text-right font-medium">Clear Upar Wala Generator ✕</button>
            )}
          </div>
        </div>


        {/* --- SECTION 2: MANUAL PREVIEWER (NEECHE WALA PART) --- */}
        {/* Is section mein user code paste karega */}
        <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-xl relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
          
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white border-l-4 border-green-500 pl-3">Step 2: Paste Base64 & Preview Tool</h2>
              {previewPasteInput && (
                <button onClick={clearPreviewer} className="text-xs text-red-400 hover:text-red-300 font-medium">✕ Clear Preview Box</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* --- LEFT SIDE: MANUAL PASTE INPUT --- */}
              <div className="bg-[#0B0F19] p-5 rounded-xl border border-gray-700 shadow-inner">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">1. Paste Your Base64 Code Here</label>
                <textarea
                  className="w-full h-80 p-4 bg-gray-900 border-2 border-dashed border-gray-700 focus:border-green-500 outline-none resize-none text-gray-300 font-mono text-xs leading-relaxed transition-all shadow-inner focus:border-solid focus:bg-[#0B0F19]"
                  placeholder="Paste your copied 'data:video/mp4;base64,...' code exactly here to see preview!"
                  value={previewPasteInput}
                  onChange={(e) => setPreviewPasteInput(e.target.value)}
                ></textarea>
                <p className="text-[11px] text-gray-600 mt-2">Neeche wale 'Preview' panel mein player tabhi banega jab valid code paste hoga.</p>
              </div>

              {/* --- RIGHT SIDE: LIVE PREVIEW PANEL --- */}
              <div className="bg-[#0B0F19] p-5 rounded-xl border border-gray-700 shadow-inner h-full md:min-h-96 flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block text-center">2. Live Media Preview Panel</label>
                
                <div className="flex-1 w-full flex justify-center items-center overflow-hidden rounded-lg bg-black/30 border border-gray-800 p-2 min-h-[300px]">
                  
                  {!mediaPreviewType && (
                    <div className="text-center text-gray-600 flex flex-col items-center p-10">
                      <span className="text-5xl mb-4 opacity-30">▶️</span>
                      <p className="font-medium text-gray-500">Left side par Valid Code Paste karein!</p>
                      <p className="text-xs mt-2 max-w-xs text-gray-600">(Code 'data:...' format mein hona chahiye, jaise ki 'Text Mode' Encode karne par deta hai.)</p>
                    </div>
                  )}

                  {mediaPreviewType === 'invalid' && (
                    <div className="text-center text-red-500 flex flex-col items-center p-8 bg-red-950/20 rounded-lg border border-red-900">
                      <span className="text-4xl mb-3">⚠️</span>
                      <p className="font-bold">Invalid Media Code!</p>
                      <p className="text-xs mt-1 text-red-400">Yeh code support nahi hota. Sirf Image, Video, ya Audio ka 'Data URL' code paste karein.</p>
                    </div>
                  )}

                  {mediaPreviewType === 'image' && mediaPreviewSrc && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={mediaPreviewSrc} alt="Base64 Image Preview" className="max-w-full max-h-[350px] object-contain rounded shadow-lg" />
                  )}
                  
                  {mediaPreviewType === 'video' && mediaPreviewSrc && (
                    <video src={mediaPreviewSrc} controls className="max-w-full max-h-[350px] rounded shadow-2xl border-2 border-gray-800" playsInline>
                      Browser not supporting
                    </video>
                  )}
                  
                  {mediaPreviewType === 'audio' && mediaPreviewSrc && (
                    <div className="w-full flex justify-center items-center p-4">
                      <audio src={mediaPreviewSrc} controls className="w-full max-w-sm"></audio>
                    </div>
                  )}

                </div>
                {mediaPreviewType && ['image', 'video', 'audio'].includes(mediaPreviewType) && (
                  <p className="text-center text-xs text-green-500 mt-4 font-medium flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Successfully loaded from pasted code.
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}