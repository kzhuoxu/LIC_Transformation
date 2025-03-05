/* Tutorial: Configuration
 * This module contains all the constant values and initial settings for the application.
 * Keeping these values separate makes it easier to modify the application behavior.
 */

const INITIAL_VIEW_STATE = {
  longitude: -73.93561,
  latitude: 40.743,
  zoom: 16,
  pitch: 30,
  bearing: 0,
};

const initialQRPosition = [
  INITIAL_VIEW_STATE.longitude,
  INITIAL_VIEW_STATE.latitude,
];

// Global state variables
let showHexagonLayer = true;
let movementRadius = 0.00001;
let manualControl = false;
let QRPosition = [...initialQRPosition];
let QRRotation = 0;
let qrWeight = 1; // Add new variable for QR weight
let showNeighborhoods = true;  // Whether to show neighborhood highlighting
let showBikeRoutes = true;  // Whether to show bike routes
let showCitibikeStations = true; // Whether to show Citibike stations
let showCitibikeHexagons = false;  // For Citibike hexagons
let showCitibikeCountData = false; // Whether to show Citibike count data as hexagons

// Add these configuration variables for the simulation
let simulationMode = false; // Whether simulation mode is active
let simulationStationPosition = [...initialQRPosition]; // Position of simulated station
let simulationStationCapacity = 20; // Default capacity of the simulated station
let simulationStationRange = 0.003; // Influence range (in coordinates)
let simulationStationImpact = 0.5; // Impact factor (0-1) of new station on existing stations