/* Tutorial: Controls
 * This module handles all user interface controls and their event listeners.
 * It includes layer toggling, manual controls, and tooltip functionality.
 */

function initializeControls() {
  // Layer toggle
  document.getElementById("toggle").addEventListener("change", (event) => {
    showHexagonLayer = event.target.checked;
    updateLayers();
  });

  // Scale slider
  document.getElementById("scale-slider").addEventListener("input", (event) => {
    movementRadius = parseFloat(event.target.value);
    document.getElementById("scale-value").textContent = movementRadius.toFixed(
      6
    );
  });

  // Weight slider
  document
    .getElementById("weight-slider")
    .addEventListener("input", (event) => {
      qrWeight = parseInt(event.target.value);
      document.getElementById("weight-value").textContent = qrWeight;
      updateLayers();
    });

  // Manual control toggle
  document
    .getElementById("manual-toggle")
    .addEventListener("change", (event) => {
      manualControl = event.target.checked;
      document.getElementById("manual-controls").style.display = manualControl
        ? "block"
        : "none";
      updateLayers();
    });

  // Add neighborhood toggle
  document.getElementById("neighborhood-toggle").addEventListener("change", (event) => {
    showNeighborhoods = event.target.checked;
    updateLayers();
  });

  // Add bike routes toggle
  document.getElementById("bike-routes-toggle").addEventListener("change", (event) => {
    showBikeRoutes = event.target.checked;
    updateLayers();
  });

  document.getElementById("citibike-toggle").addEventListener("change", (event) => {
    showCitibikeStations = event.target.checked;
    updateLayers();
  });

  // Add new Citibike hexagon toggle 
  document.getElementById("citibike-hexagon-toggle").addEventListener("change", (event) => {
    showCitibikeHexagons = event.target.checked;
    updateLayers();
  });

  // Add Citibike count data toggle
  document.getElementById("citibike-count-toggle").addEventListener("change", (event) => {
    showCitibikeCountData = event.target.checked;
    updateLayers();
  });

  // Initialize simulation controls
  initializeSimulationControls();


  // Manual movement buttons
  document.getElementById("move-up").addEventListener("click", () => {
    QRPosition[1] += 0.0001;
    updateLayers();
  });

  document.getElementById("move-down").addEventListener("click", () => {
    QRPosition[1] -= 0.0001;
    updateLayers();
  });

  document.getElementById("move-left").addEventListener("click", () => {
    QRPosition[0] -= 0.0001;
    updateLayers();
  });

  document.getElementById("move-right").addEventListener("click", () => {
    QRPosition[0] += 0.0001;
    updateLayers();
  });
}

function initializeSimulationControls() {
  // Toggle for simulation mode
  document.getElementById("simulation-toggle").addEventListener("change", (event) => {
    simulationMode = event.target.checked;

    // Show or hide simulation controls based on simulation mode
    const simulationControls = document.getElementById("simulation-controls");
    if (simulationControls) {
      simulationControls.style.display = simulationMode ? "block" : "none";
    }

    // Always sync simulation station position with QR position when enabling
    if (simulationMode) {
      simulationStationPosition = [...QRPosition];
    }

    updateLayers();
  });

  // Capacity slider
  document.getElementById("station-capacity").addEventListener("input", (event) => {
    simulationStationCapacity = parseInt(event.target.value);
    document.getElementById("capacity-value").textContent = simulationStationCapacity;
    updateLayers();
  });
  // Range slider
  document.getElementById("station-range").addEventListener("input", (event) => {
    simulationStationRange = parseFloat(event.target.value) / 1000; // Convert to coordinate units
    document.getElementById("range-value").textContent = (simulationStationRange * 1000).toFixed(1);
    updateLayers();
  });

  // Impact slider
  document.getElementById("station-impact").addEventListener("input", (event) => {
    simulationStationImpact = parseFloat(event.target.value);
    document.getElementById("impact-value").textContent = simulationStationImpact.toFixed(2);
    updateLayers();
  });

  // Position button
  document.getElementById("use-qr-position").addEventListener("click", () => {
    // Reset simulation to default values
    simulationStationCapacity = 20; // Reset to default
    document.getElementById("station-capacity").value = 20;
    document.getElementById("capacity-value").textContent = 20;

    simulationStationRange = 0.003; // Reset to default
    document.getElementById("station-range").value = 3.0;
    document.getElementById("range-value").textContent = "3.0";

    simulationStationImpact = 0.5; // Reset to default
    document.getElementById("station-impact").value = 0.5;
    document.getElementById("impact-value").textContent = "0.50";

    // Ensure position is synced
    simulationStationPosition = [...QRPosition];

    updateLayers();
  });
}

function updateTooltip({ object, x, y }) {
  const tooltip = document.getElementById("tooltip");
  if (object) {
    tooltip.style.display = "block";
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.innerHTML = `
            <strong>Tree Info:</strong><br>
            Genus Species: ${object.properties.GenusSpecies}<br>
            DBH: ${object.properties.DBH}<br>
            Condition: ${object.properties.TPCondition}<br>
            Planted Date: ${object.properties.PlantedDate || "N/A"}<br>
            Risk Rating: ${object.properties.RiskRating || "N/A"}
        `;
  } else {
    tooltip.style.display = "none";
  }
}
