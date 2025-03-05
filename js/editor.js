/* 
 * Editor Module
 * Handles facility editing functionality including adding and deleting facilities
 */

// Add a new facility at the specified coordinates
function addNewFacility(lng, lat) {
  const type = facilityToAdd.type;
  let geometry, properties;
  
  if (type === 'bench') {
    // Bench is a point feature
    geometry = {
      type: 'Point',
      coordinates: [lng, lat]
    };
    
    properties = {
      type: 'bench',
      userAdded: true,
      SeatingCapacity: DEFAULT_CAPACITIES.bench,
      color: parseInt(rgbToHex(...FACILITY_COLORS.bench).slice(1), 16)
    };
  } else if (type === 'plaza' || type === 'park') {
    // Create a small polygon for the plaza or park
    // Calculate corners of a square centered at the clicked point
    const area = facilityToAdd.area;
    const sideLength = Math.sqrt(area);
    const halfSide = sideLength / 20000; // Convert to approximate degrees
    
    geometry = {
      type: 'Polygon',
      coordinates: [[
        [lng - halfSide, lat - halfSide],
        [lng + halfSide, lat - halfSide],
        [lng + halfSide, lat + halfSide],
        [lng - halfSide, lat + halfSide],
        [lng - halfSide, lat - halfSide] // Close the polygon
      ]]
    };
    
    // Calculate seating capacity based on area and density
    const seatingCapacity = DEFAULT_CAPACITIES[type](area);
    
    properties = {
      type: type,
      userAdded: true,
      area: area,
      SeatingCapacity: seatingCapacity,
      color: parseInt(rgbToHex(...FACILITY_COLORS[type]).slice(1), 16)
    };
  }
  
  // Create the new facility feature
  const newFacility = {
    type: 'Feature',
    geometry: geometry,
    properties: properties
  };
  
  // Add to the user facilities array
  userAddedFacilities.push(newFacility);
  
  // Select the new facility
  selectedFacility = newFacility;
  document.getElementById('delete-facility').disabled = false;
  
  // Update the UI and layers
  updateFacilitiesList();
  updateLayers();
  
  // Exit add mode
  const addButton = document.getElementById('add-facility');
  addButton.classList.remove('active');
  addButton.textContent = 'Add Facility';
}

// Calculate the area of a polygon in square meters
function calculatePolygonArea(coordinates) {
  // Use a simplified formula for small areas
  // This is not accurate for large areas or areas near the poles
  const earthRadius = 6371000; // Earth radius in meters
  let area = 0;
  
  if (coordinates.length < 3) {
    return 0;
  }
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    area += (p2[0] - p1[0]) * (p2[1] + p1[1]);
  }
  
  // Close the polygon if needed
  if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
    const p1 = coordinates[coordinates.length - 1];
    const p2 = coordinates[0];
    area += (p2[0] - p1[0]) * (p2[1] + p1[1]);
  }
  
  // Convert to square meters (approximate)
  const latRad = coordinates[0][1] * Math.PI / 180;
  const metersPerDegLon = earthRadius * Math.cos(latRad) * Math.PI / 180;
  const metersPerDegLat = earthRadius * Math.PI / 180;
  
  area = Math.abs(area * metersPerDegLon * metersPerDegLat / 2);
  return area;
}

// Update the selected facility in the list - fallback function in case it's not defined elsewhere
function updateSelectedFacilityInList() {
  if (typeof window.updateSelectedFacilityInList === 'function') {
    window.updateSelectedFacilityInList();
    return;
  }
  
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

// In editor.js
function updateFacilitiesList() {
  // The issue is likely here - this function is calling itself or 
  // calling another function that eventually calls back to this one
  
  // Instead of calling itself or a function that leads back here,
  // directly perform the list update operations
  
  const listContainer = document.getElementById('added-facilities-list');
  if (!listContainer) return;
  
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
        updateSelectedFacilityInList(); // Call a different function, not this one again
        document.getElementById('delete-facility').disabled = false;
      });
      
      listContainer.appendChild(item);
    });
  }
}

// Log that editor.js has loaded successfully
console.log('editor.js loaded successfully');