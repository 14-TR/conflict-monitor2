export const calculateStatistics = (points) => {
  // Check if the dataset is empty and return default values if true
  if (points.length === 0) {
    return {
      events: 0,
      totalFatalities: 0,
      avgFatalities: '0',
      maxFatalities: 0,
      dateRange: { startDate: 'N/A', endDate: 'N/A' },
    };
  }

  // Calculate total number of events
  const totalEvents = points.length;

  // Calculate total number of fatalities
  const totalFatalities = points.reduce((sum, point) => sum + point.fatalities, 0);

  // Calculate average number of fatalities per event
  const avgFatalities = totalFatalities / totalEvents;

  // Find the maximum number of fatalities in a single event
  const maxFatalities = Math.max(...points.map((point) => point.fatalities));

  // Extract the dates from the dataset
  const dates = points.map((point) => point.event_date);

  // Find the earliest and latest event dates
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // Return the calculated statistics in the proper format
  return {
    events: totalEvents,                    // Total number of events
    totalFatalities,                        // Total number of fatalities
    avgFatalities: avgFatalities.toFixed(2), // Average fatalities per event (formatted to 2 decimal places)
    maxFatalities,                          // Maximum fatalities in a single event
    dateRange: {
      startDate: minDate.toLocaleDateString(), // Start date of the event range
      endDate: maxDate.toLocaleDateString(),   // End date of the event range
    },
  };
};
