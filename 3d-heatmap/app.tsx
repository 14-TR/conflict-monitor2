import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { MapViewState } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { BrushingExtension } from '@deck.gl/extensions';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';

import ControlPanel from './ControlPanel';

// URLs for data
const BATTLES_DATA_URL = 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_battles.csv';
const EXPLOSIONS_DATA_URL = 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_explosions.csv';

// Initial view state for the map
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 31.1656,
  latitude: 48.3794,
  zoom: 5,
  pitch: 40.5,
  bearing: -27,
};

// Color ranges for the layers
const BATTLES_COLOR_RANGE = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const EXPLOSIONS_COLOR_RANGE = [
  [68, 1, 84],
  [117, 42, 142],
  [197, 27, 125],
  [222, 119, 174],
  [241, 182, 218],
  [253, 224, 239]
];

export default function App() {
  const [battlesData, setBattlesData] = useState([]);
  const [explosionsData, setExplosionsData] = useState([]);
  const [radius, setRadius] = useState(1000);
  const [upperPercentile, setUpperPercentile] = useState([0, 100]);
  const [coverage, setCoverage] = useState(1);
  const [brushingEnabled, setBrushingEnabled] = useState(false);
  const [brushingRadius, setBrushingRadius] = useState(10000);
  const [showHexControls, setShowHexControls] = useState(true);
  const [showBattlesLayer, setShowBattlesLayer] = useState(true);
  const [showExplosionsLayer, setShowExplosionsLayer] = useState(true);
  const [battlesStatistics, setBattlesStatistics] = useState({});
  const [explosionsStatistics, setExplosionsStatistics] = useState({});
  const [tooltip, setTooltip] = useState(null); 
  const deckRef = useRef(null);

  const fetchData = useCallback(async (url, setData) => {
    try {
      const result = await load(url, CSVLoader);
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
      console.error(`Error loading data from ${url}:`, error);
    }
  }, []);

  useEffect(() => {
    fetchData(BATTLES_DATA_URL, setBattlesData);
    fetchData(EXPLOSIONS_DATA_URL, setExplosionsData);
  }, [fetchData]);

  const calculateStatistics = useCallback((points) => {
    if (points.length === 0) {
      return {
        events: 0,
        totalFatalities: 0,
        avgFatalities: '0',
        maxFatalities: 0,
        dateRange: { startDate: 'N/A', endDate: 'N/A' },
      };
    }

    const totalEvents = points.length;
    const totalFatalities = points.reduce((sum, p) => sum + p.fatalities, 0);
    const avgFatalities = totalFatalities / totalEvents;
    const maxFatalities = Math.max(...points.map((p) => p.fatalities));

    const dates = points.map((p) => p.event_date);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return {
      events: totalEvents,
      totalFatalities,
      avgFatalities: avgFatalities.toFixed(2),
      maxFatalities,
      dateRange: {
        startDate: minDate.toLocaleDateString(),
        endDate: maxDate.toLocaleDateString(),
      },
    };
  }, []);

  const handleInteraction = async (x, y) => {
    if (deckRef.current) {
      const results = await deckRef.current.pickMultipleObjects({
        x,
        y,
        radius: brushingEnabled ? brushingRadius : radius,
        layerIds: ['battles', 'explosions'],
      });

      let battlesPoints = [];
      let explosionsPoints = [];

      results.forEach((result) => {
        if (result.object?.points) {
          const points = result.object.points.map((p) => p.source);
          if (result.layer.id === 'battles') {
            battlesPoints.push(...points);
          } else if (result.layer.id === 'explosions') {
            explosionsPoints.push(...points);
          }
        }
      });

      setBattlesStatistics(calculateStatistics(battlesPoints));
      setExplosionsStatistics(calculateStatistics(explosionsPoints));
    }
  };

  const layers = useMemo(() => {
    const layersArray = [];

    if (showBattlesLayer) {
      layersArray.push(
        new HexagonLayer({
          id: 'battles',
          data: battlesData,
          getPosition: (d) => [d.longitude, d.latitude],
          radius,
          colorRange: BATTLES_COLOR_RANGE,
          elevationAggregation: 'SUM',
          colorAggregation: 'SUM',
          // elevationRange: [0, 3000],
          elevationScale: battlesData && battlesData.length ? 50 : 0,
          coverage,
          upperPercentile: upperPercentile[1],
          extruded: true,
          brushingEnabled,
          brushingRadius,
          pickable: true,
          extensions: [new BrushingExtension()],
          onHover: (info) => setTooltip(info),
          onClick: (info) => handleInteraction(info.x, info.y),
        })
      );
    }

    if (showExplosionsLayer) {
      layersArray.push(
        new HexagonLayer({
          id: 'explosions',
          data: explosionsData,
          getPosition: (d) => [d.longitude, d.latitude],
          radius,
          colorRange: EXPLOSIONS_COLOR_RANGE,
          elevationAggregation: 'SUM',
          colorAggregation: 'SUM',
          // elevationRange: [0, 3000],
          elevationScale: explosionsData && explosionsData.length ? 50 : 0,
          coverage,
          upperPercentile: upperPercentile[1],
          extruded: true,
          brushingEnabled,
          brushingRadius,
          pickable: true,
          extensions: [new BrushingExtension()],
          onHover: (info) => setTooltip(info),
          onClick: (info) => handleInteraction(info.x, info.y),
        })
      );
    }

    return layersArray;
  }, [
    battlesData,
    explosionsData,
    radius,
    upperPercentile,
    coverage,
    brushingEnabled,
    brushingRadius,
    showBattlesLayer,
    showExplosionsLayer,
  ]);

  return (
    <div>
      <DeckGL ref={deckRef} layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
        <Map reuseMaps mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>

      {tooltip && tooltip.object && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '5px',
            borderRadius: '3px',
            pointerEvents: 'none',
          }}
        >
          <div>Events: {tooltip.object.points.length}</div>
          <div>Layer: {tooltip.layer.id}</div>
        </div>
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
        showHexControls={showHexControls}
        setShowHexControls={setShowHexControls}
        showBattlesLayer={showBattlesLayer}
        setShowBattlesLayer={setShowBattlesLayer}
        showExplosionsLayer={showExplosionsLayer}
        setShowExplosionsLayer={setShowExplosionsLayer}
        battlesStatistics={battlesStatistics}
        explosionsStatistics={explosionsStatistics}
      />
    </div>
  );
}

export async function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);
}
