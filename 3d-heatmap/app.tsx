import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { BrushingExtension } from '@deck.gl/extensions';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';

import ControlPanel from './ControlPanel';

const DATA_URL =
  'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_battles.csv';

const INITIAL_VIEW_STATE = {
  longitude: 31.1656,
  latitude: 48.3794,
  zoom: 5,
  pitch: 40.5,
  bearing: -27,
};

export default function App() {
  const [data, setData] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]); // Track selected points
  const [hoverInfo, setHoverInfo] = useState(null); 
  const [radius, setRadius] = useState(1000);
  const [upperPercentile, setUpperPercentile] = useState([0, 100]);
  const [coverage, setCoverage] = useState(1);
  const [brushingEnabled, setBrushingEnabled] = useState(false);
  const [brushingRadius, setBrushingRadius] = useState(10000);
  const [showHexControls, setShowHexControls] = useState(true);
  const [statVisibility, setStatVisibility] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await load(DATA_URL, CSVLoader);
        console.log('CSV Data:', result.data);

        const parsedData = result?.data || [];
        setData(
          parsedData.map((row) => [
            parseFloat(row.longitude),
            parseFloat(row.latitude),
          ])
        );
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    }
    fetchData();
  }, []);

  // Compute statistics dynamically
  const statistics = useMemo(() => {
    if (!selectedPoints.length) return { min: 0, max: 0, total: 0, count: 0 };

    const counts = selectedPoints.map((hex) => hex.points.length);
    const total = counts.reduce((acc, val) => acc + val, 0);

    return {
      min: Math.min(...counts),
      max: Math.max(...counts),
      total,
      count: selectedPoints.length,
    };
  }, [selectedPoints]);

  const layers = [
    showHexControls &&
      new HexagonLayer({
        id: 'heatmap',
        data,
        pickable: true,
        getPosition: (d) => [d[0], d[1]],
        getElevationWeight: () => 1,
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

        // Update selected points on hover
        onHover: (info) => {
          if (info.object) {
            setHoverInfo(info);
            setSelectedPoints([info.object]); // Update selected points
          } else {
            setHoverInfo(null);
          }
        },

        // Update selected points on click
        onClick: (info) => {
          if (info.object) {
            setSelectedPoints([info.object]); // Track the clicked hexagon
            alert(`Hexagon clicked with ${info.object.points.length} events.`);
          }
        },
      }),
  ].filter(Boolean);

  return (
    <div>
      <DeckGL
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        <Map
          reuseMaps
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"
        />
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
        statistics={statistics}
        dateRange={{ startDate: '2022-01-01', endDate: '2024-12-31' }}
      />

      {/* Display hover tooltip */}
      {hoverInfo && hoverInfo.object && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            padding: '5px',
            borderRadius: '3px',
            left: hoverInfo.x,
            top: hoverInfo.y,
          }}
        >
          <div>Coordinates: {hoverInfo.coordinate.join(', ')}</div>
          <div>Event Count: {hoverInfo.object.points.length}</div>
        </div>
      )}
    </div>
  );
}

export async function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);
}
