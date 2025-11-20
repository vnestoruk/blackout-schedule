// Regions configuration - easy to add more regions in the future
export const REGIONS = {
  IF: {
    name: "Івано-Франківська",
    endpoint: "https://be-svitlo.oe.if.ua/schedule-by-queue",
    queues: [
      "1.1",
      "1.2",
      "2.1",
      "2.2",
      "3.1",
      "3.2",
      "4.1",
      "4.2",
      "5.1",
      "5.2",
      "6.1",
      "6.2",
    ],
    parseResponse: (data) => data, // IF uses the standard format
  },
  // Future regions can be added here with different endpoints and parsers
  // LVIV: { name: 'Львів', endpoint: '...', parseResponse: (data) => {...} }
};

/**
 * Fetches schedule data for a specific region and queue
 * @param {string} regionKey - Region key (e.g., 'IF')
 * @param {string} queue - Queue number (e.g., '4.1')
 * @returns {Promise<Object>} Schedule data
 */
export async function fetchSchedule(regionKey = "IF", queue = "1.1") {
  const region = REGIONS[regionKey];

  if (!region) {
    throw new Error(`Unknown region: ${regionKey}`);
  }

  try {
    const url = `${region.endpoint}?queue=${queue}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return region.parseResponse(data);
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    throw error;
  }
}
