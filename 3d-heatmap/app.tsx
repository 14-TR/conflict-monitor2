import React, { useState, useEffect, useRef } from 'react';
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
  const [hoverInfo, setHoverInfo] = useState(null);
  const [statistics, setStatistics] = useState({}); // Store aggregated statistics
  const selectedPointsRef = useRef({}); // Store selected points
  const deckRef = useRef(null); // Reference to the DeckGL instance

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
        const parsedData = result?.data || [];
        setData(
          parsedData.map((row) => ({
            id: row.event_id_cnty,
            longitude: parseFloat(row.longitude),
            latitude: parseFloat(row.latitude),
            event_date: new Date(row.event_date),
            fatalities: parseInt(row.fatalities, 10) || 0,
          }))
        );
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    }
    fetchData();
  }, []);

  // Helper function to update statistics
  const calculateStatistics = () => {
    const points = Object.values(selectedPointsRef.current);
    if (points.length === 0) {
      setStatistics({
        battles: 0,
        totalFatalities: 0,
        avgFatalities: '0',
        maxFatalities: 0,
        dateRange: { startDate: 'N/A', endDate: 'N/A' },
      });
      return;
    }

    const totalBattles = points.length;
    const totalFatalities = points.reduce((sum, p) => sum + p.fatalities, 0);
    const avgFatalities = totalFatalities / totalBattles;
    const maxFatalities = Math.max(...points.map((p) => p.fatalities));

    const dates = points.map((p) => p.event_date);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const dateRange = {
      startDate: minDate.toLocaleDateString(),
      endDate: maxDate.toLocaleDateString(),
    };

    setStatistics({
      battles: totalBattles,
      totalFatalities,
      avgFatalities: avgFatalities.toFixed(2),
      maxFatalities,
      dateRange,
    });
  };

  // Function to handle single point selection
  const handleSingleClick = (info) => {
    // Reset selected points
    selectedPointsRef.current = {};

    if (info.object) {
      console.log('Single Hexagon Points:', info.object.points);
      info.object.points.forEach((point) => {
        selectedPointsRef.current[point.source.id] = point.source;
      });
      calculateStatistics(); // Update statistics after single click
    }
  };

  // Function to handle multiple points selection (brush)
  const handleMultiClick = async (x, y) => {
    // Reset selected points
    selectedPointsRef.current = {};

    if (deckRef.current) {
      const results = await deckRef.current.pickMultipleObjects({
        x,
        y,
        radius: brushingRadius,
      });

      results.forEach((result) => {
        if (result.object) {
          console.log('Brushed Points:', result.object.points);
          result.object.points.forEach((point) => {
            selectedPointsRef.current[point.source.id] = point.source;
          });
        }
      });

      calculateStatistics(); // Update statistics after multi-click selection
    }
  };

  // Toggle between single and multi-point selection
  const handleClick = (info) => {
    if (brushingEnabled) {
      handleMultiClick(info.x, info.y); // Use multi-point selection
    } else {
      handleSingleClick(info); // Use single-point selection
    }
  };

  const layers = [
    new HexagonLayer({
      id: 'heatmap',
      data,
      pickable: true,
      getPosition: (d) => [d.longitude, d.latitude],
      getElevationWeight: () => 1,
      elevationAggregation: 'SUM',
      colorAggregation: 'SUM',
      radius,
      upperPercentile: upperPercentile[1],
      coverage,
      elevationScale: data.length ? 50 : 0,
      extruded: true,
      extensions: [
        new BrushingExtension({
          radius: brushingRadius, // Pass the brushingRadius here
        }),
      ],
      brushingEnabled,
      brushingRadius, // Ensure this is updated in the layer
      onClick: handleClick,
    }),
  ];
  

  return (
    <div>
      <DeckGL
        ref={deckRef}
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
      />

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
