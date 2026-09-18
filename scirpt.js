const startPlaces = [
  { id: 'eng-f3-lobby', label: 'Central Lobby', type: 'indoor' },
  { id: 'eng-f3-west-stairs', label: 'West Stairwell', type: 'indoor' },
  { id: 'eng-f3-east-stairs', label: 'East Stairwell', type: 'indoor' },
  { id: 'eng-f3-hall-center', label: 'Center Hallway', type: 'indoor' }
];

const destinations = [
  { id: 'eng-f3-room-326', label: 'Room 326', type: 'room', side: 'north', column: 0, description: 'Classroom on the third floor of the Engineering Building.' },
  { id: 'eng-f3-room-326b', label: 'Room 326B', type: 'room', side: 'north', column: 1, description: 'Classroom on the third floor of the Engineering Building.' },
  { id: 'eng-f3-room-325a', label: 'Room 325A', type: 'room', side: 'north', column: 2, description: 'Classroom on the third floor of the Engineering Building.' },
  { id: 'eng-f3-room-324a', label: 'Room 324A', type: 'room', side: 'north', column: 3, description: 'Classroom on the third floor of the Engineering Building.' },
  { id: 'eng-f3-room-324b', label: 'Room 324B', type: 'room', side: 'north', column: 4, description: 'Classroom on the third floor of the Engineering Building.' },
  { id: 'eng-f3-room-323', label: 'Room 323', type: 'room', side: 'east', column: 0, description: 'Classroom beside the east stairwell.' },
  { id: 'eng-f3-room-320a', label: 'Room 320A', type: 'room', side: 'south', column: 0, description: 'Classroom on the south side of the third-floor hallway.' },
  { id: 'eng-f3-room-320b', label: 'Room 320B', type: 'room', side: 'south', column: 1, description: 'Classroom on the south side of the third-floor hallway.' },
  { id: 'eng-f3-room-321a', label: 'Room 321A', type: 'room', side: 'south', column: 2, description: 'Classroom on the south side of the third-floor hallway.' },
  { id: 'eng-f3-room-321b', label: 'Room 321B', type: 'room', side: 'south', column: 3, description: 'Classroom on the south side of the third-floor hallway.' },
  { id: 'eng-f3-room-322b', label: 'Room 322B', type: 'room', side: 'south', column: 4, description: 'Classroom on the south side of the third-floor hallway.' },
  { id: 'eng-f3-room-322a', label: 'Room 322A', type: 'room', side: 'south', column: 5, description: 'Classroom near the east stairwell.' }
];

const routeGraph = {
  'eng-f3-lobby': ['eng-f3-hall-center'],
  'eng-f3-west-stairs': ['eng-f3-hall-west'],
  'eng-f3-east-stairs': ['eng-f3-hall-east'],
  'eng-f3-hall-west': ['eng-f3-west-stairs', 'eng-f3-hall-center', 'eng-f3-room-326-door', 'eng-f3-room-320a-door', 'eng-f3-room-326b-door', 'eng-f3-room-320b-door'],
  'eng-f3-hall-center': ['eng-f3-lobby', 'eng-f3-hall-west', 'eng-f3-hall-east', 'eng-f3-room-326b-door', 'eng-f3-room-325a-door', 'eng-f3-room-324a-door', 'eng-f3-room-321a-door', 'eng-f3-room-321b-door'],
  'eng-f3-hall-east': ['eng-f3-hall-center', 'eng-f3-east-stairs', 'eng-f3-room-324b-door', 'eng-f3-room-323-door', 'eng-f3-room-322b-door', 'eng-f3-room-322a-door'],
  'eng-f3-room-326-door': ['eng-f3-hall-west'],
  'eng-f3-room-326b-door': ['eng-f3-hall-center'],
  'eng-f3-room-325a-door': ['eng-f3-hall-center'],
  'eng-f3-room-324a-door': ['eng-f3-hall-center'],
  'eng-f3-room-324b-door': ['eng-f3-hall-east'],
  'eng-f3-room-323-door': ['eng-f3-hall-east'],
  'eng-f3-room-320a-door': ['eng-f3-hall-west'],
  'eng-f3-room-320b-door': ['eng-f3-hall-west'],
  'eng-f3-room-321a-door': ['eng-f3-hall-center'],
  'eng-f3-room-321b-door': ['eng-f3-hall-center'],
  'eng-f3-room-322b-door': ['eng-f3-hall-east'],
  'eng-f3-room-322a-door': ['eng-f3-hall-east']
};

const roomDoorNodes = Object.fromEntries(destinations.map((room) => [room.id, `${room.id}-door`]));

const navigationCoordinates = {
  'eng-f3-west-stairs': [105, 280],
  'eng-f3-hall-west': [290, 280],
  'eng-f3-lobby': [500, 280],
  'eng-f3-hall-center': [500, 280],
  'eng-f3-hall-east': [760, 280],
  'eng-f3-east-stairs': [900, 405]
};

destinations.forEach((room) => {
  const x = room.side === 'north' ? 150 + room.column * 132 + 62 : room.side === 'south' ? 150 + room.column * 106 + 49 : 828;
  const y = room.side === 'north' ? 235 : room.side === 'south' ? 335 : 315;
  navigationCoordinates[getRoomDoorId(room.id)] = [x, y];
});

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
const locationSearchInput = document.getElementById('locationSearchInput');
const locationResults = document.getElementById('locationResults');
const locationSearchStatus = document.getElementById('locationSearchStatus');
const gpsStatus = document.getElementById('gpsStatus');
const routeTitle = document.getElementById('routeTitle');
const routeText = document.getElementById('routeText');
const mapMode = document.getElementById('mapMode');
const roomList = document.getElementById('roomList');
const roomDetails = document.getElementById('roomDetails');
const routeSteps = document.getElementById('routeSteps');
const searchInput = document.getElementById('searchInput');
const searchStatus = document.getElementById('searchStatus');

let selectedStart = null;
let selectedDestination = null;
let routeNodePath = [];
let currentRouteLine = null;

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

function getRoomDoorId(roomId) {
  return roomDoorNodes[roomId] || roomId;
}

function renderIndoorMap(route = []) {
  const northRooms = destinations.filter((room) => room.side === 'north');
  const southRooms = destinations.filter((room) => room.side === 'south');
  const eastRoom = destinations.find((room) => room.side === 'east');
  const routeNodes = new Set(route);
  const roomRect = (room, x, y, width, height) => `
    <g class="indoor-room ${routeNodes.has(getRoomDoorId(room.id)) ? 'route-room' : ''}" data-room-id="${room.id}" tabindex="0" role="button" aria-label="${room.label}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="5"></rect>
      <text x="${x + width / 2}" y="${y + height / 2 + 5}" text-anchor="middle">${room.label.replace('Room ', '')}</text>
    </g>`;

  const northMarkup = northRooms.map((room, index) => roomRect(room, 150 + index * 132, 70, 124, 145)).join('');
  const southMarkup = southRooms.map((room, index) => roomRect(room, 150 + index * 106, 345, 98, 145)).join('');
  const eastMarkup = eastRoom ? roomRect(eastRoom, 828, 190, 120, 125) : '';

  const nodeCoordinates = {
    'eng-f3-west-stairs': [105, 280],
    'eng-f3-hall-west': [290, 280],
    'eng-f3-lobby': [500, 280],
    'eng-f3-hall-center': [500, 280],
    'eng-f3-hall-east': [760, 280],
    'eng-f3-east-stairs': [900, 405]
  };
  destinations.forEach((room) => {
    const x = room.side === 'north' ? 150 + room.column * 132 + 62 : room.side === 'south' ? 150 + room.column * 106 + 49 : 828;
    const y = room.side === 'north' ? 235 : room.side === 'south' ? 335 : 315;
    nodeCoordinates[getRoomDoorId(room.id)] = [x, y];
  });

  const points = route.map((node) => nodeCoordinates[node]).filter(Boolean).map(([x, y]) => `${x},${y}`).join(' ');
  mapContainer.innerHTML = `
    <svg class="indoor-floorplan" viewBox="0 0 1000 560" role="img" aria-label="Engineering Building third floor interactive map">
      <rect class="floor-shell" x="44" y="38" width="912" height="470" rx="12"></rect>
      <text class="floor-title" x="500" y="25" text-anchor="middle">ENGINEERING BUILDING · THIRD FLOOR</text>
      <rect class="hallway" x="90" y="235" width="820" height="92" rx="18"></rect>
      <rect class="stairs" x="62" y="70" width="70" height="145" rx="8"></rect>
      <text class="map-label" x="97" y="145" text-anchor="middle" transform="rotate(-90 97 145)">WEST STAIRS</text>
      <rect class="stairs" x="828" y="345" width="120" height="145" rx="8"></rect>
      <text class="map-label" x="888" y="420" text-anchor="middle">EAST STAIRS</text>
      ${northMarkup}${southMarkup}${eastMarkup}
      <circle class="hall-node" cx="500" cy="280" r="9"></circle>
      <path class="route-line" d="${points ? `M ${points.replaceAll(' ', ' L ')}` : ''}" aria-hidden="true"></path>
      <text class="hall-label" x="500" y="288" text-anchor="middle">MAIN HALL</text>
    </svg>`;

  mapContainer.querySelectorAll('.indoor-room').forEach((roomElement) => {
    const selectRoom = () => selectDestination(roomElement.dataset.roomId);
    roomElement.addEventListener('click', selectRoom);
    roomElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectRoom();
      }
    });
  });
}

function findPath(startId, destinationId) {
  const goal = getRoomDoorId(destinationId);
  const openSet = [startId];
  const previous = { [startId]: null };
  const scores = { [startId]: 0 };
  const estimate = (node) => {
    const [x, y] = navigationCoordinates[node] || [0, 0];
    const [goalX, goalY] = navigationCoordinates[goal] || [0, 0];
    return Math.hypot(goalX - x, goalY - y);
  };
  const totalScores = { [startId]: estimate(startId) };

  while (openSet.length) {
    openSet.sort((left, right) => totalScores[left] - totalScores[right]);
    const current = openSet.shift();
    if (current === goal) {
      const path = [];
      let cursor = goal;
      while (cursor) {
        path.unshift(cursor);
        cursor = previous[cursor];
      }
      return path;
    }

    (routeGraph[current] || []).forEach((neighbor) => {
      const tentativeScore = scores[current] + 1;
      if (tentativeScore < (scores[neighbor] ?? Infinity)) {
        previous[neighbor] = current;
        scores[neighbor] = tentativeScore;
        totalScores[neighbor] = tentativeScore + estimate(neighbor);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    });
  }
  return [];
}

function describeNode(node) {
  if (node.includes('-door')) {
    const room = destinations.find((item) => getRoomDoorId(item.id) === node);
    return room ? `Arrive at ${room.label}.` : 'Continue to the destination.';
  }
  if (node.includes('stairs')) {
    return node.includes('west') ? 'Use the west stairwell.' : 'Use the east stairwell.';
  }
  if (node.includes('lobby')) return 'Continue through the central lobby.';
  if (node.includes('hall')) return 'Continue along the main hallway.';
  return 'Continue along the route.';
}

function renderRouteInstructions(path) {
  routeSteps.innerHTML = '';
  path.forEach((node) => {
    const item = document.createElement('li');
    item.textContent = describeNode(node);
    routeSteps.appendChild(item);
  });
}

function selectDestination(roomId) {
  selectedDestination = destinations.find((room) => room.id === roomId) || null;
  renderDestinationOptions();
  renderLocationResults();
  updateRoute();
}

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
    if (selectedStart?.id === place.id) button.classList.add('active');
    startOptions.appendChild(button);
  });
}

function renderDestinationOptions() {
  destinationOptions.innerHTML = '';
  destinations.forEach((room) => {
    const button = document.createElement('button');
    button.className = 'place-btn';
    button.textContent = room.label;
    button.addEventListener('click', () => selectDestination(room.id));
    if (selectedDestination?.id === room.id) button.classList.add('active');
    destinationOptions.appendChild(button);
  });
}

function renderLocationResults() {
  const query = (locationSearchInput?.value || '').trim().toLowerCase();
  const matches = destinations.filter((room) => !query || `${room.label} engineering building floor 3`.toLowerCase().includes(query));
  locationResults.innerHTML = '';
  matches.slice(0, 8).forEach((room) => {
    const result = document.createElement('button');
    result.className = `location-result ${selectedDestination?.id === room.id ? 'active' : ''}`;
    result.innerHTML = `<strong>${room.label}</strong><span>Engineering Building · Floor 3</span>`;
    result.addEventListener('click', () => selectDestination(room.id));
    locationResults.appendChild(result);
  });
  locationSearchStatus.textContent = query ? `${matches.length} room${matches.length === 1 ? '' : 's'} found.` : 'Search rooms by number or building.';
}

function updateRoute() {
  if (!selectedStart || !selectedDestination) {
    routeTitle.textContent = 'Route preview';
    routeText.textContent = 'Choose where you are and where you want to go.';
    gpsStatus.textContent = 'Choose a room door, stairwell, or hallway point.';
    roomDetails.textContent = 'Select a room on the floor plan to see its details.';
    routeSteps.innerHTML = '';
    renderIndoorMap();
    return;
  }

  const path = findPath(selectedStart.id, selectedDestination.id);
  routeNodePath = path;
  routeTitle.textContent = `Route: ${selectedStart.label} → ${selectedDestination.label}`;
  routeText.textContent = path.length ? 'A* preview found a walkable route through the main hallway.' : 'No connected route is available for this selection yet.';
  gpsStatus.textContent = 'Indoor route mode is active. Distances are currently schematic.';
  roomDetails.textContent = selectedDestination.description;
  renderIndoorMap(path);
  renderRouteInstructions(path);
}

function initMap() {
  if (!mapContainer) return;
  renderIndoorMap(routeNodePath);
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
  });
}

function closeExploreView() {
  pageShell.classList.remove('explore-mode');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (searchInput) {
  searchInput.addEventListener('input', renderGuideCards);
}

if (locationSearchInput) {
  locationSearchInput.addEventListener('input', renderLocationResults);
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
renderLocationResults();
renderGuideCards();
updateRoute();
updateBuildingHours();
setInterval(updateBuildingHours, 60000);
