
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Plane, X, ChevronUp, ChevronDown, Gauge, ArrowUp, Navigation, Globe, Compass } from 'lucide-react';
import { Flight } from '../types';

interface PlaneOverlayProps {
  onCapture: () => void;
  nearbyFlights: Flight[];
  capturedFlight: Flight | null;
  onClearCapture: () => void;
}

const PlaneOverlay: React.FC<PlaneOverlayProps> = ({
  onCapture,
  nearbyFlights,
  capturedFlight,
  onClearCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showFlightList, setShowFlightList] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (nearbyFlights.length === 0) return;

    // Flash effect
    setShowFlash(true);
    setShowSuccess(true);
    setTimeout(() => setShowFlash(false), 300);
    setTimeout(() => setShowSuccess(false), 1500);

    onCapture();
  };

  const formatAltitude = (meters: number | null) => {
    if (!meters) return 'N/A';
    const feet = Math.round(meters * 3.28084);
    return `${feet.toLocaleString()} ft`;
  };

  const formatSpeed = (ms: number | null) => {
    if (!ms) return 'N/A';
    const knots = Math.round(ms * 1.94384);
    return `${knots} kts`;
  };

  const getHeadingDirection = (degrees: number | null) => {
    if (degrees === null) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return `${directions[index]} (${Math.round(degrees)}°)`;
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Belgium': '🇧🇪',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'United Arab Emirates': '🇦🇪',
      'Qatar': '🇶🇦',
      'Turkey': '🇹🇷',
      'Morocco': '🇲🇦',
      'Portugal': '🇵🇹',
      'Ireland': '🇮🇪',
      'Poland': '🇵🇱',
      'Russia': '🇷🇺',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'South Korea': '🇰🇷',
      'Singapore': '🇸🇬',
      'Thailand': '🇹🇭',
      'Norway': '🇳🇴',
      'Sweden': '🇸🇪',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Greece': '🇬🇷',
    };
    return flags[country] || '✈️';
  };

  return (
    <div className="relative flex-1 bg-black overflow-hidden flex flex-col">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-[100] animate-flash pointer-events-none" />
      )}

      {/* AR-style Radar HUD */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-cyan-500/20 m-4 rounded-3xl">
        <div className="absolute top-1/2 left-0 w-8 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
        <div className="absolute top-1/2 right-0 w-8 h-[1px] bg-gradient-to-l from-cyan-500/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 w-[1px] h-8 bg-gradient-to-t from-cyan-500/50 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/30 rounded-full animate-radar-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-500/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
      </div>

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 pt-safe px-4 flex justify-between items-start z-30">
        <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            LIVE RADAR
          </div>
          <button
            onClick={() => setShowFlightList(!showFlightList)}
            className="flex items-center gap-1 text-slate-400 mt-1 uppercase hover:text-white transition-colors"
          >
            Nearby: {nearbyFlights.length}
            {showFlightList ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Quick Stats for Closest Flight */}
        {nearbyFlights.length > 0 && !capturedFlight && (
          <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-mono shadow-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-blue-400">
                <ArrowUp size={12} />
                {formatAltitude(nearbyFlights[0].baro_altitude)}
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Gauge size={12} />
                {formatSpeed(nearbyFlights[0].velocity)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flight List Modal */}
      {showFlightList && nearbyFlights.length > 0 && (
        <div className="absolute top-24 left-4 right-4 max-h-[40vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 z-40 shadow-2xl animate-slide-down">
          <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur-xl">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Plane className="text-cyan-400" size={16} />
              Nearby Aircraft ({nearbyFlights.length})
            </h3>
            <button onClick={() => setShowFlightList(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {nearbyFlights.slice(0, 10).map((flight, idx) => (
              <div key={flight.icao24} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className={`p-2.5 rounded-full ${idx === 0 ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-800'}`}>
                  <Plane className={`${idx === 0 ? 'text-cyan-400' : 'text-slate-400'} rotate-45`} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{flight.callsign || 'Unknown'}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span>{getCountryFlag(flight.origin_country)}</span>
                    {flight.origin_country}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-blue-400 font-medium">{formatAltitude(flight.baro_altitude)}</p>
                  <p className="text-slate-400">{flight.distance?.toFixed(1)} km</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Captured Flight Result Card */}
      {capturedFlight && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md z-50 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 w-full max-w-sm rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(34,211,238,0.15)] overflow-hidden animate-slide-up-scale">
            {/* Header */}
            <div className="relative h-28 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center overflow-hidden">
              <button
                onClick={onClearCapture}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all backdrop-blur-sm"
              >
                <X size={20} />
              </button>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
              <Plane size={36} className="text-white/30 absolute -rotate-12" style={{ top: '10%', left: '10%' }} />
              <Plane size={24} className="text-white/20 absolute rotate-45" style={{ bottom: '20%', right: '15%' }} />
              <div className="z-10 text-center">
                <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">✈️ Flight Detected</p>
                <h2 className="text-2xl font-black text-white tracking-tight">{capturedFlight.callsign || 'Unknown Flight'}</h2>
              </div>
            </div>

            {/* Flight Info Grid */}
            <div className="p-5 space-y-4">
              {/* Country */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5 animate-stagger" style={{ animationDelay: '100ms' }}>
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Globe className="text-cyan-400" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Origin Country</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">{getCountryFlag(capturedFlight.origin_country)}</span>
                    {capturedFlight.origin_country}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Altitude */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5 animate-stagger" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUp className="text-blue-400" size={14} />
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Altitude</p>
                  </div>
                  <p className="text-xl font-bold text-blue-400">{formatAltitude(capturedFlight.baro_altitude)}</p>
                </div>

                {/* Speed */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5 animate-stagger" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="text-amber-400" size={14} />
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Speed</p>
                  </div>
                  <p className="text-xl font-bold text-amber-400">{formatSpeed(capturedFlight.velocity)}</p>
                </div>

                {/* Distance */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5 animate-stagger" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="text-emerald-400" size={14} />
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Distance</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">{capturedFlight.distance?.toFixed(1)} km</p>
                </div>

                {/* Heading */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5 animate-stagger" style={{ animationDelay: '500ms' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Compass className="text-purple-400" size={14} />
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Heading</p>
                  </div>
                  <p className="text-xl font-bold text-purple-400">{getHeadingDirection(capturedFlight.true_track)}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center animate-stagger" style={{ animationDelay: '600ms' }}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${capturedFlight.on_ground
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${capturedFlight.on_ground ? 'bg-orange-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                  {capturedFlight.on_ground ? 'On Ground' : 'In Flight'}
                </div>
              </div>

              {/* ICAO ID */}
              <div className="text-center text-[10px] text-slate-500 font-mono animate-stagger" style={{ animationDelay: '700ms' }}>
                ICAO: {capturedFlight.icao24.toUpperCase()}
              </div>

              <button
                onClick={onClearCapture}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 animate-stagger"
                style={{ animationDelay: '800ms' }}
              >
                Return to Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar - Fixed at bottom with safe area support */}
      <div className="absolute bottom-0 left-0 right-0 pb-safe px-4 flex flex-col gap-4 items-center z-40">
        {/* Nearby Plane Peek */}
        {nearbyFlights.length > 0 && !capturedFlight && (
          <div className="w-full max-w-xs bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-500/30 to-blue-500/30 p-3 rounded-full">
                  <Plane className="text-cyan-400 rotate-45" size={22} />
                </div>
                <div className="absolute inset-0 bg-cyan-500/30 rounded-full animate-pulse-ring"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-cyan-400/80 uppercase tracking-tighter font-black">Closest Aircraft</p>
                <div className="flex justify-between items-baseline gap-2">
                  <p className="text-lg font-bold truncate">{nearbyFlights[0].callsign || 'Unknown'}</p>
                  <p className="text-xs text-slate-300 shrink-0">~{nearbyFlights[0].distance?.toFixed(1)} km</p>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <span>{getCountryFlag(nearbyFlights[0].origin_country)}</span>
                  {nearbyFlights[0].origin_country}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Flights Warning */}
        {nearbyFlights.length === 0 && !capturedFlight && (
          <div className="w-full max-w-xs bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/20 shadow-lg animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-3 rounded-full">
                <Plane className="text-orange-400" size={22} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-400">No Aircraft Nearby</p>
                <p className="text-xs text-slate-400">Scanning for flights in your area...</p>
              </div>
            </div>
          </div>
        )}

        {/* Capture Controls */}
        <div className="flex items-center justify-center gap-6 pb-2">
          <button
            onClick={() => window.location.reload()}
            className="p-4 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white hover:bg-slate-800 active:scale-95 transition-all min-w-[56px] min-h-[56px] flex items-center justify-center shadow-lg"
            aria-label="Refresh"
          >
            <RefreshCw size={24} />
          </button>

          <button
            disabled={nearbyFlights.length === 0}
            onClick={handleCapture}
            className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all min-w-[80px] min-h-[80px] ${nearbyFlights.length === 0
                ? 'bg-slate-600 border-slate-500 opacity-50 cursor-not-allowed'
                : 'bg-white border-white hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.4)]'
              } ${showSuccess ? 'animate-success-pulse' : ''}`}
            aria-label="Capture"
          >
            <Camera className={nearbyFlights.length === 0 ? 'text-slate-400' : 'text-slate-900'} size={32} />
            {showSuccess && (
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-success-ring"></div>
            )}
          </button>

          {/* Spacer for symmetry */}
          <div className="w-14 min-w-[56px]" />
        </div>
      </div>
    </div>
  );
};

export default PlaneOverlay;
