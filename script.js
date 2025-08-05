// Configuration
const ROUTE = "91M";

// Stop configurations for both directions
const STOPS_CONFIG = {
  polam: {
    destination: "PO LAM",
    direction: "I",
    stops: [
      {
        id: "53889000AA9C33E2",
        name: "Diamond Hill Station Bus Terminus",
        ch_name: "鑽石山站巴士總站",
      },
      {
        id: "49FAC55AF9CB8272",
        name: "Tai Yau Street",
        ch_name: "大有街",
      },
      {
        id: "5169C5ACEA8B1746",
        name: "Choi Hung BBI - Pik Hoi House",
        ch_name: "彩虹轉車站 - 碧海樓",
      },
      {
        id: "2EFDB1EADF5955E6",
        name: "Ngau Chi Wan BBI",
        ch_name: "牛池灣轉車站",
      },
    ],
    directionInfo: "Showing buses to PO LAM",
  },
  diamondhill: {
    destination: "DIAMOND HILL STATION",
    direction: "O",
    stops: [
      {
        id: "B002CEF0DBC568F5",
        name: "HKUST (South)",
        ch_name: "香港科技大學(南)",
      },
    ],
    directionInfo: "Showing buses to DIAMOND HILL STATION",
  },
};

// DOM elements
const stopsContainer = document.getElementById("stopsContainer");
const refreshBtn = document.getElementById("refreshBtn");
const lastUpdatedEl = document.getElementById("lastUpdated");
const toPoLamTab = document.getElementById("toPoLamTab");
const toDiamondHillTab = document.getElementById("toDiamondHillTab");
const directionInfo = document.getElementById("directionInfo");

// Current direction state
let currentDirection = "polam";

// Format ETA time
function formatEtaTime(etaString) {
  if (!etaString) return "--:--";

  const date = new Date(etaString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Calculate minutes until arrival
function calculateMinutesUntil(etaString) {
  if (!etaString) return { minutes: "N/A", status: "" };

  const now = new Date();
  const eta = new Date(etaString);
  const diffMinutes = Math.floor((eta - now) / (1000 * 60));

  if (diffMinutes < 0) return { minutes: "Departed", status: "departed" };
  if (diffMinutes === 0) return { minutes: "Arriving", status: "arriving" };
  if (diffMinutes <= 3)
    return { minutes: `${diffMinutes} min`, status: "soon" };
  return { minutes: `${diffMinutes} min`, status: "" };
}

// Update last updated timestamp
function updateTimestamp() {
  const now = new Date();
  lastUpdatedEl.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Create stop card HTML
function createStopCard(stop, etas) {
  return `
    <div class="stop-card">
      <div class="stop-header">
        <h2 class="stop-name">
          <i class="fas fa-map-marker-alt"></i> ${stop.name}
        </h2>
        <div class="stop-location">${stop.ch_name}</div>
      </div>
      <div class="eta-list">
        ${
          etas.length > 0
            ? etas
                .map((eta) => {
                  const timeInfo = calculateMinutesUntil(eta.eta);
                  return `
                <div class="eta-item">
                  <div class="eta-time">
                    ${formatEtaTime(eta.eta)}
                    ${
                      eta.rmk_en
                        ? `<div class="eta-remark">${eta.rmk_en}</div>`
                        : ""
                    }
                  </div>
                  <div class="eta-minutes ${timeInfo.status}">
                    ${timeInfo.minutes}
                  </div>
                </div>
                `;
                })
                .join("")
            : `<div class="no-eta">No scheduled buses at this time</div>`
        }
      </div>
    </div>
  `;
}

// Display loading state
function showLoading() {
  stopsContainer.innerHTML = `
    <div class="loading">
      <i class="fas fa-spinner"></i>
      <p>Loading bus arrival times...</p>
    </div>
  `;
}

// Fetch ETA for a specific stop
async function fetchStopEta(stopId, config) {
  try {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${ROUTE}/1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Filter buses based on direction config
    const filteredData = data.data.filter(
      (bus) =>
        bus.dest_en === config.destination && bus.dir === config.direction
    );

    // Sort by arrival time
    filteredData.sort((a, b) => new Date(a.eta) - new Date(b.eta));

    return filteredData;
  } catch (error) {
    console.error(`Error fetching ETA for stop ${stopId}:`, error);
    return [];
  }
}

// Fetch ETAs for all stops in current direction
async function fetchAllEtas() {
  showLoading();
  const config = STOPS_CONFIG[currentDirection];
  directionInfo.textContent = config.directionInfo;

  try {
    // Fetch ETAs for all stops in parallel
    const etaPromises = config.stops.map((stop) =>
      fetchStopEta(stop.id, config)
    );
    const allEtas = await Promise.all(etaPromises);

    // Create stop cards with ETAs
    stopsContainer.innerHTML = config.stops
      .map((stop, index) => createStopCard(stop, allEtas[index]))
      .join("");

    updateTimestamp();
  } catch (error) {
    console.error("Error fetching ETAs:", error);
    stopsContainer.innerHTML = `
      <div class="loading">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Failed to load bus times. Please try again later.</p>
      </div>
    `;
  }
}

// Switch direction
function switchDirection(direction) {
  currentDirection = direction;

  // Update active tab
  toPoLamTab.classList.toggle("active", direction === "polam");
  toDiamondHillTab.classList.toggle("active", direction === "diamondhill");

  // Fetch new data
  fetchAllEtas();
}

// Initialize the app
function initApp() {
  // Set up tab event listeners
  toPoLamTab.addEventListener("click", () => switchDirection("polam"));
  toDiamondHillTab.addEventListener("click", () =>
    switchDirection("diamondhill")
  );

  // Set up refresh button
  refreshBtn.addEventListener("click", fetchAllEtas);

  // Auto-refresh every 30 seconds
  setInterval(fetchAllEtas, 30000);

  // Load initial data
  fetchAllEtas();
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);
