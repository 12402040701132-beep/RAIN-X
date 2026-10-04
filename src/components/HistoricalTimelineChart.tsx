import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalSeasonTrend } from '../data/historicalArchiveData';

interface HistoricalTimelineChartProps {
  data: HistoricalSeasonTrend[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  metricType: 'rmse' | 'csi';
}

export const HistoricalTimelineChart: React.FC<HistoricalTimelineChartProps> = ({
  data,
  selectedYear,
  onSelectYear,
  metricType
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    season: HistoricalSeasonTrend;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Dimensions
    const width = 800;
    const height = 320;
    const margin = { top: 30, right: 40, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xExtent = d3.extent(data, d => d.year) as [number, number];
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth]);

    let yScale: d3.ScaleLinear<number, number>;
    if (metricType === 'rmse') {
      const maxY = Math.ceil(d3.max(data, d => Math.max(d.rawNwpRmse, d.rainXRmse)) || 25) + 2;
      yScale = d3.scaleLinear()
        .domain([0, maxY])
        .range([innerHeight, 0]);
    } else {
      yScale = d3.scaleLinear()
        .domain([0.2, 0.85])
        .range([innerHeight, 0]);
    }

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Subtle Grid lines
    const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1E3E62')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(data.length)
      .tickFormat(d => `${d}`);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => metricType === 'rmse' ? `${d} mm` : `${d}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#94A3B8')
      .selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '11px')
      .attr('font-weight', '600');

    g.append('g')
      .call(yAxis)
      .attr('color', '#94A3B8')
      .selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '11px')
      .attr('font-weight', '600');

    // Gradient definitions
    const defs = svg.append('defs');

    const areaGrad = defs.append('linearGradient')
      .attr('id', 'rainx-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00ADB5')
      .attr('stop-opacity', 0.35);

    areaGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00ADB5')
      .attr('stop-opacity', 0.0);

    if (metricType === 'rmse') {
      // 1. Raw NWP Line
      const rawLine = d3.line<HistoricalSeasonTrend>()
        .x(d => xScale(d.year))
        .y(d => yScale(d.rawNwpRmse))
        .curve(d3.curveMonotoneX);

      // 2. Generic ML Line
      const genLine = d3.line<HistoricalSeasonTrend>()
        .x(d => xScale(d.year))
        .y(d => yScale(d.genericMlRmse))
        .curve(d3.curveMonotoneX);

      // 3. RAIN-X Line
      const rainxLine = d3.line<HistoricalSeasonTrend>()
        .x(d => xScale(d.year))
        .y(d => yScale(d.rainXRmse))
        .curve(d3.curveMonotoneX);

      // RAIN-X Area fill
      const rainxArea = d3.area<HistoricalSeasonTrend>()
        .x(d => xScale(d.year))
        .y0(innerHeight)
        .y1(d => yScale(d.rainXRmse))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'url(#rainx-area-grad)')
        .attr('d', rainxArea);

      // Draw Raw NWP line (dashed gray)
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#64748B')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,4')
        .attr('d', rawLine);

      // Draw Generic ML line (purple)
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#A855F7')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3')
        .attr('d', genLine);

      // Draw RAIN-X line (bold teal)
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#00ADB5')
        .attr('stroke-width', 3.5)
        .attr('d', rainxLine);

    } else {
      // CSI Metric comparison
      const rawCsiLine = d3.line<HistoricalSeasonTrend>()
        .x(d => xScale(d.year))
        .y(d => yScale(d.rawNwpCsi))
        .curve(d3.curveMonotoneX);

      const rainxCsiLine = d3.line<HistoricalSeasonTrend>()
        .x(d => xScale(d.year))
        .y(d => yScale(d.rainXCsi))
        .curve(d3.curveMonotoneX);

      const csiArea = d3.area<HistoricalSeasonTrend>()
        .x(d => xScale(d.year))
        .y0(innerHeight)
        .y1(d => yScale(d.rainXCsi))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'url(#rainx-area-grad)')
        .attr('d', csiArea);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#64748B')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,4')
        .attr('d', rawCsiLine);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#00ADB5')
        .attr('stroke-width', 3.5)
        .attr('d', rainxCsiLine);
    }

    // Points on RAIN-X line
    const dots = g.selectAll('.dot')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'dot')
      .attr('transform', d => {
        const yVal = metricType === 'rmse' ? d.rainXRmse : d.rainXCsi;
        return `translate(${xScale(d.year)},${yScale(yVal)})`;
      });

    dots.append('circle')
      .attr('r', d => d.year === selectedYear ? 8 : 5)
      .attr('fill', d => d.year === selectedYear ? '#38E54D' : '#00ADB5')
      .attr('stroke', '#0B192C')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltipData({ x: mx, y: my, season: d });
      })
      .on('mouseleave', () => {
        setTooltipData(null);
      })
      .on('click', (_, d) => {
        onSelectYear(d.year);
      });

    // Outer glow for selected point
    dots.filter(d => d.year === selectedYear)
      .append('circle')
      .attr('r', 14)
      .attr('fill', 'none')
      .attr('stroke', '#00ADB5')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.8);

  }, [data, selectedYear, metricType, onSelectYear]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 800 320"
        className="w-full h-auto max-h-[340px]"
      />

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 border border-teal-500/80 rounded-lg p-2.5 shadow-xl text-xs text-slate-200 backdrop-blur transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }}
        >
          <div className="font-bold text-teal-300">{tooltipData.season.season}</div>
          <div className="text-[10px] text-slate-400">{tooltipData.season.highlightEvent}</div>
          <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] space-y-0.5 font-mono">
            {metricType === 'rmse' ? (
              <>
                <div className="text-teal-300 font-bold">RAIN-X: {tooltipData.season.rainXRmse} mm</div>
                <div className="text-purple-300">Generic ML: {tooltipData.season.genericMlRmse} mm</div>
                <div className="text-slate-400">Raw NWP: {tooltipData.season.rawNwpRmse} mm</div>
              </>
            ) : (
              <>
                <div className="text-teal-300 font-bold">RAIN-X CSI: {tooltipData.season.rainXCsi}</div>
                <div className="text-slate-400">Raw NWP CSI: {tooltipData.season.rawNwpCsi}</div>
              </>
            )}
          </div>
          <div className="text-[9px] text-emerald-400 mt-1">Click to drill down into season</div>
        </div>
      )}
    </div>
  );
};
