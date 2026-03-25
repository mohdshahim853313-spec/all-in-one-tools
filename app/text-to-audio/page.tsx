"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function TextToAudioTool() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load available voices in the browser
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Set a default voice (preferably an English or Hindi one)
        const defaultVoice = availableVoices.find(v => v.lang.includes('en') || v.lang.includes('hi')) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    // Load initial voices
    loadVoices();

    // Chrome needs this event to load voices properly
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup on unmount
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!text.trim() || typeof window === "undefined" || !window.speechSynthesis) return;

    // If it's paused, just resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set selected voice
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    // Set rate and pitch
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Event listeners for state updates
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
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
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
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
            <p className="text-gray-400 text-sm md:text-base">Listen to your written text in different voices. (AI Voice Reader).</p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300 w-full md:w-auto text-center">
            ← Back to Home
          </Link>
        </div>

        {/* Main Tool Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL - Controls (🔥 FIX: Added lg:sticky lg:top-8) */}
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-8 z-20">
            <div className="bg-[#151B2B] p-5 md:p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <div className="relative">
                <div className="mb-6 border-b border-gray-800 pb-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span>⚙️</span> Voice Settings
                  </h3>
                </div>

                {/* Voice Selection */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Voice / Language</label>
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
                  <p className="text-[10px] md:text-xs text-gray-500 mt-2">
                    * Voices depend on your device and browser.
                  </p>
                </div>

                {/* Speed (Rate) Slider */}
                <div className="mb-6 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Speed (Rate)</label>
                    <span className="text-sm font-bold text-green-400">{rate}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" max="2" step="0.1" 
                    value={rate} 
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Pitch Slider */}
                <div className="mb-6 bg-[#0B0F19] p-4 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Voice Pitch</label>
                    <span className="text-sm font-bold text-green-400">{pitch}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="2" step="0.1" 
                    value={pitch} 
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono">
                    <span>Deep</span>
                    <span>Normal</span>
                    <span>High/Squeaky</span>
                  </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                  <span className="text-blue-400">ℹ️</span>
                  <p className="text-[10px] md:text-xs text-blue-300/80 leading-relaxed">
                  Due to browser security, you cannot directly download this audio as an MP3. This tool is best for listening.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Text Area & Player */}
          <div className="lg:col-span-2 bg-[#151B2B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[400px] lg:min-h-[500px] flex flex-col relative">
            
            {/* Input Area */}
            <div className="flex-1 p-5 md:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-white">Enter Text to Read</label>
                {text.length > 0 && (
                  <button onClick={clearText} className="text-xs text-red-400 hover:text-red-300 hover:underline font-semibold">
                    Clear Text
                  </button>
                )}
              </div>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here and press the Play button..."
                className="w-full flex-1 min-h-[200px] lg:min-h-[250px] p-4 md:p-5 bg-[#0B0F19] border border-gray-700 rounded-xl text-gray-300 outline-none resize-none leading-relaxed focus:border-green-500 transition-colors text-sm md:text-base"
              />
            </div>

            {/* Playback Controls Box */}
            <div className="bg-[#0B0F19] p-5 md:p-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                {/* Status Indicator */}
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
                  ⏹️ Stop
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