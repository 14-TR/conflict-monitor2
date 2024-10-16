import React from 'react';
import StatisticsDisplay from './StatisticsDisplay';

const StatisticsArea = ({ battlesStatistics, explosionsStatistics }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '8px',
      }}
    >
      {/* Battles Statistics */}
      <div style={{ marginRight: '20px' }}>
        <StatisticsDisplay title="Battles Statistics" statistics={battlesStatistics} />
      </div>

      {/* Explosions Statistics */}
      <div>
        <StatisticsDisplay title="Explosions Statistics" statistics={explosionsStatistics} />
      </div>
    </div>
  );
};

export default StatisticsArea;
