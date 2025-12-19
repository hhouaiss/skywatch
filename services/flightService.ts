
import { Flight, UserLocation } from '../types';

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

/**
 * OpenSky state vector mapping:
 * 0: icao24
 * 1: callsign
 * 2: origin_country
 * 3: time_position
 * 4: last_contact
 * 5: longitude
 * 6: latitude
 * 7: baro_altitude
 * 8: on_ground
 * 9: velocity
 * 10: true_track
 * 11: vertical_rate
 * 12: sensors
 * 13: geo_altitude
 * 14: squawk
 * 15: spi
 * 16: position_source
 */

export const fetchNearbyFlights = async (location: UserLocation): Promise<Flight[]> => {
  // Define a bounding box around user (approx 50km radius)
  const delta = 0.5; // Roughly 0.5 degrees is 50-60km depending on latitude
  const lamin = location.latitude - delta;
  const lomin = location.longitude - delta;
  const lamax = location.latitude + delta;
  const lomax = location.longitude + delta;

  try {
    const response = await fetch(`${OPENSKY_URL}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`);
    if (!response.ok) throw new Error('Failed to fetch flight data');
    const data = await response.json();

    if (!data.states) return [];

    const flights: Flight[] = data.states.map((s: any[]) => ({
      icao24: s[0],
      callsign: s[1]?.trim() || 'N/A',
      origin_country: s[2],
      longitude: s[5],
      latitude: s[6],
      baro_altitude: s[7],
      velocity: s[9],
      true_track: s[10],
      on_ground: s[8],
    }));

    // Calculate distance and sort
    return flights.map(f => ({
      ...f,
      distance: calculateDistance(location.latitude, location.longitude, f.latitude, f.longitude)
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
