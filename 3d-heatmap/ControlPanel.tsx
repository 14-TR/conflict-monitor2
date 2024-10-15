import React from 'react';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';

interface ControlPanelProps {
  radius: number;
  setRadius: (value: number) => void;
  upperPercentile: number[];
  setUpperPercentile: (value: number[]) => void;
  coverage: number;
  setCoverage: (value: number) => void;
  brushingEnabled: boolean;
  setBrushingEnabled: (value: boolean) => void;
  brushingRadius: number;
  setBrushingRadius: (value: number) => void;
  showHexControls: boolean;
  setShowHexControls: (value: boolean) => void;
  statVisibility: boolean;
  setStatVisibility: (value: boolean) => void;
  statistics: { 
    battles: number; 
    totalFatalities: number; 
    avgFatalities: string; 
    maxFatalities: number; 
    dateRange: { startDate: string; endDate: string } 
  };
}

export default function ControlPanel({
  radius,
  setRadius,
  upperPercentile,
  setUpperPercentile,
  coverage,
  setCoverage,
  brushingEnabled,
  setBrushingEnabled,
  brushingRadius,
  setBrushingRadius,
  showHexControls,
  setShowHexControls,
  statVisibility,
  setStatVisibility,
  statistics,
}: ControlPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '8px',
        maxWidth: '300px',
      }}
    >
      {/* Toggle Hex Control Visibility */}
      <div style={{ marginBottom: '10px' }}>
        <label>Show Hex Controls</label>
        <Switch
          checked={showHexControls}
          onChange={(e) => setShowHexControls(e.target.checked)}
        />
      </div>

      {showHexControls && (
        <>
          <div style={{ marginTop: '20px' }}>
            <label>Radius: {radius} meters</label>
            <Slider
              value={radius}
              min={100}
              max={20000}
              step={100}
              onChange={(e, value) => setRadius(value as number)}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <label>
              Percentile Range: {upperPercentile[0]}% - {upperPercentile[1]}%
            </label>
            <Slider
              value={upperPercentile}
              min={0}
              max={100}
              step={1}
              onChange={(e, value) => setUpperPercentile(value as number[])}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <label>Coverage: {coverage}</label>
            <Slider
              value={coverage}
              min={0}
              max={1}
              step={0.01}
              onChange={(e, value) => setCoverage(value as number)}
            />
          </div>
        </>
      )}

      {/* Brushing Control */}
      <div style={{ marginTop: '20px' }}>
        <label>Enable Brushing</label>
        <Switch
          checked={brushingEnabled}
          onChange={(e) => setBrushingEnabled(e.target.checked)}
        />
        {brushingEnabled && (
          <div style={{ marginTop: '10px' }}>
            <label>Brushing Radius: {brushingRadius} meters</label>
            <Slider
              value={brushingRadius}
              min={100}
              max={100000}
              step={1000}
              onChange={(e, value) => setBrushingRadius(value as number)}
            />
          </div>
        )}
      </div>

      {/* Toggle Statistics Visibility */}
      <div style={{ marginTop: '20px' }}>
        <label>Show Statistics</label>
        <Switch
          checked={statVisibility}
          onChange={(e) => setStatVisibility(e.target.checked)}
        />
      </div>

      {statVisibility && (
        <div style={{ marginTop: '20px' }}>
          <h4>Statistics</h4>
          <p>
            Battles: {statistics.battles} <br />
            Total Fatalities: {statistics.totalFatalities} <br />
            Average Fatalities per Battle: {statistics.avgFatalities} <br />
            Max Fatalities in a Single Battle: {statistics.maxFatalities}
          </p>
          <p>
            Date Range: {statistics.dateRange.startDate} -{' '}
            {statistics.dateRange.endDate}
          </p>
        </div>
      )}
    </div>
  );
}
