'use client';

import { useEffect, useRef } from 'react';

interface HeatmapDataPoint {
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
}

interface AdvancedHeatmapProps {
  data: HeatmapDataPoint[];
  width?: number;
  height?: number;
  className?: string;
}

export default function AdvancedHeatmap({ 
  data, 
  width = 800, 
  height = 400, 
  className = '' 
}: AdvancedHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient background like in the image
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)'); // Light blue
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.05)'); // Light purple
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)'); // Light red
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw heat points
    data.forEach((point, index) => {
      const x = (point.x / width) * canvas.width;
      const y = (point.y / height) * canvas.height;
      const radius = 15 + (point.intensity * 25);
      
      // Create radial gradient for heat effect
      const heatGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      if (point.intensity > 0.8) {
        // Hot spots - red
        heatGradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        heatGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        heatGradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
      } else if (point.intensity > 0.6) {
        // Warm spots - orange/yellow
        heatGradient.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        heatGradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
        heatGradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
      } else if (point.intensity > 0.4) {
        // Medium spots - purple
        heatGradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)');
        heatGradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.4)');
        heatGradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
      } else {
        // Cool spots - blue
        heatGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        heatGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
        heatGradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      }

      // Draw the heat point
      ctx.fillStyle = heatGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add a central dot for precise location
      ctx.fillStyle = point.intensity > 0.7 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Add intensity label for hot spots
      if (point.intensity > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(point.intensity * 100)}%`, x, y - radius - 8);
      }
    });

    // Add legend
    const legendX = canvas.width - 120;
    const legendY = 20;
    
    // Legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(legendX - 10, legendY - 10, 110, 120);
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 10, 110, 120);

    // Legend title
    ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Intensité', legendX, legendY + 10);

    // Legend items
    const legendItems = [
      { color: 'rgba(239, 68, 68, 0.8)', label: '> 80% (Très élevé)', y: legendY + 30 },
      { color: 'rgba(245, 158, 11, 0.8)', label: '60-80% (Élevé)', y: legendY + 50 },
      { color: 'rgba(147, 51, 234, 0.8)', label: '40-60% (Moyen)', y: legendY + 70 },
      { color: 'rgba(59, 130, 246, 0.8)', label: '< 40% (Faible)', y: legendY + 90 }
    ];

    legendItems.forEach(item => {
      // Color square
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, item.y - 8, 12, 12);
      
      // Label
      ctx.fillStyle = 'rgba(17, 24, 39, 0.8)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(item.label, legendX + 18, item.y);
    });

  }, [data, width, height]);

  return (
    <div className={`analytics-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--ws-gray-900))] flex items-center">
          <div className="w-2 h-2 bg-[rgb(var(--heatmap-hot))] rounded-full mr-3"></div>
          Carte de Chaleur d'Activité CLAIR
        </h3>
        <div className="text-sm text-[rgb(var(--ws-gray-600))]">
          {data.length} points d'activité
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full border border-[rgb(var(--ws-gray-200))] rounded-lg overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Activity indicators */}
        <div className="absolute top-2 left-2 text-xs text-[rgb(var(--ws-gray-600))] bg-white/90 px-2 py-1 rounded">
          Système CLAIR - Zones d'activité en temps réel
        </div>
        
        <div className="absolute bottom-2 left-2 text-xs text-[rgb(var(--ws-gray-600))] bg-white/90 px-2 py-1 rounded">
          Dernière mise à jour: {new Date().toLocaleTimeString('fr-CA')}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-[rgb(var(--heatmap-hot))]">
            {data.filter(p => p.intensity > 0.8).length}
          </div>
          <div className="text-xs text-[rgb(var(--ws-gray-600))]">Zones très actives</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-[rgb(var(--heatmap-warm))]">
            {data.filter(p => p.intensity > 0.6 && p.intensity <= 0.8).length}
          </div>
          <div className="text-xs text-[rgb(var(--ws-gray-600))]">Zones actives</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-[rgb(var(--analytics-primary))]">
            {data.length > 0 ? Math.round((data.reduce((sum, p) => sum + p.intensity, 0) / data.length) * 100) : 0}%
          </div>
          <div className="text-xs text-[rgb(var(--ws-gray-600))]">Intensité moyenne</div>
        </div>
      </div>
    </div>
  );
}