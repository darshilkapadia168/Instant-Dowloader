"use client";

import { useState } from "react";
import { Download, Loader2, Link as LinkIcon, Camera, AlertCircle, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [media, setMedia] = useState<{url: string, type: string}[]>([]);
  const [mediaType, setMediaType] = useState<"video" | "image" | "carousel" | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setMedia([]);
    setMediaType(null);
    if (url.includes("/reel/") || url.includes("/tv/")) {
      setError("Reel and Video downloads are currently not supported. Please paste an Image or Carousel link.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch media");
      }

      if (data.data && data.data.media_list && data.data.media_list.length > 0) {
        setMedia(data.data.media_list);
        
        if (data.data.media_list.length > 1) {
          setMediaType("carousel");
        } else {
          const isVideo = data.data.media_list[0].type === 'video';
          setMediaType(isVideo ? "video" : "image");
        }
      } else {
        throw new Error("No media found at this link.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (urlToDownload: string, index: number) => {
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(urlToDownload)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = urlToDownload.includes(".mp4") ? "mp4" : "jpg";
      a.download = `instagram_media_${index + 1}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed, opening in new tab", err);
      window.open(urlToDownload, "_blank");
    }
  };

  const handleDownloadAll = () => {
    media.forEach((m, idx) => {
      setTimeout(() => {
        handleDownload(m.url, idx);
      }, idx * 500);
    });
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col font-sans text-white overflow-hidden">
      
      {/* Top Half: Header & Search Form */}
      <div className="flex-1 flex flex-col justify-end items-center w-full px-4 sm:px-8 pb-6 sm:pb-10">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              InstaFetch
            </h1>
            <p className="mt-4 text-lg text-zinc-400 font-medium">
              Download high-quality Instagram Videos, Photos, and Carousels effortlessly.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl transition-all duration-300 relative z-10">
            <form onSubmit={handleFetch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste Instagram link here..."
                className="block w-full pl-12 sm:pl-14 pr-[90px] sm:pr-32 py-4 sm:py-5 bg-black border border-zinc-800 rounded-xl sm:rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-base sm:text-lg"
              />
              <div className="absolute inset-y-1.5 right-1.5 sm:inset-y-2 sm:right-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-full px-5 sm:px-8 bg-white hover:bg-gray-200 text-black text-sm sm:text-base font-bold rounded-lg sm:rounded-xl transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-black" /> : "Fetch"}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-950 border border-red-900 rounded-xl flex items-center text-red-200 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-500" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Half: Results Area */}
      <div className="flex-1 w-full overflow-y-auto px-4 sm:px-8 pt-6 sm:pt-10">
        <div className="w-full max-w-3xl mx-auto pb-12">
          {media.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {mediaType === "carousel" ? (
                    <><ImageIcon className="w-6 h-6 text-zinc-400" /> Carousel ({media.length} items)</>
                  ) : mediaType === "video" ? (
                    <><VideoIcon className="w-6 h-6 text-zinc-400" /> Video</>
                  ) : (
                    <><ImageIcon className="w-6 h-6 text-zinc-400" /> Image</>
                  )}
                </h2>
                {media.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    className="px-6 py-3 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-200 transition-transform transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-5 h-5" /> Download All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((m, idx) => {
                  const isVideo = m.type === "video";
                  return (
                    <div key={idx} className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors">
                      <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
                        {isVideo ? (
                          <video src={`/api/proxy?url=${encodeURIComponent(m.url)}`} controls className="w-full h-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/proxy?url=${encodeURIComponent(m.url)}`} alt={`Media ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        )}
                      </div>
                      
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:bg-black/60 sm:inset-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 pointer-events-none">
                        <button
                          onClick={() => handleDownload(m.url, idx)}
                          className="pointer-events-auto w-full py-2.5 sm:py-3 bg-white hover:bg-gray-200 text-black font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-transform transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                          <Download className="w-5 h-5" /> Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
