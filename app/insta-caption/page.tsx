"use client";
import { useState } from "react";
import Link from "next/link";

export default function InstaCaptionGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("aesthetic");
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Alag-alag moods (tones) ke liye Viral Templates
  const templates: Record<string, string[]> = {
    aesthetic: [
      "Lost in the magic of [topic] ✨☁️",
      "Romanticizing my life with [topic] 🤍",
      "Just me, my peace, and [topic] 🌿",
      "Vibing with [topic] today 🦋",
      "A core memory: [topic] 🎞️🤎",
      "Finding beauty in [topic] ✨",
      "Golden hour and [topic] 🌅",
      "Keep it simple with [topic] 🕊️"
    ],
    funny: [
      "My relationship status: Committed to [topic] 😂",
      "I’m on a seafood diet. I see [topic], and I eat it 🍕",
      "[topic] is my therapy (and it's cheaper) 🤪",
      "I followed my heart, and it led me to [topic] 🏃‍♂️💨",
      "Reality called, so I hung up and went back to [topic] 📵",
      "They say 'do what you love', so I did [topic] 🤷‍♂️",
      "I need a 6-month vacation twice a year for [topic] 🏖️"
    ],
    motivational: [
      "Hustle for [topic]. Don't stop until you're proud 🚀",
      "Every expert was once a beginner at [topic] 💪",
      "Turn your pain into [topic], and your [topic] into power 💯",
      "Focus on your goals, and let [topic] handle the rest 🌟",
      "Small steps in [topic] every day lead to big results 📈",
      "Believe in [topic] and you're halfway there ✨",
      "Dream big, work hard, and make [topic] happen 🎯"
    ],
    short: [
      "[topic] vibes ✌️",
      "Just [topic] 🖤",
      "POV: [topic] 📸",
      "More [topic], please 🥺",
      "[topic] dump 🗑️✨",
      "Living for [topic] 🥂",
      "Focus: [topic] 👁️"
    ]
  };

  const generateCaptions = () => {
    if (!topic.trim()) {
      alert("Please enter a topic first! (e.g., Coffee, Travel, Gym)");
      return;
    }

    const keyword = topic.trim().toLowerCase();
    
    // Select templates based on chosen tone
    const selectedTemplates = templates[tone];
    
    // Shuffle arrays to get random captions every time
    const shuffled = [...selectedTemplates].sort(() => 0.5 - Math.random());
    
    // Replace [topic] with user's keyword and pick top 5
    const finalCaptions = shuffled.slice(0, 5).map(caption => 
      caption.replace(/\[topic\]/g, keyword)
    );

    setGeneratedCaptions(finalCaptions);
    setCopiedIndex(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-pink-500 selection:text-white pb-20">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">📸</span> Insta Caption Generator
            </h1>
            <p className="text-gray-400">Apni photos ke liye Aesthetic, Funny aur Viral captions generate karein.</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Input & Settings */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Photo Topic / Keyword
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none text-white placeholder-gray-600 transition-all mb-6"
                  placeholder="e.g., Morning Coffee, Gym, Goa Trip..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />

                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Select Vibe (Tone)
                </label>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { id: "aesthetic", icon: "✨", label: "Aesthetic" },
                    { id: "funny", icon: "😂", label: "Funny" },
                    { id: "motivational", icon: "🚀", label: "Motivation" },
                    { id: "short", icon: "✌️", label: "Short" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-1 transition-all border ${
                        tone === t.id 
                        ? "bg-pink-500/20 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]" 
                        : "bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateCaptions}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex justify-center items-center text-lg"
                >
                  <span className="mr-2">✨</span> Generate Captions
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Results Area */}
          <div className="lg:col-span-2 bg-[#151B2B] p-6 rounded-2xl border border-gray-800 min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
              <span>Generated Captions</span>
            </h2>
            
            {generatedCaptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
                <span className="text-5xl mb-4 opacity-30">📱</span>
                <p>Topic daalein aur vibe select karke<br/>apni Instagram post ke liye captions banayein.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {generatedCaptions.map((caption, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-5 bg-[#0B0F19] border border-gray-800 rounded-xl hover:border-pink-500/50 transition-colors group"
                  >
                    <p className="text-white text-lg font-medium pr-4">{caption}</p>
                    <button
                      onClick={() => copyToClipboard(caption, index)}
                      className={`min-w-[80px] px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        copiedIndex === index 
                        ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                        : "bg-[#151B2B] text-gray-300 hover:bg-pink-600 hover:text-white hover:border-pink-500 border border-gray-700"
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