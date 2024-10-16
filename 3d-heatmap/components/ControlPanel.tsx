import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import SliderControl from './SliderControl';
import StatisticsDisplay from './StatisticsDisplay';

const ControlPanel = ({
  radius,
  setRadius,
  upperPercentile,
  setUpperPercentile,
  coverage,
  setCoverage,
  brushingEnabled,
  setBrushingEnabled,
  brushingRadius,
  setBrushingRadius,
  showHexControls,
  setShowHexControls,
  showBattlesLayer,
  setShowBattlesLayer,
  showExplosionsLayer,
  setShowExplosionsLayer,
  // battlesStatistics,
  // explosionsStatistics,
}) => {
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
      {/* Toggle Hex Controls */}
      <ToggleSwitch
        label="Show Hex Controls"
        checked={showHexControls}
        onChange={(checked) => setShowHexControls(checked)}
      />

      {showHexControls && (
        <>
          {/* Layer Visibility Switches */}
          <ToggleSwitch
            label="Show Battles Layer"
            checked={showBattlesLayer}
            onChange={(checked) => setShowBattlesLayer(checked)}
          />
          <ToggleSwitch
            label="Show Explosions Layer"
            checked={showExplosionsLayer}
            onChange={(checked) => setShowExplosionsLayer(checked)}
          />

          {/* Radius Slider */}
          <SliderControl
            label={`Radius: ${radius} meters`}
            value={radius}
            min={100}
            max={20000}
            step={100}
            onChange={setRadius}
          />

          {/* Percentile Range Slider */}
          <SliderControl
            label={`Percentile Range: ${upperPercentile[0]}% - ${upperPercentile[1]}%`}
            value={upperPercentile}
            min={0}
            max={100}
            step={1}
            onChange={setUpperPercentile}
            isRange={true}
          />

          {/* Coverage Slider */}
          <SliderControl
            label={`Coverage: ${coverage}`}
            value={coverage}
            min={0}
            max={1}
            step={0.01}
            onChange={setCoverage}
          />
        </>
      )}

      {/* Brushing Controls */}
      <ToggleSwitch
        label="Enable Brushing"
        checked={brushingEnabled}
        onChange={(checked) => setBrushingEnabled(checked)}
      />

      {brushingEnabled && (
        <SliderControl
          label={`Brushing Radius: ${brushingRadius} meters`}
          value={brushingRadius}
          min={100}
          max={100000}
          step={1000}
          onChange={setBrushingRadius}
        />
      )}

      
    </div>
  );
};

export default ControlPanel;
