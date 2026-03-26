"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

export default function TextToAudioTool() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Highlight Track karne ke liye state
  const [highlightStart, setHighlightStart] = useState(-1);
  const highlightSpanRef = useRef<HTMLSpanElement>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for tracking live text position
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startIndexRef = useRef(0);
  const currentIndexRef = useRef(0);
  
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        const defaultVoice = availableVoices.find(v => v.lang.includes('en') || v.lang.includes('hi')) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 🔥 FIX 1: Text ko pehle se hi tokens (words aur spaces) mein baant liya taaki DOM shift na ho
  const parsedTokens = useMemo(() => {
    const tokens = [];
    // Split by spaces/newlines but keep the spaces intact
    const parts = text.split(/(\s+)/);
    let currentIdx = 0;
    for (const part of parts) {
      if (!part) continue;
      tokens.push({
        text: part,
        start: currentIdx,
        end: currentIdx + part.length,
        isSpace: /\s+/.test(part),
      });
      currentIdx += part.length;
    }
    return tokens;
  }, [text]);

  /// 🔥 FIX: Auto-Scroll Logic (Manual scroll support ke saath)
  useEffect(() => {
    if (highlightSpanRef.current && !isUserScrolling.current) {
      highlightSpanRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightStart]);

  const handleManualScroll = () => {
    isUserScrolling.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    // 3 second baad wapas auto-scroll shuru ho jayega
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 3000); 
  };

  // LIVE UPDATE MAGIC
  useEffect(() => {
    if (isPlayingRef.current && !isPausedRef.current) {
      const timeout = setTimeout(() => {
        restartFromCurrentPosition();
      }, 400); 
      return () => clearTimeout(timeout);
    }
  }, [rate, pitch, selectedVoice]);

  // Handle word boundary to update highlight
  const handleBoundary = (e: SpeechSynthesisEvent) => {
    const actualStart = startIndexRef.current + e.charIndex;
    currentIndexRef.current = actualStart;
    setHighlightStart(actualStart);
  };

  const restartFromCurrentPosition = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onerror = null;
      currentUtteranceRef.current.onboundary = null;
    }

    window.speechSynthesis.cancel();

    const remainingText = text.substring(currentIndexRef.current);
    if (!remainingText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(remainingText);
    currentUtteranceRef.current = utterance;

    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.rate = rate;
    utterance.pitch = pitch;

    startIndexRef.current = currentIndexRef.current;
    utterance.onboundary = handleBoundary;

    utterance.onend = resetReadingState;
    utterance.onerror = resetReadingState;

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!text.trim() || typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onerror = null;
      currentUtteranceRef.current.onboundary = null;
    }
    window.speechSynthesis.cancel();

    startIndexRef.current = 0;
    currentIndexRef.current = 0;
    setHighlightStart(0);

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;
    
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onboundary = handleBoundary;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = resetReadingState;
    utterance.onerror = resetReadingState;

    window.speechSynthesis.speak(utterance);
  };

  const resetReadingState = () => {
    startIndexRef.current = 0;
    currentIndexRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setHighlightStart(-1);
  };

  const handlePause = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onerror = null;
        currentUtteranceRef.current.onboundary = null;
      }
      window.speechSynthesis.cancel();
      resetReadingState();
    }
  };

  const clearText = () => {
    setText("");
    handleStop();
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-gray-200 selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">🎙️</span> Text to Audio
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Listen with Smooth Auto-Scroll & Makhan Live Highlighting!</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300 w-full md:w-auto text-center">
            ← Back to Home
          </Link>
        </div>

        {/* Main Tool Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL - Controls */}
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-8 z-20">
            <div className="bg-[#151B2B] p-5 md:p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <div className="mb-6 border-b border-gray-800 pb-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span>⚙️</span> Voice Settings
                  </h3>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Voice</label>
                  {voices.length === 0 ? (
                    <div className="p-3 bg-gray-900 rounded-lg text-sm text-gray-500 border border-gray-800">
                      Loading voices...
                    </div>
                  ) : (
                    <select 
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full p-3 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none text-white text-sm focus:border-green-500 transition-colors cursor-pointer"
                    >
                      {voices.map((voice, index) => (
                        <option key={index} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mb-6 bg-[#0B0F19] p-4 rounded-xl border border-gray-700 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Speed (Rate)</label>
                    <span className="text-sm font-bold text-green-400">{rate.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" max="2" step="0.1" 
                    value={rate} 
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 relative z-10"
                  />
                </div>

                <div className="mb-6 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Voice Pitch</label>
                    <span className="text-sm font-bold text-green-400">{pitch.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="2" step="0.1" 
                    value={pitch} 
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Text Area & Player */}
          <div className="lg:col-span-2 bg-[#151B2B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[400px] lg:min-h-[500px] flex flex-col relative">
            
            <div className="flex-1 p-5 md:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-bold text-white">Enter Text to Read</label>
                  {(isPlaying || isPaused) && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 animate-pulse">
                      📖 Reading Mode
                    </span>
                  )}
                </div>
                {text.length > 0 && !(isPlaying || isPaused) && (
                  <button onClick={clearText} className="text-xs text-red-400 hover:text-red-300 hover:underline font-semibold">
                    Clear Text
                  </button>
                )}
              </div>
              
              {/* 🔥 FIX: onTouchMove aur onWheel add kiya hai */}
              {isPlaying || isPaused ? (
                <div 
                  onTouchMove={handleManualScroll}
                  onWheel={handleManualScroll}
                  className="w-full flex-1 min-h-[200px] lg:min-h-[250px] max-h-[400px] overflow-y-auto p-4 md:p-5 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words" style={{scrollbarColor: '#22c55e #0b0f19'}}
                >
                  {parsedTokens.map((token, i) => {
                    const isActive = !token.isSpace && highlightStart >= token.start && highlightStart < token.end;
                    
                    return (
                      <span
                        key={i}
                        ref={isActive ? highlightSpanRef : null}
                        // Ye class transition ko makhan banati hai, aur layout shift rokti hai
                        className={`transition-colors duration-200 ease-in-out ${
                          isActive 
                            ? "bg-green-500/30 text-green-300 shadow-[0_0_8px_rgba(34,197,94,0.4)] rounded-md" 
                            : "text-gray-400 bg-transparent"
                        }`}
                      >
                        {token.text}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text here and press the Play button..."
                  className="w-full flex-1 min-h-[200px] lg:min-h-[250px] p-4 md:p-5 bg-[#0B0F19] border border-gray-700 rounded-xl text-gray-300 outline-none resize-none leading-relaxed focus:border-green-500 transition-colors text-sm md:text-base"
                />
              )}
            </div>

            <div className="bg-[#0B0F19] p-5 md:p-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]' : isPaused ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                <span className="text-sm font-bold text-gray-300">
                  {isPlaying ? "Playing..." : isPaused ? "Paused" : "Ready"}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  className="flex-1 sm:flex-none px-5 py-3 bg-gray-800 text-white rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-sm md:text-base"
                >
                  ⏹️ Stop to Edit
                </button>

                {isPlaying ? (
                  <button 
                    onClick={handlePause}
                    className="flex-1 sm:flex-none px-6 md:px-8 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-xl hover:bg-yellow-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 font-bold text-sm md:text-base"
                  >
                    ⏸️ Pause
                  </button>
                ) : (
                  <button 
                    onClick={handlePlay}
                    disabled={!text.trim()}
                    className="flex-1 sm:flex-none px-6 md:px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 text-sm md:text-base"
                  >
                    {isPaused ? "▶️ Resume" : "▶️ Play Audio"}
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}