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