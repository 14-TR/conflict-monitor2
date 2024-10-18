require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');

// Load API credentials from environment variables
const ACLED_API_KEY = process.env.ACLED_API_KEY;
const ACLED_EMAIL = process.env.ACLED_EMAIL;

// Function to fetch data from ACLED API and save it as JSON
async function fetchData() {
  // Build API parameters
  const apiParams = {
    key: ACLED_API_KEY,
    email: ACLED_EMAIL,
    country: 'Ukraine',
    event_date: '2022-01-01',
    event_date_where: '>=',
    limit: 0, // Set to 0 for unlimited results
    event_type: ['Explosions/Remote violence'],
  };

  // Construct query string
  const queryString = Object.entries(apiParams)
    .flatMap(([key, value]) =>
      Array.isArray(value)
        ? value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
        : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');

  const url = `https://api.acleddata.com/acled/read?${queryString}`;

  try {
    console.log('Fetching data from ACLED API...');
    const response = await fetch(url);
    const data = await response.json();

    // Check if data was returned
    if (data && data.data && data.data.length > 0) {
      console.log('Data fetched successfully. Saving to JSON...');

      // Write data to a JSON file
      fs.writeFileSync('acled_data.json', JSON.stringify(data.data, null, 2));

      console.log('Data has been saved to acled_data.json.');
    } else {
      console.log('No data returned from ACLED API.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Run the fetchData function
fetchData();
