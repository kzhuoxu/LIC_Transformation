/* 
 * Controls Module
 * Handles all user interface controls and their event listeners
 */

// Initialize all UI controls and their event listeners
function initializeControls() {
  // Layer toggle controls
  document.getElementById('hexagon-toggle').addEventListener('change', (event) => {
    showHexagonLayer = event.target.checked;
    updateLayers();
  });
  
  document.getElementById('bench-toggle').addEventListener('change', (event) => {
    showBenches = event.target.checked;
    updateLayers();
  });
  
  document.getElementById('plaza-toggle').addEventListener('change', (event) => {
    showPlazas = event.target.checked;
    updateLayers();
  });
  
  document.getElementById('park-toggle').addEventListener('change', (event) => {
    showParks = event.target.checked;
    updateLayers();
  });
  
  document.getElementById('bid-toggle').addEventListener('change', (event) => {
    showBID = event.target.checked;
    updateLayers();
  });
  
  // Hexagon radius slider
  document.getElementById('hexagon-radius').addEventListener('input', (event) => {
    hexagonRadius = parseInt(event.target.value);
    document.getElementById('radius-value').textContent = hexagonRadius;
    updateLayers();
  });
  
  // Editor mode toggle
  document.getElementById('editor-toggle').addEventListener('change', (event) => {
    editorMode = event.target.checked;
    document.getElementById('editor-controls').style.display = editorMode ? 'block' : 'none';
    
    // Reset selection when toggling editor mode
    if (!editorMode) {
      selectedFacility = null;
      document.getElementById('delete-facility').disabled = true;
      updateSelectedFacilityInList();
    }
  });
  
  // Facility type selector
  document.getElementById('facility-type').addEventListener('change', (event) => {
    facilityToAdd.type = event.target.value;
    
    // Show/hide area controls based on facility type
    const areaControls = document.getElementById('area-controls');
    areaControls.style.display = (facilityToAdd.type === 'bench') ? 'none' : 'block';
  });
  
  // Area slider for parks/plazas
  document.getElementById('area-slider').addEventListener('input', (event) => {
    facilityToAdd.area = parseInt(event.target.value);
    document.getElementById('area-value').textContent = facilityToAdd.area;
  });
  
  // Density slider for parks/plazas
  document.getElementById('density-slider').addEventListener('input', (event) => {
    facilityToAdd.density = parseInt(event.target.value);
    document.getElementById('density-value').textContent = facilityToAdd.density;
  });
  
  // Add facility button
  const addButton = document.getElementById('add-facility');
  addButton.addEventListener('click', () => {
    if (addButton.classList.contains('active')) {
      // Deactivate add mode
      addButton.classList.remove('active');
      addButton.textContent = 'Add Facility';
    } else {
      // Activate add mode
      addButton.classList.add('active');
      addButton.textContent = 'Click Map to Place';
    }
  });
  
  // Delete facility button
  document.getElementById('delete-facility').addEventListener('click', () => {
    if (selectedFacility) {
      deleteSelectedFacility();
    }
  });
}

// Update the list of user-added facilities in the UI
function updateFacilitiesList() {
  const listContainer = document.getElementById('added-facilities-list');
  const emptyMessage = listContainer.querySelector('.empty-list-message');
  
  // Clear existing items (except the empty message)
  Array.from(listContainer.children).forEach(child => {
    if (!child.classList || !child.classList.contains('empty-list-message')) {
      listContainer.removeChild(child);
    }
  });
  
  // Show/hide empty message based on whether there are facilities
  if (userAddedFacilities.length === 0) {
    if (emptyMessage) emptyMessage.style.display = 'block';
  } else {
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    // Add facility items to the list
    userAddedFacilities.forEach((facility, index) => {
      const item = document.createElement('div');
      item.className = 'facility-item';
      if (selectedFacility === facility) {
        item.classList.add('selected');
      }
      
      const type = facility.properties.type;
      let name = '';
      
      if (type === 'bench') {
        name = `Bench #${index + 1}`;
      } else if (type === 'plaza') {
        name = `Plaza #${index + 1}`;
      } else if (type === 'park') {
        name = `Park #${index + 1}`;
      }
      
      item.innerHTML = `
        <strong>${name}</strong>
        <div>Capacity: ${facility.properties.SeatingCapacity || 'N/A'}</div>
      `;
      
      // Add click handler to select this facility
      item.addEventListener('click', () => {
        selectedFacility = facility;
        updateSelectedFacilityInList();
        document.getElementById('delete-facility').disabled = false;
      });
      
      listContainer.appendChild(item);
    });
  }
}

// Update the selected facility in the list
function updateSelectedFacilityInList() {
  // Remove selection from all items
  const items = document.querySelectorAll('.facility-item');
  items.forEach(item => item.classList.remove('selected'));
  
  if (selectedFacility) {
    // Find the index of the selected facility
    const index = userAddedFacilities.indexOf(selectedFacility);
    if (index >= 0 && index < items.length) {
      items[index].classList.add('selected');
    }
  }
}

// Delete the currently selected facility
function deleteSelectedFacility() {
  if (!selectedFacility) return;
  
  // Find the index of the selected facility
  const index = userAddedFacilities.indexOf(selectedFacility);
  if (index >= 0) {
    // Remove the facility from the array
    userAddedFacilities.splice(index, 1);
    
    // Reset selection
    selectedFacility = null;
    document.getElementById('delete-facility').disabled = true;
    
    // Update the UI and layers
    updateFacilitiesList();
    updateLayers();
  }
}

// Add this to your controls.js
console.log("Layer visibility settings:");
console.log("- Hexagon layer:", showHexagonLayer);
console.log("- Benches:", showBenches);
console.log("- Plazas:", showPlazas);
console.log("- Parks:", showParks);
console.log("- BID:", showBID);

// Toggle editor mode
function toggleEditorMode(enable) {
  editorMode = enable;
  
  // Update UI elements
  const editorPanel = document.getElementById('editor-panel');
  const controlPanel = document.getElementById('control-panel');
  
  if (editorMode) {
    editorPanel.classList.remove('hidden');
    controlPanel.classList.add('hidden');
  } else {
    editorPanel.classList.add('hidden');
    controlPanel.classList.remove('hidden');
    
    // Clear selection when exiting editor mode
    selectedFacility = null;
    document.getElementById('delete-facility').disabled = true;
  }
}

// Handle map click for adding facilities
function handleMapClick(event) {
  if (!editorMode) return;
  
  // Get clicked coordinates
  const coordinates = event.coordinate || event.lngLat.toArray();
  
  // Open add facility modal
  openAddFacilityModal(coordinates);
}

// Open modal for adding a new facility
function openAddFacilityModal(coordinates) {
  const modal = document.getElementById('add-facility-modal');
  
  // Store coordinates for later use
  modal.dataset.lng = coordinates[0];
  modal.dataset.lat = coordinates[1];
  
  // Show the modal
  modal.style.display = 'block';
}

// Close the add facility modal
function closeAddFacilityModal() {
  const modal = document.getElementById('add-facility-modal');
  modal.style.display = 'none';
}

// Add a new facility
function addFacility() {
  const modal = document.getElementById('add-facility-modal');
  const type = document.getElementById('facility-type').value;
  const seatingCapacity = parseInt(document.getElementById('facility-capacity').value);
  
  // Get coordinates from modal dataset
  const lng = parseFloat(modal.dataset.lng);
  const lat = parseFloat(modal.dataset.lat);
  
  // Create new facility object
  const newFacility = {
    type: 'Feature',
    properties: {
      type: type,
      SeatingCapacity: seatingCapacity,
      userAdded: true
    },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
  
  // For parks and plazas, create polygon instead of point
  if (type === 'park' || type === 'plaza') {
    // Create a simple polygon (circle approximation)
    const radius = 0.0003; // roughly 30 meters
    const sides = 20;
    const polygon = createCirclePolygon([lng, lat], radius, sides);
    
    newFacility.geometry = {
      type: 'Polygon',
      coordinates: [polygon]
    };
    
    // Add area property
    newFacility.properties.area = calculatePolygonArea(polygon);
  }
  
  // Add the new facility to the list
  userAddedFacilities.push(newFacility);
  
  // Update the layers
  updateLayers();
  
  // Close the modal
  closeAddFacilityModal();
}

// Delete the selected facility
function deleteFacility() {
  if (!selectedFacility || !selectedFacility.properties.userAdded) return;
  
  // Find the index of the selected facility
  const index = userAddedFacilities.findIndex(f => 
    f.geometry.coordinates.toString() === selectedFacility.geometry.coordinates.toString()
  );
  
  if (index !== -1) {
    // Remove the facility
    userAddedFacilities.splice(index, 1);
    
    // Clear selection
    selectedFacility = null;
    document.getElementById('delete-facility').disabled = true;
    
    // Update the layers
    updateLayers();
  }
}

// Helper function to create a circle-like polygon
function createCirclePolygon(center, radius, sides) {
  const polygon = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides;
    const lng = center[0] + radius * Math.cos(angle);
    const lat = center[1] + radius * Math.sin(angle);
    polygon.push([lng, lat]);
  }
  
  // Close the polygon
  polygon.push([...polygon[0]]);
  
  return polygon;
}

// Calculate approximate area of a polygon
function calculatePolygonArea(polygon) {
  // Simple approximation
  return 0.00005; // About 5000 sq meters
}