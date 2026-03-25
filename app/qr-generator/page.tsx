"use client";
import { useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://gsatyping.in");
  const [size, setSize] = useState(200);

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "AllInOne-QRCode.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8 flex flex-col items-center justify-center font-sans text-gray-200 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Side: Inputs */}
        <div className="w-full md:w-1/2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <span className="mr-3">📱</span> QR Code Gen
            </h1>
          </div>
          <p className="text-gray-400 mb-8">Enter any link, text, or UPI ID and instantly generate a QR code.
          </p>

          <div className="bg-[#151B2B] p-6 rounded-2xl border border-gray-800 shadow-lg relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">Enter text or URL.</label>
              <textarea
                className="w-full h-32 p-4 bg-[#0B0F19] border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-white placeholder-gray-600 transition-all mb-6"
                placeholder="e.g., https://youtube.com ya apna naam..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></textarea>

              <div className="mb-2 flex justify-between">
                <label className="text-sm font-medium text-gray-400">QR Code Size</label>
                <span className="text-purple-400 font-bold">{size}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="350"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-6"
              />

              <button
                onClick={() => setText("")}
                className="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
              >
                Clear Input
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/" className="inline-block px-5 py-2.5 bg-[#151B2B] text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-300">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-[#151B2B] p-8 rounded-2xl border border-gray-800 h-full min-h-[400px]">
          {text ? (
            <>
              <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all">
                <QRCodeCanvas 
                  id="qr-canvas"
                  value={text} 
                  size={size} 
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"} 
                  includeMargin={false}
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="mt-8 px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center"
              >
                <span className="mr-2">⬇️</span> Download QR Image
              </button>
            </>
          ) : (
            <div className="text-gray-500 flex flex-col items-center text-center">
              <span className="text-4xl mb-4 opacity-50">📱</span>
              <p>QR Code dekhne ke liye<br/>type anything</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}