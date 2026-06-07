import { teams, versions } from "../data/teams";
import { X, Filter, Shirt, Users } from "lucide-react";

export default function Sidebar({ selectedTeams, selectedVersions, onTeamToggle, onVersionToggle, onClear, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-0
          h-screen w-72 lg:w-64
          bg-zinc-950 border-r border-white/[0.06]
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-white">
            <Shirt size={20} className="text-[var(--color-jersey-gold)]" />
            <span className="font-semibold text-sm tracking-wide uppercase">Filters</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <X size={14} />
              Clear
            </button>
            <button
              onClick={onClose}
              className="lg:hidden text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Teams Section */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">NBA Teams</h3>
            </div>
            <div className="space-y-1">
              {teams.map((team) => (
                <label
                  key={team}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                    transition-all duration-200 group
                    ${selectedTeams.includes(team)
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team)}
                    onChange={() => onTeamToggle(team)}
                    className="sr-only"
                  />
                  <span
                    className={`
                      w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                      transition-all duration-200
                      ${selectedTeams.includes(team)
                        ? "bg-[var(--color-jersey-gold)] border-[var(--color-jersey-gold)]"
                        : "border-zinc-600 group-hover:border-zinc-500"
                      }
                    `}
                  >
                    {selectedTeams.includes(team) && (
                      <svg className="w-3 h-3 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm">{team}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Version Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Version</h3>
            </div>
            <div className="space-y-1">
              {versions.map((version) => (
                <label
                  key={version}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                    transition-all duration-200 group
                    ${selectedVersions.includes(version)
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedVersions.includes(version)}
                    onChange={() => onVersionToggle(version)}
                    className="sr-only"
                  />
                  <span
                    className={`
                      w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                      transition-all duration-200
                      ${selectedVersions.includes(version)
                        ? "bg-[var(--color-jersey-gold)] border-[var(--color-jersey-gold)]"
                        : "border-zinc-600 group-hover:border-zinc-500"
                      }
                    `}
                  >
                    {selectedVersions.includes(version) && (
                      <svg className="w-3 h-3 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm">
                    {version === "SW" ? "Swingman (球迷版)" : "Authentic (球员版)"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-600 leading-relaxed">
            Click any jersey to view details, measurements, and purchase info.
          </p>
        </div>
      </aside>
    </>
  );
}
