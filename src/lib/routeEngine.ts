// Dynamic Route & Intermediate Waypoints Engine for PathShare Karachi & Major Cities

export interface RouteInfo {
  destinationName: string;
  fullPath: string;
  waypoints: string[];
  km: number;
  estMinutes: number;
}

const POPULAR_ROUTES: Record<string, RouteInfo> = {
  'DHA Phase 6, Karachi': {
    destinationName: 'DHA Phase 6, Karachi',
    fullPath: 'Clifton Block 5 → Boat Basin → Sea View → Khayaban-e-Ittehad → DHA Phase 6',
    waypoints: ['Clifton', 'Boat Basin', 'Sea View', 'Phase 6', 'Kh-e-Ittehad'],
    km: 12,
    estMinutes: 25
  },
  'DHA Phase 8, Karachi': {
    destinationName: 'DHA Phase 8, Karachi',
    fullPath: 'Clifton Block 2 → Sea View → Khayaban-e-Ittehad → Beach Avenue → DHA Phase 8',
    waypoints: ['Clifton', 'Sea View', 'Phase 8', 'Beach Ave', 'Kh-e-Shujaat'],
    km: 16,
    estMinutes: 30
  },
  'Clifton, Karachi': {
    destinationName: 'Clifton, Karachi',
    fullPath: 'I.I. Chundrigar → Mai Kolachi Bypass → Boat Basin → Clifton Block 5',
    waypoints: ['Tower', 'Mai Kolachi', 'Boat Basin', 'Clifton Block 5'],
    km: 10,
    estMinutes: 20
  },
  'PECHS Block 6, Karachi': {
    destinationName: 'PECHS Block 6, Karachi',
    fullPath: 'Sharea Faisal → Nursery → Shahrah-e-Quaideen → PECHS Block 6',
    waypoints: ['Sharea Faisal', 'Nursery', 'PECHS', 'Tara Chand Road'],
    km: 14,
    estMinutes: 28
  },
  'Gulshan-e-Iqbal, Karachi': {
    destinationName: 'Gulshan-e-Iqbal, Karachi',
    fullPath: 'Civil Lines → Sharea Faisal → NIPA Chowrangi → Gulshan Block 13D',
    waypoints: ['Sharea Faisal', 'NIPA', 'Gulshan 13D', 'University Road'],
    km: 18,
    estMinutes: 35
  },
  'Model Colony, Karachi': {
    destinationName: 'Model Colony, Karachi',
    fullPath: 'Sharea Faisal → Star Gate → Airport Road → Model Colony Gate',
    waypoints: ['Sharea Faisal', 'Star Gate', 'Airport', 'Model Colony'],
    km: 22,
    estMinutes: 40
  },
  'Shadman Town, Karachi': {
    destinationName: 'Shadman Town, Karachi',
    fullPath: 'Shahrah-e-Pakistan → Sakhi Hasan → Anda Mor → Shadman Town Sector 14/B',
    waypoints: ['Sohrab Goth', 'Sakhi Hasan', 'Anda Mor', 'Shadman Town'],
    km: 25,
    estMinutes: 45
  },
  'Malir Cantt, Karachi': {
    destinationName: 'Malir Cantt, Karachi',
    fullPath: 'Sharea Faisal → Malir Halt → Check Post 2 → Malir Cantt',
    waypoints: ['Sharea Faisal', 'Malir Halt', 'Post 2', 'Cantt Market'],
    km: 24,
    estMinutes: 42
  }
};

export interface RouteWaypointWithTime {
  name: string;
  minutesFromStart: number;
  formattedEta: string;
}

export function parseDepartureTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const now = new Date();

  if (timeStr.includes('Leaving Now') || timeStr.includes('Now')) {
    return now.getHours() * 60 + now.getMinutes();
  }
  if (timeStr.includes('5 mins')) {
    return now.getHours() * 60 + now.getMinutes() + 5;
  }
  if (timeStr.includes('15 mins')) {
    return now.getHours() * 60 + now.getMinutes() + 15;
  }
  if (timeStr.includes('30 mins')) {
    return now.getHours() * 60 + now.getMinutes() + 30;
  }

  // Check 12-hour or 24-hour time e.g. "7:15 PM" or "19:30"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + mins;
  }

  return now.getHours() * 60 + now.getMinutes();
}

export function formatMinutesToTimeString(totalMinutes: number): string {
  const normalizedMins = (totalMinutes + 24 * 60) % (24 * 60);
  let hours = Math.floor(normalizedMins / 60);
  const mins = normalizedMins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours}:${minsStr} ${ampm}`;
}

export function getHotspotsWithTimings(departureTimeStr: string, waypoints: string[], totalKm: number = 15): RouteWaypointWithTime[] {
  const startMins = parseDepartureTimeToMinutes(departureTimeStr);
  const totalTravelMins = Math.max(15, Math.round(totalKm * 2.2));
  const stepMins = Math.max(4, Math.floor(totalTravelMins / ((waypoints.length || 1) + 1)));

  return waypoints.map((wp, index) => {
    const offset = (index + 1) * stepMins;
    const etaMins = startMins + offset;
    return {
      name: wp,
      minutesFromStart: offset,
      formattedEta: formatMinutesToTimeString(etaMins)
    };
  });
}

export interface RecommendedHotspotOption {
  id: 'shortest' | 'second_shortest' | 'custom';
  title: string;
  badge: string;
  hotspotName: string;
  corridorDescription: string;
  distanceKm: number;
  estMinutes: number;
  fuelShareEstimate: number;
}

export function getRecommendedHotspots(from: string, to: string): {
  shortest: RecommendedHotspotOption;
  secondShortest: RecommendedHotspotOption;
} {
  const cleanFrom = from.split(',')[0] || from;
  const cleanTo = to.split(',')[0] || to;
  const baseKm = getRouteDetails(to).km || 14;

  const shortestKm = baseKm;
  const shortestMins = Math.round(shortestKm * 1.8);
  const secondKm = baseKm + 2.5;
  const secondMins = Math.round(secondKm * 2.0);

  let spot1 = 'Boat Basin Shell Pump Gate';
  let spot2 = 'Teen Talwar Clifton Bus Stop';
  let desc1 = `Via Shortest Corridor (${cleanFrom} ➔ Express Link ➔ ${cleanTo})`;
  let desc2 = `Via Alternative Ring Corridor (${cleanFrom} ➔ Bypass ➔ ${cleanTo})`;

  if (to.includes('Gulshan') || from.includes('Gulshan')) {
    spot1 = 'NIPA Flyover Bridge Shell Gate';
    spot2 = 'Hassan Square Bus Stop Point';
    desc1 = `Via University Road Main Express (${shortestKm} km)`;
    desc2 = `Via Rashid Minhas / Sharea Faisal (${secondKm} km)`;
  } else if (to.includes('PECHS') || from.includes('PECHS')) {
    spot1 = 'Nursery Sharea Faisal Underpass';
    spot2 = 'Tariq Road McDonald\'s Junction';
    desc1 = `Via Direct Sharea Faisal Highway (${shortestKm} km)`;
    desc2 = `Via Shahrah-e-Quaideen Expressway (${secondKm} km)`;
  } else if (to.includes('Phase 8') || to.includes('Phase 6')) {
    spot1 = 'Boat Basin Shell Gate / 26th Street';
    spot2 = 'Khayaban-e-Shamsheer & Ittehad Corner';
    desc1 = `Via Direct Sea View Corridor (${shortestKm} km)`;
    desc2 = `Via Korangi Road Expressway (${secondKm} km)`;
  } else if (to.includes('Model Colony') || to.includes('Malir')) {
    spot1 = 'Star Gate Sharea Faisal Metro Stop';
    spot2 = 'Malir Halt Main Crossing';
    desc1 = `Via Sharea Faisal Airport Road (${shortestKm} km)`;
    desc2 = `Via Jinnah Avenue / Cantt Link (${secondKm} km)`;
  }

  return {
    shortest: {
      id: 'shortest',
      title: 'Shortest Route (Recommended)',
      badge: '⚡ Shortest • Quickest ETA',
      hotspotName: spot1,
      corridorDescription: desc1,
      distanceKm: shortestKm,
      estMinutes: shortestMins,
      fuelShareEstimate: Math.round((100 + shortestKm * 25) / 10) * 10
    },
    secondShortest: {
      id: 'second_shortest',
      title: 'Second Shortest (Alternative Corridor)',
      badge: '🔄 Alternative • Lower Traffic',
      hotspotName: spot2,
      corridorDescription: desc2,
      distanceKm: secondKm,
      estMinutes: secondMins,
      fuelShareEstimate: Math.round((100 + secondKm * 25) / 10) * 10
    }
  };
}

/**
 * Returns dynamic route waypoints and intermediate stopovers for any location.
 */
export function getRouteDetails(destination: string): RouteInfo {
  if (POPULAR_ROUTES[destination]) {
    return POPULAR_ROUTES[destination];
  }

  const cleanDest = destination.trim();
  const waypoints = [
    'Office Hub',
    cleanDest.includes('Phase') ? 'Kh-e-Ittehad' : 'Main Boulevard',
    cleanDest.split(',')[0] || cleanDest
  ];

  return {
    destinationName: cleanDest,
    fullPath: `Main Office Hub → Express Highway → ${cleanDest}`,
    waypoints,
    km: 15,
    estMinutes: 30
  };
}


