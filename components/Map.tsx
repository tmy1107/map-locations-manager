
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Location } from '../types';

interface MapProps {
  locations: Location[];
  onMarkerClick?: (location: Location) => void;
}

const Map: React.FC<MapProps> = ({ locations, onMarkerClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch World GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => res.json())
      .then(data => setWorldData(data))
      .catch(err => console.error("Error loading map data:", err));
  }, []);

  // Map Rendering and Interactions
  useEffect(() => {
    if (!worldData || !svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const { width, height } = dimensions;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const projection = d3.geoMercator()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Initial Render of Land
    g.selectAll('path.country')
      .data(worldData.features)
      .join('path')
      .attr('class', 'country')
      .attr('d', path as any)
      .attr('fill', '#e2e8f0')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 0.5);

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        // Scale stroke and markers to keep them visible but not huge
        g.selectAll('path.country').attr('stroke-width', 0.5 / event.transform.k);
        g.selectAll('.marker-circle').attr('r', 5 / event.transform.k);
        g.selectAll('.marker-text').style('font-size', `${12 / event.transform.k}px`);
      });

    svg.call(zoom);

    // Force updates when locations change
    const markers = g.selectAll('.marker-group')
      .data(locations, (d: any) => d.id)
      .join('g')
      .attr('class', 'marker-group cursor-pointer')
      .on('click', (event, d) => onMarkerClick?.(d));

    markers.selectAll('circle')
      .data(d => [d])
      .join('circle')
      .attr('class', 'marker-circle')
      .attr('cx', d => projection([d.lng, d.lat])?.[0] || 0)
      .attr('cy', d => projection([d.lng, d.lat])?.[1] || 0)
      .attr('r', 5 / (d3.zoomTransform(svg.node()!).k || 1))
      .attr('fill', '#ef4444')
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    markers.selectAll('text')
      .data(d => [d])
      .join('text')
      .attr('class', 'marker-text font-medium select-none')
      .attr('x', d => (projection([d.lng, d.lat])?.[0] || 0) + 8 / (d3.zoomTransform(svg.node()!).k || 1))
      .attr('y', d => (projection([d.lng, d.lat])?.[1] || 0) + 4 / (d3.zoomTransform(svg.node()!).k || 1))
      .text(d => d.name)
      .attr('fill', '#1e293b')
      .style('font-size', `${12 / (d3.zoomTransform(svg.node()!).k || 1)}px`);

  }, [worldData, dimensions, locations, onMarkerClick]);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur p-2 rounded-lg shadow-sm text-xs text-slate-500 border border-slate-200">
        Use 1 finger to move, 2 fingers or scroll to zoom
      </div>
      <svg ref={svgRef} className="w-full h-full block">
        <g ref={gRef} />
      </svg>
    </div>
  );
};

export default Map;
