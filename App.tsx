
import React, { useState, useEffect, useCallback } from 'react';
import PlaneOverlay from './components/PlaneOverlay';
import { fetchNearbyFlights } from './services/flightService';
import { Flight, UserLocation } from './types';
import { Plane, Navigation, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [nearbyFlights, setNearbyFlights] = useState<Flight[]>([]);
  const [capturedFlight, setCapturedFlight] = useState<Flight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setPermissionGranted(true);
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
      }
    );
  }, []);

  // Poll for flight data
  useEffect(() => {
    if (!location) return;

    const getFlights = async () => {
      const flights = await fetchNearbyFlights(location);
      setNearbyFlights(flights);
    };

    getFlights();
    const interval = setInterval(getFlights, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [location]);

  const handleCapture = useCallback(() => {
    // When user captures, select the nearest flight
    if (nearbyFlights.length > 0) {
      setCapturedFlight(nearbyFlights[0]);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }
    }
  }, [nearbyFlights]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-950">
        <div className="bg-red-500/20 p-6 rounded-full">
          <ShieldCheck size={64} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold">Access Required</h1>
        <p className="text-slate-400 max-w-xs">{error}. Please enable camera and location permissions in your browser settings to use SkyWatch.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!permissionGranted || !location) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-slate-950">
        <div className="relative">
          <Plane size={80} className="text-blue-500 animate-bounce" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-blue-900/40 rounded-full blur-sm" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tighter">SKYWATCH</h1>
          <p className="text-slate-400 animate-pulse">Initializing Flight Systems...</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 px-4 py-2 rounded-full border border-white/5">
          <Navigation size={14} className="text-blue-400" />
          Awaiting GPS coordinates...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <PlaneOverlay
        onCapture={handleCapture}
        nearbyFlights={nearbyFlights}
        capturedFlight={capturedFlight}
        onClearCapture={() => setCapturedFlight(null)}
      />
    </div>
  );
};

export default App;
