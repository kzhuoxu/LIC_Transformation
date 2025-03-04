/* Tutorial: Map Layers
 * This module handles the deck.gl layers and map initialization.
 * It includes functions for creating and updating various visualization layers.
 */

const {
  DeckGL,
  HexagonLayer,
  MapboxOverlay,
  LineLayer,
  ScatterplotLayer,
  GeoJsonLayer,
} = deck;

// Add the CSV conversion function directly here
/**
 * Converts bike routes CSV data to GeoJSON format
 * @param {string} csvText - The raw CSV data as text
 * @returns {Object} GeoJSON FeatureCollection
 */
function bikeCsvToGeoJson(csvText) {
  // Split the CSV into lines
  const lines = csvText.trim().split('\n');

  // Get headers (first line)
  const headers = lines[0].split(',');

  // Create GeoJSON features
  const features = [];

  // Process each line (skip the header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) continue;

    // Match the coordinates from the MULTILINESTRING format
    const geomMatch = line.match(/MULTILINESTRING \(\((.*?)\)\)/);
    if (!geomMatch) continue;

    // Extract coordinates
    const coordsText = geomMatch[1];
    const coordPairs = coordsText.split(', ');
    const coordinates = coordPairs.map(pair => {
      const [lon, lat] = pair.split(' ').map(Number);
      return [lon, lat];
    });

    // Split the remaining fields
    const values = line.substring(line.indexOf('")') + 2).split(',');

    // Create properties object
    const properties = {};
    for (let j = 1; j < headers.length; j++) {
      // Skip first header (geometry)
      properties[headers[j]] = values[j - 1] ? values[j - 1].trim() : '';
    }

    // Create GeoJSON feature
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      },
      properties: properties
    });
  }

  return {
    type: 'FeatureCollection',
    features: features
  };
}


async function loadTreesData() {
  const response = await fetch("trees.json");
  const data = await response.json();
  return data.features;
}
// now load the lic_bid data
async function loadLicBidData() {
  const response = await fetch("lic_bid.json");
  const data = await response.json();
  return data.features;
}

async function updateLayers() {
  if (window.deckOverlay) {
    const treesData = await loadTreesData();
    const licBidData = await loadLicBidData();
    const layers = [];

    // Add the neighborhood highlight layer if enabled
    if (showNeighborhoods) {
      layers.push(createNeighborhoodHighlightLayer(licBidData));
    }

    // Add bike routes layer if enabled
    if (showBikeRoutes) {
      const bikeRoutesData = await loadBikeRoutesData();
      layers.push(createBikeRoutesLayer(bikeRoutesData));
    }

    if (showHexagonLayer) {
      layers.push(
        new HexagonLayer({
          id: "hexagon-layer",
          data: [
            ...treesData.map((tree) => ({
              ...tree,
              weight: 1,
            })),
            {
              geometry: { coordinates: QRPosition },
              weight: qrWeight,
            },
          ],
          getPosition: (d) => d.geometry.coordinates,
          getElevationWeight: (d) => d.weight,
          radius: 50,
          elevationScale: 1,
          extruded: true,
          pickable: true,
          opacity: 0.85,
          colorRange: [
            [1, 152, 189],
            [73, 227, 206],
            [216, 254, 181],
            [254, 237, 177],
            [254, 173, 84],
            [209, 55, 78],
          ],
        })
      );
    } else {
      layers.push(createScatterplotLayer(treesData));
      layers.push(createLicBidLayer(licBidData));
    }

    layers.push(createQRPositionLayer());
    window.deckOverlay.setProps({ layers });
  }
}

// Function to create a geojson layer for the lic_bid data

function createLicBidLayer(licBidData) {
  return new GeoJsonLayer({
    id: "geojson-layer",
    data: licBidData,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getLineColor: [160, 160, 180],
    getFillColor: [140, 170, 180, 100],
    getRadius: 100,
    getLineWidth: 1,
    getElevation: 30,
  });
}

function createScatterplotLayer(treesData) {
  return new ScatterplotLayer({
    id: "scatterplot-layer",
    data: treesData,
    getPosition: (d) => d.geometry.coordinates,
    getFillColor: (d) => {
      const color = d.properties.color;
      return [color >> 16, (color >> 8) & 255, color & 255];
    },
    getRadius: 5,
    pickable: true,
    onHover: updateTooltip,
  });
}

function createQRPositionLayer() {
  return new LineLayer({
    id: "line-layer",
    data: [
      {
        sourcePosition: [QRPosition[0], QRPosition[1], 0],
        targetPosition: [QRPosition[0], QRPosition[1], 1000],
      },
    ],
    getSourcePosition: (d) => d.sourcePosition,
    getTargetPosition: (d) => d.targetPosition,
    getColor: [0, 255, 0],
    getWidth: 5,
  });
}

async function initializeDeckGL() {
  const map = new maplibregl.Map({
    container: "map",
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    pitch: INITIAL_VIEW_STATE.pitch,
    bearing: INITIAL_VIEW_STATE.bearing,
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  });

  window.deckOverlay = new MapboxOverlay({ layers: [] });
  map.addControl(window.deckOverlay);
}

function createNeighborhoodHighlightLayer(licBidData) {
  // Define search radius (in coordinates)
  const searchRadius = 0.001; // Adjust as needed

  // Find neighborhoods near the QR position
  const nearbyNeighborhoods = licBidData.filter(feature => {
    // Get coordinates based on geometry type
    let coordinates = [];
    if (feature.geometry.type === 'Polygon') {
      coordinates = feature.geometry.coordinates[0]; // First ring of polygon
    } else if (feature.geometry.type === 'MultiPolygon') {
      coordinates = feature.geometry.coordinates.flatMap(poly => poly[0]);
    }

    // Check if any point is within radius of QR position
    return coordinates.some(coord => {
      const dx = coord[0] - QRPosition[0];
      const dy = coord[1] - QRPosition[1];
      return Math.sqrt(dx * dx + dy * dy) < searchRadius;
    });
  });

  return new GeoJsonLayer({
    id: "neighborhood-highlight-layer",
    data: nearbyNeighborhoods,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getLineColor: [255, 140, 0], // Orange outline
    getFillColor: [255, 255, 0, 80], // Yellow fill with transparency
    getLineWidth: 3,
  });
}

// Add a new function to load bike route data
async function loadBikeRoutesData() {
  try {
    const response = await fetch("data/bikes/bike_routes.csv");
    const csvText = await response.text();
    const geoJson = bikeCsvToGeoJson(csvText);
    return geoJson.features;
  } catch (error) {
    console.error("Error loading bike route data:", error);
    return [];
  }
}

// Add a function to create the bike routes layer
function createBikeRoutesLayer(bikeRoutesData) {
  return new GeoJsonLayer({
    id: "bike-routes-layer",
    data: bikeRoutesData,
    pickable: true,
    stroked: true,
    lineWidthScale: 5,
    lineWidthMinPixels: 1,
    getLineColor: d => {
      // Color by facility class (I, II, III)
      const facilityClass = d.properties.facilitycl;
      if (facilityClass === 'I') return [50, 180, 50]; // Green for class I
      if (facilityClass === 'II') return [50, 50, 220]; // Blue for class II
      if (facilityClass === 'III') return [220, 100, 50]; // Orange for class III
      return [50, 50, 220]; // Gray for unknown
    },
    getLineWidth: d => {
      // Adjust width based on facility class
      const facilityClass = d.properties.facilitycl;
      if (facilityClass === 'I') return 4;
      if (facilityClass === 'II') return 3;
      return 2; // Smaller for class III
    },
    // Add tooltip for bike route info
    onHover: info => {
      if (info.object) {
        updateBikeRouteTooltip(info);
      }
    }
  });
}

// Add tooltip function for bike routes
function updateBikeRouteTooltip(info) {
  const tooltip = document.getElementById("tooltip");
  if (info.object) {
    const { street, fromstreet, tostreet, facilitycl, ft_facilit, tf_facilit } = info.object.properties;
    tooltip.style.display = "block";
    tooltip.style.left = `${info.x}px`;
    tooltip.style.top = `${info.y}px`;
    tooltip.innerHTML = `
      <strong>Bike Route Info:</strong><br>
      Street: ${street || 'N/A'}<br>
      From: ${fromstreet || 'N/A'}<br>
      To: ${tostreet || 'N/A'}<br>
      Class: ${facilitycl || 'N/A'}<br>
      Type: ${ft_facilit || tf_facilit || 'N/A'}
    `;
  } else {
    tooltip.style.display = "none";
  }
}