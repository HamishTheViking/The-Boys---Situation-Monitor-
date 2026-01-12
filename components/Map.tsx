
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import * as d3 from 'd3';
import { WORLD_GEOJSON_URL, STRATEGIC_POIS } from '../constants';
import { StrategicAsset, AssetType, Affiliation } from '../types';

interface MapProps {
  assets: StrategicAsset[];
  onAssetClick: (asset: StrategicAsset) => void;
  focusTheater?: { center: [number, number], zoom: number };
  showPaths: boolean;
  onTogglePaths: () => void;
}

interface WeatherData {
  temp: number;
  wind: number;
  condition: string;
  name: string;
}

const getAssetColor = (asset: StrategicAsset) => {
  if (asset.country === 'RUSSIA') return "#ef4444";
  if (asset.country === 'CHINA') return "#fbbf24";
  if (asset.affiliation === Affiliation.NATO) return "#3b82f6";
  if (asset.affiliation === Affiliation.ALLIED) return "#22c55e";
  if (asset.affiliation === Affiliation.UNKNOWN) return "#a855f7";
  return "#94a3b8";
};

const getSimulatedWeather = (lat: number, lng: number, name: string): WeatherData => {
  const baseTemp = 25 - Math.abs(lat) * 0.55;
  const randomFactor = (Math.sin(lat * 0.1) + Math.cos(lng * 0.1)) * 5;
  const temp = Math.round(baseTemp + randomFactor);
  const wind = Math.round(Math.abs(Math.sin(lat * lng) * 40) + 5);
  let condition = "CLEAR";
  if (wind > 30) condition = "GALE";
  else if (temp < 0) condition = "SNOW";
  else if (temp > 32) condition = "HEATWAVE";
  else if (Math.random() > 0.8) condition = "STORM";
  return { temp, wind, condition, name };
};

const Map = forwardRef<any, MapProps>(({ assets, onAssetClick, focusTheater, showPaths, onTogglePaths }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const zoomRef = useRef<any>(null);
  const gRef = useRef<any>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [showWeather, setShowWeather] = useState(false);
  const [hoverWeather, setHoverWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    d3.json(WORLD_GEOJSON_URL).then(data => setGeoData(data));
  }, []);

  const handleManualZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(500).call(zoomRef.current.scaleBy, factor);
  };

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  useEffect(() => {
    if (!svgRef.current || !zoomRef.current || !focusTheater) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const projection = d3.geoMercator().scale(width / 6.2).translate([width / 2, height / 1.5]);
    const target = projection([focusTheater.center[0], focusTheater.center[1]]);
    if (target) {
      svg.transition().duration(2000).ease(d3.easeCubicInOut)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(focusTheater.zoom).translate(-target[0], -target[1]));
    }
  }, [focusTheater]);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator().scale(width / 6.2).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);
    const g = svg.append("g");
    gRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 1000]).on("zoom", (event) => {
      g.attr("transform", event.transform);
      setCurrentZoom(event.transform.k);
    });
    zoomRef.current = zoom;
    svg.call(zoom);

    const visualScale = 1 / Math.pow(currentZoom, 0.65);
    const labelScale = 1 / Math.pow(currentZoom, 0.85);

    svg.insert("rect", "g").attr("width", width).attr("height", height).attr("fill", "#050507");

    // Render Countries with high-contrast borders
    g.selectAll("path.country")
      .data(geoData.features)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path as any)
      .attr("fill", showWeather ? "#0d1b2a" : "#111418")
      .attr("stroke", "#3a414a") // Map borders added here
      .attr("stroke-width", 0.7 / currentZoom)
      .style("transition", "fill 0.4s ease")
      .on("mouseover", function(event, d: any) {
        d3.select(this).attr("fill", showWeather ? "#1b263b" : "#1c2229");
        if (showWeather) {
          const [lng, lat] = projection.invert!(d3.pointer(event));
          setHoverWeather(getSimulatedWeather(lat, lng, d.properties.name));
        }
      })
      .on("mousemove", function(event) {
        if (showWeather && tooltipRef.current) {
          const x = event.clientX + 15;
          const y = event.clientY + 15;
          tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", showWeather ? "#0d1b2a" : "#111418");
        setHoverWeather(null);
      });

    // Render Movement Trails
    if (showPaths) {
      const trailLine = d3.line<[number, number]>().x(d => d[0]).y(d => d[1]).curve(d3.curveBasis);
      const trails = g.append("g").attr("class", "asset-trails");
      assets.forEach(asset => {
        if (asset.pathHistory && asset.pathHistory.length > 1) {
          const points = asset.pathHistory.map(p => projection([p.lng, p.lat]) as [number, number]);
          trails.append("path").datum(points).attr("d", trailLine).attr("fill", "none")
            .attr("stroke", getAssetColor(asset)).attr("stroke-width", 1.2 / currentZoom)
            .attr("stroke-dasharray", `${4/currentZoom},${3/currentZoom}`).attr("opacity", 0.3);
        }
      });
    }

    // Render POIs
    const poiLayer = g.append("g").attr("class", "pois");
    poiLayer.selectAll(".poi")
      .data(STRATEGIC_POIS)
      .enter().append("g").attr("class", "poi")
      .attr("transform", d => {
        const p = projection([d.location.lng, d.location.lat]);
        return p ? `translate(${p[0]}, ${p[1]})` : null;
      })
      .style("opacity", d => {
        const z = currentZoom;
        if (d.type === 'CITY') return z < 1.4 ? 0.35 : 1;
        if (d.type === 'STRAIT') return z > 2.5 ? 1 : 0;
        if (d.type === 'BASE') return z > 5.0 ? 1 : 0;
        return 0;
      })
      .each(function(d) {
        const node = d3.select(this);
        node.append("circle").attr("r", (d.type === 'CITY' ? 1.4 : 0.8) * visualScale * 1.5)
          .attr("fill", d.type === 'CITY' ? '#e2e8f0' : '#fbbf24').attr("stroke", "#000").attr("stroke-width", 0.1 * visualScale);
        node.append("text").attr("dy", -4.5 * visualScale).attr("text-anchor", "middle")
          .attr("fill", d.type === 'CITY' ? '#94a3b8' : '#fbbf24').attr("font-size", (d.type === 'CITY' ? 2.8 : 2.2) * labelScale * 3.5 + "px")
          .attr("font-family", "Orbitron").attr("font-weight", "900").attr("style", "text-shadow: 0 0 5px #000; pointer-events: none;").text(d.name.toUpperCase());
      });

    // Render Assets with dynamic, high-fidelity icons
    const nodes = g.selectAll(".asset").data(assets).enter().append("g").attr("class", "asset")
      .attr("transform", d => {
        const p = projection([d.location.lng, d.location.lat]);
        return p ? `translate(${p[0]}, ${p[1]})` : null;
      })
      .on("click", (e, d) => onAssetClick(d))
      .on("mouseenter", function(e, d) {
        const color = getAssetColor(d);
        const group = d3.select(this);
        group.select(".asset-icon-group").transition().duration(200).attr("transform", `scale(${visualScale * 7.5})`);
        group.selectAll(".asset-path").transition().duration(200).style("filter", `drop-shadow(0 0 8px ${color})`);
        group.select(".asset-label").transition().duration(200).style("fill", "#fff").attr("font-size", 7 * labelScale * 7 + "px");
      })
      .on("mouseleave", function(e, d) {
        const color = getAssetColor(d);
        const group = d3.select(this);
        group.select(".asset-icon-group").transition().duration(200).attr("transform", `scale(${visualScale * 5.5})`);
        group.selectAll(".asset-path").transition().duration(200).style("filter", null);
        group.select(".asset-label").transition().duration(200).style("fill", color).attr("font-size", 5 * labelScale * 6 + "px");
      });

    nodes.each(function(d) {
      const color = getAssetColor(d);
      const node = d3.select(this);
      const iconGroup = node.append("g").attr("class", "asset-icon-group").attr("transform", `scale(${visualScale * 5.5})`);

      if (d.type === AssetType.AIRCRAFT) {
        // High fidelity fixed-wing silhouette
        iconGroup.append("path").attr("class", "asset-path")
          .attr("d", "M0,-8 L1.5,-6 L1.5,-2 L10,2 L10,4 L1.5,2 L1.5,7 L5,10 L5,11 L0,10 L-5,11 L-5,10 L-1.5,7 L-1.5,2 L-10,4 L-10,2 L-1.5,-2 L-1.5,-6 Z")
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 0.4)
          .attr("transform", `rotate(${d.heading})`);
      } else if (d.type === AssetType.VESSEL) {
        // Sleek hull silhouette
        iconGroup.append("path").attr("class", "asset-path")
          .attr("d", "M0,-10 C2.5,-8 4,-4 4,3 L4,10 L0,12 L-4,10 L-4,3 C-4,-4 -2.5,-8 0,-10 Z M-2,1 L2,1 M-1.5,4 L1.5,4")
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 0.4)
          .attr("transform", `rotate(${d.heading})`);
      } else {
        // Ground unit (Tank/APC silhouette)
        iconGroup.append("path").attr("class", "asset-path")
          .attr("d", "M-7,-5 L7,-5 L8,2 L8,6 L-8,6 L-8,2 Z M-4,-1 L4,-1 L4,-8 L-4,-8 Z M0,-12 L0,-8")
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 0.5);
      }

      // Dynamic asset labels
      node.append("text").attr("class", "asset-label").attr("x", 16 * visualScale * 5).attr("y", 4 * visualScale * 5)
        .attr("fill", color).attr("font-size", 5 * labelScale * 6 + "px").attr("font-family", "Orbitron")
        .attr("font-weight", "900").attr("style", "text-shadow: 0 0 5px #000; pointer-events: none;").text(d.name);
    });

    nodes.filter(d => d.status === 'ALERT').append("circle").attr("r", 20 * visualScale).attr("fill", "none")
      .attr("stroke", d => getAssetColor(d)).attr("stroke-width", 2 * visualScale).attr("opacity", 0.8)
      .append("animate").attr("attributeName", "r").attr("from", (20 * visualScale).toString()).attr("to", (50 * visualScale).toString())
      .attr("dur", "2.5s").attr("repeatCount", "indefinite");

  }, [geoData, assets, onAssetClick, currentZoom, showWeather, showPaths]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050507] rounded-lg border border-[#30363d] group">
      {/* Weather HUD */}
      <div ref={tooltipRef} className={`fixed top-0 left-0 z-[100] pointer-events-none transition-opacity duration-200 ${hoverWeather ? 'opacity-100' : 'opacity-0'}`} style={{ width: '200px' }}>
        {hoverWeather && (
          <div className="bg-black/95 backdrop-blur-2xl border border-blue-500/50 p-3 dx-border shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <div className="flex justify-between items-center mb-2 border-b border-blue-500/20 pb-1">
              <span className="text-[10px] font-hud font-bold text-blue-400 tracking-widest">{hoverWeather.name.toUpperCase()}</span>
              <i className={`fas ${hoverWeather.condition === 'CLEAR' ? 'fa-sun' : 'fa-meteor'} text-blue-400 text-[10px]`}></i>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-tighter text-white">
              <div><span className="text-slate-500 block mb-0.5">ATMOS_TEMP</span><span className="text-blue-300 font-hud">{hoverWeather.temp}°C</span></div>
              <div><span className="text-slate-500 block mb-0.5">WIND_VEC</span><span className="text-blue-300 font-hud">{hoverWeather.wind} KN</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Top HUD Cluster (Trails & Weather) */}
      <div className="absolute top-6 right-6 z-40 flex gap-3 pointer-events-auto">
        <button 
          onClick={() => setShowWeather(!showWeather)} 
          className={`h-11 px-5 dx-border flex items-center gap-3 transition-all font-hud font-bold text-[10px] tracking-[0.2em] uppercase ${showWeather ? 'bg-blue-600/30 text-blue-300 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'text-slate-500 hover:text-blue-400 hover:bg-blue-600/10'}`}
        >
          <i className="fas fa-satellite-dish"></i> WEATHER
        </button>
        <button 
          onClick={onTogglePaths} 
          className={`h-11 px-5 dx-border flex items-center gap-3 transition-all font-hud font-bold text-[10px] tracking-[0.2em] uppercase ${showPaths ? 'bg-amber-600/30 text-amber-500 border-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.5)]' : 'text-slate-500 hover:text-amber-500 hover:bg-amber-600/10'}`}
        >
          <i className="fas fa-wave-square"></i> TRAILS
        </button>
      </div>

      {/* Static Visual Overlays */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="dx-border px-4 py-2 text-[10px] flex items-center gap-3 font-hud border-l-4 border-l-[#3b82f6] shadow-lg">
          <div className="w-2 h-2 bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]"></div>
          <span className="text-[#3b82f6] tracking-widest uppercase">NATO // SECURE LINK</span>
        </div>
        <div className="dx-border px-4 py-2 text-[10px] flex items-center gap-3 font-hud border-l-4 border-l-[#ef4444] animate-pulse">
          <div className="w-2 h-2 bg-[#ef4444] shadow-[0_0_5px_#ef4444]"></div>
          <span className="text-[#ef4444] tracking-widest uppercase">OPFOR // RED ALERT</span>
        </div>
      </div>

      {/* Zoom Interface */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
        <button onClick={() => handleManualZoom(1.8)} className="w-12 h-12 dx-border flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-all font-bold text-xl"><i className="fas fa-plus"></i></button>
        <button onClick={() => handleManualZoom(0.6)} className="w-12 h-12 dx-border flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-all font-bold text-xl"><i className="fas fa-minus"></i></button>
        <button onClick={resetZoom} className="w-12 h-12 dx-border flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-all font-bold text-lg"><i className="fas fa-crosshairs"></i></button>
      </div>

      {/* Coordinates / Mag Overlay */}
      <div className="absolute bottom-6 left-6 z-10 font-hud text-[9px] text-slate-500 pointer-events-none flex flex-col gap-1 bg-black/60 p-3 border border-white/5 backdrop-blur-md">
        <span>LOC: {focusTheater?.center[1].toFixed(2)}N / {focusTheater?.center[0].toFixed(2)}E</span>
        <span>MAG: {currentZoom.toFixed(1)}X</span>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-crosshair" />
    </div>
  );
});

export default Map;
