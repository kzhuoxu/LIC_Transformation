/* 
 * Main Application Module
 * Initializes all components and starts the application
 */

async function initializeApplication() {
  // Initialize the deck.gl map and load data
  await initializeDeckGL();
  
  // Initialize UI controls
  initializeControls();
  
  // Initially populate the facilities list (empty at first)
  updateFacilitiesList();
  
  console.log('LIC Seating Map initialized successfully!');

  loadFacilitiesData();
  loadBIDData();
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

// Add this to your app.js or mapLayers.js
async function debugFacilitiesData() {
  try {
    const response = await fetch("data/combined_facilities.json");
    const data = await response.json();
    console.log("Facilities data loaded:", data);
    console.log("Number of facilities:", data.features ? data.features.length : 0);

    // Force layer ordering so that facility and BID layers are drawn on top
    // (Adjust variable names as defined in your mapLayers.js)
    deckgl.setProps({
      layers: [
        hexagonLayer,   // Base hexagon layer (if any)
        benchLayer,     // Benches layer
        plazaLayer,     // Plazas layer
        parkLayer,      // Parks layer
        bidLayer        // LIC BID boundary layer on top
      ]
    });

    return data;
  } catch (error) {
    console.error("Error loading facilities data:", error);
  }
}

// Call this function after your page loads
debugFacilitiesData();