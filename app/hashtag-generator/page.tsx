"use client";

import { useState } from "react";
import Link from "next/link";

export default function HashtagGenerator() {
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Expanded & Smart Offline Tag Database
  const tagDatabase: Record<string, string[]> = {
    // Entertainment & Comedy
    comedy: ["funny", "comedyvideo", "funnymemes", "humor", "joke", "desicomedy", "lol", "laugh", "standup", "hilarious"],
    funny: ["comedy", "memes", "fun", "lmao", "funnymoments", "jokes", "trendingreels", "dailymemes"],
    dog: ["dogsofinstagram", "puppy", "doglover", "dogoftheday", "petsofinstagram", "cute", "doglife", "pet"],
    desi: ["india", "mumbai", "delhi", "desimemes", "indian", "bollywood", "trendingindia", "reelsindia", "indiancreators"],
    
    // Tech & Coding
    python: ["pythonprogramming", "coding", "developer", "tech", "programmer", "software", "pythoncode", "coder", "webdev"],
    coding: ["programming", "developer", "javascript", "code", "tech", "coderlife", "softwaredeveloper", "webdevelopment"],
    tech: ["technology", "techgadgets", "innovation", "instatech", "gadgets", "techtrends", "futuretech"],
    
    // Lifestyle & Other
    fitness: ["workout", "gym", "fitfam", "health", "bodybuilding", "fitnessmotivation", "fit", "training"],
    travel: ["wanderlust", "travelgram", "explore", "vacation", "nature", "travelblogger", "adventure"],
    food: ["foodie", "foodporn", "instafood", "yummy", "delicious", "foodphotography", "foodblogger"],
    vlog: ["vlogger", "youtube", "dailyvlog", "lifestyle", "creator", "contentcreator", "minivlog"],
  };

  const platforms = [
    { name: "Instagram", icon: "📸" },
    { name: "TikTok", icon: "🎵" },
    { name: "Twitter / X", icon: "🐦" },
    { name: "YouTube", icon: "▶️" },
  ];

  const stopWords = ["is", "the", "in", "on", "at", "for", "with", "a", "an", "and", "of", "to", "aur", "hai", "ka", "ki", "mein", "pe", "ko", "se", "ye", "wo"];

  const generateHashtags = () => {
    if (!keyword.trim()) return;
    setIsGenerating(true);
    setCopied(false);

    setTimeout(() => {
      // Use Set to automatically prevent duplicate hashtags
      let tagsSet = new Set<string>();
      
      // Split user input by spaces to handle multiple words/sentences
      const words = keyword.toLowerCase().split(/\s+/);
      
      // Clean and filter words
      const validWords = words
        .map(w => w.replace(/[^a-z0-9]/g, "")) // Remove special chars
        .filter(w => w.length > 2 && !stopWords.includes(w)); // Remove short words and stop words

      // 1. Add the exact words the user typed
      validWords.forEach(w => tagsSet.add(w));

      // 2. Check Database for each word
      validWords.forEach(word => {
        for (const [category, categoryTags] of Object.entries(tagDatabase)) {
          // If the word matches a category or is very similar
          if (category.includes(word) || word.includes(category)) {
            categoryTags.forEach(tag => tagsSet.add(tag));
          }
        }
      });

      // 3. Add Platform Specific Viral Tags
      if (platform === "Instagram") {
        ["instagood", "explorepage", "viral", "trending", "explore"].forEach(t => tagsSet.add(t));
      } else if (platform === "TikTok") {
        ["fyp", "foryou", "viral", "trending", "tiktok", "foryoupage"].forEach(t => tagsSet.add(t));
      } else if (platform === "Twitter / X") {
        ["trending", "viralpost", "breaking"].forEach(t => tagsSet.add(t));
      } else if (platform === "YouTube") {
        ["youtube", "youtuber", "subscribe", "viralvideo", "shorts", "youtubeshorts"].forEach(t => tagsSet.add(t));
      }

      // Convert Set back to array, shuffle, and limit to 30 tags
      let finalTags = Array.from(tagsSet);
      finalTags = finalTags.sort(() => 0.5 - Math.random()).slice(0, 30);
      
      // If still no tags (very rare), provide fallbacks
      if (finalTags.length === 0) {
        finalTags = ["viral", "trending", "explore", "foryou", "newpost"];
      }
      
      setGeneratedTags(finalTags);
      setIsGenerating(false);
    }, 500);
  };

  const copyToClipboard = () => {
    const textToCopy = generatedTags.map(tag => `#${tag}`).join(" ");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 font-sans text-gray-200 selection:bg-purple-500 selection:text-white pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3 text-purple-500">#️⃣</span> Smart Hashtag Gen.
            </h1>
            <p className="text-gray-400">Generate perfect viral hashtags for Instagram, TikTok, or YouTube.
            </p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>

        {/* Main Tool Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL - Inputs */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-8 z-20">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                {/* Keyword Input */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topic or Keyword</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Funny comedy video" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full p-4 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none text-white text-sm focus:border-purple-500 transition-colors placeholder-gray-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-2">You can also write a complete sentence.
                  </p>
                </div>

                {/* Platform Selection */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Platform</label>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => setPlatform(p.name)}
                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border flex flex-col items-center justify-center gap-1 ${
                          platform === p.name 
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                          : "bg-[#0B0F19] border-gray-800 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        <span className="text-lg">{p.icon}</span>
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateHashtags}
                  disabled={!keyword.trim() || isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚙️</span> Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="group-hover/btn:-translate-y-1 transition-transform duration-300">🚀</span> Generate Hashtags
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Output */}
          <div className="lg:col-span-2 bg-[#151B2B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[450px] p-6 md:p-8 flex flex-col relative">
            <div className="border-b border-gray-800 pb-4 mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Ready-to-Use Hashtags</h2>
                {generatedTags.length > 0 && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                        {generatedTags.length} Tags Generated
                    </span>
                )}
            </div>
            
            {generatedTags.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 pb-10">
                <span className="text-7xl mb-4 opacity-40">📄</span>
                <p className="text-center max-w-sm leading-relaxed">
                Enter your niche, keyword, or full topic on the left side, then click “Generate.”

                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
                
                {/* Visual Tags Cloud */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {generatedTags.map((tag, idx) => (
                        <span key={idx} className="bg-[#0B0F19] border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-sm hover:border-purple-500 hover:text-purple-300 transition-colors cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Textarea for easy editing */}
                <div className="relative w-full flex-1 min-h-[120px] mb-6">
                    <textarea 
                        readOnly
                        value={generatedTags.map(t => `#${t}`).join(" ")}
                        className="w-full h-full p-4 bg-[#0B0F19] border border-gray-700 rounded-xl text-purple-300 outline-none resize-none leading-relaxed"
                    />
                </div>

                {/* Copy Button */}
                <button 
                    onClick={copyToClipboard}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border ${
                        copied 
                        ? "bg-green-500/20 border-green-500 text-green-400" 
                        : "bg-[#0B0F19] border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500"
                    }`}
                >
                    {copied ? (
                        <><span>✅</span> Copied to Clipboard!</>
                    ) : (
                        <><span>📋</span> Copy All Hashtags</>
                    )}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}