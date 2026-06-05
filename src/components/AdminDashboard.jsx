import { useState } from "react";
import { teams, versions } from "../data/teams";
import { Plus, Shirt, Ruler, Tag, Hash, Lock, LogIn, X, FolderOpen } from "lucide-react";

export default function AdminDashboard({ onAddJersey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    team: teams[0],
    version: "SW",
    price: "",
    status: "In Stock",
    measuredWidth: "",
    officialSize: "XS",
    year: "",
    imageFolder: "",
    imageCount: 5,
    description: "",
  });

  const handleLogin = () => {
    if (password === "123456") {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.measuredWidth) return;

    const imageFolder = form.imageFolder || `custom-${Date.now()}`;
    const newJersey = {
      id: Date.now(),
      title: form.title,
      team: form.team,
      version: form.version,
      price: Number(form.price),
      status: form.status,
      measuredWidth: form.measuredWidth,
      officialSize: form.officialSize,
      year: form.year || "2024-25",
      imageFolder,
      imageCount: Number(form.imageCount),
      description: form.description || `${form.title} - ${form.team} ${form.version === "AU" ? "Authentic" : "Swingman"} 球衣。`,
    };

    onAddJersey(newJersey);
    setForm({
      title: "",
      team: teams[0],
      version: "SW",
      price: "",
      status: "In Stock",
      measuredWidth: "",
      officialSize: "XS",
      year: "",
      imageFolder: "",
      imageCount: 5,
      description: "",
    });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 hover:scale-110 transition-all duration-300 shadow-lg"
        title="Admin"
      >
        <Lock size={18} />
      </button>

      {/* Admin Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => {
            setIsOpen(false);
            setAuthenticated(false);
            setError("");
            setPassword("");
          }}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-zinc-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-white">
                <Shirt size={20} className="text-[var(--color-jersey-gold)]" />
                <span className="font-semibold">Admin Dashboard</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setAuthenticated(false);
                  setError("");
                  setPassword("");
                }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {!authenticated ? (
                /* Login */
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400">Enter admin password to continue.</p>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Password"
                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors"
                  />
                  {error && <p className="text-xs text-[var(--color-jersey-accent)]">{error}</p>}
                  <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-jersey-gold)] text-zinc-900 font-semibold text-sm hover:brightness-110 transition-all"
                  >
                    <LogIn size={16} />
                    Unlock
                  </button>
                </div>
              ) : (
                /* Add Jersey Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Add New Jersey</p>

                  {/* Title */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                      <Hash size={12} /> Title
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="e.g. LeBron James #23 Lakers Home"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors"
                    />
                  </div>

                  {/* Team & Version */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        <Shirt size={12} /> Team
                      </label>
                      <select
                        value={form.team}
                        onChange={(e) => updateField("team", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors appearance-none cursor-pointer"
                      >
                        {teams.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        <Tag size={12} /> Version
                      </label>
                      <select
                        value={form.version}
                        onChange={(e) => updateField("version", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors appearance-none cursor-pointer"
                      >
                        {versions.map((v) => (
                          <option key={v} value={v}>{v === "SW" ? "Swingman" : "Authentic"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        Price (¥)
                      </label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => updateField("price", e.target.value)}
                        placeholder="699"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => updateField("status", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>
                  </div>

                  {/* Measured Width & Official Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        <Ruler size={12} /> Measured Width
                      </label>
                      <input
                        type="text"
                        value={form.measuredWidth}
                        onChange={(e) => updateField("measuredWidth", e.target.value)}
                        placeholder="e.g. 59cm"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        Official Size
                      </label>
                      <select
                        value={form.officialSize}
                        onChange={(e) => updateField("officialSize", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors appearance-none cursor-pointer"
                      >
                        {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                      Season
                    </label>
                    <input
                      type="text"
                      value={form.year}
                      onChange={(e) => updateField("year", e.target.value)}
                      placeholder="e.g. 2023-24"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors"
                    />
                  </div>

                  {/* Image Folder & Count */}
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        <FolderOpen size={12} /> Image Folder Name
                      </label>
                      <input
                        type="text"
                        value={form.imageFolder}
                        onChange={(e) => updateField("imageFolder", e.target.value)}
                        placeholder="e.g. lebron-lakers-23"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                        Photos (1-5)
                      </label>
                      <select
                        value={form.imageCount}
                        onChange={(e) => updateField("imageCount", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n} 张</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600 -mt-2">
                    Put 1.jpg~5.jpg in public/images/jerseys/your-folder-name/
                  </p>

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                      Description (optional)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-jersey-gold)] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-jersey-gold)] text-zinc-900 font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <Plus size={16} />
                    Add Jersey
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
