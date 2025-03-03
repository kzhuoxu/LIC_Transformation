// Main script to orchestrate the application
const INITIAL_VIEW_STATE = {
  longitude: -73.9413184,
  latitude: 40.7508189,
  zoom: 16,
  pitch: 30,
  bearing: 0,
};

let videoCanvas, videoCtx, deckOverlay;
let showHexagonLayer = true;
let scaleFactor = 0.00001;
const initialQRPosition = [
  INITIAL_VIEW_STATE.longitude,
  INITIAL_VIEW_STATE.latitude,
];
let QRPosition = [...initialQRPosition];
const tooltip = document.getElementById("tooltip");

// Show or hide tooltip on hover
function showTooltip(x, y, content) {
  tooltip.style.display = "block";
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.innerHTML = content;
}

function hideTooltip() {
  tooltip.style.display = "none";
}

// Load OpenCV.js and initialize video
async function initializeVideoAndCanvas() {
  try {
    await loadOpenCVJS(); // From qr_detection.js
    videoCanvas = document.getElementById("video-canvas");
    videoCtx = videoCanvas.getContext("2d");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1024, height: 768 },
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
    setInterval(() => captureFrame(video), 100); // Reduced to 10 fps for performance
  } catch (err) {
    console.error("Video initialization error:", err);
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "absolute";
    errorDiv.style.top = "50%";
    errorDiv.style.left = "50%";
    errorDiv.style.transform = "translate(-50%, -50%)";
    errorDiv.style.background = "rgba(255, 0, 0, 0.8)";
    errorDiv.style.color = "white";
    errorDiv.style.padding = "20px";
    errorDiv.innerText =
      "Camera access denied. Please enable camera permissions to use this feature.";
    document.body.appendChild(errorDiv);
  }
}

// Update layers when QR position changes
function updateLayers() {
  updateDeckLayers(showHexagonLayer, QRPosition, showTooltip, hideTooltip); // From layers.js
}

// Event listeners for UI controls
document.getElementById("toggle").addEventListener("change", (event) => {
  showHexagonLayer = event.target.checked;
  updateLayers();
});

document.getElementById("scale-slider").addEventListener("input", (event) => {
  scaleFactor = parseFloat(event.target.value);
  document.getElementById("scale-value").textContent = scaleFactor.toFixed(6);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  QRPosition = [...initialQRPosition];
  updateLayers();
});

// Initialize the application
async function init() {
  await initializeVideoAndCanvas();
  await initializeMap(INITIAL_VIEW_STATE); // From map.js
  deckOverlay = window.deckOverlay; // Set globally from map.js
  updateLayers();
}

init();
