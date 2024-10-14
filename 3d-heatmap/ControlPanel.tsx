// ControlPanel.tsx
import React from 'react';
import Switch from '@mui/material/Switch';
import HexControls from './HexControls';
import BrushingControls from './BrushingControls';
import StatisticsDisplay from './StatisticsDisplay';

interface ControlPanelProps {
  hexVisible: boolean;
  setHexVisible: (value: boolean) => void;
  brushingVisible: boolean;
  setBrushingVisible: (value: boolean) => void;
  statsVisible: boolean;
  setStatsVisible: (value: boolean) => void;
}

export default function ControlPanel({
  hexVisible,
  setHexVisible,
  brushingVisible,
  setBrushingVisible,
  statsVisible,
  setStatsVisible,
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
      <div style={{ marginTop: '20px' }}>
        <label>Show Hex Controls</label>
        <Switch checked={hexVisible} onChange={(e) => setHexVisible(e.target.checked)} />
      </div>

      {hexVisible && <HexControls />}

      <div style={{ marginTop: '20px' }}>
        <label>Show Brushing Tools</label>
        <Switch checked={brushingVisible} onChange={(e) => setBrushingVisible(e.target.checked)} />
      </div>

      {brushingVisible && <BrushingControls />}

      <div style={{ marginTop: '20px' }}>
        <label>Show Statistics</label>
        <Switch checked={statsVisible} onChange={(e) => setStatsVisible(e.target.checked)} />
      </div>

      {statsVisible && <StatisticsDisplay />}
    </div>
  );
}
