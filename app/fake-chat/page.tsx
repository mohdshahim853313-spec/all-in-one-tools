"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";

type Platform = "whatsapp" | "instagram" | "facebook";
type Message = { id: number; text: string; time: string; isMe: boolean };

export default function FakeChatGenerator() {
  const [platform, setPlatform] = useState<Platform>("whatsapp");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! Kaisi ho?", time: "10:00 AM", isMe: true },
    { id: 2, text: "Main theek hu, tum batao?", time: "10:02 AM", isMe: false },
  ]);
  
  const [msgText, setMsgText] = useState("");
  const [msgTime, setMsgTime] = useState("10:05 AM");
  const [isMe, setIsMe] = useState(true);

  const chatRef = useRef<HTMLDivElement>(null);

  const addMessage = () => {
    if (!msgText) return;
    setMessages([...messages, { id: Date.now(), text: msgText, time: msgTime, isMe }]);
    setMsgText("");
  };

  const removeMessage = (id: number) => {
    setMessages(messages.filter((m) => m.id !== id));
  };

  const downloadChat = async () => {
    if (chatRef.current) {
      try {
        const dataUrl = await toPng(chatRef.current, { 
          quality: 1, 
          pixelRatio: 2 // High Quality image ke liye
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `FakeChat-${platform}.png`;
        link.click();
      } catch (err) {
        console.error("Image download error:", err);
        alert("Image download karne mein error aaya!");
      }
    }
  };

  const themes = {
    whatsapp: {
      bgImage: "/whatsapp_bg.png", 
      myMsg: "bg-[#005c4b] text-[#e9edef]",
      otherMsg: "bg-[#202c33] text-[#e9edef]"
    },
    instagram: {
      bgImage: "/instagram_bg.png", 
      myMsg: "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white",
      otherMsg: "bg-[#262626] text-white"
    },
    facebook: {
      bgImage: "/facebook_bg.png", 
      myMsg: "bg-[#0084ff] text-white",
      otherMsg: "bg-[#3e4042] text-white"
    }
  };

  const currentTheme = themes[platform];

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center font-sans text-gray-200 selection:bg-pink-500 selection:text-white pb-20">
      <div className="w-full max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <span className="mr-3">💬</span> Fake Chat Generator
            </h1>
            <p className="text-gray-400">Add fake chat bubbles to your custom background image.            </p>
          </div>
          <Link href="/" className="text-sm px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Controls */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
              <div className="relative">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Select Platform</h3>
                <div className="flex bg-[#0B0F19] p-1 rounded-xl">
                  {["whatsapp", "instagram", "facebook"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p as Platform)}
                      className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all ${
                        platform === p ? "bg-gray-700 text-white shadow-md" : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {p === "facebook" ? "FB" : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Add Message</h3>
              <div className="space-y-4">
                <textarea 
                  value={msgText} 
                  onChange={(e) => setMsgText(e.target.value)} 
                  placeholder="Type a message..." 
                  className="w-full p-3 h-24 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none focus:border-pink-500 resize-none text-white"
                ></textarea>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Time</label>
                    <input type="text" value={msgTime} onChange={(e) => setMsgTime(e.target.value)} className="w-full p-3 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none focus:border-pink-500 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Who sent?</label>
                    <select value={isMe ? "me" : "them"} onChange={(e) => setIsMe(e.target.value === "me")} className="w-full p-3 bg-[#0B0F19] border border-gray-700 rounded-xl outline-none focus:border-pink-500 text-white appearance-none">
                      <option value="me">Me (Right)</option>
                      <option value="them">Them (Left)</option>
                    </select>
                  </div>
                </div>

                <button onClick={addMessage} className="w-full py-3 bg-pink-600/20 text-pink-400 border border-pink-500/30 font-bold rounded-xl hover:bg-pink-600 hover:text-white transition-all">
                  + Add to Chat
                </button>
              </div>
            </div>

            <button onClick={downloadChat} className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex justify-center items-center text-lg">
              <span className="mr-2">📸</span> Download Image
            </button>
          </div>

          {/* Right Side: Clean Live Preview Area */}
          <div className="lg:col-span-2 flex justify-center items-start bg-[#0B0F19] border border-gray-800 p-8 rounded-2xl">
            
            {/* Overlay Container (No fixed height now, it scales with image) */}
            <div 
              ref={chatRef} 
              className="relative w-full max-w-[380px] shadow-2xl rounded-sm overflow-hidden bg-black"
            >
              {/* Asli Image - Ye background mein rahegi aur box ka size decide karegi */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentTheme.bgImage} 
                alt="Chat Background" 
                className="w-full h-auto block pointer-events-none"
              />

              {/* Messages Area - Image ke upar float karega */}
              <div 
                className="absolute inset-0 flex flex-col p-4 pt-[85px] pb-[75px] overflow-y-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Scrollbar hide karne ke liye
              >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                {platform === "whatsapp" && (
                  <div className="flex justify-center mb-4 mt-2">
                    <span className="bg-[#182229] text-gray-400 text-[11px] px-3 py-1 rounded-lg shadow-sm">TODAY</span>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"} group relative mb-2`}>
                    <div className="relative max-w-[80%] flex flex-col">
                      <div className={`px-3 py-2 text-[15px] leading-snug shadow-sm ${msg.isMe ? currentTheme.myMsg : currentTheme.otherMsg} ${msg.isMe ? "rounded-l-xl rounded-tr-xl rounded-br-sm" : "rounded-r-xl rounded-tl-xl rounded-bl-sm"}`}>
                        {msg.text}
                        <div className={`text-[10px] text-right mt-1 opacity-70 flex justify-end items-center gap-1 ${msg.isMe && platform === "whatsapp" ? "text-blue-400 opacity-100" : ""}`}>
                          {msg.time} {msg.isMe && platform === "whatsapp" && <span className="text-[12px] leading-none">✓✓</span>}
                        </div>
                      </div>

                      <button onClick={() => removeMessage(msg.id)} data-html2canvas-ignore className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}