
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
  distance?: number; // Calculated distance from user
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
