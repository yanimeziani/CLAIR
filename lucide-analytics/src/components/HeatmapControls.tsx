'use client';

import React, { useState } from 'react';
import { Calendar, Filter, Download, Play, Pause, RotateCcw, Eye, EyeOff, Layers, Settings } from 'lucide-react';

interface HeatmapControlsProps {
  onFilterChange: (filters: HeatmapFilters) => void;
  onExport: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  totalPoints: number;
  timeRange: { start: Date; end: Date };
}

export interface HeatmapFilters {
  timeRange: '1h' | '24h' | '7d' | '30d' | 'custom';
  eventTypes: {
    click: boolean;
    mousemove: boolean;
    scroll: boolean;
    touch: boolean;
    form_input: boolean;
  };
  intensityRange: {
    min: number;
    max: number;
  };
  path: string;
  deviceType: 'all' | 'desktop' | 'mobile' | 'tablet';
  showHeatmap: boolean;
  showDots: boolean;
  showPaths: boolean;
  opacity: number;
  customTimeRange: {
    start: Date;
    end: Date;
  };
}

export default function HeatmapControls({
  onFilterChange,
  onExport,
  isPlaying,
  onPlayPause,
  onReset,
  totalPoints,
  timeRange
}: HeatmapControlsProps) {
  const [filters, setFilters] = useState<HeatmapFilters>({
    timeRange: '24h',
    eventTypes: {
      click: true,
      mousemove: true,
      scroll: true,
      touch: true,
      form_input: true
    },
    intensityRange: {
      min: 0,
      max: 1
    },
    path: '',
    deviceType: 'all',
    showHeatmap: true,
    showDots: true,
    showPaths: false,
    opacity: 0.8,
    customTimeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (newFilters: Partial<HeatmapFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleTimeRangeChange = (range: HeatmapFilters['timeRange']) => {
    updateFilters({ timeRange: range });
  };

  const handleEventTypeChange = (eventType: keyof HeatmapFilters['eventTypes']) => {
    updateFilters({
      eventTypes: {
        ...filters.eventTypes,
        [eventType]: !filters.eventTypes[eventType]
      }
    });
  };

  const handleIntensityChange = (type: 'min' | 'max', value: number) => {
    updateFilters({
      intensityRange: {
        ...filters.intensityRange,
        [type]: value
      }
    });
  };

  return (
    <div className="analytics-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-[rgb(var(--analytics-primary),0.1)] mr-3">
            <Filter className="h-5 w-5 text-[rgb(var(--analytics-primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--ws-gray-900))]">
              Contrôles Heatmap
            </h3>
            <p className="text-sm text-[rgb(var(--ws-gray-600))]">
              {totalPoints.toLocaleString()} points • {timeRange.start.toLocaleDateString()} - {timeRange.end.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onPlayPause}
            className="p-2 rounded-lg bg-[rgb(var(--analytics-primary))] text-white hover:bg-[rgb(var(--analytics-primary),0.8)] transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-[rgb(var(--ws-gray-200))] text-[rgb(var(--ws-gray-700))] hover:bg-[rgb(var(--ws-gray-300))] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={onExport}
            className="p-2 rounded-lg bg-[rgb(var(--ws-green))] text-white hover:bg-[rgb(var(--ws-green),0.8)] transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Time Range Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[rgb(var(--ws-gray-700))] mb-2">
          Période
        </label>
        <div className="flex items-center space-x-2">
          {[
            { value: '1h', label: '1h' },
            { value: '24h', label: '24h' },
            { value: '7d', label: '7j' },
            { value: '30d', label: '30j' },
            { value: 'custom', label: 'Personnalisé' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value as HeatmapFilters['timeRange'])}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                filters.timeRange === option.value
                  ? 'bg-[rgb(var(--analytics-primary))] text-white border-[rgb(var(--analytics-primary))]'
                  : 'bg-white text-[rgb(var(--ws-gray-700))] border-[rgb(var(--ws-gray-300))] hover:bg-[rgb(var(--ws-gray-50))]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Types */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[rgb(var(--ws-gray-700))] mb-2">
          Types d'événements
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters.eventTypes).map(([type, enabled]) => (
            <button
              key={type}
              onClick={() => handleEventTypeChange(type as keyof HeatmapFilters['eventTypes'])}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                enabled
                  ? 'bg-[rgb(var(--analytics-secondary))] text-white border-[rgb(var(--analytics-secondary))]'
                  : 'bg-white text-[rgb(var(--ws-gray-700))] border-[rgb(var(--ws-gray-300))] hover:bg-[rgb(var(--ws-gray-50))]'
              }`}
            >
              {type === 'click' && '🖱️ Clics'}
              {type === 'mousemove' && '🐭 Souris'}
              {type === 'scroll' && '📜 Défilement'}
              {type === 'touch' && '👆 Tactile'}
              {type === 'form_input' && '📝 Formulaires'}
            </button>
          ))}
        </div>
      </div>

      {/* Visualization Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[rgb(var(--ws-gray-700))] mb-2">
          Options d'affichage
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilters({ showHeatmap: !filters.showHeatmap })}
            className={`flex items-center px-3 py-1 text-sm rounded-md border transition-colors ${
              filters.showHeatmap
                ? 'bg-[rgb(var(--heatmap-hot))] text-white border-[rgb(var(--heatmap-hot))]'
                : 'bg-white text-[rgb(var(--ws-gray-700))] border-[rgb(var(--ws-gray-300))] hover:bg-[rgb(var(--ws-gray-50))]'
            }`}
          >
            <Layers className="h-3 w-3 mr-1" />
            Carte thermique
          </button>
          
          <button
            onClick={() => updateFilters({ showDots: !filters.showDots })}
            className={`flex items-center px-3 py-1 text-sm rounded-md border transition-colors ${
              filters.showDots
                ? 'bg-[rgb(var(--analytics-primary))] text-white border-[rgb(var(--analytics-primary))]'
                : 'bg-white text-[rgb(var(--ws-gray-700))] border-[rgb(var(--ws-gray-300))] hover:bg-[rgb(var(--ws-gray-50))]'
            }`}
          >
            {filters.showDots ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
            Points
          </button>
          
          <button
            onClick={() => updateFilters({ showPaths: !filters.showPaths })}
            className={`flex items-center px-3 py-1 text-sm rounded-md border transition-colors ${
              filters.showPaths
                ? 'bg-[rgb(var(--analytics-secondary))] text-white border-[rgb(var(--analytics-secondary))]'
                : 'bg-white text-[rgb(var(--ws-gray-700))] border-[rgb(var(--ws-gray-300))] hover:bg-[rgb(var(--ws-gray-50))]'
            }`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Chemins
          </button>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-[rgb(var(--analytics-primary))] hover:text-[rgb(var(--analytics-primary),0.8)] transition-colors"
        >
          <Settings className="h-4 w-4 mr-1" />
          {showAdvanced ? 'Masquer' : 'Afficher'} les contrôles avancés
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-[rgb(var(--ws-gray-200))]">
          {/* Intensity Range */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--ws-gray-700))] mb-2">
              Plage d'intensité
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-xs text-[rgb(var(--ws-gray-600))]">Min</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.intensityRange.min}
                  onChange={(e) => handleIntensityChange('min', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[rgb(var(--ws-gray-200))] rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-[rgb(var(--ws-gray-600))]">
                  {(filters.intensityRange.min * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex-1">
                <label className="text-xs text-[rgb(var(--ws-gray-600))]">Max</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.intensityRange.max}
                  onChange={(e) => handleIntensityChange('max', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[rgb(var(--ws-gray-200))] rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-[rgb(var(--ws-gray-600))]">
                  {(filters.intensityRange.max * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--ws-gray-700))] mb-2">
              Opacité: {(filters.opacity * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={filters.opacity}
              onChange={(e) => updateFilters({ opacity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[rgb(var(--ws-gray-200))] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Path Filter */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--ws-gray-700))] mb-2">
              Filtrer par chemin
            </label>
            <input
              type="text"
              value={filters.path}
              onChange={(e) => updateFilters({ path: e.target.value })}
              placeholder="/dashboard, /patients, etc."
              className="w-full px-3 py-2 border border-[rgb(var(--ws-gray-300))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--analytics-primary))] focus:border-transparent"
            />
          </div>

          {/* Device Type */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--ws-gray-700))] mb-2">
              Type d'appareil
            </label>
            <select
              value={filters.deviceType}
              onChange={(e) => updateFilters({ deviceType: e.target.value as HeatmapFilters['deviceType'] })}
              className="w-full px-3 py-2 border border-[rgb(var(--ws-gray-300))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--analytics-primary))] focus:border-transparent"
            >
              <option value="all">Tous les appareils</option>
              <option value="desktop">Ordinateur</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablette</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}