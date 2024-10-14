// StatisticsDisplay.tsx
import React from 'react';

interface StatisticsDisplayProps {
  statistics: { min: number; max: number; total: number; count: number };
  dateRange: { startDate: string; endDate: string };
}

export default function StatisticsDisplay({ statistics, dateRange }: StatisticsDisplayProps) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h4>Statistics</h4>
      <p>
        Min: {statistics.min} <br />
        Max: {statistics.max} <br />
        Total: {statistics.total} <br />
        Count: {statistics.count}
      </p>
      <p>
        There were a total of {statistics.total} battles from {dateRange.startDate} to {dateRange.endDate} in the selected area.
      </p>
    </div>
  );
}
