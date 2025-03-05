/* 
 * Configuration Settings
 * Contains all global configuration settings and state variables
 */

// Initial map view centered on Long Island City
const INITIAL_VIEW_STATE = {
  longitude: -73.9413184,
  latitude: 40.7508189,
  zoom: 14,
  pitch: 30,
  bearing: 0,
};

// Layer visibility settings
let showHexagonLayer = true;
let showBenches = true;
let showPlazas = true;
let showParks = true;
let showBID = true;

// Hexagon layer configuration
let hexagonRadius = 100;  // in meters
let hexagonElevationScale = 1;

// Editor mode configuration
let editorMode = false;
let selectedFacility = null;
let facilityToAdd = {
  type: 'bench',
  area: 100,  // in square meters (for parks/plazas)
  density: 10, // square meters per person (for calculating seating capacity)
};

// Colors for different facility types
const FACILITY_COLORS = {
  bench: [0, 128, 255],  // Blue
  plaza: [255, 153, 0],  // Orange
  park: [0, 204, 102],   // Green
};

// Default seating capacities
const DEFAULT_CAPACITIES = {
  bench: 3,
  plaza: function(area) { return Math.max(Math.floor(area / facilityToAdd.density), 10); },
  park: function(area) { return Math.max(Math.floor(area / facilityToAdd.density), 5); }
};

// Storage for user-added facilities
let userAddedFacilities = [];

// Data storage for loaded facilities
let facilitiesData = [];
let bidData = null;

// Legend configuration
const legendItems = [
  // Will be populated dynamically from data
];