
import React from 'react';
import { StrategicAsset, AssetType } from '../types';

interface AssetDetailProps {
  asset: StrategicAsset;
  onClose: () => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onClose }) => {
  return (
    <div className="dx-border p-6 shadow-2xl min-w-[380px] animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-amber-600/20 border-t-4 border-t-amber-600">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-hud font-bold text-amber-600 amber-glow tracking-tighter uppercase leading-none">{asset.id}</h3>
          <p className="text-[9px] text-slate-600 mt-2 tracking-[0.2em] font-bold">COUNTRY_NODE: {asset.country}</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-amber-600/10 hover:bg-amber-600 hover:text-black transition-all text-amber-600 border border-amber-600/40">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="space-y-6 text-sm">
        <div className="p-4 bg-amber-600/5 border border-amber-600/10">
          <label className="text-slate-600 uppercase text-[9px] tracking-widest font-bold block mb-2 border-b border-amber-600/10 pb-1">Callsign_Link</label>
          <p className="text-xl font-bold text-white tracking-wide font-hud">{asset.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black border border-slate-900 p-3">
            <label className="text-slate-600 uppercase text-[9px] tracking-widest font-bold block mb-1">Asset_Class</label>
            <p className="flex items-center gap-2 font-bold text-amber-500/80 text-xs">
              <i className={`fas ${asset.type === AssetType.AIRCRAFT ? 'fa-plane' : asset.type === AssetType.VESSEL ? 'fa-anchor' : 'fa-truck-monster'}`}></i>
              {asset.type}
            </p>
          </div>
          <div className="bg-black border border-slate-900 p-3">
            <label className="text-slate-600 uppercase text-[9px] tracking-widest font-bold block mb-1">Operational_Status</label>
            <p className={`font-bold text-xs flex items-center gap-2 ${asset.status === 'ALERT' ? 'text-red-500' : 'text-emerald-500'}`}>
              <span className={`w-1.5 h-1.5 ${asset.status === 'ALERT' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              {asset.status}
            </p>
          </div>
        </div>

        <div className="p-4 border border-amber-600/10 bg-amber-900/5">
          <label className="text-amber-600 uppercase text-[9px] tracking-widest font-bold block mb-2">Tactical_Brief</label>
          <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{asset.mission}"</p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 bg-[#050505] border border-slate-900 font-hud">
          <div>
            <label className="text-slate-700 uppercase text-[8px] font-bold block mb-1">LAT_VAL</label>
            <p className="text-amber-600/80 text-xs">{asset.location.lat.toFixed(5)}</p>
          </div>
          <div>
            <label className="text-slate-700 uppercase text-[8px] font-bold block mb-1">LNG_VAL</label>
            <p className="text-amber-600/80 text-xs">{asset.location.lng.toFixed(5)}</p>
          </div>
          <div>
            <label className="text-slate-700 uppercase text-[8px] font-bold block mb-1">VELOCITY</label>
            <p className="text-amber-600/80 text-xs">{asset.speed} {asset.type === AssetType.AIRCRAFT ? 'KTS' : 'KN'}</p>
          </div>
          <div>
            <label className="text-slate-700 uppercase text-[8px] font-bold block mb-1">HDG_DEG</label>
            <p className="text-amber-600/80 text-xs">{asset.heading}°</p>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-amber-600/10">
          {asset.trackingUrl && (
            <a 
              href={asset.trackingUrl} 
              target="_blank" 
              rel="noreferrer"
              className="dx-button w-full flex items-center justify-between px-6 py-4 bg-amber-600 text-black font-bold text-[10px] tracking-widest transition-all hover:bg-amber-500 shadow-lg shadow-amber-600/20"
            >
              <span>ACCESS_OSINT_NODE</span>
              <i className="fas fa-satellite"></i>
            </a>
          )}
          {asset.wikiUrl && (
            <a 
              href={asset.wikiUrl} 
              target="_blank" 
              rel="noreferrer"
              className="dx-button w-full flex items-center justify-between px-6 py-4 border border-amber-600/40 text-amber-600 font-bold text-[10px] tracking-widest hover:bg-amber-600/10 transition-all"
            >
              <span>INTEL_DATABASE</span>
              <i className="fas fa-file-invoice"></i>
            </a>
          )}
        </div>

        <div className="pt-4 flex justify-between items-center text-[8px] text-slate-700 font-bold uppercase tracking-tighter">
          <span>SEC_ENCRYPT: RSA_4096</span>
          <span>SYNC_AGE: 0.04S</span>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
