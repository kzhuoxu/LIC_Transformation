/* Facilities Management
 * Simplified version with basic functionality.
 */

// Initialize the facilities management system
function initializeFacilitiesManagement() {
  try {
    // Facility type selection buttons
    const facilityTypes = ['bench', 'plaza', 'park'];
    facilityTypes.forEach(type => {
      const button = document.getElementById(`add-${type}`);
      if (button) {
        button.addEventListener('click', () => {
          try {
            setActiveFacilityType(type);
          } catch (e) {
            console.error(`Error setting facility type ${type}:`, e);
          }
        });
      }
    });
    
    // Seating ratio slider
    const ratioSlider = document.getElementById('seating-ratio-slider');
    if (ratioSlider) {
      ratioSlider.addEventListener('input', (event) => {
        try {
          seatingRatio = parseInt(event.target.value);
          const valueElement = document.getElementById('seating-ratio-value');
          if (valueElement) {
            valueElement.textContent = seatingRatio;
          }
        } catch (e) {
          console.error("Error in seating ratio slider:", e);
        }
      });
    }
    
    // Delete selected facility button
    const deleteButton = document.getElementById('delete-selected');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        try {
          deleteSelectedFacility();
        } catch (e) {
          console.error("Error deleting facility:", e);
        }
      });
    }
    
    // Cancel drawing button
    const cancelButton = document.getElementById('cancel-drawing');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        try {
          cancelDrawing();
        } catch (e) {
          console.error("Error canceling drawing:", e);
        }
      });
    }
    
    console.log("Facilities management initialized successfully");
  } catch (error) {
    console.error("Error initializing facilities management:", error);
  }
}

// Set the active facility type for adding new facilities
function setActiveFacilityType(type) {
  // Update UI
  document.querySelectorAll('.facility-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const button = document.getElementById(`add-${type}`);
  if (button) {
    button.classList.add('active');
  }
  
  // Update state
  currentEditingTool = type;
  
  // Start drawing mode
  startDrawing();
}

// Start the drawing mode for adding a new facility
function startDrawing() {
  isDrawing = true;
  const cancelButton = document.getElementById('cancel-drawing');
  if (cancelButton) {
    cancelButton.classList.remove('hidden');
  }
  updateLayers();
}

// Cancel the current drawing operation
function cancelDrawing() {
  isDrawing = false;
  const cancelButton = document.getElementById('cancel-drawing');
  if (cancelButton) {
    cancelButton.classList.add('hidden');
  }
  updateLayers();
}

// Delete the currently selected facility
function deleteSelectedFacility() {
  if (!selectedFacilityId) return;
  
  // Remove from data array
  const index = customFacilities.findIndex(f => f.id === selectedFacilityId);
  if (index !== -1) {
    customFacilities.splice(index, 1);
  }
  
  // Remove from UI list
  const listItem = document.getElementById(`facility-${selectedFacilityId}`);
  if (listItem) {
    listItem.remove();
  }
  
  // Update empty list message visibility
  updateEmptyListMessage();
  
  // Reset selection
  selectedFacilityId = null;
  const deleteButton = document.getElementById('delete-selected');
  if (deleteButton) {
    deleteButton.disabled = true;
  }
  
  // Update the map
  updateLayers();
}

// Add a newly created facility to the list UI
function addFacilityToList(facility) {
  if (!facility || !facility.id) return;
  
  const facilitiesList = document.getElementById('facilities-list');
  if (!facilitiesList) return;
  
  const facilityType = facility.properties?.facilityType || 'unknown';
  const facilityName = facility.properties?.name || 'New Facility';
  const capacity = facility.properties?.SeatingCapacity || 0;
  
  // Hide empty list message if visible
  updateEmptyListMessage();
  
  // Create the list item
  const item = document.createElement('div');
  item.id = `facility-${facility.id}`;
  item.className = 'facility-item';
  item.dataset.id = facility.id;
  
  // Icon based on facility type
  let icon;
  switch (facilityType) {
    case 'bench':
      icon = 'fa-chair';
      break;
    case 'plaza':
      icon = 'fa-map-marker-alt';
      break;
    case 'park':
      icon = 'fa-tree';
      break;
    default:
      icon = 'fa-map-pin';
  }
  
  item.innerHTML = `
    <div class="facility-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="facility-name">${facilityName}</div>
    <div class="facility-capacity">${capacity}</div>
  `;
  
  // Add click handler to select the facility
  item.addEventListener('click', () => {
    selectFacility(facility.id);
  });
  
  // Add to the list
  facilitiesList.appendChild(item);
}

// Select a facility from the list
function selectFacility(id) {
  // Update UI selection state
  document.querySelectorAll('.facility-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  const listItem = document.getElementById(`facility-${id}`);
  if (listItem) {
    listItem.classList.add('selected');
  }
  
  // Update state
  selectedFacilityId = id;
  const deleteButton = document.getElementById('delete-selected');
  if (deleteButton) {
    deleteButton.disabled = false;
  }
  
  // Update the map to highlight the selected facility
  updateLayers();
}

// Update the empty list message visibility
function updateEmptyListMessage() {
  const facilitiesList = document.getElementById('facilities-list');
  if (!facilitiesList) return;
  
  const emptyMessage = facilitiesList.querySelector('.empty-list-message');
  
  if (customFacilities.length === 0) {
    if (!emptyMessage) {
      const msg = document.createElement('p');
      msg.className = 'empty-list-message';
      msg.textContent = 'No custom facilities added yet.';
      facilitiesList.appendChild(msg);
    }
  } else {
    if (emptyMessage) {
      emptyMessage.remove();
    }
  }
}