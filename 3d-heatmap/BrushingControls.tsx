// BrushingControls.tsx
import React from 'react';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';

interface BrushingControlsProps {
  brushingEnabled: boolean;
  setBrushingEnabled: (value: boolean) => void;
  brushingRadius: number;
  setBrushingRadius: (value: number) => void;
}

export default function BrushingControls({
  brushingEnabled,
  setBrushingEnabled,
  brushingRadius,
  setBrushingRadius,
}: BrushingControlsProps) {
  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <label>Enable Brushing</label>
        <Switch checked={brushingEnabled} onChange={(e) => setBrushingEnabled(e.target.checked)} />
      </div>
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
    </>
  );
}
