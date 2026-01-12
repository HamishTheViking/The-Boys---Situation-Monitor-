
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
  const [activeTheater, setActiveTheater] = useState<Theater>(Theater.GLOBAL);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setAssets(prev => prev.map(asset => {
        if (asset.speed === 0) return asset;
        const moveScale = 0.00005 * (asset.speed / 10);
        return {
          ...asset,
          location: {
            lat: asset.location.lat + Math.sin(asset.heading * Math.PI / 180) * moveScale,
            lng: asset.location.lng + Math.cos(asset.heading * Math.PI / 180) * moveScale,
          },
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

  // Map theater string value to THEATER_COORDS key (e.g. "MIDDLE EAST" -> "MIDDLE_EAST", "SOUTH & CENTRAL AMERICA" -> "SOUTH_CENTRAL_AMERICA")
  const theaterCoordKey = useMemo(() => {
    return activeTheater.replace(/[^A-Z]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  }, [activeTheater]);

  const chartData = useMemo(() => [
    { name: 'ACTIVE', count: assets.filter(a => a.status === 'ACTIVE').length, color: '#d97706' },
    { name: 'ALERT', count: assets.filter(a => a.status === 'ALERT').length, color: '#ef4444' },
    { name: 'STANDBY', count: assets.filter(a => a.status === 'STANDBY').length, color: '#3b82f6' },
  ], [assets]);

  return (
    <div className="flex flex-col h-screen w-full text-slate-100 overflow-hidden font-mono bg-black">
      {/* HUD Header */}
      <header className="h-20 border-b border-amber-600/20 flex items-center justify-between px-8 bg-black/80 backdrop-blur-md relative z-50">
        <div className="absolute top-0 left-0 w-32 h-1 bg-amber-600"></div>
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-600 text-black rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.3)]">
            <i className="fas fa-microchip text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-hud font-bold tracking-[0.2em] text-amber-600 amber-glow uppercase leading-none">DSAR Monitors</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">NATO_NODE // SECURE</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span className="text-[10px] text-slate-500">AUTH: LEVEL_07</span>
            </div>
          </div>
        </div>

        {/* Pentagon Activity Rating */}
        <div className="flex items-center gap-4 bg-slate-900/30 border border-amber-600/10 px-6 py-2">
            <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Pentagon_Activity_Index</p>
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
            <div className="max-w-[150px]">
                <p className="text-[8px] text-slate-600 leading-tight italic truncate" title={sitrep?.pentagonActivity?.reasoning}>
                    {sitrep?.pentagonActivity?.reasoning || "Analyzing fast food traffic patterns..."}
                </p>
            </div>
        </div>
        
        {/* Navigation / Theater Select */}
        <div className="flex items-center gap-1 bg-slate-900/40 p-1 border border-amber-600/10 overflow-x-auto no-scrollbar max-w-[50%]">
          {Object.values(Theater).map(t => (
            <button
              key={t}
              onClick={() => selectTheater(t as Theater)}
              className={`dx-button px-4 py-2 text-[9px] font-bold transition-all uppercase tracking-widest whitespace-nowrap ${activeTheater === t ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/20' : 'text-amber-600/50 hover:text-amber-500 hover:bg-amber-600/5'}`}
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
            className="dx-button bg-amber-600/10 border border-amber-600/40 px-6 py-2 hover:bg-amber-600 hover:text-black transition-all font-bold text-xs text-amber-600"
          >
            {loadingSitrep ? 'SYNCING...' : 'SYNC_INTEL'}
          </button>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] radar-sweep"></div>
        
        {/* Left Side: Status & Filters */}
        <aside className="w-80 flex flex-col gap-6 overflow-y-auto z-10">
          <div className="dx-border p-5 border-t-2 border-t-amber-600/50">
            <h2 className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mb-4 flex justify-between">
              <span>System_Vitals</span>
              <span className="text-emerald-500">Online</span>
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
            <h2 className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mb-4">Signal_Filters</h2>
            <div className="space-y-3">
              {[
                { label: 'AIRCRAFT', active: showAircraft, set: setShowAircraft, icon: 'fa-plane' },
                { label: 'NAVAL', active: showVessels, set: setShowVessels, icon: 'fa-anchor' },
                { label: 'GROUND', active: showGround, set: setShowGround, icon: 'fa-square' }
              ].map(f => (
                <button 
                  key={f.label}
                  onClick={() => f.set(!f.active)}
                  className={`w-full flex items-center justify-between p-3 border transition-all ${f.active ? 'bg-amber-600/10 border-amber-600/50 text-amber-100' : 'bg-black border-slate-900 text-slate-700'}`}
                >
                  <div className="flex items-center gap-3"><i className={`fas ${f.icon} text-xs`}></i><span className="text-[10px] font-bold tracking-widest">{f.label}</span></div>
                  <div className={`w-2 h-2 ${f.active ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(217,119,6,0.6)]' : 'bg-slate-900'}`}></div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 dx-border p-5 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mb-4">Target_Manifest</h2>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 border transition-all cursor-pointer group flex items-center gap-4 ${selectedAsset?.id === asset.id ? 'bg-amber-600/10 border-amber-600' : 'bg-black/40 border-slate-900 hover:border-amber-900'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-amber-600/60 font-hud">{asset.id}</span>
                      <span className="text-[8px] text-slate-500">{asset.country}</span>
                    </div>
                    <h3 className="text-xs font-bold truncate text-slate-300 group-hover:text-amber-500 transition-colors uppercase">{asset.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Tactical Map */}
        <section className="flex-1 relative dx-border border-amber-600/10 bg-black overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 tri-corner-tl bg-amber-600/20 z-10"></div>
          <Map 
            assets={filteredAssets} 
            onAssetClick={setSelectedAsset} 
            focusTheater={THEATER_COORDS[theaterCoordKey as keyof typeof THEATER_COORDS]}
          />
          
          {selectedAsset && (
            <div className="absolute top-8 right-8 z-30">
              <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
            </div>
          )}
        </section>

        {/* Right Side: News & Intel */}
        <aside className="w-[440px] dx-border flex flex-col overflow-hidden relative border-t-2 border-t-amber-600/50">
          <div className="relative z-10 flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8 border-b border-amber-600/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 ${loadingSitrep ? 'bg-amber-500 animate-ping' : 'bg-amber-600'}`}></div>
                <h2 className="text-sm font-hud font-bold tracking-[0.2em] text-amber-600 uppercase">OSINT_FEED</h2>
              </div>
              <div className="text-[9px] font-bold text-slate-500 font-hud uppercase">ID: {activeTheater}_OPS_SIT</div>
            </div>

            {loadingSitrep ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-1 w-full max-w-[200px] bg-slate-900 relative overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-amber-600 animate-[pulse_1s_infinite]" style={{ width: '40%' }}></div>
                </div>
                <p className="text-amber-600 text-[10px] animate-pulse uppercase tracking-[0.3em]">Decoding_Data_Streams...</p>
              </div>
            ) : sitrep ? (
              <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                <div className="relative">
                  <div className="p-4 bg-amber-600/5 border-l-2 border-amber-600 text-xs italic text-amber-200/80 leading-relaxed font-medium">
                    "{sitrep.summary}"
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">Verified_Alerts</h3>
                  {sitrep.news.map((item, idx) => (
                    <a 
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-4 border border-slate-900 bg-black/40 hover:border-amber-600/30 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-amber-600 tracking-tighter uppercase">{item.theater}</span>
                        <span className="text-[9px] text-slate-600 font-hud">{item.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-500 transition-colors leading-tight mb-2">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.summary}</p>
                    </a>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">Conflict_Hotspots</h3>
                  <div className="space-y-2">
                    {sitrep.hotspots.map((h, i) => (
                      <div key={i} className="p-3 bg-red-950/10 border border-red-900/20 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-red-600 mt-1 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        <div>
                          <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">{h.name}</p>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1">{h.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-auto pt-6 border-t border-amber-600/10 flex justify-between items-end">
              <div className="text-[9px] text-slate-700 leading-tight font-hud">
                LINK: 119.034.22.X<br/>
                TERM: VX_700<br/>
                STATUS: ENCRYPTED
              </div>
              <div className="text-[32px] font-hud font-black text-amber-600/10 select-none">GSC</div>
            </div>
          </div>
        </aside>
      </main>

      {/* HUD Footer */}
      <footer className="h-10 bg-black border-t border-amber-600/20 px-8 flex items-center justify-between text-[10px] text-slate-600 uppercase tracking-widest">
        <div className="flex items-center gap-10">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-600 shadow-[0_0_5px_rgba(217,119,6,0.8)]"></span> NETWORK_STABLE</span>
          <span className="flex items-center gap-2 font-bold text-amber-600/50">GEOSPATIAL_ENGINE: v4.20_DEUS</span>
          <span className="text-slate-800">|</span>
          <span className="text-[9px] font-hud">NATO_UNCLASSIFIED // REPRO_MODE</span>
        </div>
        <div className="flex gap-4">
          <span className="text-amber-600/30">ID: ALPHA_XRAY_009</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
