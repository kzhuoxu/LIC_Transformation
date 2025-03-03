// Deck.gl layer management
const { HexagonLayer, ScatterplotLayer, LineLayer } = deck;

async function loadTreesData() {
  const response = await fetch("trees.json");
  const data = await response.json();
  return data.features;
}

async function updateDeckLayers(
  showHexagonLayer,
  qrPosition,
  showTooltip,
  hideTooltip
) {
  console.log(qrPosition);
  if (!window.deckOverlay) return;

  const treesData = await loadTreesData();
  const layers = [];

  if (showHexagonLayer) {
    layers.push(
      new HexagonLayer({
        id: "hexagon-layer",
        data: [
          ...treesData,
          {
            geometry: {
              coordinates: qrPosition,
            },
          },
        ],
        getPosition: (d) => d.geometry.coordinates,
        radius: 20,
        elevationScale: 1,
        extruded: true,
        pickable: true,
        opacity: 0.85,
        colorRange: [
          [1, 152, 189],
          [73, 227, 206],
          [216, 254, 181],
          [254, 237, 177],
          [254, 173, 84],
          [209, 55, 78],
        ],
      })
    );
  } else {
    layers.push(
      new ScatterplotLayer({
        id: "scatterplot-layer",
        data: treesData,
        getPosition: (d) => d.geometry.coordinates,
        getFillColor: (d) => {
          const color = d.properties.color || 0x00ff00; // Default green if undefined
          return [color >> 16, (color >> 8) & 255, color & 255];
        },
        getRadius: 5,
        pickable: true,
        onHover: ({ object, x, y }) => {
          if (object) {
            showTooltip(
              x,
              y,
              `
                <strong>Tree Info:</strong><br>
                Genus Species: ${object.properties.GenusSpecies}<br>
                DBH: ${object.properties.DBH}<br>
                Condition: ${object.properties.TPCondition}<br>
                Planted Date: ${object.properties.PlantedDate || "N/A"}<br>
                Risk Rating: ${object.properties.RiskRating || "N/A"}
              `
            );
          } else {
            hideTooltip();
          }
        },
      })
    );
  }

  // Separate QR position layer
  layers.push(
    new ScatterplotLayer({
      id: "qr-layer",
      data: [{ position: qrPosition, color: [255, 0, 0] }],
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getRadius: 10,
      pickable: true,
      onHover: ({ object, x, y }) => {
        if (object) {
          showTooltip(
            x,
            y,
            `QR Position: [${object.position[0].toFixed(
              6
            )}, ${object.position[1].toFixed(6)}]`
          );
        } else {
          hideTooltip();
        }
      },
    })
  );

  layers.push(
    new LineLayer({
      id: "line-layer",
      data: [
        {
          sourcePosition: [qrPosition[0], qrPosition[1], 0],
          targetPosition: [qrPosition[0], qrPosition[1], 1000],
        },
      ],
      getSourcePosition: (d) => d.sourcePosition,
      getTargetPosition: (d) => d.targetPosition,
      getColor: [0, 255, 0],
      getWidth: 5,
    })
  );

  window.deckOverlay.setProps({ layers });
}
