
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';
import { WORLD_GEOJSON_URL, STRATEGIC_POIS } from '../constants';
import { StrategicAsset, AssetType, Affiliation, TheaterPOI } from '../types';

interface MapProps {
  assets: StrategicAsset[];
  onAssetClick: (asset: StrategicAsset) => void;
  focusTheater?: { center: [number, number], zoom: number };
}

const getAssetColor = (asset: StrategicAsset) => {
  if (asset.country === 'RUSSIA') return "#ef4444";
  if (asset.country === 'CHINA') return "#fbbf24";
  if (asset.affiliation === Affiliation.NATO) return "#3b82f6";
  if (asset.affiliation === Affiliation.ALLIED) return "#22c55e";
  if (asset.affiliation === Affiliation.UNKNOWN) return "#a855f7";
  return "#94a3b8";
};

const Map = forwardRef<any, MapProps>(({ assets, onAssetClick, focusTheater }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const zoomRef = useRef<any>(null);
  const gRef = useRef<any>(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  useEffect(() => {
    d3.json(WORLD_GEOJSON_URL).then(data => {
      setGeoData(data);
    });
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

    const projection = d3.geoMercator()
      .scale(width / 6.2)
      .translate([width / 2, height / 1.5]);

    const target = projection([focusTheater.center[0], focusTheater.center[1]]);
    if (target) {
      svg.transition()
        .duration(2000)
        .ease(d3.easeCubicInOut)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(focusTheater.zoom)
            .translate(-target[0], -target[1])
        );
    }
  }, [focusTheater]);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .scale(width / 6.2)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const g = svg.append("g");
    gRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 500])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setCurrentZoom(event.transform.k);
      });
    
    zoomRef.current = zoom;
    svg.call(zoom);

    g.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("fill", "#18181b")
      .attr("stroke", "#27272a")
      .attr("stroke-width", 0.5)
      .style("vector-effect", "non-scaling-stroke")
      .on("mouseover", function() { d3.select(this).attr("fill", "#212124"); })
      .on("mouseout", function() { d3.select(this).attr("fill", "#18181b"); });

    const poiLayer = g.append("g").attr("class", "pois");
    const pois = poiLayer.selectAll(".poi")
      .data(STRATEGIC_POIS)
      .enter()
      .append("g")
      .attr("class", "poi")
      .attr("transform", d => {
        const p = projection([d.location.lng, d.location.lat]);
        return p ? `translate(${p[0]}, ${p[1]})` : null;
      })
      .style("opacity", d => (currentZoom > (d.type === 'PROVINCE' ? 10 : 3) ? 1 : 0))
      .style("pointer-events", "none");

    pois.append("circle")
      .attr("r", d => d.type === 'PROVINCE' ? 0.3 : 1.0)
      .attr("fill", d => d.type === 'BASE' ? '#ef4444' : d.type === 'STRAIT' ? '#fbbf24' : '#d97706');

    pois.append("text")
      .attr("dy", -3)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.type === 'PROVINCE' ? '#71717a' : '#d97706')
      .attr("font-size", d => (d.type === 'PROVINCE' ? "1.5px" : "2.5px"))
      .attr("font-family", "JetBrains Mono")
      .attr("font-weight", "bold")
      .attr("opacity", d => d.type === 'PROVINCE' ? 0.6 : 1)
      .text(d => d.name.toUpperCase());

    const nodes = g.selectAll(".asset")
      .data(assets)
      .enter()
      .append("g")
      .attr("class", "asset")
      .attr("transform", d => {
        const p = projection([d.location.lng, d.location.lat]);
        return p ? `translate(${p[0]}, ${p[1]})` : null;
      })
      .style("cursor", "pointer")
      .on("click", (event, d) => onAssetClick(d));

    nodes.each(function(d) {
      const color = getAssetColor(d);
      const node = d3.select(this);
      const iconScale = Math.max(0.1, 1 / Math.sqrt(currentZoom));
      const iconGroup = node.append("g").attr("transform", `scale(${iconScale * 2})`);

      if (d.type === AssetType.AIRCRAFT) {
        iconGroup.append("path")
          .attr("d", "M0,-6 L1,-5 L5,-1 L5,0 L1,0 L1,4 L3,6 L3,7 L0,6 L-3,7 L-3,6 L-1,4 L-1,0 L-5,0 L-5,-1 L-1,-5 Z")
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.3)
          .attr("transform", `rotate(${d.heading})`);
      } else if (d.type === AssetType.VESSEL) {
        iconGroup.append("path")
          .attr("d", "M0,-7 L3,-4 L3,5 L0,7 L-3,5 L-3,-4 Z")
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.3)
          .attr("transform", `rotate(${d.heading})`);
      } else {
        const gMan = iconGroup.append("g").attr("transform", "translate(0,-3.5)");
        gMan.append("circle")
          .attr("cx", 0).attr("cy", 0).attr("r", 1.8)
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 0.3);
        gMan.append("path")
          .attr("d", "M-2.5,2.5 L2.5,2.5 L3.5,8 L-3.5,8 Z")
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 0.3);
      }

      node.append("text")
        .attr("x", 4 * iconScale * 3)
        .attr("y", 1 * iconScale * 3)
        .attr("fill", color)
        .attr("font-size", `${3 * iconScale * 2}px`)
        .attr("font-family", "Orbitron")
        .attr("font-weight", "bold")
        .attr("style", "text-shadow: 0 0 2px rgba(0,0,0,0.8); pointer-events: none;")
        .text(d.name.split(' ')[0]);
    });

    nodes.filter(d => d.status === 'ALERT')
      .append("circle")
      .attr("r", 2)
      .attr("fill", "none")
      .attr("stroke", d => getAssetColor(d))
      .attr("stroke-width", 0.5)
      .append("animate")
      .attr("attributeName", "r")
      .attr("from", "2")
      .attr("to", "10")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

  }, [geoData, assets, onAssetClick, currentZoom]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#000000] rounded-lg border border-[#1a1a1e]">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="dx-border px-3 py-1 text-[9px] flex items-center gap-2 font-hud border-l-2 border-l-[#3b82f6]">
          <div className="w-1.5 h-1.5 bg-[#3b82f6]"></div>
          <span className="text-[#3b82f6] tracking-widest">NATO LINK // ACTIVE</span>
        </div>
        <div className="dx-border px-3 py-1 text-[9px] flex items-center gap-2 font-hud border-l-2 border-l-[#ef4444]">
          <div className="w-1.5 h-1.5 bg-[#ef4444]"></div>
          <span className="text-[#ef4444] tracking-widest">RUSSIA // RED ALERT</span>
        </div>
        <div className="dx-border px-3 py-1 text-[9px] flex items-center gap-2 font-hud border-l-2 border-l-[#fbbf24]">
          <div className="w-1.5 h-1.5 bg-[#fbbf24]"></div>
          <span className="text-[#fbbf24] tracking-widest">CHINA // YELLOW SECTOR</span>
        </div>
        <div className="dx-border px-3 py-1 text-[9px] flex items-center gap-2 font-hud border-l-2 border-l-[#a855f7]">
          <div className="w-1.5 h-1.5 bg-[#a855f7]"></div>
          <span className="text-[#a855f7] tracking-widest">UNKNOWN // PURPLE SPEC</span>
        </div>
      </div>

      {/* Manual Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button 
          onClick={() => handleManualZoom(1.5)}
          className="w-10 h-10 dx-border flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-black transition-all font-bold text-xl"
          title="Zoom In"
        >
          <i className="fas fa-plus"></i>
        </button>
        <button 
          onClick={() => handleManualZoom(0.75)}
          className="w-10 h-10 dx-border flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-black transition-all font-bold text-xl"
          title="Zoom Out"
        >
          <i className="fas fa-minus"></i>
        </button>
        <button 
          onClick={resetZoom}
          className="w-10 h-10 dx-border flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-black transition-all font-bold text-lg"
          title="Reset Zoom"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 font-mono text-[8px] text-[#475569] pointer-events-none flex flex-col">
        <span>GRID: {focusTheater?.center[0].toFixed(2)}, {focusTheater?.center[1].toFixed(2)}</span>
        <span>MAG: {currentZoom.toFixed(1)}x</span>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
});

export default Map;
