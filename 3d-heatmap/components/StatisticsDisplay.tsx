import React from 'react';

const StatisticsDisplay = ({ title, statistics }) => {
  const { startDate = 'N/A', endDate = 'N/A' } = statistics.dateRange || {};

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>{title}</h4>
      {statistics.events === 0 ? (
        <p>No data available.</p>
      ) : (
        <p>
          Events: {statistics.events} <br />
          Total Fatalities: {statistics.totalFatalities} <br />
          Avg Fatalities per Event: {statistics.avgFatalities} <br />
          Max Fatalities in a Single Event: {statistics.maxFatalities} <br />
          Date Range: {startDate} - {endDate}
        </p>
      )}
    </div>
  );
};

export default StatisticsDisplay;
