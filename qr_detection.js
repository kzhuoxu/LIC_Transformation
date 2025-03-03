// QR code detection and position update logic
let cvImg;

async function loadOpenCVJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.9.0/opencv.js";
    script.onload = () => (cv["onRuntimeInitialized"] = resolve);
    script.onerror = () => reject(new Error("Failed to load OpenCV.js"));
    document.body.appendChild(script);
  });
}

function calculateCenter(points) {
  // Calculate center by averaging x and y coordinates of four corners
  return {
    x: (points[0] + points[2] + points[4] + points[6]) / 4,
    y: (points[1] + points[3] + points[5] + points[7]) / 4,
  };
}

function drawQRCodeOutline(img, points) {
  const pointMatVector = new cv.MatVector();
  pointMatVector.push_back(cv.matFromArray(4, 1, cv.CV_32SC2, points));
  cv.polylines(
    img,
    pointMatVector,
    true,
    new cv.Scalar(0, 255, 0, 255),
    2,
    cv.LINE_AA
  );
  pointMatVector.delete();
}

function updateQRPosition(center) {
  // Update QR position based on center offset from canvas middle
  QRPosition[0] =
    initialQRPosition[0] + (center.x - videoCanvas.width / 2) * scaleFactor;
  QRPosition[1] =
    initialQRPosition[1] - (center.y - videoCanvas.height / 2) * scaleFactor; // Invert y-axis for map
}

async function captureFrame(video) {
  videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
  cvImg = cv.imread(videoCanvas);

  // Downscale image for faster processing
  const downscaledImg = new cv.Mat();
  cv.resize(cvImg, downscaledImg, {
    width: cvImg.cols / 2,
    height: cvImg.rows / 2,
  });

  const qcd = new cv.QRCodeDetector();
  const decodedInfo = new cv.StringVector();
  const points = new cv.Mat();
  const straightQrCode = new cv.MatVector();

  if (
    qcd.detectAndDecodeMulti(downscaledImg, decodedInfo, points, straightQrCode)
  ) {
    let maxArea = 0;
    let selectedPoints = null;

    // Select largest QR code based on area
    for (let i = 0; i < decodedInfo.size(); i++) {
      const p = points.row(i).data32F;
      const width = Math.abs(p[2] - p[0]);
      const height = Math.abs(p[5] - p[1]);
      const area = width * height;
      if (area > maxArea) {
        maxArea = area;
        selectedPoints = p;
      }
    }

    if (selectedPoints) {
      // Scale points back to original size
      const scaledPoints = selectedPoints.map((coord) => coord * 2);
      const center = calculateCenter(scaledPoints);
      updateQRPosition(center);
      drawQRCodeOutline(cvImg, scaledPoints);
      updateLayers();
    }
  }

  cv.imshow("video-canvas", cvImg);
  [
    downscaledImg,
    qcd,
    decodedInfo,
    points,
    straightQrCode,
    cvImg,
  ].forEach((item) => item.delete());
}
