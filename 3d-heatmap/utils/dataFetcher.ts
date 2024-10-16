import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';

const DATA_URLS = {
  BATTLES: 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_battles.csv',
  EXPLOSIONS: 'https://raw.githubusercontent.com/14-TR/conflict-monitor2/refs/heads/main/acled_data_explosions.csv',
};

export const fetchData = async (type, setData) => {
  const url = DATA_URLS[type];
  try {
    const result = await load(url, CSVLoader); // Load data using the CSV loader
    const parsedData = result.map((row) => ({
      id: row.event_id_cnty,
      longitude: parseFloat(row.longitude),
      latitude: parseFloat(row.latitude),
      event_date: new Date(row.event_date), // Convert date string to Date object
      fatalities: parseInt(row.fatalities, 10) || 0, // Parse fatalities to ensure it's a number
    }));
    setData(parsedData); // Set the parsed data to the state
  } catch (error) {
    console.error(`Error loading data from ${url}:`, error);
  }
};
