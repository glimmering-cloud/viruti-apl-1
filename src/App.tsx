import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Users, 
  LayoutDashboard, 
  TrendingUp, 
  Cpu, 
  ChevronRight,
  RefreshCw,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  Trophy
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  role: string;
  sr: number;
  avg: number;
  initials: string;
}

interface CoachAnalysis {
  brief: string;
  pros: string[];
  cons: string[];
}

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Virat Kohli', role: 'Top Order Batter', sr: 138.4, avg: 52.7, initials: 'VK' },
  { id: '2', name: 'Rohit Sharma', role: 'Opening Batter', sr: 142.1, avg: 48.2, initials: 'RS' },
  { id: '3', name: 'Hardik Pandya', role: 'All-Rounder', sr: 149.8, avg: 33.4, initials: 'HP' },
  { id: '4', name: 'Jasprit Bumrah', role: 'Pace Bowler', sr: 9.2, avg: 14.1, initials: 'JB' },
  { id: '5', name: 'Ravindra Jadeja', role: 'Spin All-Rounder', sr: 127.5, avg: 24.5, initials: 'RJ' },
  { id: '6', name: 'KL Rahul', role: 'Wicket Keeper', sr: 135.9, avg: 37.7, initials: 'KL' },
  { id: '7', name: 'Mohammed Shami', role: 'Pace Bowler', sr: 8.5, avg: 10.2, initials: 'MS' },
  { id: '8', name: 'Rishabh Pant', role: 'Wicket Keeper', sr: 145.2, avg: 34.0, initials: 'RP' },
];

const BENCH_PLAYERS: Player[] = [
  { id: '9', name: 'Suryakumar Yadav', role: 'Middle Order', sr: 171.4, avg: 45.8, initials: 'SY' },
  { id: '10', name: 'Ishan Kishan', role: 'Wicket Keeper', sr: 131.2, avg: 29.4, initials: 'IK' },
  { id: '11', name: 'Shubman Gill', role: 'Opening Batter', sr: 146.5, avg: 32.1, initials: 'SG' },
  { id: '12', name: 'Axar Patel', role: 'Left-Arm Spinner', sr: 132.8, avg: 22.4, initials: 'AP' },
];

export default function App() {
  const [playingXI, setPlayingXI] = useState<Player[]>(INITIAL_PLAYERS);
  const [bench, setBench] = useState<Player[]>(BENCH_PLAYERS);
  const [selectedXIIndex, setSelectedXIIndex] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAction, setLastAction] = useState<string>('Ready for tactical optimization');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'xi' | 'bench' | 'ai'>('xi');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const liveScore = { runs: 168, wickets: 4, overs: 16.2 };

  const handleSearch = (e: React.MouseEvent, playerName: string) => {
    e.stopPropagation();
    window.open(`https://www.google.com/search?q=${encodeURIComponent(playerName + ' cricket stats')}`, '_blank');
  };

  const projectedScore = useMemo(() => {
    const avgSR = playingXI.reduce((acc, p) => acc + (p.sr * p.avg / 100), 0) / playingXI.length;
    const baseProjected = 200;
    const modifier = (avgSR - 40) * 2; 
    return Math.round(baseProjected + modifier);
  }, [playingXI]);

  const handleSwap = async (playerFromBench: Player) => {
    if (selectedXIIndex === null) return;
    const indexInXI = selectedXIIndex;
    const benchedPlayer = playingXI[indexInXI];
    
    const newXI = [...playingXI];
    newXI[indexInXI] = playerFromBench;
    
    const newBench = [...bench];
    const benchIndex = bench.findIndex(p => p.id === playerFromBench.id);
    newBench[benchIndex] = benchedPlayer;

    setPlayingXI(newXI);
    setBench(newBench);
    setSelectedXIIndex(null);
    setLastAction(`Swapping ${benchedPlayer.name} for ${playerFromBench.name}`);
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playingXI: newXI.map(p => ({ name: p.name, sr: p.sr, avg: p.avg })),
          benchedPlayer: { name: benchedPlayer.name, sr: benchedPlayer.sr, avg: benchedPlayer.avg },
          incomingPlayer: { name: playerFromBench.name, sr: playerFromBench.sr, avg: playerFromBench.avg },
        }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Tactical evaluation failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[var(--m3-surface)] text-[var(--m3-on-surface)] transition-colors duration-300">
      
      {/* M3 Header / Top App Bar */}
      <header className="h-16 lg:h-20 px-4 md:px-6 flex items-center justify-between bg-[var(--m3-surface-container)] border-b border-[var(--m3-outline-variant)] shrink-0 z-20">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--m3-primary)] rounded-full flex items-center justify-center text-[var(--m3-on-primary)] shadow-sm shrink-0">
            <Trophy className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold tracking-tight leading-none">Squad-Swap</h1>
            <p className="text-[10px] text-[var(--m3-on-surface-variant)] uppercase font-mono tracking-widest mt-1">AI Tactical Hub</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-8 bg-[var(--m3-surface-container-high)] px-3 md:px-6 py-1.5 rounded-2xl shadow-inner border border-[var(--m3-outline-variant)]">
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-wider text-[var(--m3-on-surface-variant)]">Live</span>
            <span className="text-sm md:text-xl font-bold font-mono tracking-tighter">
              {liveScore.runs}/{liveScore.wickets} <span className="hidden xs:inline text-[10px] text-[var(--m3-primary)] font-normal">({liveScore.overs})</span>
            </span>
          </div>
          <div className="w-[1px] h-6 bg-[var(--m3-outline-variant)]"></div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-wider text-[var(--m3-on-surface-variant)]">Projected</span>
            <span className="text-sm md:text-xl font-bold font-mono text-[var(--m3-primary)]">{projectedScore}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 md:p-3 rounded-full hover:bg-[var(--m3-surface-container-highest)] transition-colors text-[var(--m3-on-surface)]"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <div className="hidden md:flex items-center space-x-2 bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] px-4 py-2 rounded-full text-xs font-medium border border-[var(--m3-primary)]">
            <ShieldCheck className="w-4 h-4" />
            <span>CLOUD RUN</span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex bg-[var(--m3-surface-container)] border-b border-[var(--m3-outline-variant)] shrink-0 z-10 font-sans">
        <button 
          onClick={() => setActiveTab('xi')}
          className={`flex-1 flex flex-col items-center py-3 transition-all relative ${activeTab === 'xi' ? 'text-[var(--m3-primary)]' : 'text-[var(--m3-on-surface-variant)]'}`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Lineup</span>
          {activeTab === 'xi' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--m3-primary)] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('bench')}
          className={`flex-1 flex flex-col items-center py-3 transition-all relative ${activeTab === 'bench' ? 'text-[var(--m3-primary)]' : 'text-[var(--m3-on-surface-variant)]'}`}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Bench</span>
          {activeTab === 'bench' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--m3-primary)] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex flex-col items-center py-3 transition-all relative ${activeTab === 'ai' ? 'text-[var(--m3-primary)]' : 'text-[var(--m3-on-surface-variant)]'}`}
        >
          <Cpu className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Strategy</span>
          {activeTab === 'ai' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--m3-primary)] rounded-t-full" />}
        </button>
      </div>

      {/* Content Area */}
      <main className="flex-1 p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 overflow-hidden">
        
        {/* Playing XI - Column 1 */}
        <div className={`col-span-1 lg:col-span-4 flex flex-col space-y-3 md:space-y-4 lg:overflow-hidden ${activeTab === 'xi' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center justify-between px-2">
            <h2 className="text-base md:text-lg font-medium flex items-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[var(--m3-primary)]" /> Playing XI
            </h2>
            <span className="text-[10px] md:text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] border border-[var(--m3-secondary)]">
              {playingXI.length}/11
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar shrink-0">
            {playingXI.map((player, idx) => (
              <motion.div 
                layout
                key={player.id}
                className={`p-3 rounded-[16px] flex items-center transition-all cursor-pointer ${
                  selectedXIIndex === idx 
                    ? 'bg-[var(--m3-primary-container)] ring-2 ring-[var(--m3-primary)]' 
                    : 'bg-[var(--m3-surface-container-high)] hover:bg-[var(--m3-surface-container-highest)]'
                }`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setSelectedXIIndex(selectedXIIndex === idx ? null : idx)}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] flex items-center justify-center font-bold text-sm mr-3">
                  {player.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold">{player.name}</p>
                    <button 
                      onClick={(e) => handleSearch(e, player.name)}
                      className="p-1.5 rounded-full hover:bg-[var(--m3-outline-variant)] text-[var(--m3-on-surface-variant)] transition-colors"
                      title="Stats Search"
                    >
                      <Search className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--m3-on-surface-variant)]">{player.role}</p>
                </div>
                <div className="flex space-x-3 text-right">
                  <div className="bg-[var(--m3-surface)] px-2 py-1 rounded-lg">
                    <p className="text-[8px] text-[var(--m3-on-surface-variant)] uppercase font-bold">SR</p>
                    <p className="text-xs font-mono font-bold">{player.sr}</p>
                  </div>
                  <div className="bg-[var(--m3-surface)] px-2 py-1 rounded-lg">
                    <p className="text-[8px] text-[var(--m3-on-surface-variant)] uppercase font-bold">AVG</p>
                    <p className="text-xs font-mono font-bold">{player.avg}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bench - Column 2 */}
        <div className={`col-span-1 lg:col-span-4 flex flex-col space-y-3 md:space-y-4 lg:overflow-hidden ${activeTab === 'bench' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center justify-between px-2">
            <h2 className="text-base md:text-lg font-medium flex items-center">
              <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[var(--m3-tertiary)]" /> Bench
            </h2>
            <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-[var(--m3-on-surface-variant)] font-bold">Reserves</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar shrink-0">
            {bench.map((player, idx) => {
              const canSwap = selectedXIIndex !== null;
              return (
                <motion.div 
                  layout
                  key={player.id}
                  className={`p-3 rounded-[16px] border-2 border-dashed flex items-center transition-all ${
                    canSwap 
                      ? 'bg-[var(--m3-surface-container)] border-[var(--m3-primary)] cursor-pointer hover:bg-[var(--m3-primary-container)]' 
                      : 'bg-[var(--m3-surface-container-high)] border-[var(--m3-outline-variant)] opacity-60'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => canSwap && handleSwap(player)}
                >
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm mr-3 transition-colors ${
                    canSwap ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]' : 'bg-[var(--m3-outline-variant)] text-[var(--m3-on-surface-variant)]'
                  }`}>
                    {player.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <p className={`text-xs md:text-sm font-semibold truncate ${canSwap ? 'text-[var(--m3-on-surface)]' : 'text-[var(--m3-on-surface-variant)]'}`}>
                        {player.name}
                      </p>
                      <button 
                        onClick={(e) => handleSearch(e, player.name)}
                        className="p-1.5 rounded-full hover:bg-[var(--m3-outline-variant)] text-[var(--m3-on-surface-variant)] transition-colors"
                      >
                        <Search className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] md:text-[11px] text-[var(--m3-on-surface-variant)] truncate">{player.role}</p>
                  </div>
                  <div className="flex space-x-2 md:space-x-3 text-right">
                    <div>
                      <p className="text-[7px] md:text-[8px] text-[var(--m3-on-surface-variant)] uppercase font-bold">SR</p>
                      <p className="text-[10px] md:text-xs font-mono font-bold text-[var(--m3-primary)]">{player.sr}</p>
                    </div>
                    <div>
                      <p className="text-[7px] md:text-[8px] text-[var(--m3-on-surface-variant)] uppercase font-bold">AVG</p>
                      <p className="text-[10px] md:text-xs font-mono font-bold text-[var(--m3-primary)]">{player.avg}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="h-20 md:h-24 bg-[var(--m3-surface-container)] rounded-[28px] border border-[var(--m3-outline-variant)] flex flex-col items-center justify-center p-3">
            <p className="text-[9px] md:text-[10px] text-[var(--m3-on-surface-variant)] uppercase font-bold tracking-[0.1em] mb-2 text-center leading-tight">
              {selectedXIIndex !== null ? 'Select professional from bench' : 'Tap a player from XI to swap'}
            </p>
            <div className={`w-8 md:w-10 h-1 rounded-full transition-all duration-500 ${selectedXIIndex !== null ? 'bg-[var(--m3-primary)] w-12 md:w-16' : 'bg-[var(--m3-outline-variant)]'}`}></div>
          </div>
        </div>

        {/* AI Analysis - Column 3 */}
        <div className={`col-span-1 lg:col-span-4 flex flex-col ${activeTab === 'ai' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 bg-[var(--m3-surface-container)] rounded-[28px] p-4 md:p-6 flex flex-col border border-[var(--m3-outline-variant)] shadow-sm overflow-hidden">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[var(--m3-primary)] to-[var(--m3-tertiary)] flex items-center justify-center text-white shadow-md shrink-0">
                <Cpu className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-sm md:text-md font-semibold tracking-tight">Gemini Strategy Agent</h2>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
              <div className="p-4 bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] rounded-[20px] rounded-tl-sm border border-[var(--m3-primary)] shadow-sm">
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-70 mb-1">Observation</p>
                <p className="text-xs leading-relaxed italic font-medium">
                  "{lastAction}"
                </p>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--m3-on-surface-variant)] mb-3 px-1">Tactical Analysis</p>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 space-y-4"
                      >
                        <RefreshCw className="w-10 h-10 text-[var(--m3-primary)] animate-spin" />
                        <p className="text-xs text-[var(--m3-on-surface-variant)] animate-pulse">Running Monte Carlo simulation...</p>
                      </motion.div>
                    ) : analysis ? (
                      <motion.div 
                        key={analysis.brief}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <p className="text-sm text-[var(--m3-on-surface)] leading-relaxed">
                          {analysis.brief}
                        </p>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-[var(--m3-surface-container-high)] p-3 rounded-2xl border border-[var(--m3-outline-variant)]">
                            <p className="text-[9px] text-[var(--m3-primary)] font-bold uppercase mb-2">Advantages</p>
                            <ul className="space-y-2">
                              {analysis.pros.map((pro, i) => (
                                <li key={i} className="text-xs text-[var(--m3-on-surface)] flex items-start">
                                  <ChevronRight className="w-4 h-4 text-[var(--m3-primary)] mr-1 flex-shrink-0" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-[var(--m3-surface-container-high)] p-3 rounded-2xl border border-[var(--m3-outline-variant)]">
                            <p className="text-[9px] text-[var(--m3-error)] font-bold uppercase mb-2">Risk Factors</p>
                            <ul className="space-y-2">
                              {analysis.cons.map((con, i) => (
                                <li key={i} className="text-xs text-[var(--m3-on-surface)] flex items-start">
                                  <ChevronRight className="w-4 h-4 text-[var(--m3-error)] mr-1 flex-shrink-0" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-50">
                        <TrendingUp className="w-12 h-12 text-[var(--m3-outline)]" />
                        <p className="text-xs text-center px-6">Select a lineup swap to generate real-time tactical insights</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <button className="w-full py-4 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] font-semibold rounded-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>OPTIMIZE SQUAD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tonal Navigation / Footer */}
      <footer className="h-10 md:h-12 bg-[var(--m3-surface-container-high)] flex items-center justify-between px-4 md:px-6 border-t border-[var(--m3-outline-variant)] shrink-0">
        <div className="flex space-x-3 md:space-x-6 text-[9px] md:text-[10px] font-medium text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            <span className="hidden xs:inline">Backend Sync: Live</span>
            <span className="xs:hidden">Live</span>
          </div>
          <span>Match: IND vs AUS</span>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 text-[9px] md:text-[10px] font-bold text-[var(--m3-on-surface-variant)]">
          <span className="hidden sm:inline bg-[var(--m3-surface-container-highest)] px-3 py-1 rounded-full border border-[var(--m3-outline-variant)]">
            Win Prob: 64.2%
          </span>
          <span className="text-[var(--m3-primary)] font-mono tracking-tighter">
            LATENCY: 42ms
          </span>
        </div>
      </footer>
    </div>
  );
}
