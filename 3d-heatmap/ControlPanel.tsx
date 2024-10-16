import React from 'react';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';

interface Statistics {
  events: number;
  totalFatalities: number;
  avgFatalities: string;
  maxFatalities: number;
  dateRange?: { startDate: string; endDate: string };
}

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
  showBattlesLayer: boolean;
  setShowBattlesLayer: (value: boolean) => void;
  showExplosionsLayer: boolean;
  setShowExplosionsLayer: (value: boolean) => void;
  battlesStatistics: Statistics;
  explosionsStatistics: Statistics;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
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
  showBattlesLayer,
  setShowBattlesLayer,
  showExplosionsLayer,
  setShowExplosionsLayer,
  battlesStatistics,
  explosionsStatistics,
}) => {
  const renderStatistics = (title: string, stats: Statistics) => {
    const { startDate = 'N/A', endDate = 'N/A' } = stats.dateRange || {};

    return (
      <div style={{ marginTop: '20px' }}>
        <h4>{title}</h4>
        {stats.events === 0 ? (
          <p>No data available.</p>
        ) : (
          <p>
            Events: {stats.events} <br />
            Total Fatalities: {stats.totalFatalities} <br />
            Avg Fatalities per Event: {stats.avgFatalities} <br />
            Max Fatalities in a Single Event: {stats.maxFatalities} <br />
            Date Range: {startDate} - {endDate}
          </p>
        )}
      </div>
    );
  };

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
      {/* Toggle Hex Controls */}
      <div style={{ marginBottom: '10px' }}>
        <label>Show Hex Controls</label>
        <Switch
          checked={showHexControls}
          onChange={(e) => setShowHexControls(e.target.checked)}
        />
      </div>

      {showHexControls && (
        <>
          {/* Layer Visibility Switches */}
          <div style={{ marginTop: '10px' }}>
            <label>Show Battles Layer</label>
            <Switch
              checked={showBattlesLayer}
              onChange={(e) => setShowBattlesLayer(e.target.checked)}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>Show Explosions Layer</label>
            <Switch
              checked={showExplosionsLayer}
              onChange={(e) => setShowExplosionsLayer(e.target.checked)}
            />
          </div>

          {/* Radius Slider */}
          <div style={{ marginTop: '20px' }}>
            <label>Radius: {radius} meters</label>
            <Slider
              value={radius}
              min={100}
              max={20000}
              step={100}
              onChange={(e, value) => setRadius(value as number)}
              valueLabelDisplay="auto"
            />
          </div>

          {/* Percentile Range Slider */}
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

          {/* Coverage Slider */}
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

      {/* Brushing Controls */}
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
              valueLabelDisplay="auto"
            />
          </div>
        )}
      </div>

      {/* Battles and Explosions Statistics */}
      {renderStatistics('Battles Statistics', battlesStatistics)}
      {renderStatistics('Explosions Statistics', explosionsStatistics)}
    </div>
  );
};

export default ControlPanel;
