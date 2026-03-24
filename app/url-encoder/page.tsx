"use client";
import { useState } from "react";
import Link from "next/link";

export default function URLEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const encodeURL = () => {
    if (!input) return;
    setOutput(encodeURIComponent(input));
  };

  const decodeURL = () => {
    if (!input) return;
    try {
      setOutput(decodeURIComponent(input));
    } catch (error) {
      setOutput("Error: Invalid URL Encoding!");
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-purple-500 selection:text-white pb-20">
      <div className="w-full max-w-4xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">🔗</span> URL Encoder / Decoder
            </h1>
            <p className="text-gray-400">Kisi bhi text ya URL ko safely encode ya decode karein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Box */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Input Text / URL</label>
              <textarea
                className="w-full h-48 p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-white transition-all"
                placeholder="Paste your text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              ></textarea>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={encodeURL} className="py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-all shadow-md">
                  Encode
                </button>
                <button onClick={decodeURL} className="py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-md">
                  Decode
                </button>
              </div>
            </div>

            {/* Output Box */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Result</label>
              <textarea
                className="w-full h-48 p-4 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none resize-none text-green-400 transition-all"
                placeholder="Result will appear here..."
                value={output}
                readOnly
              ></textarea>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={copyToClipboard} 
                  className={`py-3 font-bold rounded-xl transition-all shadow-md ${copied ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-[#0B0F19] border border-gray-700 hover:border-gray-500 text-white"}`}
                >
                  {copied ? "Copied!" : "Copy Result"}
                </button>
                <button onClick={() => {setInput(""); setOutput("");}} className="py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  Clear All
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}