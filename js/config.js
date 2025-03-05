/* 
 * Configuration Settings
 * Contains global configuration settings and state variables
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
let showPlazas = true; // Keep plazas visible for visualization
let showParks = true;  // Keep parks visible for visualization
let showBID = true;

// Hexagon layer configuration
let hexagonRadius = 100;  // in meters
let hexagonElevationScale = 1;

// Editor mode configuration
let editorMode = false;
let selectedFacility = null;
let facilityToAdd = {
  type: 'bench',
  position: [-73.9413184, 40.7508189],  // Default position (center of map)
  seatingCapacity: 3  // Default bench seating capacity
};

// Colors for different facility types
const FACILITY_COLORS = {
  bench: [0, 128, 255],       // Blue
  plaza: [255, 165, 0],       // Orange
  park:  [34, 139, 34]        // Forest Green
};


// Storage for user-added facilities
let userAddedFacilities = [];

// Data storage for loaded facilities
let facilitiesData = [];
let bidData = null;

// Legend configuration
const legendItems = [];