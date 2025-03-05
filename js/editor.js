/* 
 * Editor Module
 * Handles facility editing functionality (only bench adding/removing)
 */

// Add a new bench at the specified coordinates
function addNewFacility(lng, lat) {
  facilityToAdd.position = [lng, lat];  // Ensure position is updated
  
  let geometry = { type: 'Point', coordinates: [lng, lat] };
  let properties = {
    type: 'bench',
    userAdded: true,
    color: FACILITY_COLORS.bench,
    SeatingCapacity: facilityToAdd.seatingCapacity,
    BenchType: 'backed'
  };
  
  const newFacility = { type: 'Feature', geometry, properties };
  userAddedFacilities.push(newFacility);
  
  // Update layers and facilities list
  updateLayers();
  updateFacilitiesList();
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

// Log that editor.js has loaded successfully
console.log('editor.js loaded successfully');