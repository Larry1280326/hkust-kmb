// Configuration for all routes
const ROUTES_CONFIG = {
    '91M': {
        polam: {
            route: "91M",
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
            directionInfo: "Showing buses to PO LAM"
        },
        diamondhill: {
            route: "91M",
            destination: "DIAMOND HILL STATION",
            direction: "O",
            stops: [
                {
                    id: "B002CEF0DBC568F5",
                    name: "HKUST (South)",
                    ch_name: "香港科技大學(南)",
                },
            ],
            directionInfo: "Showing buses to DIAMOND HILL STATION"
        }
    },
    '91': {
        clearwaterbay: {
            route: "91",
            destination: "CLEAR WATER BAY",
            direction: "I",
            stops: [
                {
                    id: "0B41334D66E94275",
                    name: "Diamond Hill Station Bus Terminus",
                    ch_name: "鑽石山站巴士總站",
                },
                {
                    id: "5169C5ACEA8B1746",
                    name: "Choi Hung BBI - Pik Hoi House",
                    ch_name: "彩虹轉車站 - 碧海樓",
                },
                {
                    id: "2EFDB1EADF5955E6",
                    name: "Ngau Chi Wan BBI - Ngau Chi Wan Village",
                    ch_name: "牛池灣轉車站 - 牛池灣村",
                },
            ],
            directionInfo: "Showing buses to CLEAR WATER BAY"
        },
        diamondhill91: {
            route: "91",
            destination: "DIAMOND HILL STATION",
            direction: "O",
            stops: [
                {
                    id: "B002CEF0DBC568F5",
                    name: "HKUST (South)",
                    ch_name: "香港科技大學(南)",
                },
            ],
            directionInfo: "Showing buses to DIAMOND HILL STATION"
        }
    },
    '91P': {
        hkustnorth: {
            route: "91P",
            destination: "HKUST (NORTH)",
            direction: "O",
            stops: [
                {
                    id: "53889000AA9C33E2",
                    name: "Diamond Hill Station Bus Terminus",
                    ch_name: "鑽石山站巴士總站",
                },
                {
                    id: "2EFDB1EADF5955E6",
                    name: "Ngau Chi Wan BBI - Ngau Chi Wan Village",
                    ch_name: "牛池灣轉車站 - 牛池灣村",
                }
            ],
            directionInfo: "Showing buses to HKUST (NORTH)"
        },
        pingshek: {
            route: "91P",
            destination: "PING SHEK / CHOI HUNG STATION",
            direction: "I",
            stops: [
                {
                    id: "E9018F8A7E096544",
                    name: "HKUST (SOUTH)",
                    ch_name: "香港科技大學(南)"
                }
            ],
            directionInfo: "Showing buses to PING SHEK / CHOI HUNG STATION"
        }
    },
    '11': {
        tohanghau: {
            route: "11",
            minibus: true,
            destination: "Hang Hau Village",
            stops: [
                {
                    id: "20001116",
                    name: "Choi Hung Station",
                    ch_name: "彩虹站"
                }
            ],
            directionInfo: "Showing minibuses to Hang Hau Village"
        },
        tochoihung: {
            route: "11",
            minibus: true,
            destination: "Choi Hung",
            stops: [
                {
                    id: "20013010",
                    name: "Hang Hau Village",
                    ch_name: "坑口村"
                }
            ],
            directionInfo: "Showing minibuses to Choi Hung"
        }
    }
};

// DOM elements
const stopsContainer = document.getElementById('stopsContainer');
const refreshBtn = document.getElementById('refreshBtn');
const lastUpdatedEl = document.getElementById('lastUpdated');
const directionInfo = document.getElementById('directionInfo');
const route91mTab = document.getElementById('route91mTab');
const route91Tab = document.getElementById('route91Tab');
const route91pTab = document.getElementById('route91pTab');
const route11Tab = document.getElementById('route11Tab');
const directionTabs91m = document.getElementById('directionTabs91m');
const directionTabs91 = document.getElementById('directionTabs91');
const directionTabs91p = document.getElementById('directionTabs91p');
const directionTabs11 = document.getElementById('directionTabs11');

// Current state
let currentRoute = '91M';
let currentDirection = 'polam';

// Format ETA time
function formatEtaTime(etaString) {
    if (!etaString) return '--:--';
    
    const date = new Date(etaString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Calculate minutes until arrival
function calculateMinutesUntil(etaString) {
    if (!etaString) return { minutes: 'N/A', status: '' };
    
    const now = new Date();
    const eta = new Date(etaString);
    const diffMinutes = Math.floor((eta - now) / (1000 * 60));
    
    if (diffMinutes < 0) return { minutes: 'Departed', status: 'departed' };
    if (diffMinutes === 0) return { minutes: 'Arriving', status: 'arriving' };
    if (diffMinutes <= 3) return { minutes: `${diffMinutes} min`, status: 'soon' };
    return { minutes: `${diffMinutes} min`, status: '' };
}

// Update last updated timestamp
function updateTimestamp() {
    const now = new Date();
    lastUpdatedEl.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Create stop card HTML
function createStopCard(stop, etas, route) {
    return `
        <div class="stop-card">
            <div class="stop-header">
                <h2 class="stop-name">
                    <i class="fas fa-map-marker-alt"></i> ${stop.name}
                </h2>
                <div class="stop-location">${stop.ch_name}</div>
            </div>
            <div class="eta-list">
                ${etas.length > 0 ? 
                    etas.map(eta => {
                        if (!eta.eta) {
                            return '<div class="no-eta">No scheduled buses at this time</div>';
                        }
                        const timeInfo = calculateMinutesUntil(eta.eta);
                        return `
                        <div class="eta-item">
                            <div class="eta-time">
                                ${formatEtaTime(eta.eta)}
                                ${eta.rmk_en ? `<div class="eta-remark">${eta.rmk_en}</div>` : ''}
                            </div>
                            <div class="eta-minutes ${timeInfo.status}">
                                ${timeInfo.minutes}
                            </div>
                        </div>
                        `;
                    }).join('') : 
                    `<div class="no-eta">No scheduled buses at this time</div>`
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
async function fetchStopEta(stopId, route, config) {
    try {
        // Minibus uses different API endpoint
        if (config.minibus) {
            const response = await fetch(`https://data.etagmb.gov.hk/eta/stop/${stopId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Find minibus route 11 (route_id: 2004791)
            const route11Data = data.data.find(item => item.route_id === 2004791);
            
            if (!route11Data || !route11Data.eta || route11Data.eta.length === 0) {
                return [];
            }
            
            // Format minibus ETA data to match KMB structure
            return route11Data.eta.map(eta => ({
                eta: eta.timestamp,
                rmk_en: eta.remarks_en
            }));
        }
        else {
            const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/1`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();

            // Filter buses based on direction config
            const filteredData = data.data.filter(bus => 
                bus.dest_en === config.destination && bus.dir === config.direction
            );
            
            // Sort by arrival time
            filteredData.sort((a, b) => new Date(a.eta) - new Date(b.eta));
            
            return filteredData;
        }
    } catch (error) {
        console.error(`Error fetching ETA for stop ${stopId}:`, error);
        return [];
    }
}

// Fetch ETAs for all stops in current direction
async function fetchAllEtas() {
    showLoading();
    const config = ROUTES_CONFIG[currentRoute][currentDirection];
    directionInfo.textContent = config.directionInfo;
    
    // Update UI classes for styling
    document.body.className = `route-${currentRoute.toLowerCase().replace('m', '')}`;
    
    try {
        // Fetch ETAs for all stops in parallel
        const etaPromises = config.stops.map(stop => 
            fetchStopEta(stop.id, config.route, config)
        );
        const allEtas = await Promise.all(etaPromises);
        
        // Create stop cards with ETAs
        stopsContainer.innerHTML = config.stops.map((stop, index) => 
            createStopCard(stop, allEtas[index], config.route)
        ).join('');
        
        updateTimestamp();
    } catch (error) {
        console.error('Error fetching ETAs:', error);
        stopsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load bus times. Please try again later.</p>
            </div>
        `;
    }
}

// Switch route
function switchRoute(route) {
    currentRoute = route;
    
    // Update active route tab
    route91mTab.classList.toggle('active', route === '91M');
    route91Tab.classList.toggle('active', route === '91');
    route91pTab.classList.toggle('active', route === '91P');
    route11Tab.classList.toggle('active', route === '11');
    
    // Show correct direction tabs
    directionTabs91m.style.display = route === '91M' ? 'flex' : 'none';
    directionTabs91.style.display = route === '91' ? 'flex' : 'none';
    directionTabs91p.style.display = route === '91P' ? 'flex' : 'none';
    directionTabs11.style.display = route === '11' ? 'flex' : 'none';
    
    // Reset to first direction for this route
    const directions = Object.keys(ROUTES_CONFIG[route]);
    currentDirection = directions[0];
    
    // Update active direction tab
    let directionTabs;
    if (route === '91M') {
        directionTabs = directionTabs91m.querySelectorAll('.tab');
    } else if (route === '91') {
        directionTabs = directionTabs91.querySelectorAll('.tab');
    } else if (route === '91P') {
        directionTabs = directionTabs91p.querySelectorAll('.tab');
    } else if (route === '11') {
        directionTabs = directionTabs11.querySelectorAll('.tab');
    }
    
    if (directionTabs) {
        directionTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.direction === currentDirection) {
                tab.classList.add('active');
            }
        });
    }
    
    // Fetch new data
    fetchAllEtas();
}

// Switch direction
function switchDirection(direction) {
    currentDirection = direction;
    
    // Update active tab
    let directionTabs;
    if (currentRoute === '91M') {
        directionTabs = directionTabs91m.querySelectorAll('.tab');
    } else if (currentRoute === '91') {
        directionTabs = directionTabs91.querySelectorAll('.tab');
    } else if (currentRoute === '91P') {
        directionTabs = directionTabs91p.querySelectorAll('.tab');
    } else if (currentRoute === '11') {
        directionTabs = directionTabs11.querySelectorAll('.tab');
    }
    
    if (directionTabs) {
        directionTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.direction === direction);
        });
    }
    
    // Fetch new data
    fetchAllEtas();
}

// Initialize the app
function initApp() {
    // Set up route tab event listeners
    route91mTab.addEventListener('click', () => switchRoute('91M'));
    route91Tab.addEventListener('click', () => switchRoute('91'));
    route91pTab.addEventListener('click', () => switchRoute('91P'));
    route11Tab.addEventListener('click', () => switchRoute('11'));
    
    // Set up direction tab event listeners
    document.getElementById('toPoLamTab').addEventListener('click', () => switchDirection('polam'));
    document.getElementById('toDiamondHillTab').addEventListener('click', () => switchDirection('diamondhill'));
    document.getElementById('toClearWaterBayTab').addEventListener('click', () => switchDirection('clearwaterbay'));
    document.getElementById('toDiamondHill91Tab').addEventListener('click', () => switchDirection('diamondhill91'));
    document.getElementById('toHkustNorthTab').addEventListener('click', () => switchDirection('hkustnorth'));
    document.getElementById('toPingShekTab').addEventListener('click', () => switchDirection('pingshek'));
    document.getElementById('toHangHauTab').addEventListener('click', () => switchDirection('tohanghau'));
    document.getElementById('toChoiHungTab').addEventListener('click', () => switchDirection('tochoihung'));
    
    // Set up refresh button
    refreshBtn.addEventListener('click', fetchAllEtas);
    
    // Auto-refresh every 30 seconds
    setInterval(fetchAllEtas, 30000);
    
    // Load initial data
    fetchAllEtas();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);