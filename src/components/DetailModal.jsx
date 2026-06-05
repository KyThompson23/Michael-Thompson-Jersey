import { useState, useEffect, useRef } from "react";
import { X, Copy, Check, Ruler, Shirt, Calendar, ChevronLeft, ChevronRight, Upload, Camera, Trash2 } from "lucide-react";
import { getJerseyImages, getPlaceholder } from "../lib/images";
import { getStoredImages, uploadImage, deleteStoredImage, deleteAllImages } from "../lib/storage";
import { imageLabelsEn, maxImages } from "../data/teams";

const WECHAT_ID = "YourWeChatID";

export default function DetailModal({ jersey, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [imageSrcs, setImageSrcs] = useState([]);
  const [uploadedMap, setUploadedMap] = useState({});
  const [uploading, setUploading] = useState({});
  const [dragOver, setDragOver] = useState(null); // which slot index is being dragged over
  const fileRefs = useRef([]);

  const images = getJerseyImages(jersey);

  // Load images: Blob API (prod) or IndexedDB (dev), fallback to local files
  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Start with local file paths
      const local = Array.from({ length: maxImages }, (_, i) => {
        const img = images[i];
        return img ? img.src : null;
      });

      // Check storage for uploaded images
      const stored = await getStoredImages(jersey.id);
      const map = {};
      const srcs = [...local];
      stored.forEach(({ index, url }) => {
        map[index] = true;
        srcs[index] = url;
      });

      if (!cancelled) {
        setUploadedMap(map);
        setImageSrcs(srcs.map((src, i) => src || getPlaceholder(images[i]?.label || "", i)));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [jersey.id]);

  const activeSrc = imageSrcs[activeImage] || getPlaceholder(images[activeImage]?.label || "", activeImage);

  const handleCopyWeChat = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_ID);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = WECHAT_ID;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goPrev = () => setActiveImage((i) => (i === 0 ? maxImages - 1 : i - 1));
  const goNext = () => setActiveImage((i) => (i === maxImages - 1 ? 0 : i + 1));

  const handleFileSelect = async (index, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [index]: true }));
    try {
      const url = await uploadImage(jersey.id, index, file);
      setImageSrcs((prev) => { const n = [...prev]; n[index] = url; return n; });
      setUploadedMap((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading((prev) => ({ ...prev, [index]: false }));
  };

  const handleClearAll = async () => {
    await deleteAllImages(jersey.id);
    const srcs = [];
    for (let i = 0; i < maxImages; i++) {
      srcs[i] = images[i]?.src || null;
    }
    setImageSrcs(srcs.map((src, i) => src || getPlaceholder(images[i]?.label || "", i)));
    setUploadedMap({});
  };

  const handleDeleteSingle = async (index) => {
    await deleteStoredImage(jersey.id, index);
    setImageSrcs((prev) => {
      const n = [...prev];
      n[index] = images[index]?.src || getPlaceholder(images[index]?.label || "", index);
      return n;
    });
    setUploadedMap((prev) => {
      const n = { ...prev };
      delete n[index];
      return n;
    });
  };

  const hasUploads = Object.keys(uploadedMap).length > 0;

  if (!jersey) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-900 border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row overflow-y-auto flex-1">
          {/* Image Area */}
          <div className="md:w-1/2 bg-zinc-950 flex flex-col">
            <div className="relative aspect-square overflow-hidden">
              <img
                src={activeSrc}
                alt={`${jersey.title}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = getPlaceholder(images[activeImage]?.label || "", activeImage);
                }}
              />
              <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/50 backdrop-blur-md text-white/80">
                  {images[activeImage]?.label || ""} / {imageLabelsEn[activeImage] || ""}
                </span>
              </div>
              {uploadedMap[activeImage] && (
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-green-500/30 text-green-300 backdrop-blur-md">已上传</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all group
                    ${i === activeImage ? "border-[var(--color-jersey-gold)]" : "border-transparent opacity-50 hover:opacity-80"}`}
                >
                  <img
                    src={imageSrcs[i] || getPlaceholder(img.label, i)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = getPlaceholder(img.label, i); }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center pb-1">
                    <span className="text-[9px] text-white/0 group-hover:text-white/90 transition-opacity font-medium">{img.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex-1 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white leading-snug mb-1">{jersey.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">{jersey.team}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="text-sm text-zinc-500">{jersey.year}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${jersey.version === "AU"
                    ? "bg-[var(--color-jersey-accent)]/20 text-[var(--color-jersey-accent)] border border-[var(--color-jersey-accent)]/30"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700"}`}>
                  {jersey.version === "AU" ? "Authentic 球员版" : "Swingman 球迷版"}
                </span>
                <span className="text-xs text-zinc-600">{images.length} photos</span>
                {hasUploads && <span className="text-xs text-green-400">({Object.keys(uploadedMap).length} cloud)</span>}
              </div>

              <div className="bg-gradient-to-br from-[var(--color-jersey-gold)]/10 to-transparent border border-[var(--color-jersey-gold)]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler size={16} className="text-[var(--color-jersey-gold)]" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">实测胸宽 / Chest Width</span>
                </div>
                <span className="text-3xl font-black text-[var(--color-jersey-gold)] tracking-tight">{jersey.measuredWidth}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Shirt size={14} className="text-zinc-500" /><span className="text-xs text-zinc-500">Official Size</span></div>
                  <span className="text-sm font-semibold text-white">{jersey.officialSize}</span>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Calendar size={14} className="text-zinc-500" /><span className="text-xs text-zinc-500">Season</span></div>
                  <span className="text-sm font-semibold text-white">{jersey.year}</span>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">{jersey.description}</p>

              {/* Edit Photos */}
              <div className="border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                      ${editMode ? "text-[var(--color-jersey-gold)]" : "text-zinc-500 hover:text-white"}`}
                  >
                    <Camera size={14} />
                    {editMode ? "收起" : "Edit Photos"}
                  </button>
                  {hasUploads && (
                    <button onClick={handleClearAll} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={12} />
                      Clear all
                    </button>
                  )}
                </div>

                {editMode && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="space-y-1.5">
                        <div
                          className={`aspect-square rounded-lg overflow-hidden bg-zinc-800 border cursor-pointer relative group transition-all
                            ${dragOver === i ? "border-[var(--color-jersey-gold)] ring-2 ring-[var(--color-jersey-gold)]/30 scale-105" : "border-white/[0.06]"}`}
                          onClick={() => fileRefs.current[i]?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                          onDragLeave={() => setDragOver(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(null);
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith("image/")) {
                              handleFileSelect(i, file);
                            }
                          }}
                        >
                          <img
                            src={imageSrcs[i] || getPlaceholder(img.label, i)}
                            alt={img.label}
                            className="w-full h-full object-cover"
                          />
                          {uploadedMap[i] && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSingle(i); }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-all z-10"
                              title="Delete"
                            >
                              <X size={11} />
                            </button>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                            <Upload size={16} className="text-white/0 group-hover:text-white/80 transition-all" />
                          </div>
                          {uploading[i] && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-[var(--color-jersey-gold)]/30 border-t-[var(--color-jersey-gold)] rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-500 text-center leading-tight">{img.label}</p>
                        <input
                          ref={(el) => (fileRefs.current[i] = el)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleFileSelect(i, e.target.files[0]);
                            e.target.value = "";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {editMode && (
                  <p className="text-[10px] text-zinc-600">
                    Click or drag & drop photos. Cloud storage (prod) / local browser (dev).
                  </p>
                )}
              </div>
            </div>

            {/* Price & CTA */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Price</span>
                <span className="text-2xl font-bold text-[var(--color-jersey-gold)]">¥{jersey.price}</span>
              </div>
              <button
                onClick={handleCopyWeChat}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                  ${copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-[var(--color-jersey-gold)] text-zinc-900 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"}`}
              >
                {copied ? (<><Check size={18} />WeChat ID Copied!</>) : (<><Copy size={18} />Copy WeChat ID to Buy</>)}
              </button>
              <p className="text-xs text-zinc-600 text-center">
                WeChat: <span className="text-zinc-400 font-mono">{WECHAT_ID}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
