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

async function loadCitibikeCountData() {
  try {
    const response = await fetch("data/bikes/citibike_count.json");
    const data = await response.json();

    // Process the data to create two points per station - one for starts, one for ends
    const processedData = [];

    data.forEach(station => {
      if (station.lat && station.lon) {
        // Calculate distance to simulation station if in simulation mode
        let startImpact = 0;
        let endImpact = 0;

        if (simulationMode) {
          const dx = station.lon - simulationStationPosition[0];
          const dy = station.lat - simulationStationPosition[1];
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate impact based on distance and simulation parameters
          if (distance < simulationStationRange) {
            // Impact decreases with distance (linear falloff)
            const impactFactor = (simulationStationRange - distance) / simulationStationRange;
            // Impact is proportional to new station's capacity
            const capacityFactor = simulationStationCapacity / 20; // Normalize to "standard" capacity

            // console.log(`Station: ${station.station_name}`);
            // console.log(`  Distance: ${distance.toFixed(5)}, Range: ${simulationStationRange.toFixed(5)}`);
            // console.log(`  Impact factor: ${impactFactor.toFixed(2)}, Capacity factor: ${capacityFactor.toFixed(2)}`);

            // Calculate impact on start and end counts
            startImpact = -impactFactor * simulationStationImpact * capacityFactor * station.start_count * 0.3;
            endImpact = -impactFactor * simulationStationImpact * capacityFactor * station.end_count * 0.3;

            // console.log(`  Original start: ${station.start_count}, Impact: ${startImpact.toFixed(2)}, New: ${(station.start_count + startImpact).toFixed(2)}`);
            // console.log(`  Original end: ${station.end_count}, Impact: ${endImpact.toFixed(2)}, New: ${(station.end_count + endImpact).toFixed(2)}`);
          }
        }

        // Create a point for starts (shifted slightly west)
        processedData.push({
          ...station,
          position: [station.lon - 0.0002, station.lat],
          count: Math.max(0, station.start_count + startImpact),
          originalCount: station.start_count,
          impact: startImpact,
          type: 'start'
        });

        // Create a point for ends with simulation impact
        processedData.push({
          ...station,
          position: [station.lon + 0.0002, station.lat],
          count: Math.max(0, station.end_count + endImpact),
          originalCount: station.end_count,
          impact: endImpact,
          type: 'end'
        });
      }
    });

    // Add the simulated station's impact as new points
    if (simulationMode) {
      const simulatedStationImpact = simulationStationCapacity * 2; // Roughly estimate impact based on capacity

      // Add start rides generated by new station
      processedData.push({
        station_name: "Simulated Station",
        station_id: "sim-1",
        lat: simulationStationPosition[1],
        lon: simulationStationPosition[0],
        position: [simulationStationPosition[0] - 0.0002, simulationStationPosition[1]],
        count: simulatedStationImpact,
        originalCount: 0,
        impact: simulatedStationImpact,
        type: 'start'
      });

      // Add end rides generated by new station
      processedData.push({
        station_name: "Simulated Station",
        station_id: "sim-1",
        lat: simulationStationPosition[1],
        lon: simulationStationPosition[0],
        position: [simulationStationPosition[0] + 0.0002, simulationStationPosition[1]],
        count: simulatedStationImpact,
        originalCount: 0,
        impact: simulatedStationImpact,
        type: 'end'
      });
    }

    // Log counts for debugging
    const startCount = processedData.filter(d => d.type === 'start').length;
    const endCount = processedData.filter(d => d.type === 'end').length;
    console.log(`Start points: ${startCount}, End points: ${endCount}`);
    return processedData;
  } catch (error) {
    console.error("Error loading Citibike count data:", error);
    return [];
  }
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

    // Load Citibike data if needed for any Citibike layer
    let citibikeData = [];
    if (showCitibikeStations || showCitibikeHexagons) {
      citibikeData = await loadCitibikeData();
    }


    if (showCitibikeCountData) {
      console.log("Citibike count data should display");
      const citibikeCountData = await loadCitibikeCountData();
      console.log("Citibike count data loaded:", citibikeCountData.length, "points");
      layers.push(createCitibikeDualHexagonLayer(citibikeCountData));
    }

    // Add simulated station if simulation mode is active
    if (simulationMode) {
      layers.push(createSimulatedStationLayer());
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
      // layers.push(createScatterplotLayer(treesData));
      layers.push(createLicBidLayer(licBidData));
    }

    // Citibike hexagon layer (independent toggle)
    if (showCitibikeHexagons && citibikeData.length > 0) {
      layers.push(createCitibikeHexagonLayer(citibikeData));
    }

    // Citibike stations layer (independent toggle)
    if (showCitibikeStations && citibikeData.length > 0) {
      // Only show point layer if hexagons are off or we explicitly want both
      if (!showCitibikeHexagons) {
        layers.push(createCitibikeLayer(citibikeData));
      }
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

// Add this function to fetch and load Citibike station data
async function loadCitibikeData() {
  try {
    // Fetch directly from the Citibike API
    const response = await fetch("https://gbfs.citibikenyc.com/gbfs/en/station_information.json");
    const data = await response.json();
    return data.data.stations;
  } catch (error) {
    console.error("Error loading Citibike station data:", error);
    return [];
  }
}


// Add this function to create a Citibike stations layer
function createCitibikeLayer(citibikeData) {
  return new ScatterplotLayer({
    id: "citibike-layer",
    data: citibikeData,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 4,
    radiusMaxPixels: 12,
    lineWidthMinPixels: 1,
    getPosition: d => [d.lon, d.lat], // Matches your data structure from the API
    getRadius: d => Math.sqrt(d.capacity || 10),
    getFillColor: [0, 105, 217], // Citibike blue color
    getLineColor: [255, 255, 255],
    onHover: updateCitibikeTooltip
  });
}

// Add tooltip function for Citibike stations
function updateCitibikeTooltip(info) {
  const tooltip = document.getElementById("tooltip");
  if (info.object) {
    const { name, station_id, capacity, lat, lon } = info.object;
    tooltip.style.display = "block";
    tooltip.style.left = `${info.x}px`;
    tooltip.style.top = `${info.y}px`;
    tooltip.innerHTML = `
      <strong>${name || 'Citibike Station'}</strong><br>
      Station ID: ${station_id}<br>
      Capacity: ${capacity || 'N/A'}<br>
      Location: [${lat.toFixed(5)}, ${lon.toFixed(5)}]
    `;
  }
}
// Add tooltip function for Citibike stations
// Update the tooltip to show impact from simulation
function updateCitibikeCountTooltip(info) {
  const tooltip = document.getElementById("tooltip");
  if (info.object) {
    tooltip.style.display = "block";
    tooltip.style.left = `${info.x}px`;
    tooltip.style.top = `${info.y}px`;

    const points = info.object.points || [];
    if (points.length > 0) {
      const isStart = points[0]?.source?.type === 'start';
      const sum = points.reduce((total, p) => total + p.source.count, 0);
      const originalSum = points.reduce((total, p) => total + (p.source.originalCount || p.source.count), 0);
      const impact = sum - originalSum;
      const stationName = points[0]?.source?.station_name || 'Unknown Station';

      let impactText = '';
      if (simulationMode && Math.abs(impact) > 0.1) {
        const impactPercent = ((impact / originalSum) * 100).toFixed(1);
        const impactColor = impact < 0 ? 'red' : 'green';
        impactText = `<span style="color: ${impactColor}">Impact: ${impact.toFixed(0)} rides (${impactPercent}%)</span><br>`;
      }
      tooltip.innerHTML = `
        <strong>${stationName}</strong><br>
        <span style="color: ${isStart ? '#4287f5' : '#42aaf5'}">
          ${isStart ? 'Start' : 'End'} Rides: ${sum.toFixed(0)}
        </span><br>
        ${impactText}
        Location: ${points[0]?.source?.lat.toFixed(4)}, ${points[0]?.source?.lon.toFixed(4)}
      `;
    } else {
      tooltip.style.display = "none";
    }
  } else {
    tooltip.style.display = "none";
  }
}

// Add this function to create a hexagon layer for Citibike station capacities
function createCitibikeHexagonLayer(citibikeData) {
  return new HexagonLayer({
    id: 'citibike-hexagon-layer',
    data: citibikeData,
    getPosition: d => [d.lon, d.lat],
    getElevationWeight: d => d.capacity || 0,
    getColorWeight: d => d.capacity || 0,
    radius: 50,
    elevationScale: 1,
    extruded: true,
    pickable: true,
    colorRange: [
      [0, 64, 128],
      [0, 96, 176],
      [0, 128, 214],
      [0, 160, 235],
      [41, 190, 240],
      [103, 216, 245]
    ],  // Citibike blue color gradient
    elevationRange: [0, 500],
    coverage: 0.85,
    opacity: 0.8,
    onHover: info => {
      if (info.object) {
        updateCitibikeHexagonTooltip(info);
      }
    }
  });
}

// Add tooltip function for Citibike hexagons
function updateCitibikeHexagonTooltip(info) {
  const tooltip = document.getElementById("tooltip");
  if (info.object) {
    const count = info.object.points.length;
    const totalCapacity = info.object.points.reduce((sum, p) => sum + (p.source.capacity || 0), 0);
    const avgCapacity = count > 0 ? Math.round(totalCapacity / count) : 0;

    tooltip.style.display = "block";
    tooltip.style.left = `${info.x}px`;
    tooltip.style.top = `${info.y}px`;
    tooltip.innerHTML = `
      <strong>Citibike Station Cluster</strong><br>
      Stations: ${count}<br>
      Total Capacity: ${totalCapacity}<br>
      Avg. Capacity: ${avgCapacity}<br>
    `;
  } else {
    tooltip.style.display = "none";
  }
}

// Add this function to create a dual hexagon layer for Citibike start/end counts
function createCitibikeDualHexagonLayer(citibikeCountData) {
  console.log("Creating dual hexagon layer with", citibikeCountData.length, "points");

  // // For debugging, inspect the data
  const startPoints = citibikeCountData.filter(d => d.type === 'start');
  const endPoints = citibikeCountData.filter(d => d.type === 'end');

  // Find maximum values for normalization
  const maxCount = Math.max(
    ...citibikeCountData.map(d => d.originalCount || d.count || 0)
  );


  // const simplifiedData = citibikeCountData.map(d => ({
  //   position: d.position, // Keep original position
  //   weight: d.count,
  //   type: d.type,
  //   colorValue: d.type === 'start' ? 0 : 1 // 0 for start, 1 for end
  // }));

  const simplifiedData = citibikeCountData.map(d => {
    // For the simulated station, we want to show its actual count
    const isSimulated = d.station_name === "Simulated Station";

    // If we're in simulation mode AND this is not the simulated station,
    // we want to invert how the impact is displayed visually
    let displayWeight;

    if (simulationMode && !isSimulated) {
      // For existing stations, invert the weight so that:
      // - Lower counts (negative impact) = taller hexagons
      // - Use original count as reference, and then scale down by impact
      // - This will make hexagons taller as impact becomes more negative
      displayWeight = d.originalCount - (d.impact * 2); // Multiply impact by 2 to exaggerate
    } else {
      // For the simulated station or when not in simulation mode:
      // - Just use the actual count
      displayWeight = d.count;
    }


    return {
      position: d.position,
      weight: displayWeight, // Use our custom display weight
      type: d.type,
      colorValue: d.type === 'start' ? 0 : 1,

      // Keep original data for tooltips
      originalCount: d.originalCount,
      impact: d.impact,
      stationName: d.station_name
    };
  });

  return new HexagonLayer({
    id: 'citibike-counts-layer',
    data: simplifiedData,
    getPosition: d => d.position,
    getElevationWeight: d => d.weight,
    getColorWeight: d => d.colorValue, // Use our type indicator for color
    colorAggregation: 'MEAN', // Use MEAN to keep the color values discrete
    elevationAggregation: 'SUM',
    radius: 30,
    elevationScale: 1,
    extruded: true,
    pickable: true,
    coverage: 0.9,
    // Simpler color range - just two colors
    colorRange: [
      [30, 144, 255], // Blue for start
      [30, 144, 255], // Blue for start
      [30, 144, 255], // Blue for start
      [0, 191, 100],  // Green for end
      [0, 191, 100],  // Green for end
      [0, 191, 100]   // Green for end
    ],
    material: {
      ambient: 0.7,
      diffuse: 0.8,
      shininess: 32
    },
    opacity: 1.0,
    // Try a much lower elevation range
    elevationRange: [0, 500], // Reduced from 1000 to make columns shorter
    onHover: updateCitibikeCountTooltip
  });
}

// Update the tooltip function for better information display
function updateCitibikeCountTooltip(info) {
  const tooltip = document.getElementById("tooltip");
  if (info.object) {
    tooltip.style.display = "block";
    tooltip.style.left = `${info.x}px`;
    tooltip.style.top = `${info.y}px`;

    const points = info.object.points || [];
    if (points.length > 0) {
      const isStart = points[0]?.source?.type === 'start';
      const sum = points.reduce((total, p) => total + p.source.count, 0);
      const stationName = points[0]?.source?.station_name || 'Unknown Station';

      tooltip.innerHTML = `
        <strong>${stationName}</strong><br>
        <span style="color: ${isStart ? '#4287f5' : '#42aaf5'}">
          ${isStart ? 'Start' : 'End'} Rides: ${sum.toFixed(0)}
        </span><br>
        Location: ${points[0]?.source?.lat.toFixed(4)}, ${points[0]?.source?.lon.toFixed(4)}
      `;
    } else {
      tooltip.style.display = "none";
    }
  } else {
    tooltip.style.display = "none";
  }
}

// Add a function to create a layer for the simulated station
function createSimulatedStationLayer() {
  simulationStationPosition = [...QRPosition];

  return new ScatterplotLayer({
    id: "simulated-station-layer",
    data: [{
      position: QRPosition,
      capacity: simulationStationCapacity,
      isSimulation: true
    }],
    pickable: true,
    opacity: 1.0,
    stroked: true,
    filled: true,
    radiusScale: 8,
    radiusMinPixels: 10,
    radiusMaxPixels: 20,
    lineWidthMinPixels: 2,
    getPosition: d => d.position,
    getRadius: d => Math.sqrt(d.capacity || 10) * 2,
    getFillColor: [255, 50, 50], // Red color for simulated station
    getLineColor: [255, 255, 255],
    onHover: updateSimulatedStationTooltip
  });
}

// Add tooltip function for the simulated station
function updateSimulatedStationTooltip(info) {
  const tooltip = document.getElementById("tooltip");
  if (info.object && info.object.isSimulation) {
    tooltip.style.display = "block";
    tooltip.style.left = `${info.x}px`;
    tooltip.style.top = `${info.y}px`;
    tooltip.innerHTML = `
      <strong>Simulated Citibike Station</strong><br>
      Capacity: ${info.object.capacity}<br>
      Position: [${info.object.position[1].toFixed(5)}, ${info.object.position[0].toFixed(5)}]<br>
      <em>Use the simulation controls to adjust</em>
    `;
  }
}