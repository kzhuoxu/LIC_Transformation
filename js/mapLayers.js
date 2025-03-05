/*
 * Map Layers Module
 * Handles deck.gl layers and map initialization
 */

const {
  DeckGL,
  HexagonLayer,
  ScatterplotLayer,
  GeoJsonLayer,
  LineLayer,
  PolygonLayer,
  MapboxOverlay,
} = deck;


// Load facility data from JSON file
async function loadFacilitiesData() {
  try {
    const response = await fetch("data/combined_facilities.json");
    const data = await response.json();
    facilitiesData = data.features;

    // Populate legend items
    populateLegend(facilitiesData);

    return facilitiesData;
  } catch (error) {
    console.error("Error loading facilities data:", error);
    return [];
  }
}

// Update the list of facilities in the UI
function updateLayers() {
  if (!window.deckOverlay) return;

  const layers = [];

  // Include all layers for visualization
  if (showBID) {
    layers.push(createBIDLayer());
  }

  // Add facility layers next
  if (showParks) {
    layers.push(createParkLayer());
  }

  if (showPlazas) {
    layers.push(createPlazaLayer());
  }

  if (showBenches) {
    layers.push(createBenchLayer());
  }
  // Add the line layer for the bench being placed in editor mode
  if (editorMode && facilityToAdd && facilityToAdd.position) {
    layers.push(
      new LineLayer({
        id: "facility-line-layer",
        data: [
          {
            sourcePosition: facilityToAdd.position,
            targetPosition: [
              facilityToAdd.position[0],
              facilityToAdd.position[1] + 0.005,
              0,
            ],
          },
        ],
        getSourcePosition: (d) => d.sourcePosition,
        getTargetPosition: (d) => d.targetPosition,
        getColor: [0, 255, 0], // Green line indicator
        getWidth: 10,
        opacity: 1.0,
      })
    );

    // Add a temporary bench at the current position for the hexagon layer to use
    const tempBench = {
      position: facilityToAdd.position,
      weight: facilityToAdd.seatingCapacity,
    };

    // Always show hexagon layer in editor mode to visualize the impact
    if (showHexagonLayer) {
      layers.push(createHexagonLayer([tempBench]));
    }
  }
  if (showHexagonLayer) {
    layers.push(createHexagonLayer([]));
  }

  window.deckOverlay.setProps({ layers });
}

// Add movement controls dynamically when editor mode is enabled
function addMovementControls() {
  const editorControls = document.getElementById("editor-controls");
  if (!document.getElementById("move-up")) {
    // Prevent duplicate buttons
    const movementButtons = `
      <div class="movement-controls">
        <button id="move-up">⬆️ Up</button>
        <button id="move-left">⬅️ Left</button>
        <button id="move-right">➡️ Right</button>
        <button id="move-down">⬇️ Down</button>
      </div>
    `;
    editorControls.insertAdjacentHTML("beforeend", movementButtons);

    document
      .getElementById("move-up")
      .addEventListener("click", () => moveFacility("up"));
    document
      .getElementById("move-down")
      .addEventListener("click", () => moveFacility("down"));
    document
      .getElementById("move-left")
      .addEventListener("click", () => moveFacility("left"));
    document
      .getElementById("move-right")
      .addEventListener("click", () => moveFacility("right"));
  }
}

// Load BID boundary data from JSON file
async function loadBIDData() {
  try {
    const response = await fetch("data/lic_bid.json");
    const data = await response.json();
    bidData = data.features;
    return bidData;
  } catch (error) {
    console.error("Error loading BID data:", error);
    return [];
  }
}

// Extract unique categories for legend
function populateLegend(features) {
  console.log("Populating legend with", features.length, "features");
  // Clear existing items
  legendItems.length = 0;

  // Categories by facility type
  const categories = {
    bench: new Map(),
    plaza: new Map(),
    park: new Map()
  };

  // Extract unique categories and their colors
  features.forEach(feature => {
    const type = feature.properties.type;
    let category, color;

    if (type === 'bench') {
      category = feature.properties.Category || 'Other';
      color = feature.properties.color;
    } else if (type === 'plaza') {
      category = feature.properties.Partner || 'Other';
      color = feature.properties.color;
    } else if (type === 'park') {
      category = feature.properties.TYPECATEGORY || 'Other';
      color = feature.properties.color;
    }

    if (category && color && categories[type]) {
      // Convert decimal color to hex
      const hexColor = `#${color.toString(16).padStart(6, '0')}`;
      categories[type].set(category, hexColor);
    }
  });

  // Add default colors for user-added facilities
  categories.bench.set('User Added', rgbToHex(...FACILITY_COLORS.bench));
  categories.plaza.set('User Added', rgbToHex(...FACILITY_COLORS.plaza));
  categories.park.set('User Added', rgbToHex(...FACILITY_COLORS.park));

  // Convert to legend items
  for (const [type, typeCategories] of Object.entries(categories)) {
    for (const [category, color] of typeCategories.entries()) {
      legendItems.push({
        type,
        category,
        color
      });
    }
  }

  // Update legend in UI
  updateLegendDisplay();
}

// Convert RGB array to hex color
function rgbToHex(r, g, b) {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Update the legend display in the UI
function updateLegendDisplay() {
  console.log("Updating legend display");
  const legendContainer = document.getElementById('legend-container');
  console.log("Legend container:", legendContainer);
  legendContainer.innerHTML = '';

  // Group by facility type
  const groupedLegend = {
    bench: [],
    plaza: [],
    park: []
  };

  legendItems.forEach(item => {
    if (groupedLegend[item.type]) {
      groupedLegend[item.type].push(item);
    }
  });

  // Create legend sections by type
  for (const [type, items] of Object.entries(groupedLegend)) {
    if (items.length > 0) {
      const typeTitle = document.createElement('div');
      typeTitle.className = 'legend-type-title';
      typeTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}es`;
      legendContainer.appendChild(typeTitle);

      items.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = item.color;

        const label = document.createElement('span');
        label.textContent = item.category;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
      });
    }
  }

  // Add special hexagon layer legend if it's visible
  if (showHexagonLayer) {
    const hexTitle = document.createElement('div');
    hexTitle.className = 'legend-type-title';
    hexTitle.textContent = 'Seating Capacity';
    legendContainer.appendChild(hexTitle);

    // Create a gradient for the hexagon elevation
    const gradientContainer = document.createElement('div');
    gradientContainer.className = 'legend-gradient';
    gradientContainer.style.background = 'linear-gradient(to right, #019cbd, #49e3ce, #d8feb5, #feedb1, #fead54, #d1374e)';
    gradientContainer.style.height = '15px';
    gradientContainer.style.marginBottom = '5px';
    gradientContainer.style.borderRadius = '2px';

    // Add labels for low and high
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'legend-labels';
    labelsContainer.style.display = 'flex';
    labelsContainer.style.justifyContent = 'space-between';
    labelsContainer.style.fontSize = '11px';

    const lowLabel = document.createElement('span');
    lowLabel.textContent = 'Low';

    const highLabel = document.createElement('span');
    highLabel.textContent = 'High';

    labelsContainer.appendChild(lowLabel);
    labelsContainer.appendChild(highLabel);

    legendContainer.appendChild(gradientContainer);
    legendContainer.appendChild(labelsContainer);
  }
  console.log("Legend container content:", legendContainer.innerHTML);
}

// Create a hexagon layer for seating capacity visualization
function createHexagonLayer(additionalData = []) {
  // Convert all facility types to points with position and weight
  const facilitiesPoints = facilitiesData.map((feature) => {
    let position;
    if (feature.geometry.type === "Point") {
      position = feature.geometry.coordinates;
    } else if (feature.geometry.type === "MultiPolygon") {
      // Use the first coordinate of the first polygon as an approximation
      position = feature.geometry.coordinates[0][0][0];
    } else if (feature.geometry.type === "Polygon") {
      // Use the first coordinate of the polygon as an approximation
      position = feature.geometry.coordinates[0][0];
    }

    return {
      position: position,
      weight: feature.properties.SeatingCapacity || 0,
    };
  });

  // Combine all data sources
  const allFacilities = [
    ...facilitiesPoints,
    ...userAddedFacilities.map((facility) => ({
      position: facility.geometry.coordinates,
      weight: facility.properties.SeatingCapacity || 0,
    })),
    ...additionalData, // Include any temporary data points (like the moving bench)
  ];

  return new HexagonLayer({
    id: "hexagon-layer",
    data: allFacilities,
    getPosition: (d) => d.position,
    getElevationWeight: (d) => d.weight,
    elevationScale: hexagonElevationScale,
    extruded: true,
    radius: hexagonRadius,
    coverage: 0.85,
    upperPercentile: 90,
    pickable: true,
    autoHighlight: true,
    onHover: updateHexagonTooltip,
    colorRange: [
      [1, 152, 189],
      [73, 227, 206],
      [216, 254, 181],
      [254, 237, 177],
      [254, 173, 84],
      [209, 55, 78],
    ],
    updateTriggers: {
      getElevationWeight: [userAddedFacilities, hexagonRadius, additionalData],
    },
  });
}

// Create scatter plot layer for benches
function createBenchLayer() {
  // Filter facilities data for benches
  const benchData = facilitiesData.filter(
    (feature) => feature.properties.type === "bench"
  );

  return new ScatterplotLayer({
    id: "bench-layer",
    data: [...benchData, ...userAddedFacilities],
    getPosition: (feature) => feature.geometry.coordinates,
    getRadius: 5,
    radiusUnits: "pixels",
    getFillColor: (feature) => {
      if (feature.properties.userAdded) {
        return FACILITY_COLORS.bench;
      }
      // Convert decimal color to RGB array
      const color = feature.properties.color;
      return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
    },
    getLineColor: [0, 0, 0],
    lineWidthMinPixels: 1,
    pickable: true,
    onHover: updateFacilityTooltip,
    onClick: handleFacilityClick,
    updateTriggers: {
      getFillColor: [userAddedFacilities],
    },
  });
}

// Create GeoJSON layer for plazas
function createPlazaLayer() {
  // Filter facilities data for plazas
  const plazaData = facilitiesData.filter(
    (feature) => feature.properties.type === "plaza"
  );

  // Get user-added plazas
  const userPlazas = userAddedFacilities.filter(
    (facility) => facility.properties.type === "plaza"
  );

  return new GeoJsonLayer({
    id: "plaza-layer",
    data: [...plazaData, ...userPlazas],
    pickable: true,
    stroked: true,
    filled: true,
    getFillColor: (feature) => {
      if (feature.properties.userAdded) {
        return [...FACILITY_COLORS.plaza, 180]; // Add alpha
      }
      // Convert decimal color to RGB array with alpha
      const color = feature.properties.color;
      return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff, 180];
    },
    getLineColor: [0, 0, 0, 255],
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    onHover: updateFacilityTooltip,
    onClick: handleFacilityClick,
    updateTriggers: {
      getFillColor: [userAddedFacilities],
    },
  });
}

// Create GeoJSON layer for parks
function createParkLayer() {
  // Filter facilities data for parks
  const parkData = facilitiesData.filter(
    (feature) => feature.properties.type === "park"
  );

  // Get user-added parks
  const userParks = userAddedFacilities.filter(
    (facility) => facility.properties.type === "park"
  );

  return new GeoJsonLayer({
    id: "park-layer",
    data: [...parkData, ...userParks],
    pickable: true,
    stroked: true,
    filled: true,
    getFillColor: (feature) => {
      if (feature.properties.userAdded) {
        return [...FACILITY_COLORS.park, 180]; // Add alpha
      }
      // Convert decimal color to RGB array with alpha
      const color = feature.properties.color;
      return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff, 180];
    },
    getLineColor: [0, 0, 0, 255],
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    onHover: updateFacilityTooltip,
    onClick: handleFacilityClick,
    updateTriggers: {
      getFillColor: [userAddedFacilities],
    },
  });
}

// Create GeoJSON layer for BID boundary
function createBIDLayer() {
  return new GeoJsonLayer({
    id: "bid-layer",
    data: bidData,
    pickable: false,
    stroked: true,
    filled: false,
    getLineColor: [100, 100, 100, 255],
    getLineWidth: 2,
    lineWidthMinPixels: 2,
  });
}

// Update the tooltip for hexagon layer
function updateHexagonTooltip({ x, y, object }) {
  const tooltip = document.getElementById("tooltip");

  if (object) {
    // Get all facilities in this hexagon
    const points = object.points || [];
    if (points.length === 0) {
      tooltip.style.display = "none";
      return;
    }

    const totalSeating = points.reduce((sum, p) => sum + p.weight, 0);

    // Count facilities by type
    const facilityCount = {
      bench: 0,
      plaza: 0,
      park: 0,
    };

    points.forEach((p) => {
      const feature = facilitiesData.find((f) => {
        const fPos = getPosition(f);
        return (
          fPos[0] === p.source.position[0] && fPos[1] === p.source.position[1]
        );
      });

      if (feature && feature.properties.type) {
        facilityCount[feature.properties.type]++;
      } else {
        // Check user-added facilities
        const userFeature = userAddedFacilities.find((f) => {
          return (
            f.geometry.coordinates[0] === p.source.position[0] &&
            f.geometry.coordinates[1] === p.source.position[1]
          );
        });

        if (userFeature && userFeature.properties.type) {
          facilityCount[userFeature.properties.type]++;
        }
      }
    });

    // Create tooltip content
    let content = `<strong>Total Seating Capacity: ${totalSeating}</strong><br>`;
    content += `<strong>Facilities in this area:</strong><br>`;

    if (facilityCount.bench > 0) {
      content += `Benches: ${facilityCount.bench}<br>`;
    }
    if (facilityCount.plaza > 0) {
      content += `Plazas: ${facilityCount.plaza}<br>`;
    }
    if (facilityCount.park > 0) {
      content += `Parks: ${facilityCount.park}<br>`;
    }

    tooltip.innerHTML = content;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
}

// Update the tooltip for facility layers
function updateFacilityTooltip({ x, y, object }) {
  const tooltip = document.getElementById("tooltip");

  if (object) {
    const properties = object.properties || {};
    const type = properties.type;
    let content = "";

    if (type === "bench") {
      content = `
        <strong>Bench</strong><br>
        Category: ${properties.Category || "N/A"}<br>
        Seating Capacity: ${properties.SeatingCapacity || 3}<br>
        ${properties.BenchType ? `Type: ${properties.BenchType}<br>` : ""}
        ${properties.userAdded ? "<em>User Added</em>" : ""}
      `;
    } else if (type === "plaza") {
      content = `
        <strong>Plaza</strong><br>
        Name: ${properties.Plaza_Name || "User Added Plaza"}<br>
        Partner: ${properties.Partner || "N/A"}<br>
        Seating Capacity: ${properties.SeatingCapacity || "N/A"}<br>
        Area: ${Math.round(properties.area || 0)} sq m<br>
        ${properties.userAdded ? "<em>User Added</em>" : ""}
      `;
    } else if (type === "park") {
      content = `
        <strong>Park</strong><br>
        Name: ${properties.PARK_NAME || "User Added Park"}<br>
        Type: ${properties.TYPECATEGORY || "N/A"}<br>
        Seating Capacity: ${properties.SeatingCapacity || "N/A"}<br>
        Area: ${
          properties.ACRES
            ? properties.ACRES + " acres"
            : Math.round(properties.area || 0) + " sq m"
        }<br>
        ${properties.userAdded ? "<em>User Added</em>" : ""}
      `;
    }

    tooltip.innerHTML = content;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
}

// Handle facility click for selection in editor mode
function handleFacilityClick({ object }) {
  if (!editorMode || !object) return;

  // Only select user-added facilities for editing
  if (!object.properties.userAdded) return;

  // Select this facility
  selectedFacility = object;

  // Update the selected facility in the UI
  updateSelectedFacilityInList();

  // Enable delete button
  document.getElementById("delete-facility").disabled = false;
}

async function initializeDeckGL() {
  try {
    const map = new maplibregl.Map({
      container: "map",
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      pitch: INITIAL_VIEW_STATE.pitch,
      bearing: INITIAL_VIEW_STATE.bearing,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      failIfMajorPerformanceCaveat: false, // Try to render even with poor performance
    });

    // Initialize Deck.gl overlay with empty layers
    window.deckOverlay = new MapboxOverlay({ layers: [] });
    map.addControl(window.deckOverlay);

    // Rest of your initialization code...
  } catch (error) {
    console.error("WebGL initialization failed:", error);

    // Display a user-friendly error message
    const mapContainer = document.getElementById("map");
    mapContainer.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>WebGL Not Available</h2>
        <p>This application requires WebGL, which isn't available in your current environment.</p>
        <p>Please try:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>Updating your graphics drivers</li>
          <li>Enabling hardware acceleration in your browser</li>
          <li>Using a different browser (Chrome or Firefox recommended)</li>
          <li>Using a device with better graphics support</li>
        </ul>
      </div>
    `;

    // Load data even without map, so other parts of the app can work
    await Promise.all([loadFacilitiesData(), loadBIDData()]);
  }
}
