/* 
 * Main Application Module
 * Initializes components and starts the application
 */

async function initializeApplication() {
  await initializeDeckGL();
  initializeControls();
  // updateFacilitiesList();
  console.log('LIC Seating Map initialized successfully!');
  loadFacilitiesData();
  loadBIDData();
  setupEditorMode();
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

// Function to enable editor mode setup
function setupEditorMode() {
  document.getElementById('editor-toggle').addEventListener('change', (event) => {
    editorMode = event.target.checked;
    if (editorMode) {
      facilityToAdd.position = [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude]; // Default to map center
      console.log("Editor Mode Enabled. Facility Position:", facilityToAdd.position);
      addMovementControls(); // Add the movement controls when editor mode is enabled
    }
    updateLayers();
  });
}

// Function to move facility in editor mode
function moveFacility(direction) {
  if (!editorMode || !facilityToAdd || !facilityToAdd.position) return;
  const step = 0.0005; // Adjust movement step size
  
  switch (direction) {
    case 'up':
      facilityToAdd.position[1] += step;
      break;
    case 'down':
      facilityToAdd.position[1] -= step;
      break;
    case 'left':
      facilityToAdd.position[0] -= step;
      break;
    case 'right':
      facilityToAdd.position[0] += step;
      break;
  }
  console.log("Facility moved:", facilityToAdd.position);
  updateLayers();
}