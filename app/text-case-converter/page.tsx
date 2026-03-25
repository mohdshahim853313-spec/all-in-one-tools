"use client";
import { useState } from "react";
import Link from "next/link";

export default function TextCaseConverter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  
  const toTitleCase = () => {
    const titleCased = text.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
    setText(titleCased);
  };

  const toSentenceCase = () => {
    if (!text) return;
    const sentenceCased = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function(c) {
      return c.toUpperCase();
    });
    setText(sentenceCased);
  };

  const toAlternatingCase = () => {
    const altCased = text.split('').map((char, index) => {
      return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
    }).join('');
    setText(altCased);
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
              <span className="mr-3">🔠</span> Text Case Converter
            </h1>
            <p className="text-gray-400">Type or paste your text, and instantly change the case using the buttons.
            </p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* Text Area */}
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
          <textarea
            className="relative w-full h-64 p-6 bg-[#151B2B] border border-gray-800 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-lg text-gray-200 placeholder-gray-600 transition-all shadow-inner"
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "UPPERCASE", action: toUpperCase },
            { label: "lowercase", action: toLowerCase },
            { label: "Title Case", action: toTitleCase },
            { label: "Sentence case", action: toSentenceCase },
            { label: "aLtErNaTiNg", action: toAlternatingCase },
          ].map((btn, idx) => (
            <button 
              key={idx} 
              onClick={btn.action} 
              className="py-3 px-2 bg-[#151B2B] border border-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-800 hover:border-blue-500/50 hover:text-blue-400 transition-all shadow-sm"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={copyToClipboard}
            className={`flex-1 py-4 font-bold rounded-xl transition-all shadow-lg ${
              copied 
              ? "bg-green-500/20 text-green-400 border border-green-500/50" 
              : "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            }`}
          >
            {copied ? "✓ Copied to Clipboard!" : "Copy Text"}
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