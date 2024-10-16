import React from 'react';
import Slider from '@mui/material/Slider';

const SliderControl = ({ label, value, min, max, step, onChange, isRange = false }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <label>{label}</label>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e, newValue) => onChange(newValue)}
        valueLabelDisplay="auto"
        marks
        aria-labelledby="slider-control"
      />
    </div>
  );
};

export default SliderControl;
