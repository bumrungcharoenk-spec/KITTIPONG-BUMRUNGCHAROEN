const startPlaces = [
  { id: 'quad', label: 'Oval', type: 'outdoor' },
  { id: 'library', label: 'Library Entrance', type: 'indoor' },
  { id: 'gate', label: 'Main Gate', type: 'outdoor' }
];

const destinations = [
  { id: 'cafeteria', label: 'Cafeteria', type: 'indoor', description: 'Busy dining hall with breakfast and lunch service. Great for quick breaks between classes.' },
  { id: 'gym', label: 'Gym', type: 'indoor', description: 'Fitness rooms, courts, and wellness activities are available here throughout the day.' },
  { id: 'arts', label: 'Arts Hall', type: 'indoor', description: 'Creative studios and gallery spaces with weekly student exhibitions.' },
  { id: 'science', label: 'Science Lab', type: 'indoor', description: 'Modern labs and study support for practical learning and research projects.' }
];

const floorPlans = {
  cafeteria: [
    { floor: 1, label: 'Floor 1', rooms: ['Main Dining', 'Coffee Bar'] },
    { floor: 2, label: 'Floor 2', rooms: ['Study Lounge', 'Event Room'] }
  ],
  gym: [
    { floor: 1, label: 'Floor 1', rooms: ['Reception', 'Weight Room'] },
    { floor: 2, label: 'Floor 2', rooms: ['Basketball Court', 'Yoga Studio'] }
  ],
  arts: [
    { floor: 1, label: 'Floor 1', rooms: ['Gallery', 'Workshop'] },
    { floor: 2, label: 'Floor 2', rooms: ['Studio A', 'Lecture Hall'] },
    { floor: 3, label: 'Floor 3', rooms: ['Design Lab', 'Exhibition Space'] }
  ],
  science: [
    { floor: 1, label: 'Floor 1', rooms: ['Lab Entrance', 'Prep Room'] },
    { floor: 2, label: 'Floor 2', rooms: ['Physics Lab', 'Computer Lab'] },
    { floor: 3, label: 'Floor 3', rooms: ['Chemistry Lab', 'Observation Room'] },
    { floor: 4, label: 'Floor 4', rooms: ['Research Hub', 'Seminar Room'] }
  ]
};

const roomDescriptions = {
  'Main Dining': 'Open for breakfast and lunch with accessible seating and vending options nearby.',
  'Coffee Bar': 'A quick-stop cafe for coffee, snacks, and casual study breaks.',
  'Study Lounge': 'Bright lounge space with group tables, charging docks, and quiet corners.',
  'Event Room': 'Used for club meetups, presentations, and temporary campus activities.',
  'Reception': 'Front desk help for memberships, facility access, and equipment rentals.',
  'Weight Room': 'Strength training area with machines, free weights, and coaches on duty.',
  'Basketball Court': 'Indoor sports space for team play and casual recreation.',
  'Yoga Studio': 'Flexible studio for guided wellness sessions and personal practice.',
  'Gallery': 'Rotating student exhibits and public art displays.',
  'Workshop': 'Hands-on studio for making, crafting, and collaborative design projects.',
  'Studio A': 'Creative room for painting, digital media, and temporary installations.',
  'Lecture Hall': 'Used for talks, demonstrations, and presentations with tiered seating.',
  'Design Lab': 'An open workspace with tablets, visual tools, and collaborative desks.',
  'Exhibition Space': 'A flexible area for showcases, portfolios, and small events.',
  'Lab Entrance': 'Entry point to the scientific wing with safety instructions and check-in.',
  'Prep Room': 'Support space for equipment setup, tools, and lab preparation.',
  'Physics Lab': 'Experiment-focused room for demonstrations and data collection.',
  'Computer Lab': 'Workstations and software support for coding, analysis, and research.',
  'Chemistry Lab': 'Specialized space for experimentation, chemical handling, and supervision.',
  'Observation Room': 'A quiet room used for monitoring live activities and reviewing results.',
  'Research Hub': 'Shared workspace for advanced projects, collaboration, and team study.',
  'Seminar Room': 'Small meeting space for presentations, tutoring, and group discussion.'
};

const authOverlay = document.getElementById('authOverlay');
const pageShell = document.getElementById('pageShell');
const accessCodeInput = document.getElementById('accessCode');
const accessSubmit = document.getElementById('accessSubmit');
const authError = document.getElementById('authError');
const startExploringButton = document.getElementById('startExploringButton');
const backHomeButton = document.getElementById('backHomeButton');

const mapContainer = document.getElementById('mapContainer');
const startOptions = document.getElementById('startOptions');
const destinationOptions = document.getElementById('destinationOptions');
const gpsButton = document.getElementById('gpsButton');
const gpsStatus = document.getElementById('gpsStatus');
const routeTitle = document.getElementById('routeTitle');
const routeText = document.getElementById('routeText');
const mapMode = document.getElementById('mapMode');
const floorSwitcher = document.getElementById('floorSwitcher');
const roomList = document.getElementById('roomList');
const roomDetails = document.getElementById('roomDetails');
const searchInput = document.getElementById('searchInput');
const searchStatus = document.getElementById('searchStatus');

let selectedStart = null;
let selectedDestination = null;
let gpsEnabled = false;
let currentFloor = 1;
let campusMap = null;

// Manually set the default map position and marker locations here.
const mapDefaults = {
  center: [14.216141, 121.135681],
  zoom: 16.5,
  gate: [14.2140083, 121.1369202]
};

function renderStartOptions() {
  startOptions.innerHTML = '';
  startPlaces.forEach((place) => {
    const button = document.createElement('button');
    button.className = 'chip-btn';
    button.textContent = place.label;
    button.addEventListener('click', () => {
      selectedStart = place;
      renderStartOptions();
      updateRoute();
    });

    if (selectedStart && selectedStart.id === place.id) {
      button.classList.add('active');
    }

    startOptions.appendChild(button);
  });
}

function renderDestinationOptions() {
  destinationOptions.innerHTML = '';
  destinations.forEach((place) => {
    const button = document.createElement('button');
    button.className = 'place-btn';
    button.textContent = place.label;
    button.addEventListener('click', () => {
      selectedDestination = place;
      currentFloor = 1;
      renderDestinationOptions();
      updateRoute();
    });

    if (selectedDestination && selectedDestination.id === place.id) {
      button.classList.add('active');
    }

    destinationOptions.appendChild(button);
  });
}

function renderGuideCards() {
  const cards = Array.from(document.querySelectorAll('.info-card'));
  const query = (searchInput?.value || '').trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    const matches = !query || text.includes(query);
    card.classList.toggle('hidden', !matches);

    if (matches) {
      visibleCount += 1;
    }
  });

  if (searchStatus) {
    searchStatus.textContent = query
      ? `Showing ${visibleCount} result${visibleCount === 1 ? '' : 's'} for "${searchInput.value.trim()}".`
      : 'Try searching for a building or service.';
  }
}

function renderFloorSwitcher() {
  floorSwitcher.innerHTML = '';
  if (!selectedDestination) {
    return;
  }

  const plan = floorPlans[selectedDestination.id];
  if (!plan) {
    return;
  }

  plan.forEach((level) => {
    const button = document.createElement('button');
    button.className = 'floor-btn';
    button.textContent = level.label;
    button.addEventListener('click', () => {
      currentFloor = level.floor;
      renderFloorSwitcher();
      renderRoomList();
    });

    if (currentFloor === level.floor) {
      button.classList.add('active');
    }

    floorSwitcher.appendChild(button);
  });
}

function renderRoomList() {
  roomList.innerHTML = '';
  if (!selectedDestination) {
    roomDetails.textContent = 'Select a room to see its short description.';
    return;
  }

  const plan = floorPlans[selectedDestination.id];
  const activeLevel = plan.find((level) => level.floor === currentFloor);
  if (!activeLevel) {
    return;
  }

  activeLevel.rooms.forEach((room) => {
    const button = document.createElement('button');
    button.className = 'room-chip';
    button.textContent = room;
    button.addEventListener('click', () => {
      roomDetails.textContent = roomDescriptions[room] || 'This room description will be updated when the full layout is added.';
      renderRoomList();
    });

    roomList.appendChild(button);
  });
}

function updateRoute() {
  if (!selectedStart || !selectedDestination) {
    routeTitle.textContent = 'Route preview';
    routeText.textContent = 'Choose a starting point and destination to preview the path.';
    mapMode.textContent = 'Outdoor map selected';
    gpsStatus.textContent = gpsEnabled
      ? 'GPS is active. Campus navigation may be less accurate indoors.'
      : 'GPS is inactive. Choose a starting point manually.';
    floorSwitcher.innerHTML = '';
    roomList.innerHTML = '';
    roomDetails.textContent = 'Select a room to see its short description.';
    return;
  }

  const startIsCampus = selectedStart.id === 'library' || selectedStart.id === 'quad';

  if (gpsEnabled && startIsCampus) {
    gpsStatus.textContent = 'GPS detected you are inside the campus area. Indoor navigation is recommended.';
    gpsStatus.classList.add('warning');
    mapMode.textContent = 'Indoor map selected';
  } else if (gpsEnabled) {
    gpsStatus.textContent = 'GPS is active outside the campus perimeter. Outdoor navigation is recommended.';
    gpsStatus.classList.remove('warning');
    mapMode.textContent = 'Outdoor map selected';
  } else {
    gpsStatus.textContent = 'GPS is inactive. Manual routing is active for the placeholder experience.';
    gpsStatus.classList.remove('warning');
    mapMode.textContent = selectedDestination.type === 'indoor' ? 'Indoor map selected' : 'Outdoor map selected';
  }

  routeTitle.textContent = `Route: ${selectedStart.label} → ${selectedDestination.label}`;
  routeText.textContent = `From ${selectedStart.label}, head toward ${selectedDestination.label}. ${selectedDestination.type === 'indoor' ? 'The destination uses an indoor floor plan.' : 'The destination uses an outdoor campus path.'}`;

  renderFloorSwitcher();
  renderRoomList();
}

function initMap() {
  if (!window.L || !mapContainer || campusMap) {
    return;
  }

  const campusCenter = mapDefaults.center;
  const gatePoint = mapDefaults.gate;

  campusMap = L.map(mapContainer, {
    zoomControl: true,
    scrollWheelZoom: true,
    preferCanvas: true
  }).setView(campusCenter, mapDefaults.zoom);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri | Source: Esri, OpenStreetMap contributors, and the GIS User Community'
  }).addTo(campusMap);

  L.circleMarker(gatePoint, {
    radius: 8,
    color: '#7dd3fc',
    fillColor: '#7dd3fc',
    fillOpacity: 0.95
  }).addTo(campusMap).bindPopup('Campus gate');

  L.circleMarker(campusCenter, {
    radius: 6,
    color: '#ffffff',
    fillColor: '#ffffff',
    fillOpacity: 0.85
  }).addTo(campusMap).bindPopup('University of Perpetual Help System DALTA Calamba Campus');

  const refreshMap = () => {
    if (campusMap) {
      setTimeout(() => campusMap.invalidateSize(), 120);
    }
  };

  campusMap.whenReady(refreshMap);
  window.addEventListener('resize', refreshMap);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      refreshMap();
    }
  });
}

function updateBuildingHours() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const currentTimeText = formatter.format(now);
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const hoursMap = {
    'hours-cafeteria': { open: 7 * 60, close: 16 * 60, label: 'Open until 4:00 PM' },
    'hours-registrar': { open: 8 * 60, close: 14 * 60, label: 'Open until 2:00 PM' },
    'hours-faculty': { open: 7 * 60 + 30, close: 16 * 60, label: 'Open until 4:00 PM' },
    'hours-library': { open: 8 * 60, close: 16 * 60, label: 'Open until 4:00 PM' }
  };

  Object.entries(hoursMap).forEach(([id, config]) => {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }

    const isOpen = currentTotalMinutes >= config.open && currentTotalMinutes < config.close;
    el.textContent = `${isOpen ? 'Open now' : 'Closed now'} • ${config.label} • ${currentTimeText} GMT+8`;
  });
}

async function handleAccess() {
  const enteredCode = accessCodeInput.value.trim();
  if (!enteredCode) {
    authError.textContent = 'Please enter your access code.';
    authError.classList.add('show');
    return;
  }

  accessSubmit.disabled = true;
  authError.classList.remove('show');

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ code: enteredCode })
    });

    if (response.ok) {
      authOverlay.style.opacity = '0';
      authOverlay.style.pointerEvents = 'none';
      pageShell.hidden = false;
      pageShell.style.display = 'block';
      pageShell.classList.add('is-visible');
      updateBuildingHours();
      return;
    }

    authError.textContent = response.status === 429
      ? 'Too many attempts. Please wait a minute and try again.'
      : 'Incorrect code. Please try again.';
    authError.classList.add('show');
  } catch (error) {
    authError.textContent = 'The access service is unavailable. Start Navify through the server and try again.';
    authError.classList.add('show');
  } finally {
    accessSubmit.disabled = false;
  }
}

function openExploreView() {
  pageShell.classList.add('explore-mode');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  requestAnimationFrame(() => {
    initMap();
    setTimeout(() => {
      if (campusMap) {
        campusMap.invalidateSize();
      }
    }, 120);
  });
}

function closeExploreView() {
  pageShell.classList.remove('explore-mode');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

gpsButton.addEventListener('click', () => {
  gpsEnabled = true;
  gpsStatus.textContent = 'GPS enabled. Campus perimeter detection is being simulated.';
  gpsStatus.classList.add('warning');
  updateRoute();
});

if (searchInput) {
  searchInput.addEventListener('input', renderGuideCards);
}

accessSubmit.addEventListener('click', handleAccess);
startExploringButton.addEventListener('click', openExploreView);
backHomeButton.addEventListener('click', closeExploreView);
accessCodeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleAccess();
  }
});

if (!pageShell.hidden) {
  initMap();
}

renderStartOptions();
renderDestinationOptions();
renderGuideCards();
updateRoute();
updateBuildingHours();
setInterval(updateBuildingHours, 60000);
