import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import { INITIAL_VIEW_STATE } from './config/mapConfig';
import { CSVLoader } from '@loaders.gl/csv';
import { load } from '@loaders.gl/core';  
import ControlPanel from './components/ControlPanel';
import { createLayers } from './utils/layerCreator'; 
import { calculateStatistics } from './utils/calculateStatistics';
import StatisticsArea from './components/StatisticsArea';  // Import the new component
import StackedBarChart from './components/StackedBarChart'; // Import the new StackedBarChart component
import { aggregateDataByDate } from './utils/aggregateDataByDate';  // Import the data aggregation helper

const BATTLES_DATA_URL = 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_battles.csv';
const EXPLOSIONS_DATA_URL = 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_explosions.csv';

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
  const [aggregatedData, setAggregatedData] = useState([]);  // New state for aggregated chart data
  const deckRef = useRef(null);

  // Fetching the data using the same logic that worked before, with proper parsing for event_date
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

  // Fetch the battles and explosions data on component mount
  useEffect(() => {
    fetchData(BATTLES_DATA_URL, setBattlesData);
    fetchData(EXPLOSIONS_DATA_URL, setExplosionsData);
  }, [fetchData]);

  // Recalculate statistics and aggregate data for the chart when data changes
  useEffect(() => {
    if (battlesData.length && explosionsData.length) {
      const newBattlesStatistics = calculateStatistics(battlesData);
      setBattlesStatistics(newBattlesStatistics);

      const newExplosionsStatistics = calculateStatistics(explosionsData);
      setExplosionsStatistics(newExplosionsStatistics);

      // Aggregate data by date for the chart
      const aggregated = aggregateDataByDate(battlesData, explosionsData);
      setAggregatedData(aggregated);  // Set the aggregated data for the chart
    }
  }, [battlesData, explosionsData]);

  const handleInteraction = useCallback(async (x, y) => {
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
  }, [brushingEnabled, brushingRadius, radius]);

  const layers = useMemo(() => {
    return createLayers({
      battlesData,
      explosionsData,
      radius,
      upperPercentile,
      coverage,
      brushingEnabled,
      brushingRadius,
      showBattlesLayer,
      showExplosionsLayer,
      handleInteraction,
      setTooltip,
    });
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

      {/* Add StatisticsArea component to display stats in top-right corner */}
      <StatisticsArea
        battlesStatistics={battlesStatistics}
        explosionsStatistics={explosionsStatistics}
      />

      {/* Add the StackedBarChart in the bottom-right corner */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'white', padding: '10px' }}>
        <StackedBarChart data={aggregatedData} />  {/* Pass the aggregated data */}
      </div>

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