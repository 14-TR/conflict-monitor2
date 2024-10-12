import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import { CSVLoader } from '@loaders.gl/csv';
import { load } from '@loaders.gl/core';
import Slider from '@mui/material/Slider';

import type { Color, PickingInfo, MapViewState } from '@deck.gl/core';

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight1, pointLight2 });

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -1.415727,
  latitude: 52.232395,
  zoom: 6.6,
  minZoom: 5,
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
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.points.length;

  return `\
latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
${count} Accidents`;
}

type DataPoint = [longitude: number, latitude: number];

export default function App({
  data = null,
  mapStyle = MAP_STYLE,
}: {
  data?: DataPoint[] | null;
  mapStyle?: string;
}) {
  // State variables for sliders
  const [radius, setRadius] = useState(1000);
  const [upperPercentile, setUpperPercentile] = useState(100);
  const [coverage, setCoverage] = useState(1);

  const layers = [
    new HexagonLayer<DataPoint>({
      id: 'heatmap',
      colorRange,
      coverage,
      data,
      elevationRange: [0, 3000],
      elevationScale: data && data.length ? 50 : 0,
      extruded: true,
      getPosition: (d) => d,
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
      <DeckGL
        layers={layers}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapStyle={mapStyle} />
      </DeckGL>
      {/* Sliders */}
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
            min={500}
            max={5000}
            step={100}
            onChange={(e, value) => setRadius(value as number)}
          />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>Upper Percentile: {upperPercentile}%</label>
          <Slider
            value={upperPercentile}
            min={80}
            max={100}
            step={1}
            onChange={(e, value) => setUpperPercentile(value as number)}
          />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>Coverage: {coverage}</label>
          <Slider
            value={coverage}
            min={0}
            max={1}
            step={0.1}
            onChange={(e, value) => setCoverage(value as number)}
          />
        </div>
      </div>
    </div>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);

  // Load data and render the App component with data
  const data = (await load(DATA_URL, CSVLoader)).data;
  const points: DataPoint[] = data.map((d: any) => [Number(d.lng), Number(d.lat)]);
  root.render(<App data={points} />);
}
