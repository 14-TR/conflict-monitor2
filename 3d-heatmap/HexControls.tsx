// HexControls.tsx
import React from 'react';
import Slider from '@mui/material/Slider';

interface HexControlsProps {
  radius: number;
  setRadius: (value: number) => void;
  upperPercentile: number[];
  setUpperPercentile: (value: number[]) => void;
  coverage: number;
  setCoverage: (value: number) => void;
}

export default function HexControls({
  radius,
  setRadius,
  upperPercentile,
  setUpperPercentile,
  coverage,
  setCoverage,
}: HexControlsProps) {
  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <label>Radius: {radius} meters</label>
        <Slider value={radius} min={100} max={20000} step={100} onChange={(e, value) => setRadius(value as number)} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <label>Percentile Range: {upperPercentile[0]}% - {upperPercentile[1]}%</label>
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
        <Slider value={coverage} min={0} max={1} step={0.01} onChange={(e, value) => setCoverage(value as number)} />
      </div>
    </>
  );
}
