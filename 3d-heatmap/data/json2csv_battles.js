const fs = require('fs');
const { Parser } = require('json2csv');

/**
 * Converts a JSON file to a CSV file, keeping only the specified fields.
 *
 * @param {string} inputFilePath - The path to the input JSON file.
 * @param {string} outputFilePath - The path to the output CSV file.
 */
function convertJsonToCsv(inputFilePath, outputFilePath) {
  try {
    // Read JSON data from the input file
    const jsonData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

    // Ensure the data is an array
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

    // Check if the data array is empty
    if (dataArray.length === 0) {
      throw new Error('JSON data is empty.');
    }

    // Specify the fields you want to keep in the CSV
    const fields = [
      'event_id_cnty',
      'event_date',
      'event_type',
      'sub_event_type',
      'latitude',
      'longitude',
      'geo_precision',
      'fatalities'
    ];

    // Initialize the JSON to CSV parser with the specified fields
    const json2csvParser = new Parser({ fields });

    // Convert the JSON array to CSV
    const csvData = json2csvParser.parse(dataArray);

    // Write the CSV data to the output file
    fs.writeFileSync(outputFilePath, csvData, 'utf8');

    console.log(`CSV file has been created at: ${outputFilePath}`);
  } catch (error) {
    console.error('Error converting JSON to CSV:', error.message);
  }
}

// Example usage
const inputFilePath = 'acled_data_battles.json'; // Replace with your JSON file path
const outputFilePath = 'acled_data_battles.csv'; // Replace with your desired CSV file path

convertJsonToCsv(inputFilePath, outputFilePath);
