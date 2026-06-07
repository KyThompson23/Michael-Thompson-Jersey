import { useState, useEffect, useRef } from "react";
import { X, Copy, Check, Ruler, Shirt, Calendar, ChevronLeft, ChevronRight, Upload, Camera, Trash2, ImagePlus } from "lucide-react";
import { getJerseyImages, getPlaceholder } from "../lib/images";
import { getStoredImages, uploadImage, deleteStoredImage, deleteAllImages } from "../lib/storage";
import { imageLabelsEn, minImages, maxImages } from "../data/teams";

const WECHAT_ID = "YourWeChatID";

export default function DetailModal({ jersey, onClose, isAdmin = false }) {
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [imageSrcs, setImageSrcs] = useState([]);
  const [uploadedMap, setUploadedMap] = useState({});
  const [uploading, setUploading] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const [mainDragOver, setMainDragOver] = useState(false);
  const [slotCount, setSlotCount] = useState(jersey.imageCount);
  const [fullscreen, setFullscreen] = useState(false);
  const fileRefs = useRef([]);

  const images = getJerseyImages({ ...jersey, imageCount: slotCount });

  // Load images: uploaded first, fallback to local files
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const local = Array.from({ length: maxImages }, (_, i) => {
        const img = images[i];
        return img ? img.src : null;
      });

      const stored = await getStoredImages(jersey.id, jersey.imageFolder);
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
  }, [jersey.id, slotCount]);

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

  const goPrev = () => setActiveImage((i) => (i === 0 ? slotCount - 1 : i - 1));
  const goNext = () => setActiveImage((i) => (i === slotCount - 1 ? 0 : i + 1));

  const addSlot = () => {
    if (slotCount < maxImages) {
      setSlotCount(slotCount + 1);
    }
  };

  const handleFileSelect = async (index, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [index]: true }));
    try {
      const url = await uploadImage(jersey.id, index, file, jersey.imageFolder);
      setImageSrcs((prev) => { const n = [...prev]; n[index] = url; return n; });
      setUploadedMap((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading((prev) => ({ ...prev, [index]: false }));
  };

  const handleClearAll = async () => {
    await deleteAllImages(jersey.id, jersey.imageFolder);
    const srcs = [];
    for (let i = 0; i < maxImages; i++) {
      srcs[i] = images[i]?.src || null;
    }
    setImageSrcs(srcs.map((src, i) => src || getPlaceholder(images[i]?.label || "", i)));
    setUploadedMap({});
    setSlotCount(minImages);
  };

  const handleDeleteSingle = async (index) => {
    await deleteStoredImage(jersey.id, index, jersey.imageFolder);
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
            <div
              className={`relative aspect-square overflow-hidden ${mainDragOver ? "ring-2 ring-[var(--color-jersey-gold)] ring-inset" : ""}`}
              onDragOver={(e) => { if (isAdmin) { e.preventDefault(); setMainDragOver(true); } }}
              onDragLeave={() => setMainDragOver(false)}
              onDrop={(e) => {
                if (!isAdmin) return;
                e.preventDefault();
                setMainDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/")) {
                  handleFileSelect(activeImage, file);
                }
              }}
            >
              <img
                src={activeSrc}
                alt={`${jersey.title}`}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setFullscreen(true)}
                onError={(e) => {
                  e.target.src = getPlaceholder(images[activeImage]?.label || "", activeImage);
                }}
              />
              <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all z-10">
                <ChevronLeft size={18} />
              </button>
              <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all z-10">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/50 backdrop-blur-md text-white/80">
                  {images[activeImage]?.label || ""} / {imageLabelsEn[activeImage] || ""}
                </span>
              </div>
              {uploadedMap[activeImage] && (
                <button
                  onClick={(e) => { e.stopPropagation(); fileRefs.current[activeImage]?.click(); }}
                  className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-green-500/30 text-green-300 backdrop-blur-md hover:bg-green-500/50 transition-colors"
                  title="点击替换"
                >
                  已上传
                </button>
              )}
              {!uploadedMap[activeImage] && isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); fileRefs.current[activeImage]?.click(); }}
                  className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-jersey-gold)] text-zinc-900 text-xs font-semibold hover:brightness-110 transition-all shadow-lg"
                >
                  <Upload size={12} />
                  上传
                </button>
              )}

              {/* Drag overlay */}
              {isAdmin && mainDragOver && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-jersey-gold)]/10 border-2 border-[var(--color-jersey-gold)] border-dashed">
                  <div className="flex flex-col items-center gap-2">
                    <ImagePlus size={32} className="text-[var(--color-jersey-gold)]" />
                    <span className="text-xs text-[var(--color-jersey-gold)] font-medium">松手上传</span>
                  </div>
                </div>
              )}

              {/* Uploading spinner */}
              {uploading[activeImage] && (
                <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[var(--color-jersey-gold)]/30 border-t-[var(--color-jersey-gold)] rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, i) => (
                <div key={i} className="relative flex-shrink-0 group/thumb">
                  <button
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                      ${i === activeImage ? "border-[var(--color-jersey-gold)]" : "border-transparent opacity-50 hover:opacity-80"}`}
                  >
                    <img
                      src={imageSrcs[i] || getPlaceholder(img.label, i)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = getPlaceholder(img.label, i); }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors flex items-end justify-center pb-1">
                      <span className="text-[9px] text-white/0 group-hover/thumb:text-white/90 transition-opacity font-medium">{img.label}</span>
                    </div>
                  </button>

                  {/* Admin: upload icon on each thumbnail */}
                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileRefs.current[i]?.click();
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--color-jersey-gold)] text-zinc-900 flex items-center justify-center
                          opacity-0 group-hover/thumb:opacity-100 transition-all hover:scale-110 z-10 shadow-md"
                        title={`替换 ${img.label}`}
                      >
                        <Upload size={10} />
                      </button>
                      {uploadedMap[i] && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSingle(i); }}
                          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center
                            opacity-0 group-hover/thumb:opacity-100 transition-all hover:scale-110 z-10 shadow-md"
                          title="删除此图"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </>
                  )}

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

              {/* Add more photo slot button */}
              {isAdmin && slotCount < maxImages && (
                <button
                  onClick={addSlot}
                  className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-dashed border-zinc-700 hover:border-[var(--color-jersey-gold)] transition-all flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-[var(--color-jersey-gold)] group/add"
                  title="添加新图位"
                >
                  <ImagePlus size={18} className="transition-transform group-hover/add:scale-110" />
                  <span className="text-[9px] font-medium">添加</span>
                </button>
              )}
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
                {hasUploads && <span className="text-xs text-green-400">({Object.keys(uploadedMap).length} 已上传)</span>}
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

              {/* Admin edit panel — always visible when admin */}
              {isAdmin && (
              <div className="border border-[var(--color-jersey-gold)]/20 rounded-xl p-4 space-y-3 bg-[var(--color-jersey-gold)]/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-jersey-gold)]">
                    <Camera size={14} />
                    <span className="text-xs font-semibold">管理图片</span>
                    <span className="text-[10px] text-zinc-500">({Object.keys(uploadedMap).length}/{slotCount} 张)</span>
                  </div>
                  {hasUploads && (
                    <button onClick={handleClearAll} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={12} />
                      清空全部
                    </button>
                  )}
                </div>

                {/* Upload grid */}
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
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                          <Upload size={16} className="text-white/0 group-hover:text-white/80 transition-all" />
                        </div>
                        {uploading[i] && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-[var(--color-jersey-gold)]/30 border-t-[var(--color-jersey-gold)] rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between px-0.5">
                        <p className="text-[9px] text-zinc-500 leading-tight">{img.label}</p>
                        {uploadedMap[i] && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSingle(i); }}
                            className="text-red-400/60 hover:text-red-400 transition-colors"
                            title="删除"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add slot button in grid */}
                  {slotCount < maxImages && (
                    <button
                      onClick={addSlot}
                      className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-[var(--color-jersey-gold)] transition-all flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-[var(--color-jersey-gold)] group/add"
                      title="添加新图位"
                    >
                      <ImagePlus size={20} className="transition-transform group-hover/add:scale-110" />
                      <span className="text-[9px]">加图位</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500">
                  💡 大图区可直接拖拽替换，缩略图悬停有上传按钮。至少需传 {minImages} 张，最多 {maxImages} 张。
                </p>
              </div>
              )}

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

      {/* Fullscreen image viewer */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setFullscreen(false);
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
          }}
          tabIndex={0}
          ref={(el) => el?.focus()}
        >
          {/* Close */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Image */}
          <img
            src={activeSrc}
            alt={jersey.title}
            className="max-w-full max-h-full object-contain p-8"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.src = getPlaceholder(images[activeImage]?.label || "", activeImage);
            }}
          />

          {/* Info bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <span className="px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm backdrop-blur-sm">
              {images[activeImage]?.label || ""} / {imageLabelsEn[activeImage] || ""}
            </span>
            <span className="text-white/40 text-sm">
              {activeImage + 1} / {slotCount}
            </span>
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all
                  ${i === activeImage ? "border-[var(--color-jersey-gold)]" : "border-white/20 opacity-50 hover:opacity-80"}`}
              >
                <img
                  src={imageSrcs[i] || getPlaceholder(img.label, i)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
