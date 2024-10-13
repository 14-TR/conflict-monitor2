// ControlPanel.tsx
import React from 'react';
import Slider from '@mui/material/Slider';

interface ControlPanelProps {
  radius: number;
  setRadius: (value: number) => void;
  upperPercentile: number[];
  setUpperPercentile: (value: number[]) => void;
  coverage: number;
  setCoverage: (value: number) => void;
  statistics: { min: number; max: number; total: number; count: number };
  dateRange: { startDate: string; endDate: string };
}

export default function ControlPanel({
  radius,
  setRadius,
  upperPercentile,
  setUpperPercentile,
  coverage,
  setCoverage,
  statistics,
  dateRange,
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
      <div>
        <label>Radius: {radius} meters</label>
        <Slider
          value={radius}
          min={100}
          max={20000}
          step={.5}
          onChange={(e, value) => setRadius(value as number)}
        />
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
        <Slider
          value={coverage}
          min={0}
          max={1}
          step={0.01}
          onChange={(e, value) => setCoverage(value as number)}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <h4>Statistics</h4>
        <p>
          Min: {statistics.min} <br />
          Max: {statistics.max} <br />
          Total: {statistics.total} <br />
          Count: {statistics.count}
        </p>
        <p>
          There were a total of {statistics.total} battles from{' '}
          {dateRange.startDate} to {dateRange.endDate} in the selected area.
        </p>
      </div>
    </div>
  );
}
