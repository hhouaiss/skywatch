
export interface Flight {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  velocity: number;
  true_track: number;
  on_ground: boolean;
  distance?: number;
  isOverhead?: boolean; // true if within 0.2-0.9km (capturable)
}

export interface FlightRoute {
  departureAirport?: AirportInfo;
  arrivalAirport?: AirportInfo;
}

export interface AirportInfo {
  icao: string;
  name: string;
  city: string;
  country: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
