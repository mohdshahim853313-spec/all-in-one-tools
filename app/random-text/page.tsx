"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Meaningful English sentences ka collection
const ENGLISH_SENTENCES = [
  "The sun dipped below the horizon, painting the sky in brilliant shades of orange and pink.",
  "In today's fast-paced digital world, technology continues to transform how we live and work.",
  "A gentle breeze rustled the leaves, bringing a sense of calm to the quiet forest.",
  "Artificial intelligence and machine learning are shaping the future of many global industries.",
  "Reading a good book can completely transport you to another universe without leaving your room.",
  "Success is not final, and failure is not fatal; it is the courage to continue that counts.",
  "The vast ocean holds countless mysteries and wonders that we have yet to fully discover.",
  "Coffee is often considered the essential fuel that keeps the modern corporate world running.",
  "Space exploration constantly pushes the boundaries of human knowledge and our understanding of the universe.",
  "Maintaining a healthy lifestyle with proper diet and exercise contributes to a happy life.",
  "Teamwork makes the dream work, especially when tackling complex projects in an organization.",
  "Music has a unique power to heal the soul and unite people across different cultures.",
  "Innovation is the key factor that distinguishes between a true leader and a follower.",
  "Taking a long walk in nature is one of the best ways to clear your mind and reduce stress.",
  "Design is not just what it looks like and feels like, design is how it actually works.",
  "Education is the most powerful weapon which you can use to change the world for the better.",
  "Every great developer knows that writing clean, readable code is an art form.",
  "The coffee shop corner was filled with the soft hum of conversations and the smell of roasted beans.",
  "Overcoming daily challenges is what builds character and leads to long-term personal growth.",
  "A simple smile can brighten someone's day and create a ripple effect of positivity."
];

// Sentences ko tod kar English words ki list banana
const ENGLISH_WORDS = [...new Set(
  ENGLISH_SENTENCES.join(" ")
    .replace(/[.,;]/g, "")
    .toLowerCase()
    .split(" ")
)];

export default function RandomTextGenerator() {
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState<number>(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const getRandomWord = () => ENGLISH_WORDS[Math.floor(Math.random() * ENGLISH_WORDS.length)];

  const getRandomSentence = () => ENGLISH_SENTENCES[Math.floor(Math.random() * ENGLISH_SENTENCES.length)];

  // Paragraph = 4 se 6 meaningful sentences
  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 3) + 4; 
    let paragraph = [];
    for (let i = 0; i < sentenceCount; i++) {
      paragraph.push(getRandomSentence());
    }
    return paragraph.join(" ");
  };

  const generateText = () => {
    let result = [];
    const loopCount = count > 100 ? 100 : count; 

    if (type === "words") {
      for (let i = 0; i < loopCount; i++) {
        result.push(getRandomWord());
      }
      setOutput(result.join(" "));
    } else if (type === "sentences") {
      for (let i = 0; i < loopCount; i++) {
        result.push(getRandomSentence());
      }
      setOutput(result.join(" "));
    } else {
      for (let i = 0; i < loopCount; i++) {
        result.push(generateParagraph());
      }
      setOutput(result.join("\n\n")); 
    }
    setCopied(false);
  };

  useEffect(() => {
    generateText();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-blue-500 selection:text-white pb-20">
      <div className="w-full max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">🎲</span> English Text Generator
            </h1>
            <p className="text-gray-400">Generate sensible and readable English text for your designs.            </p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Text Type</h3>
                <div className="flex flex-col gap-3 mb-6">
                  {["paragraphs", "sentences", "words"].map((t) => (
                    <label key={t} className="flex items-center space-x-3 cursor-pointer group/radio p-3 bg-[#0B0F19] border border-gray-700 rounded-xl hover:border-blue-500 transition-colors">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="textType" 
                          checked={type === t} 
                          onChange={() => setType(t as any)} 
                          className="peer sr-only" 
                        />
                        <div className="w-5 h-5 border-2 border-gray-600 rounded-full bg-[#0B0F19] peer-checked:border-blue-500 transition-all"></div>
                        {type === t && <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full pointer-events-none"></div>}
                      </div>
                      <span className="text-gray-300 capitalize font-medium">{t}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-8">
                  <div className="flex justify-between mb-3 items-center">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
                    <input 
                      type="number" 
                      min="1" max="100" 
                      value={count} 
                      onChange={(e) => setCount(Number(e.target.value))} 
                      className="w-16 bg-[#0B0F19] border border-gray-700 text-white text-center py-1 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={type === "words" ? 100 : 20}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-2 text-right">Max limit: 100</div>
                </div>

                <button
                  onClick={generateText}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex justify-center items-center"
                >
                  <span className="mr-2">⚡</span> Generate English
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#151B2B] p-6 rounded-2xl border border-gray-800 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span>Generated Output</span>
              </h2>
              <button
                onClick={copyToClipboard}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-md flex items-center ${
                  copied 
                  ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                  : "bg-blue-600 text-white hover:bg-blue-500 border border-transparent"
                }`}
              >
                {copied ? "✓ Copied!" : "📋 Copy Text"}
              </button>
            </div>
            
            <textarea
              className="w-full flex-1 p-6 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none resize-none text-gray-300 text-lg leading-relaxed transition-all shadow-inner"
              value={output}
              readOnly
              placeholder="Your random english text will appear here..."
            ></textarea>
          </div>

        </div>
      </div>
    </div>
  );
}