
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map from './components/Map';
import AssetDetail from './components/AssetDetail';
import { INITIAL_ASSETS, THEATER_COORDS } from './constants';
import { StrategicAsset, SituationalReport, AssetType, Affiliation, NewsItem, Theater } from './types';
import { fetchSituationalReport } from './services/geminiService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [assets, setAssets] = useState<StrategicAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<StrategicAsset | null>(null);
  const [sitrep, setSitrep] = useState<SituationalReport | null>(null);
  const [loadingSitrep, setLoadingSitrep] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [showAircraft, setShowAircraft] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showGround, setShowGround] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [activeTheater, setActiveTheater] = useState<Theater>(Theater.GLOBAL);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setAssets(prev => prev.map(asset => {
        if (asset.speed === 0) return asset;
        const moveScale = 0.00005 * (asset.speed / 10);
        const newLocation = {
          lat: asset.location.lat + Math.sin(asset.heading * Math.PI / 180) * moveScale,
          lng: asset.location.lng + Math.cos(asset.heading * Math.PI / 180) * moveScale,
        };

        const newHistory = [...(asset.pathHistory || [])];
        if (newHistory.length > 50) newHistory.shift();
        newHistory.push({ lat: asset.location.lat, lng: asset.location.lng });

        return {
          ...asset,
          location: newLocation,
          pathHistory: newHistory,
          lastUpdated: new Date().toISOString()
        };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateSitrep = useCallback(async (theater: Theater = activeTheater) => {
    setLoadingSitrep(true);
    try {
      const data = await fetchSituationalReport(theater);
      setSitrep(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSitrep(false);
    }
  }, [activeTheater]);

  const selectTheater = (theater: Theater) => {
    setActiveTheater(theater);
    handleUpdateSitrep(theater);
    setSelectedAsset(null);
  };

  useEffect(() => {
    handleUpdateSitrep(Theater.GLOBAL);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      return (asset.type === AssetType.AIRCRAFT && showAircraft) || 
             (asset.type === AssetType.VESSEL && showVessels) ||
             (asset.type === AssetType.GROUND && showGround);
    });
  }, [assets, showAircraft, showVessels, showGround]);

  const theaterCoordKey = useMemo(() => {
    return activeTheater.replace(/[^A-Z]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  }, [activeTheater]);

  const theaterStats = useMemo(() => {
      // In a real app we'd filter by geographical bounding box, but for this mock
      // we'll filter by some property or just show relevant counts.
      const nato = filteredAssets.filter(a => a.affiliation === Affiliation.NATO).length;
      const opfor = filteredAssets.filter(a => a.affiliation === Affiliation.OPFOR).length;
      return { nato, opfor };
  }, [filteredAssets]);

  const chartData = useMemo(() => [
    { name: 'ACTIVE', count: assets.filter(a => a.status === 'ACTIVE').length, color: '#d97706' },
    { name: 'ALERT', count: assets.filter(a => a.status === 'ALERT').length, color: '#ef4444' },
    { name: 'STANDBY', count: assets.filter(a => a.status === 'STANDBY').length, color: '#3b82f6' },
  ], [assets]);

  return (
    <div className="flex flex-col h-screen w-full text-slate-100 overflow-hidden font-mono bg-[#0c0d0f]">
      {/* HUD Header */}
      <header className="h-20 border-b border-amber-600/20 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md relative z-50">
        <div className="absolute top-0 left-0 w-32 h-1 bg-amber-600"></div>
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-600 text-black flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.3)]">
            <i className="fas fa-satellite text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-hud font-bold tracking-[0.2em] text-amber-600 amber-glow uppercase leading-none">Global Strategic Command</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">NODE_STATUS // ONLINE</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">TERMINAL: {currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Pentagon Activity Rating */}
        <div className="flex items-center gap-4 bg-slate-900/30 border border-amber-600/10 px-6 py-2">
            <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Pentagon_Busyness_Index</p>
                <div className="flex items-center gap-2 justify-end">
                    <span className={`text-xs font-hud font-bold ${sitrep?.pentagonActivity?.label === 'CRITICAL' ? 'text-red-500 animate-pulse' : sitrep?.pentagonActivity?.label === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-500'}`}>
                        {sitrep?.pentagonActivity?.label || "CALIBRATING..."}
                    </span>
                    <div className="flex gap-0.5 h-3">
                        {[1, 2, 3, 4, 5].map(i => {
                            const active = (sitrep?.pentagonActivity?.score || 0) >= (i * 20);
                            return <div key={i} className={`w-1 h-full ${active ? (sitrep?.pentagonActivity?.score! > 75 ? 'bg-red-500' : 'bg-amber-500') : 'bg-slate-800'}`}></div>;
                        })}
                    </div>
                </div>
            </div>
            <div className="w-px h-8 bg-amber-600/10"></div>
            <div className="max-w-[200px]">
                <p className="text-[8px] text-slate-500 leading-tight italic truncate" title={sitrep?.pentagonActivity?.reasoning}>
                    {sitrep?.pentagonActivity?.reasoning || "Analyzing local logistics patterns..."}
                </p>
            </div>
        </div>
        
        {/* Navigation / Theater Select */}
        <div className="flex items-center gap-1 bg-slate-900/40 p-1 border border-amber-600/10 overflow-x-auto no-scrollbar max-w-[40%]">
          {Object.values(Theater).map(t => (
            <button
              key={t}
              onClick={() => selectTheater(t as Theater)}
              className={`dx-button px-5 py-2 text-[9px] font-bold transition-all uppercase tracking-[0.2em] whitespace-nowrap ${activeTheater === t ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/20' : 'text-amber-600/50 hover:text-amber-500 hover:bg-amber-600/5'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Zulu Time</p>
            <p className="font-bold text-amber-600 text-sm">{currentTime.toISOString().split('T')[1].split('.')[0]}</p>
          </div>
          <button 
            onClick={() => handleUpdateSitrep()}
            disabled={loadingSitrep}
            className="dx-button bg-amber-600 border border-amber-600 px-6 py-2 hover:bg-amber-500 text-black transition-all font-bold text-xs shadow-[0_0_15px_rgba(217,119,6,0.3)]"
          >
            {loadingSitrep ? 'SYNCING...' : 'REFRESH_INTEL'}
          </button>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.01] radar-sweep"></div>
        
        {/* Left Sidebar */}
        <aside className="w-80 flex flex-col gap-6 overflow-y-auto z-10 scrollbar-hide">
          <div className="dx-border p-5 border-t-4 border-t-amber-600 shadow-xl">
            <h2 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4 flex justify-between items-center">
              <span>System_Vitals</span>
              <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></div> SECURE</span>
            </h2>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#78350f" fontSize={9} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} stroke={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dx-border p-5">
            <h2 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4">Tactical_Filters</h2>
            <div className="space-y-2">
              {[
                { label: 'AIRCRAFT', active: showAircraft, set: setShowAircraft, icon: 'fa-fighter-jet' },
                { label: 'NAVAL', active: showVessels, set: setShowVessels, icon: 'fa-anchor' },
                { label: 'GROUND', active: showGround, set: setShowGround, icon: 'fa-shield-halved' },
              ].map(f => (
                <button 
                  key={f.label}
                  onClick={() => f.set(!f.active)}
                  className={`w-full flex items-center justify-between p-3 border transition-all ${f.active ? 'bg-amber-600/5 border-amber-600/50 text-amber-100' : 'bg-black/40 border-slate-900 text-slate-700'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`fas ${f.icon} text-xs ${f.active ? 'text-amber-500' : 'text-slate-800'}`}></i>
                    <span className="text-[10px] font-bold tracking-[0.2em]">{f.label}</span>
                  </div>
                  <div className={`w-2 h-2 ${f.active ? 'bg-amber-500 shadow-[0_0_8px_rgba(217,119,6,1)]' : 'bg-slate-900'}`}></div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 dx-border p-5 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4">Target_Manifest</h2>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 border transition-all cursor-pointer group flex items-center gap-4 ${selectedAsset?.id === asset.id ? 'bg-amber-600/10 border-amber-600 shadow-inner' : 'bg-black/40 border-slate-900 hover:border-amber-900'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-amber-600/60 font-hud">{asset.id}</span>
                      <span className="text-[8px] text-slate-600 uppercase">{asset.country}</span>
                    </div>
                    <h3 className="text-xs font-bold truncate text-slate-300 group-hover:text-amber-500 transition-colors uppercase font-hud">{asset.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          <section className="flex-[3] relative dx-border border-amber-600/20 bg-black overflow-hidden shadow-2xl">
            {/* Top-Left Corner Piece */}
            <div className="absolute top-0 left-0 w-12 h-12 tri-corner-tl bg-amber-600/30 z-10"></div>
            
            <Map 
              assets={filteredAssets} 
              onAssetClick={setSelectedAsset} 
              focusTheater={THEATER_COORDS[theaterCoordKey as keyof typeof THEATER_COORDS]}
              showPaths={showPaths}
              onTogglePaths={() => setShowPaths(!showPaths)}
            />

            {/* Hyper Focus Theater Overlay */}
            {activeTheater !== Theater.GLOBAL && !selectedAsset && (
                <div className="absolute bottom-10 right-10 z-30 animate-in slide-in-from-right-10 duration-500">
                    <div className="dx-border border-l-4 border-l-amber-600 p-6 bg-black/80 backdrop-blur-xl min-w-[280px] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                        <div className="flex justify-between items-center mb-4 border-b border-amber-600/20 pb-2">
                            <h3 className="text-lg font-hud font-bold text-amber-600 uppercase tracking-tighter">Theater_Command</h3>
                            <span className="text-[9px] text-slate-500 font-bold">{activeTheater}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-900/10 border border-blue-500/20 p-3">
                                <span className="text-[8px] text-blue-500 font-bold uppercase block mb-1">NATO_ASSETS</span>
                                <span className="text-2xl font-hud font-bold text-blue-400">{theaterStats.nato}</span>
                            </div>
                            <div className="bg-red-900/10 border border-red-500/20 p-3">
                                <span className="text-[8px] text-red-500 font-bold uppercase block mb-1">OPFOR_UNITS</span>
                                <span className="text-2xl font-hud font-bold text-red-400">{theaterStats.opfor}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="h-1 bg-slate-900 w-full rounded-full overflow-hidden">
                                <div className="h-full bg-amber-600" style={{ width: `${(theaterStats.nato / (theaterStats.nato + theaterStats.opfor || 1)) * 100}%` }}></div>
                            </div>
                            <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Relative_Influence_Ratio</span>
                        </div>
                    </div>
                </div>
            )}
            
            {selectedAsset && (
              <div className="absolute top-10 right-10 z-50">
                <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
              </div>
            )}
            
            {!selectedAsset && sitrep && (
              <div className="absolute bottom-10 left-10 z-10 max-w-lg pointer-events-none">
                <div className="bg-black/90 backdrop-blur-xl border-l-4 border-amber-600 p-5 dx-border shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <p className="text-[10px] text-amber-600 font-hud mb-2 tracking-[0.2em] uppercase">Tactical_Report // {activeTheater}</p>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium italic">"{sitrep.summary}"</p>
                </div>
              </div>
            )}
          </section>

          {/* Feeds Panel */}
          <section className="flex-1 flex gap-6 overflow-hidden">
             <div className="flex-[2] dx-border flex flex-col overflow-hidden border-t-4 border-t-blue-600/50">
               <div className="p-4 border-b border-blue-600/10 flex justify-between items-center bg-blue-900/10">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 ${loadingSitrep ? 'bg-blue-400 animate-ping' : 'bg-blue-600'}`}></div>
                   <h2 className="text-xs font-hud font-bold tracking-[0.3em] text-blue-400 uppercase">OSINT_STREAM</h2>
                 </div>
                 <div className="text-[9px] font-bold text-slate-500 font-hud">SECURE_LINK_{activeTheater}</div>
               </div>
               
               <div className="flex-1 overflow-x-auto overflow-y-hidden flex p-4 gap-4 scrollbar-hide">
                 {loadingSitrep ? (
                   <div className="flex items-center justify-center w-full">
                     <p className="text-blue-500 text-[10px] animate-pulse uppercase tracking-[0.5em]">Synchronizing_Global_Surveillance...</p>
                   </div>
                 ) : sitrep?.news.map((item, idx) => (
                    <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="min-w-[320px] max-w-[320px] flex flex-col justify-between p-4 border border-slate-900 bg-black/60 hover:border-blue-600/40 transition-all group shrink-0 shadow-lg">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{item.sourceType}</span>
                          <span className="text-[8px] text-slate-600 font-hud">{item.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-tight mb-2 line-clamp-2 uppercase font-hud">{item.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic border-t border-slate-900 pt-2 mt-2">"{item.summary}"</p>
                    </a>
                  ))}
               </div>
             </div>

             <div className="flex-1 dx-border flex flex-col overflow-hidden border-t-4 border-t-red-600/50">
               <div className="p-4 border-b border-red-600/10 flex items-center gap-3 bg-red-950/20">
                 <i className="fas fa-biohazard text-red-600 text-xs"></i>
                 <h2 className="text-xs font-hud font-bold tracking-[0.3em] text-red-600 uppercase">Flashpoints</h2>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {sitrep?.hotspots.map((h, i) => (
                    <div key={i} className="p-3 bg-red-950/10 border border-red-900/30 flex items-start gap-3 hover:bg-red-900/20 transition-all cursor-default">
                      <div className="w-1.5 h-1.5 bg-red-600 mt-1 shadow-[0_0_5px_#dc2626]"></div>
                      <div>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1 font-hud">{h.name}</p>
                        <p className="text-[9px] text-slate-400 leading-snug">{h.description}</p>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          </section>
        </div>
      </main>

      {/* HUD Footer */}
      <footer className="h-10 bg-black/60 border-t border-amber-600/20 px-8 flex items-center justify-between text-[10px] text-slate-600 uppercase tracking-widest relative">
        <div className="flex items-center gap-10">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.8)]"></span> NETWORK_LOCKED</span>
          <span className="flex items-center gap-2 font-bold text-amber-600/50">GEOSPATIAL_CORE: V5.0_AEGIS</span>
          <div className="flex gap-1 items-end h-3">
             {[...Array(30)].map((_, i) => (
               <div key={i} className={`w-[1px] bg-amber-600/40`} style={{ height: `${Math.random() * 100}%` }}></div>
             ))}
          </div>
        </div>
        <div className="flex gap-10 items-center">
          <span className="text-amber-600/30 font-bold">ALPHA_SEC_PROT_00X</span>
          <span className="w-px h-4 bg-slate-800"></span>
          <span className="text-[9px] font-hud text-emerald-500/70">X-HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
