import React from 'react';
import Switch from '@mui/material/Switch';

const ToggleSwitch = ({ label, checked, onChange }) => {
  return (
    <div style={{ marginTop: '10px' }}>
      <label>{label}</label>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
};

export default ToggleSwitch;
