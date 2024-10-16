import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import { INITIAL_VIEW_STATE } from './config/mapConfig';
import { fetchData } from './utils/dataFetcher'; // Import fetchData function
import { createLayers } from './utils/layerCreator';
import ControlPanel from './components/ControlPanel';
import { calculateStatistics } from './utils/calculateStatistics';

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

  // Fetch battles and explosions data when component loads
  useEffect(() => {
    fetchData('BATTLES', setBattlesData);
    fetchData('EXPLOSIONS', setExplosionsData);
  }, []); // Empty array ensures this runs only once when the component mounts

  // Calculate statistics when data changes
  useEffect(() => {
    if (battlesData.length) {
      const newBattlesStatistics = calculateStatistics(battlesData);
      setBattlesStatistics(newBattlesStatistics);
    }

    if (explosionsData.length) {
      const newExplosionsStatistics = calculateStatistics(explosionsData);
      setExplosionsStatistics(newExplosionsStatistics);
    }
  }, [battlesData, explosionsData]);  // This ensures that whenever battlesData or explosionsData changes, the statistics are recalculated.

  const handleInteraction = useCallback(async (x, y) => {
    // Interaction logic...
  }, []);

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
  }, [battlesData, explosionsData, radius, upperPercentile, coverage, brushingEnabled, brushingRadius, showBattlesLayer, showExplosionsLayer]);

  return (
    <div>
      <DeckGL ref={deckRef} layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
        <Map reuseMaps mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>

      {tooltip && tooltip.object && (
        <div style={{ position: 'absolute', left: tooltip.x, top: tooltip.y, backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#fff', padding: '5px', borderRadius: '3px', pointerEvents: 'none' }}>
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
