
import { Flight, FlightRoute, UserLocation } from '../types';
import { getAirportInfo } from './airportService';

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';
const OPENSKY_FLIGHTS_URL = 'https://opensky-network.org/api/flights/aircraft';

// Distance thresholds in km
const OVERHEAD_MIN_DISTANCE = 0.2; // Minimum distance to be considered overhead
const OVERHEAD_MAX_DISTANCE = 0.9; // Maximum distance to be considered overhead (capturable)

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

    // Calculate distance, mark overhead status, and sort
    return flights.map(f => {
      const distance = calculateDistance(location.latitude, location.longitude, f.latitude, f.longitude);
      return {
        ...f,
        distance,
        isOverhead: distance >= OVERHEAD_MIN_DISTANCE && distance <= OVERHEAD_MAX_DISTANCE && !f.on_ground
      };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
};

/**
 * Get overhead flights only (0.2-0.9 km range, not on ground)
 */
export const getOverheadFlights = (flights: Flight[]): Flight[] => {
  return flights.filter(f => f.isOverhead);
};

/**
 * Fetch flight route information (departure/arrival airports)
 * Uses OpenSky's flights/aircraft endpoint to get recent flight data
 */
export const fetchFlightRoute = async (icao24: string): Promise<FlightRoute> => {
  const now = Math.floor(Date.now() / 1000);
  const begin = now - 86400; // Last 24 hours

  try {
    const response = await fetch(`${OPENSKY_FLIGHTS_URL}?icao24=${icao24.toLowerCase()}&begin=${begin}&end=${now}`);

    if (!response.ok) {
      console.log('Flight route API returned non-OK status');
      return {};
    }

    const flights = await response.json();

    if (!flights || flights.length === 0) {
      return {};
    }

    // Get the most recent flight
    const latestFlight = flights[flights.length - 1];

    const route: FlightRoute = {};

    if (latestFlight.estDepartureAirport) {
      route.departureAirport = getAirportInfo(latestFlight.estDepartureAirport) || {
        icao: latestFlight.estDepartureAirport,
        name: 'Unknown Airport',
        city: latestFlight.estDepartureAirport,
        country: ''
      };
    }

    if (latestFlight.estArrivalAirport) {
      route.arrivalAirport = getAirportInfo(latestFlight.estArrivalAirport) || {
        icao: latestFlight.estArrivalAirport,
        name: 'Unknown Airport',
        city: latestFlight.estArrivalAirport,
        country: ''
      };
    }

    return route;
  } catch (error) {
    console.error('Error fetching flight route:', error);
    return {};
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
