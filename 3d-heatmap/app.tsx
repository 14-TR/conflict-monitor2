// App.tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import Slider from '@mui/material/Slider';
import { CSVLoader } from '@loaders.gl/csv';
import { load } from '@loaders.gl/core';

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
  const [upperPercentile, setUpperPercentile] = useState(100);
  const [coverage, setCoverage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Replace this with the raw GitHub link to your CSV file
  const CSV_URL = 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_battles.csv?token=GHSAT0AAAAAACXQNX5RGFNOBE5B2GEL42UOZYLCNCQ';

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await load(CSV_URL, CSVLoader);
        const points: DataPoint[] = result.data.map((row: any) => [
          parseFloat(row.longitude),
          parseFloat(row.latitude),
          parseInt(row.fatalities, 10),
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

  const layers = [
    new HexagonLayer<DataPoint>({
      id: 'heatmap',
      colorRange,
      coverage,
      data,
      elevationRange: [0, 5000],
      elevationScale: data.length ? 100 : 0,
      extruded: true,
      getPosition: (d) => [d[0], d[1]],
      getElevationWeight: (d) => d[2],
      elevationAggregation: 'SUM',
      getColorWeight: (d) => d[2],
      colorAggregation: 'SUM',
      pickable: true,
      radius,
      upperPercentile,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51],
      },
      transitions: {
        elevationScale: 3000,
      },
    }),
  ];

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
          <Slider value={radius} min={1000} max={20000} step={1000} onChange={(e, value) => setRadius(value as number)} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>Upper Percentile: {upperPercentile}%</label>
          <Slider value={upperPercentile} min={80} max={100} step={1} onChange={(e, value) => setUpperPercentile(value as number)} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>Coverage: {coverage}</label>
          <Slider value={coverage} min={0} max={1} step={0.1} onChange={(e, value) => setCoverage(value as number)} />
        </div>
      </div>
    </div>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);
}
