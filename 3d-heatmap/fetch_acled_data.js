// fetch_acled_data.js
require('dotenv').config();
const fetch = require('node-fetch');
const duckdb = require('duckdb');

const ACLED_API_KEY = process.env.ACLED_API_KEY;
const ACLED_EMAIL = process.env.ACLED_EMAIL;

// Initialize DuckDB
const db = new duckdb.Database('acled_data.duckdb');

// Function to fetch data from ACLED API
async function fetchData() {
  const url = `https://api.acleddata.com/acled/read?key=${ACLED_API_KEY}&email=${ACLED_EMAIL}&country=Ukraine&limit=0`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Extract events
    const events = data.data;

    // Insert data into DuckDB
    await insertData(events);

    console.log('Data fetched and stored successfully.');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to insert data into DuckDB
async function insertData(events) {
  const connection = db.connect();

  // Create table if it doesn't exist
  await connection.run(`
    CREATE TABLE IF NOT EXISTS acled_events (
      event_id TEXT PRIMARY KEY,
      event_date DATE,
      latitude DOUBLE,
      longitude DOUBLE,
      event_type TEXT,
      sub_event_type TEXT,
      actor1 TEXT,
      actor2 TEXT,
      notes TEXT,
      fatalities INTEGER
      -- Add other fields as needed
    );
  `);

  // Prepare insert statement
  const insertStmt = await connection.prepare(`
    INSERT INTO acled_events (
      event_id, event_date, latitude, longitude, event_type, sub_event_type,
      actor1, actor2, notes, fatalities
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  // Insert each event
  for (const event of events) {
    await insertStmt.run([
      event.event_id,
      event.event_date,
      parseFloat(event.latitude),
      parseFloat(event.longitude),
      event.event_type,
      event.sub_event_type,
      event.actor1,
      event.actor2,
      event.notes,
      parseInt(event.fatalities, 10),
    ]);
  }

  await insertStmt.finalize();
  await connection.close();
}

// Execute the script
fetchData();
