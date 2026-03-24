"use client";
import { useState } from "react";
import Link from "next/link";
import * as Diff from "diff";

export default function TextCompare() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = () => {
    if (!text1 && !text2) return;
    
    // Words ke hisaab se difference nikalna
    const differences = Diff.diffWordsWithSpace(text1, text2);
    setDiffResult(differences);
    setHasCompared(true);
  };

  const clearAll = () => {
    setText1("");
    setText2("");
    setDiffResult([]);
    setHasCompared(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-blue-500 selection:text-white pb-20">
      <div className="w-full max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">⚖️</span> Text Compare
            </h1>
            <p className="text-gray-400">Do alag-alag text ko compare karein aur unke beech ka difference dekhein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Original Text Box */}
          <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
            <div className="relative">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex justify-between">
                <span>Original Text</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded">Text 1</span>
              </label>
              <textarea
                className="w-full h-64 p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-gray-200 transition-all"
                placeholder="Purana text yahan paste karein..."
                value={text1}
                onChange={(e) => setText1(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Modified Text Box */}
          <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
            <div className="relative">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex justify-between">
                <span>Modified Text</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded">Text 2</span>
              </label>
              <textarea
                className="w-full h-64 p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-gray-200 transition-all"
                placeholder="Naya badla hua text yahan paste karein..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
              ></textarea>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center">
          <button 
            onClick={handleCompare} 
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center text-lg"
          >
            <span className="mr-2">🔍</span> Compare Text
          </button>
          <button 
            onClick={clearAll} 
            className="px-8 py-4 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            Clear All
          </button>
        </div>

        {/* Output Section (Diff Result) */}
        {hasCompared && (
          <div className="bg-[#151B2B] p-8 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
              <span>Comparison Result</span>
              <div className="flex gap-4 text-sm font-normal">
                <span className="flex items-center"><span className="w-3 h-3 bg-red-500/20 border border-red-500 rounded-full mr-2"></span> Removed</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-green-500/20 border border-green-500 rounded-full mr-2"></span> Added</span>
              </div>
            </h2>
            
            <div className="bg-[#0B0F19] border border-gray-700 p-6 rounded-xl text-lg leading-relaxed whitespace-pre-wrap font-mono">
              {diffResult.length > 0 ? (
                diffResult.map((part, index) => {
                  // Logic: Agar text add hua hai toh Green, agar remove hua hai toh Red (with line-through), warna normal text.
                  const colorClass = part.added 
                    ? "bg-green-500/20 text-green-400 border-b border-green-500" 
                    : part.removed 
                    ? "bg-red-500/20 text-red-400 line-through opacity-70" 
                    : "text-gray-300";

                  return (
                    <span key={index} className={colorClass}>
                      {part.value}
                    </span>
                  );
                })
              ) : (
                <span className="text-gray-500 italic">Dono text bilkul same hain, koi difference nahi hai! 🎉</span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}