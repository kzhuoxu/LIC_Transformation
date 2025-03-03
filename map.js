// Map initialization with Maplibre-gl and deck.gl
async function initializeMap(initialViewState) {
  const map = new maplibregl.Map({
    container: "map",
    center: [initialViewState.longitude, initialViewState.latitude],
    zoom: initialViewState.zoom,
    pitch: initialViewState.pitch,
    bearing: initialViewState.bearing,
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  });

  const deckOverlay = new deck.MapboxOverlay({
    layers: [],
  });

  map.addControl(deckOverlay);
  window.deckOverlay = deckOverlay; // Make overlay globally accessible
}
