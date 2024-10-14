import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { BrushingExtension } from '@deck.gl/extensions';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';

import ControlPanel from './ControlPanel';

const DATA_URL = 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_battles.csv';

const INITIAL_VIEW_STATE = {
  longitude: 31.1656,
  latitude: 48.3794,
  zoom: 5,
  pitch: 40.5,
  bearing: -27,
};

export default function App() {
  const [data, setData] = useState([]);
  const [radius, setRadius] = useState(1000);
  const [upperPercentile, setUpperPercentile] = useState([0, 100]);
  const [coverage, setCoverage] = useState(1);
  const [brushingEnabled, setBrushingEnabled] = useState(false);
  const [brushingRadius, setBrushingRadius] = useState(10000);
  const [showHexControls, setShowHexControls] = useState(true); // For hexagon controls
  const [statVisibility, setStatVisibility] = useState(false); // For statistics visibility

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await load(DATA_URL, CSVLoader);
        setData(
          result.data.map((row) => [
            parseFloat(row.longitude),
            parseFloat(row.latitude),
            parseInt(row.fatalities, 10),
          ])
        );
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    }
    fetchData();
  }, []);

  const layers = [
    showHexControls &&
      new HexagonLayer({
        id: 'heatmap',
        data,
        getPosition: (d) => [d[0], d[1]],
        getElevationWeight: (d) => d[2],
        elevationAggregation: 'SUM',
        colorAggregation: 'SUM',
        radius,
        upperPercentile: upperPercentile[1],
        coverage,
        elevationScale: data.length ? 50 : 0,
        extruded: true,
        extensions: [new BrushingExtension()],
        brushingRadius: brushingEnabled ? brushingRadius : 0,
        brushingEnabled,
      }),
  ].filter(Boolean);

  return (
    <div>
      <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
        <Map reuseMaps mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json" />
      </DeckGL>

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
        showHexControls={showHexControls}
        setShowHexControls={setShowHexControls}
        statVisibility={statVisibility}
        setStatVisibility={setStatVisibility}
        statistics={{
          min: Math.min(...data.map((d) => d[2])),
          max: Math.max(...data.map((d) => d[2])),
          total: data.reduce((acc, d) => acc + d[2], 0),
          count: data.length,
        }}
        dateRange={{ startDate: '2022-01-01', endDate: '2024-12-31' }}
      />
    </div>
  );
}

export async function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);
}
