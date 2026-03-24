import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 p-8 font-sans selection:bg-blue-500 selection:text-white pb-20">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mb-16 pt-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 tracking-tight">
          All-In-One Tools
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto">
          Aapke daily tasks ke liye sabhi zaroori tools ek hi premium dashboard mein.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        
        {/* 1. Easy + Useful Tools */}
        <div className="bg-[#151B2B] p-7 rounded-2xl border border-gray-800 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 group">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🧠</span> Easy + Useful Tools
          </h2>
          <ul className="space-y-3">
            <li><Link href="/word-counter" className="text-gray-400 hover:text-blue-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">📄</span> Word Counter</Link></li>
            <li><Link href="/text-case-converter" className="text-gray-400 hover:text-blue-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🔠</span> Text Case Converter</Link></li>
            <li><Link href="/remove-spaces" className="text-gray-400 hover:text-blue-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">✂️</span> Remove Extra Spaces</Link></li>
            <li><Link href="/text-compare" className="text-gray-400 hover:text-blue-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">⚖️</span> Text Compare</Link></li>
            <li><Link href="/random-text" className="text-gray-400 hover:text-blue-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🎲</span> Random Text Generator</Link></li>
          </ul>
        </div>

        {/* 2. Utility Tools */}
        <div className="bg-[#151B2B] p-7 rounded-2xl border border-gray-800 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 group">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🔐</span> Utility Tools
          </h2>
          <ul className="space-y-3">
            <li><Link href="/password-generator" className="text-gray-400 hover:text-purple-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🔑</span> Password Generator</Link></li>
            <li><Link href="/qr-generator" className="text-gray-400 hover:text-purple-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">📱</span> QR Code Generator</Link></li>
            <li><Link href="/url-encoder" className="text-gray-400 hover:text-purple-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🔗</span> URL Encoder / Decoder</Link></li>
            <li><Link href="/base64-converter" className="text-gray-400 hover:text-purple-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🔣</span> Base64 Converter</Link></li>
          </ul>
        </div>

        {/* 3. Image & PDF Tools */}
        <div className="bg-[#151B2B] p-7 rounded-2xl border border-gray-800 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-300 group">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🖼️</span> Image & PDF Tools
          </h2>
          <ul className="space-y-3">
            <li><Link href="/image-to-pdf" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🖼️</span> Image to PDF</Link></li>
            <li><Link href="/text-to-pdf" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">📄</span> Text to PDF</Link></li>
            {/* Yahan maine dono links ko merge kar diya hai */}
            <li><Link href="/image-compress" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">📐</span> Image Resize & Compress</Link></li>
            <li><Link href="/image-converter" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🔄</span> Img to JPG/PNG</Link></li>
            <li><Link href="/crop-image" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">✂️</span> Crop Image</Link></li>
            <li><Link href="/blur-image" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">💧</span> Blur Image</Link></li>
            <li><Link href="/add-watermark" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">©️</span> Add Watermark</Link></li>
            <li><Link href="/image-upscale" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">⬆️</span> Image Upscale (Basic)</Link></li>
            <li><Link href="/text-to-audio" className="text-gray-400 hover:text-green-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">🎙️</span> Text to Audio</Link></li>
          </ul>
        </div>

        {/* 4. Unique Tools */}
        <div className="bg-[#151B2B] p-7 rounded-2xl border border-gray-800 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-all duration-300 group">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🎯</span> Unique Tools
          </h2>
          <ul className="space-y-3">
            <li><Link href="/fake-chat" className="text-gray-400 hover:text-pink-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">💬</span> Fake Chat Gen.</Link></li>
            <li><Link href="/yt-title" className="text-gray-400 hover:text-pink-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">▶️</span> YT Title Gen.</Link></li>
            <li><Link href="/insta-caption" className="text-gray-400 hover:text-pink-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">📸</span> Insta Caption Gen.</Link></li>
            <li><Link href="/bio-generator" className="text-gray-400 hover:text-pink-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">📝</span> Bio Generator</Link></li>
            <li><Link href="/hashtag-generator" className="text-gray-400 hover:text-pink-400 font-medium flex items-center transition-colors"><span className="mr-3 text-lg">#️⃣</span> Hashtag Generator</Link></li>
          </ul>
        </div>

      </div>
    </div>
  );
}