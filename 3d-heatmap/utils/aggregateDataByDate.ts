import { group } from 'd3-array';

export const aggregateDataByDate = (battlesData, explosionsData) => {
  // Group battles by date (converting Date object to ISO string for consistency)
  const battlesGroupedByDate = group(battlesData, (d) =>
    d.event_date.toISOString().split('T')[0]  // Ensure date consistency as YYYY-MM-DD
  );

  // Group explosions by date
  const explosionsGroupedByDate = group(explosionsData, (d) =>
    d.event_date.toISOString().split('T')[0]  // Ensure date consistency as YYYY-MM-DD
  );

  // Create array with the aggregated data
  const aggregatedData = Array.from(new Set([...battlesGroupedByDate.keys(), ...explosionsGroupedByDate.keys()]))
    .map((date) => {
      return {
        date,
        battles: (battlesGroupedByDate.get(date) || []).length,
        explosions: (explosionsGroupedByDate.get(date) || []).length,
      };
    });

  return aggregatedData;
};
