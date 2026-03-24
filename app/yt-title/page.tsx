"use client";
import { useState } from "react";
import Link from "next/link";

export default function YTTitleGenerator() {
  const [topic, setTopic] = useState("");
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Viral Title Templates
  const templates = {
    catchy: [
      "The Ultimate Guide to [topic] in 2026",
      "I Tried [topic] For 30 Days (Shocking Results)",
      "Stop Doing [topic] Like This! (Do This Instead)",
      "The Secret Truth About [topic] Everyone Ignores",
      "Why [topic] is the Next BIG Thing!"
    ],
    clickbait: [
      "I Can't Believe What Happened When I Tried [topic]!",
      "[topic] Will CHANGE Your Life Forever!",
      "They Lied to You About [topic]... Here is the Truth!",
      "Do NOT Try [topic] Until You Watch This!",
      "The BIGGEST Mistake You're Making With [topic]"
    ],
    educational: [
      "How to Master [topic] (Step-by-Step Tutorial)",
      "[topic] Explained in Under 10 Minutes",
      "5 Proven Strategies for Better [topic]",
      "Everything You Need to Know About [topic]",
      "Beginner's Complete Guide to [topic]"
    ]
  };

  const generateTitles = () => {
    if (!topic.trim()) {
      alert("Please enter a topic first!");
      return;
    }

    const keyword = topic.trim().charAt(0).toUpperCase() + topic.trim().slice(1);
    let newTitles: string[] = [];

    // Har category se 2-3 random titles uthana aur keyword dalna
    const getRand = (arr: string[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map(t => t.replace(/\[topic\]/g, keyword));
    };

    newTitles = [
      ...getRand(templates.catchy, 3),
      ...getRand(templates.clickbait, 3),
      ...getRand(templates.educational, 2)
    ];

    // Array ko shuffle karna taaki har baar naya feel aaye
    setGeneratedTitles(newTitles.sort(() => 0.5 - Math.random()));
    setCopiedIndex(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-red-500 selection:text-white pb-20">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">▶️</span> YouTube Title Generator
            </h1>
            <p className="text-gray-400">Apne video ke topic ke liye Catchy, Viral aur Clickbait titles generate karein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Input Controls */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Video Topic ya Keyword
                </label>
                <textarea
                  className="w-full h-32 p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none text-white placeholder-gray-600 transition-all mb-4"
                  placeholder="e.g., Coding with AI, Weight loss, Vlogging setup..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                ></textarea>

                <button
                  onClick={generateTitles}
                  className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex justify-center items-center"
                >
                  <span className="mr-2">🚀</span> Generate Viral Titles
                </button>
                
                {generatedTitles.length > 0 && (
                  <button
                    onClick={() => {setTopic(""); setGeneratedTitles([]);}}
                    className="w-full mt-3 py-3 bg-gray-800 text-gray-400 font-bold rounded-xl hover:bg-gray-700 hover:text-white transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Results Area */}
          <div className="lg:col-span-2 bg-[#151B2B] p-6 rounded-2xl border border-gray-800 min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
              <span>Generated Ideas ({generatedTitles.length})</span>
            </h2>
            
            {generatedTitles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
                <span className="text-5xl mb-4 opacity-30">💡</span>
                <p>Left side mein apna topic likhein<br/>aur <b>Generate Viral Titles</b> par click karein.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {generatedTitles.map((title, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-4 bg-[#0B0F19] border border-gray-800 rounded-xl hover:border-red-500/50 transition-colors group"
                  >
                    <p className="text-white text-lg font-medium pr-4">{title}</p>
                    <button
                      onClick={() => copyToClipboard(title, index)}
                      className={`min-w-[80px] px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        copiedIndex === index 
                        ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                        : "bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white border border-transparent"
                      }`}
                    >
                      {copiedIndex === index ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}