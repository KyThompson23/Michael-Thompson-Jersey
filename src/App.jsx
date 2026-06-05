import { useState, useMemo, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Gallery from "./components/Gallery";
import DetailModal from "./components/DetailModal";
import AdminDashboard from "./components/AdminDashboard";
import mockJerseys from "./data/jerseys";
import { Menu, Shirt, Sparkles } from "lucide-react";

export default function App() {
  const [jerseys, setJerseys] = useState(mockJerseys);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [selectedJersey, setSelectedJersey] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleTeamToggle = useCallback((team) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  }, []);

  const handleVersionToggle = useCallback((version) => {
    setSelectedVersions((prev) =>
      prev.includes(version) ? prev.filter((v) => v !== version) : [...prev, version]
    );
  }, []);

  const handleClear = useCallback(() => {
    setSelectedTeams([]);
    setSelectedVersions([]);
  }, []);

  const handleAddJersey = useCallback((jersey) => {
    setJerseys((prev) => [jersey, ...prev]);
  }, []);

  const filteredJerseys = useMemo(() => {
    return jerseys.filter((jersey) => {
      const teamMatch = selectedTeams.length === 0 || selectedTeams.includes(jersey.team);
      const versionMatch = selectedVersions.length === 0 || selectedVersions.includes(jersey.version);
      return teamMatch && versionMatch;
    });
  }, [jerseys, selectedTeams, selectedVersions]);

  const activeFilterCount = selectedTeams.length + selectedVersions.length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar
        selectedTeams={selectedTeams}
        selectedVersions={selectedVersions}
        onTeamToggle={handleTeamToggle}
        onVersionToggle={handleVersionToggle}
        onClear={handleClear}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-zinc-400 hover:text-white transition-colors"
              >
                <Menu size={22} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-jersey-gold)] to-[var(--color-jersey-accent)] flex items-center justify-center">
                  <Shirt size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight">NBA Jersey Gallery</h1>
                  <p className="text-[10px] text-zinc-500 -mt-0.5">球衣买手店</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-jersey-gold)]/10 text-[var(--color-jersey-gold)] text-xs font-medium border border-[var(--color-jersey-gold)]/20">
                  <Sparkles size={12} />
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                </span>
              )}
              <span className="text-xs text-zinc-600">
                {filteredJerseys.length} jersey{filteredJerseys.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-5 lg:p-8">
          <Gallery jerseys={filteredJerseys} onJerseyClick={setSelectedJersey} />
        </div>
      </main>

      {selectedJersey && (
        <DetailModal
          jersey={selectedJersey}
          onClose={() => setSelectedJersey(null)}
          isAdmin={isAdmin}
        />
      )}

      <AdminDashboard
        onAddJersey={handleAddJersey}
        isAdmin={isAdmin}
        onAuthChange={setIsAdmin}
      />
    </div>
  );
}
