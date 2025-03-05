/* 
 * Controls Module
 * Handles user interface controls and event listeners
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
      updateLayers();
    }
  });
  
  // Bench capacity selector
  document.getElementById('bench-capacity').addEventListener('change', (event) => {
    facilityToAdd.seatingCapacity = parseInt(event.target.value);
    updateLayers(); // Update immediately to show how this affects the hexagon layer
  });
}

// // Update the list of user-added facilities in the UI
// function updateFacilitiesList() {
//   const listContainer = document.getElementById('added-facilities-list');
//   const emptyMessage = listContainer.querySelector('.empty-list-message');
  
//   // Clear existing items (except the empty message)
//   Array.from(listContainer.children).forEach(child => {
//     if (!child.classList || !child.classList.contains('empty-list-message')) {
//       listContainer.removeChild(child);
//     }
//   });
  
//   // Show/hide empty message based on whether there are facilities
//   if (userAddedFacilities.length === 0) {
//     if (emptyMessage) emptyMessage.style.display = 'block';
//   } else {
//     if (emptyMessage) emptyMessage.style.display = 'none';
    
//     // Add facility items to the list
//     userAddedFacilities.forEach((facility, index) => {
//       const item = document.createElement('div');
//       item.className = 'facility-item';
//       if (selectedFacility === facility) {
//         item.classList.add('selected');
//       }
      
//       item.innerHTML = `
//         <strong>Bench #${index + 1}</strong>
//         <div>Capacity: ${facility.properties.SeatingCapacity || 'N/A'}</div>
//       `;
      
//       // Add click handler to select this facility
//       item.addEventListener('click', () => {
//         selectedFacility = facility;
//         updateSelectedFacilityInList();
//         document.getElementById('delete-facility').disabled = false;
//       });
      
//       listContainer.appendChild(item);
//     });
//   }
// }

// // Update the selected facility in the list
// function updateSelectedFacilityInList() {
//   // Remove selection from all items
//   const items = document.querySelectorAll('.facility-item');
//   items.forEach(item => item.classList.remove('selected'));
  
//   if (selectedFacility) {
//     // Find the index of the selected facility
//     const index = userAddedFacilities.indexOf(selectedFacility);
//     if (index >= 0 && index < items.length) {
//       items[index].classList.add('selected');
//     }
//   }
// }

// // Delete the currently selected facility
// function deleteSelectedFacility() {
//   if (!selectedFacility) return;
  
//   // Find the index of the selected facility
//   const index = userAddedFacilities.indexOf(selectedFacility);
//   if (index >= 0) {
//     // Remove the facility from the array
//     userAddedFacilities.splice(index, 1);
    
//     // Reset selection
//     selectedFacility = null;
//     document.getElementById('delete-facility').disabled = true;
    
//     // Update the UI and layers
//     updateFacilitiesList();
//     updateLayers();
//   }
// }

// Log layer visibility settings for debugging
console.log("Layer visibility settings:");
console.log("- Hexagon layer:", showHexagonLayer);
console.log("- Benches:", showBenches);
console.log("- BID:", showBID);