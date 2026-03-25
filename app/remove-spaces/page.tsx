"use client";
import { useState } from "react";
import Link from "next/link";

export default function RemoveSpaces() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  // Logic 1: Remove double/multiple spaces but keep newlines safe
  const removeExtraSpaces = () => {
    if (!text) return;
    const cleanedText = text.replace(/[ \t]{2,}/g, ' ').trim();
    setText(cleanedText);
  };

  // Logic 2: Remove all extra empty lines (paragraph gaps)
  const removeEmptyLines = () => {
    if (!text) return;
    const cleanedText = text.replace(/\n\s*\n/g, '\n').trim();
    setText(cleanedText);
  };

  // Logic 3: Format completely (Both spaces and lines)
  const formatAll = () => {
    if (!text) return;
    const cleanedText = text.replace(/[ \t]{2,}/g, ' ').replace(/\n\s*\n/g, '\n').trim();
    setText(cleanedText);
  };

  const copyToClipboard = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center justify-center font-sans text-gray-200 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">✂️</span> Remove Extra Spaces
            </h1>
            <p className="text-gray-400">Clean messy and unformatted text in one click.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* Text Area with Glow Effect */}
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
          <textarea
            className="relative w-full h-72 p-6 bg-[#151B2B] border border-gray-800 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-lg text-gray-200 placeholder-gray-600 transition-all shadow-inner"
            placeholder="Paste your text here that contains too many unnecessary spaces or lines..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={removeExtraSpaces} 
            className="py-4 px-4 bg-[#151B2B] border border-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-800 hover:border-blue-500/50 hover:text-blue-400 transition-all shadow-sm flex justify-center items-center"
          >
            <span className="mr-2">🧹</span> Remove Extra Spaces
          </button>
          
          <button 
            onClick={removeEmptyLines} 
            className="py-4 px-4 bg-[#151B2B] border border-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-800 hover:border-blue-500/50 hover:text-blue-400 transition-all shadow-sm flex justify-center items-center"
          >
            <span className="mr-2">🗑️</span> Remove Empty Lines
          </button>
          
          <button 
            onClick={formatAll} 
            className="py-4 px-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm flex justify-center items-center"
          >
            <span className="mr-2">✨</span> Clean Everything
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={copyToClipboard}
            className={`flex-1 py-4 font-bold rounded-xl transition-all shadow-lg ${
              copied 
              ? "bg-green-500/20 text-green-400 border border-green-500/50" 
              : "bg-[#151B2B] text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-500"
            }`}
          >
            {copied ? "✓ Copied to Clipboard!" : "Copy Clean Text"}
          </button>
          
          <button
            onClick={() => setText("")}
            className="px-8 py-4 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all"
          >
            Clear Text
          </button>
        </div>

      </div>
    </div>
  );
}