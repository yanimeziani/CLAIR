'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HeatmapFilters } from './HeatmapControls';

interface HeatmapPoint {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  intensity: number;
  timestamp: number;
  type: 'click' | 'mousemove' | 'scroll' | 'touch' | 'form_input';
  count?: number;
}

interface EnhancedHeatmapVisualizationProps {
  data: HeatmapPoint[];
  filters: HeatmapFilters;
  width: number;
  height: number;
  className?: string;
  isPlaying?: boolean;
  onPointClick?: (point: HeatmapPoint) => void;
}

export default function EnhancedHeatmapVisualization({
  data,
  filters,
  width,
  height,
  className = '',
  isPlaying = false,
  onPointClick
}: EnhancedHeatmapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [filteredData, setFilteredData] = useState<HeatmapPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Filter data based on current filters
  useEffect(() => {
    let filtered = data.filter(point => {
      // Filter by event type
      if (!filters.eventTypes[point.type]) return false;
      
      // Filter by intensity range
      if (point.intensity < filters.intensityRange.min || point.intensity > filters.intensityRange.max) {
        return false;
      }
      
      // Filter by device type (would need user agent analysis)
      // For now, we'll skip this filter
      
      return true;
    });

    setFilteredData(filtered);
  }, [data, filters]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setCurrentFrame(prev => (prev + 1) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid if enabled
    if (filters.showHeatmap) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw heatmap
    if (filters.showHeatmap) {
      drawHeatmap(ctx, filteredData, canvas.width, canvas.height);
    }

    // Draw individual points if enabled
    if (filters.showDots) {
      drawPoints(ctx, filteredData, canvas.width, canvas.height);
    }

    // Draw paths if enabled
    if (filters.showPaths) {
      drawPaths(ctx, filteredData, canvas.width, canvas.height);
    }

    // Draw legend
    drawLegend(ctx, canvas.width, canvas.height);

  }, [filteredData, filters, currentFrame, width, height]);

  const drawGrid = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  };

  const drawHeatmap = (ctx: CanvasRenderingContext2D, points: HeatmapPoint[], canvasWidth: number, canvasHeight: number) => {
    // Create a separate canvas for the heatmap
    const heatmapCanvas = document.createElement('canvas');
    heatmapCanvas.width = canvasWidth;
    heatmapCanvas.height = canvasHeight;
    const heatmapCtx = heatmapCanvas.getContext('2d');
    
    if (!heatmapCtx) return;

    // Draw each point as a radial gradient
    points.forEach(point => {
      const x = (point.x / width) * canvasWidth;
      const y = (point.y / height) * canvasHeight;
      const radius = Math.max(20, point.intensity * 60);
      
      // Create gradient based on point type and intensity
      const gradient = heatmapCtx.createRadialGradient(x, y, 0, x, y, radius);
      
      const color = getColorForEventType(point.type);
      const alpha = point.intensity * filters.opacity;
      
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      gradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      heatmapCtx.fillStyle = gradient;
      heatmapCtx.beginPath();
      heatmapCtx.arc(x, y, radius, 0, Math.PI * 2);
      heatmapCtx.fill();
    });

    // Apply the heatmap to the main canvas
    ctx.drawImage(heatmapCanvas, 0, 0);
  };

  const drawPoints = (ctx: CanvasRenderingContext2D, points: HeatmapPoint[], canvasWidth: number, canvasHeight: number) => {
    points.forEach((point, index) => {
      const x = (point.x / width) * canvasWidth;
      const y = (point.y / height) * canvasHeight;
      
      // Animate points if playing
      const animationOffset = isPlaying ? Math.sin((currentFrame + index * 10) * 0.1) * 2 : 0;
      
      const color = getColorForEventType(point.type);
      const radius = Math.max(3, point.intensity * 8) + animationOffset;
      
      // Draw point
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
      ctx.beginPath();
      ctx.arc(x, y + animationOffset, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw count if available
      if (point.count && point.count > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(point.count.toString(), x, y + 3);
      }
    });
  };

  const drawPaths = (ctx: CanvasRenderingContext2D, points: HeatmapPoint[], canvasWidth: number, canvasHeight: number) => {
    // Sort points by timestamp
    const sortedPoints = [...points].sort((a, b) => a.timestamp - b.timestamp);
    
    if (sortedPoints.length < 2) return;

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw path
    ctx.beginPath();
    sortedPoints.forEach((point, index) => {
      const x = (point.x / width) * canvasWidth;
      const y = (point.y / height) * canvasHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw direction arrows
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const current = sortedPoints[i];
      const next = sortedPoints[i + 1];
      
      const x1 = (current.x / width) * canvasWidth;
      const y1 = (current.y / height) * canvasHeight;
      const x2 = (next.x / width) * canvasWidth;
      const y2 = (next.y / height) * canvasHeight;
      
      drawArrow(ctx, x1, y1, x2, y2);
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;
    
    // Calculate midpoint
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(
      midX - arrowLength * Math.cos(angle - arrowAngle),
      midY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      midX - arrowLength * Math.cos(angle + arrowAngle),
      midY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const legendX = canvasWidth - 200;
    const legendY = 20;
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(legendX, legendY, 180, 140);
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 180, 140);
    
    // Title
    ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Types d\'événements', legendX + 10, legendY + 20);
    
    // Legend items
    const eventTypes = [
      { type: 'click', label: 'Clics', icon: '🖱️' },
      { type: 'mousemove', label: 'Mouvements', icon: '🐭' },
      { type: 'scroll', label: 'Défilement', icon: '📜' },
      { type: 'touch', label: 'Tactile', icon: '👆' },
      { type: 'form_input', label: 'Formulaires', icon: '📝' }
    ];
    
    eventTypes.forEach((item, index) => {
      const y = legendY + 40 + (index * 20);
      const color = getColorForEventType(item.type as any);
      
      // Color square
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
      ctx.fillRect(legendX + 10, y - 8, 12, 12);
      
      // Label
      ctx.fillStyle = 'rgba(17, 24, 39, 0.8)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${item.icon} ${item.label}`, legendX + 28, y);
    });
  };

  const getColorForEventType = (type: string) => {
    switch (type) {
      case 'click':
        return { r: 239, g: 68, b: 68 }; // Red
      case 'mousemove':
        return { r: 59, g: 130, b: 246 }; // Blue
      case 'scroll':
        return { r: 147, g: 51, b: 234 }; // Purple
      case 'touch':
        return { r: 245, g: 158, b: 11 }; // Orange
      case 'form_input':
        return { r: 34, g: 197, b: 94 }; // Green
      default:
        return { r: 156, g: 163, b: 175 }; // Gray
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPointClick) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find the closest point
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    
    let closestPoint: HeatmapPoint | null = null;
    let closestDistance = Infinity;
    
    filteredData.forEach(point => {
      const pointX = (point.x / width) * canvasWidth;
      const pointY = (point.y / height) * canvasHeight;
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance < 20 && distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    });
    
    if (closestPoint) {
      onPointClick(closestPoint);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePos({ x, y });
    
    // Find hovered point
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    
    let hoveredPoint: HeatmapPoint | null = null;
    let closestDistance = Infinity;
    
    filteredData.forEach(point => {
      const pointX = (point.x / width) * canvasWidth;
      const pointY = (point.y / height) * canvasHeight;
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance < 20 && distance < closestDistance) {
        closestDistance = distance;
        hoveredPoint = point;
      }
    });
    
    setHoveredPoint(hoveredPoint);
  };

  return (
    <div className={`analytics-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--ws-gray-900))] flex items-center">
          <div className="w-2 h-2 bg-[rgb(var(--heatmap-hot))] rounded-full mr-3"></div>
          Carte de Chaleur Interactive
        </h3>
        <div className="text-sm text-[rgb(var(--ws-gray-600))]">
          {filteredData.length} points affichés
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full border border-[rgb(var(--ws-gray-200))] rounded-lg overflow-hidden bg-[rgb(var(--ws-gray-50))]"
        style={{ height: `${height}px` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 p-2 bg-white rounded-lg shadow-lg border border-[rgb(var(--ws-gray-200))] pointer-events-none"
            style={{
              left: mousePos.x + 10,
              top: mousePos.y - 10,
              transform: 'translate(0, -100%)'
            }}
          >
            <div className="text-sm font-semibold text-[rgb(var(--ws-gray-900))]">
              {hoveredPoint.type.charAt(0).toUpperCase() + hoveredPoint.type.slice(1)}
            </div>
            <div className="text-xs text-[rgb(var(--ws-gray-600))]">
              Position: ({hoveredPoint.x}, {hoveredPoint.y})
            </div>
            <div className="text-xs text-[rgb(var(--ws-gray-600))]">
              Intensité: {(hoveredPoint.intensity * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-[rgb(var(--ws-gray-600))]">
              {new Date(hoveredPoint.timestamp).toLocaleString('fr-CA')}
            </div>
            {hoveredPoint.count && (
              <div className="text-xs text-[rgb(var(--ws-gray-600))]">
                Occurrences: {hoveredPoint.count}
              </div>
            )}
          </div>
        )}
        
        {/* Status overlay */}
        <div className="absolute bottom-2 left-2 text-xs text-[rgb(var(--ws-gray-600))] bg-white/90 px-2 py-1 rounded">
          {isPlaying ? '▶️ Animation active' : '⏸️ Animation en pause'}
        </div>
        
        <div className="absolute bottom-2 right-2 text-xs text-[rgb(var(--ws-gray-600))] bg-white/90 px-2 py-1 rounded">
          Dernière mise à jour: {new Date().toLocaleTimeString('fr-CA')}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-[rgb(var(--heatmap-hot))]">
            {filteredData.filter(p => p.type === 'click').length}
          </div>
          <div className="text-xs text-[rgb(var(--ws-gray-600))]">Clics</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-[rgb(var(--analytics-primary))]">
            {filteredData.filter(p => p.type === 'scroll').length}
          </div>
          <div className="text-xs text-[rgb(var(--ws-gray-600))]">Défilements</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-[rgb(var(--analytics-secondary))]">
            {filteredData.filter(p => p.type === 'mousemove').length}
          </div>
          <div className="text-xs text-[rgb(var(--ws-gray-600))]">Mouvements</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-[rgb(var(--ws-green))]">
            {filteredData.length > 0 ? Math.round((filteredData.reduce((sum, p) => sum + p.intensity, 0) / filteredData.length) * 100) : 0}%
          </div>
          <div className="text-xs text-[rgb(var(--ws-gray-600))]">Intensité moy.</div>
        </div>
      </div>
    </div>
  );
}