"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let charset = "";
    if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    if (charset === "") {
      setPassword("Select an option");
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    setPassword(newPassword);
    setCopied(false);
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = () => {
    if (password && password !== "Select an option") {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 p-8 flex flex-col items-center justify-center font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Main Card */}
      <div className="w-full max-w-md relative group">
        {/* Glow Background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        
        <div className="relative bg-[#151B2B] rounded-2xl p-8 border border-gray-800">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">🔑</span> Password Gen
            </h1>
            <Link href="/" className="text-sm px-4 py-2 bg-[#0B0F19] text-gray-400 hover:text-white border border-gray-800 rounded-lg transition-colors">
              ← Back
            </Link>
          </div>

          {/* Password Display Box */}
          <div className="relative mb-8">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full p-4 pr-24 text-lg font-mono text-white bg-[#0B0F19] border border-gray-800 rounded-xl outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={copyToClipboard}
              className={`absolute right-2 top-2 bottom-2 px-4 rounded-lg font-medium transition-all ${
                copied ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-purple-600 hover:bg-purple-500 text-white"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Length Slider */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <label className="text-gray-400 font-medium">Password Length</label>
              <span className="font-bold text-purple-400 text-lg">{length}</span>
            </div>
            <input
              type="range"
              min="6"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 mb-8">
            {[
              { label: "Uppercase (A-Z)", state: useUppercase, setState: setUseUppercase },
              { label: "Lowercase (a-z)", state: useLowercase, setState: setUseLowercase },
              { label: "Numbers (0-9)", state: useNumbers, setState: setUseNumbers },
              { label: "Symbols (!@#$)", state: useSymbols, setState: setUseSymbols },
            ].map((item, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer group/check">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={item.state} 
                    onChange={() => item.setState(!item.state)} 
                    className="peer sr-only" 
                  />
                  <div className="w-5 h-5 border-2 border-gray-600 rounded bg-[#0B0F19] peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-all"></div>
                  {item.state && <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-gray-300 group-hover/check:text-white transition-colors">{item.label}</span>
              </label>
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePassword}
            className="w-full py-4 bg-[#0B0F19] text-white font-bold rounded-xl hover:bg-gray-800 border border-gray-700 hover:border-purple-500 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            Generate New Password
          </button>
        </div>
      </div>
    </div>
  );
}