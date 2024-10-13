// App.tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import { CSVLoader } from '@loaders.gl/csv';
import { load } from '@loaders.gl/core';
import ControlPanel from './ControlPanel';
import Switch from '@mui/material/Switch';

import type { Color, PickingInfo, MapViewState } from '@deck.gl/core';

// Lighting setup
const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 1.0 });
const pointLight1 = new PointLight({ color: [255, 255, 255], intensity: 0.8, position: [-0.144528, 49.739968, 80000] });
const pointLight2 = new PointLight({ color: [255, 255, 255], intensity: 0.8, position: [-3.807751, 54.104682, 8000] });

const lightingEffect = new LightingEffect({ ambientLight, pointLight1, pointLight2 });

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 31.1656, // Centered over Ukraine
  latitude: 48.3794,
  zoom: 5,
  minZoom: 2,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27,
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

function getTooltip({ object }: PickingInfo) {
  if (!object) return null;
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.elevationValue;

  return `latitude: ${lat.toFixed(6)}\nlongitude: ${lng.toFixed(6)}\nEvent Count: ${count}`;
}

type DataPoint = [longitude: number, latitude: number, eventCount: number];

export default function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [radius, setRadius] = useState(10000);
  const [upperPercentile, setUpperPercentile] = useState<number[]>([0, 100]);
  const [coverage, setCoverage] = useState(1);
  const [brushingEnabled, setBrushingEnabled] = useState(false);
  const [brushingRadius, setBrushingRadius] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [showHexControls, setShowHexControls] = useState(false);
  const [statVisibility, setStatVisibility] = useState(true);

  const CSV_URL = 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_battles.csv';

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await load(CSV_URL, CSVLoader);
        const points: DataPoint[] = result.data.map((row: any) => [
          parseFloat(row.longitude),
          parseFloat(row.latitude),
          parseInt(row.fatalities, 10) || 0,
        ]);
        setData(points);
      } catch (error) {
        console.error('Error loading CSV:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [CSV_URL]);

  const layers = data.length > 0 ? [
    new HexagonLayer<DataPoint>({
      id: 'heatmap',
      data,
      radius,
      colorRange,
      coverage,
      upperPercentile: upperPercentile[1],
      getPosition: (d) => [d[0], d[1]],
      getElevationWeight: (d) => d[2],
      elevationAggregation: 'SUM',
      extruded: true,
      elevationScale: 50,
      pickable: true,
      brushingRadius,
      brushingEnabled,
      transitions: {
        elevationScale: 3000,
      },
    }),
  ] : [];

  return (
    <div>
      {loading ? (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '24px',
          }}
        >
          Loading...
        </div>
      ) : (
        <DeckGL
          layers={layers}
          effects={[lightingEffect]}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          getTooltip={getTooltip}
        >
          <Map reuseMaps mapStyle={MAP_STYLE} />
        </DeckGL>
      )}

      <ControlPanel
        radius={radius}
        setRadius={setRadius}
        upperPercentile={upperPercentile}
        setUpperPercentile={setUpperPercentile}
        coverage={coverage}
        setCoverage={setCoverage}
        brushingEnabled={brushingEnabled}
        setBrushingEnabled={setBrushingEnabled}
        brushingRadius={brushingRadius}
        setBrushingRadius={setBrushingRadius}
        setStatVisibility={setStatVisibility}
        statistics={{
          min: Math.min(...data.map((d) => d[2])),
          max: Math.max(...data.map((d) => d[2])),
          total: data.reduce((acc, d) => acc + d[2], 0),
          count: data.length,
        }}
        dateRange={{ startDate: '2022-01-01', endDate: '2024-12-31' }}
        showHexControls={showHexControls}
        setShowHexControls={setShowHexControls}
      />

      <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px' }}>
        <label>Show Statistics</label>
        <Switch
          checked={statVisibility}
          onChange={(e) => setStatVisibility(e.target.checked)}
        />
      </div>
    </div>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);
}
