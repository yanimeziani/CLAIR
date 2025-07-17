'use client';

import React, { useRef, useEffect, useState } from 'react';
import { HeatmapPoint } from '@/types/analytics';

interface HeatmapCanvasProps {
  points: HeatmapPoint[];
  width: number;
  height: number;
  intensity?: number;
  radius?: number;
}

export default function HeatmapCanvas({ 
  points, 
  width, 
  height, 
  intensity = 0.5,
  radius = 25 
}: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient for each point
    points.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      const alpha = Math.min(point.intensity * intensity, 1);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(255, 165, 0, ${alpha * 0.7})`);
      gradient.addColorStop(0.7, `rgba(255, 255, 0, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    });

    // Apply blend mode for better heat visualization
    ctx.globalCompositeOperation = 'multiply';
  }, [points, width, height, intensity, radius]);

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isVisible ? 'Hide' : 'Show'} Heatmap
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isVisible ? 'opacity-70' : 'opacity-0'
        }`}
        style={{ zIndex: 1000 }}
      />
    </div>
  );
}