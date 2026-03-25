"use client";
import { useState } from "react";
import Link from "next/link";

export default function WordCounter() {
  const [text, setText] = useState("");

  // Logic: Calculate words and characters (Fixed edge cases)
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, "").length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 p-8 flex flex-col items-center justify-center font-sans selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-4xl">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">📄</span> Word Counter
            </h1>
            <p className="text-gray-400">Type or paste your text below; the counting will update in real time.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300 flex items-center">
            ← Back to Home
          </Link>
        </div>

        {/* Text Area with Glow Effect */}
        <div className="relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
          <textarea
            className="relative w-full h-72 p-6 bg-[#151B2B] border border-gray-800 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-lg text-gray-200 placeholder-gray-600 transition-all shadow-inner"
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 border-t-4 border-t-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all text-center">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Words</p>
            <p className="text-5xl font-extrabold text-white">{wordCount}</p>
          </div>
          
          <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 border-t-4 border-t-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all text-center">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Characters</p>
            <p className="text-5xl font-extrabold text-white">{charCount}</p>
          </div>
          
          <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 border-t-4 border-t-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all text-center">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Without Spaces</p>
            <p className="text-5xl font-extrabold text-white">{charNoSpaces}</p>
          </div>
        </div>

        {/* Clear Button */}
        <div className="mt-8 flex justify-center md:justify-end">
          <button
            onClick={() => setText("")}
            className="px-8 py-3 bg-red-500/10 text-red-400 font-semibold rounded-xl hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all duration-300"
          >
            Clear Text
          </button>
        </div>

      </div>
    </div>
  );
}