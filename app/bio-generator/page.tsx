"use client";
import { useState } from "react";
import Link from "next/link";

export default function BioGenerator() {
  const [niche, setNiche] = useState("");
  const [hobby, setHobby] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedBios, setGeneratedBios] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Alag-alag tones ke liye Bio Templates
  const templates: Record<string, string[]> = {
    professional: [
      "💼 [niche] | 📈 Helping you level up\n☕ [hobby] enthusiast\n📩 DM for collaborations\n👇 Check my work",
      "Building the future as a [niche] 🚀\nPassionate about [hobby] & growth 💡\nLet's connect! 👇",
      "Award-winning [niche] 🏆\nAdvocate for [hobby] 🌱\nSharing my professional journey here.\n✉️ Contact below",
      "Expert [niche] specializing in creative solutions 🧠\nWhen I'm not working, I'm [hobby] ⏱️\nPortfolio 👇"
    ],
    funny: [
      "Just a [niche] trying to survive on [hobby] 🤪\nProbably late to reply 📱\n👇 Follow my mess",
      "I put the 'pro' in procrastinating [niche] tasks 🙃\nPowered entirely by [hobby] ⛽\nWelcome to my circus 🎪",
      "Professional [niche] by day, superhero [hobby] by night 🦇\n99% coffee, 1% talent ☕\nLink in bio! 👇",
      "Trying to be a serious [niche], but [hobby] keeps distracting me 🤷‍♂️\nAt least I'm funny? 🥺"
    ],
    aesthetic: [
      "✨ [niche] | ☁️ [hobby]\n🤍 creating my own sunshine\n📍 Earth\n🔗 links",
      "romanticizing my life as a [niche] 🤎\nfinding joy in [hobby] 🌿\nchasing dreams ✨\n👇",
      "minimalist [niche] 🕊️\nlover of [hobby] 🎞️\ncapturing moments ✨\nexplore my world 👇",
      "art & soul 🎨 | [niche]\nfinding peace in [hobby] 🌙\nmaking everyday beautiful 🤍"
    ],
    short: [
      "[niche] ⚡ | [hobby] 🖤\nCreating everyday.",
      "Just a [niche] who loves [hobby] ✌️",
      "Focus: [niche] 🎯 | Escape: [hobby] 🌊",
      "Doing [niche] stuff. 💻\nEnjoying [hobby] life. 🌴"
    ]
  };

  const generateBio = () => {
    if (!niche.trim() || !hobby.trim()) {
      alert("Please dono fields (Niche aur Hobby) fill karein!");
      return;
    }

    const keyword1 = niche.trim().charAt(0).toUpperCase() + niche.trim().slice(1);
    const keyword2 = hobby.trim().toLowerCase();
    
    const selectedTemplates = templates[tone];
    const shuffled = [...selectedTemplates].sort(() => 0.5 - Math.random());
    
    // Replace placeholders with user's input
    const finalBios = shuffled.slice(0, 4).map(bio => 
      bio.replace(/\[niche\]/g, keyword1).replace(/\[hobby\]/g, keyword2)
    );

    setGeneratedBios(finalBios);
    setCopiedIndex(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-purple-500 selection:text-white pb-20">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">📝</span> Social Media Bio Generator
            </h1>
            <p className="text-gray-400">Create a perfectly formatted bio for Instagram, Twitter, or YouTube.
            </p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Input & Settings */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Profession / Niche
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white placeholder-gray-600 transition-all mb-4"
                  placeholder="e.g., Web Developer, Fitness Coach..."
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />

                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Hobby / Interest
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white placeholder-gray-600 transition-all mb-6"
                  placeholder="e.g., Coffee, Anime, Traveling..."
                  value={hobby}
                  onChange={(e) => setHobby(e.target.value)}
                />

                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Bio Style
                </label>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { id: "professional", icon: "💼", label: "Pro" },
                    { id: "funny", icon: "😂", label: "Funny" },
                    { id: "aesthetic", icon: "✨", label: "Aesthetic" },
                    { id: "short", icon: "⚡", label: "Short" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-1 transition-all border ${
                        tone === t.id 
                        ? "bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                        : "bg-[#0B0F19] border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateBio}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex justify-center items-center text-lg"
                >
                  <span className="mr-2">🚀</span> Generate Bios
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Results Area */}
          <div className="lg:col-span-2 bg-[#151B2B] p-6 rounded-2xl border border-gray-800 min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
              <span>Ready-to-Use Bios</span>
            </h2>
            
            {generatedBios.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
                <span className="text-5xl mb-4 opacity-30">📝</span>
                <p>Enter your niche and hobby, then click “Generate.”                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedBios.map((bio, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col justify-between p-5 bg-[#0B0F19] border border-gray-800 rounded-xl hover:border-purple-500/50 transition-colors group relative"
                  >
                    {/* Bio Text (Preserving line breaks) */}
                    <div className="text-gray-300 font-medium whitespace-pre-line mb-6 text-[15px] leading-relaxed">
                      {bio}
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(bio, index)}
                      className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                        copiedIndex === index 
                        ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                        : "bg-[#151B2B] text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-500 border border-gray-700"
                      }`}
                    >
                      {copiedIndex === index ? "Copied to Clipboard!" : "Copy Bio"}
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