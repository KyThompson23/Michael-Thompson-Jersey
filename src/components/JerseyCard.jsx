import { useState, useEffect } from "react";
import { getJerseyImages, getPlaceholder } from "../lib/images";
import { getStoredImages } from "../lib/storage";

export default function JerseyCard({ jersey, onClick }) {
  const isSoldOut = jersey.status === "Sold Out";
  const images = getJerseyImages(jersey);
  const [coverSrc, setCoverSrc] = useState(() =>
    images.length > 0 ? images[0].src : getPlaceholder("正面", 0)
  );

  useEffect(() => {
    let cancelled = false;
    getStoredImages(jersey.id).then((stored) => {
      if (cancelled) return;
      const uploaded = stored.find((s) => s.index === 0);
      if (uploaded) {
        setCoverSrc(uploaded.url);
      }
    });
    return () => { cancelled = true; };
  }, [jersey.id]);

  return (
    <div
      onClick={() => !isSoldOut && onClick(jersey)}
      className={`group relative bg-zinc-900/80 border border-white/[0.06] rounded-2xl overflow-hidden
        transition-all duration-500 ease-out
        ${isSoldOut
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-[1.03] hover:border-white/[0.12] hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1"
        }`}
    >
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
        <img
          src={coverSrc}
          alt={jersey.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { e.target.src = getPlaceholder("正面", 0); }}
        />
      </div>

      <div className="absolute bottom-[120px] right-3">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/50 backdrop-blur-md text-white/60">
          {images.length} 张
        </span>
      </div>

      <div className="absolute top-3 left-3 flex gap-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md
          ${jersey.version === "AU"
            ? "bg-[var(--color-jersey-accent)]/90 text-white"
            : "bg-white/10 text-white/80"}`}>
          {jersey.version === "AU" ? "Authentic" : "Swingman"}
        </span>
        {isSoldOut && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/90 text-white backdrop-blur-md">Sold Out</span>
        )}
      </div>

      {!isSoldOut && (
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 backdrop-blur-md border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Available
          </span>
        </div>
      )}

      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-white/90 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {jersey.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{jersey.team}</span>
          <span className="text-lg font-bold text-[var(--color-jersey-gold)]">¥{jersey.price}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span>Size: {jersey.officialSize}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>胸宽 {jersey.measuredWidth}</span>
        </div>
      </div>
    </div>
  );
}
