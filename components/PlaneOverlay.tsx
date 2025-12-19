
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Plane, Info, X, ChevronUp, ChevronDown, Gauge, ArrowUp } from 'lucide-react';
import { Flight, PlaneAnalysis } from '../types';

interface PlaneOverlayProps {
  onCapture: (base64: string) => void;
  nearbyFlights: Flight[];
  isAnalyzing: boolean;
  analysis: PlaneAnalysis | null;
  onClearAnalysis: () => void;
}

const PlaneOverlay: React.FC<PlaneOverlayProps> = ({ 
  onCapture, 
  nearbyFlights, 
  isAnalyzing, 
  analysis,
  onClearAnalysis
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showFlightList, setShowFlightList] = useState(false);

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
    if (videoRef.current && canvasRef.current) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Flash effect
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        onCapture(base64);
      }
    }
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
      <div className="absolute inset-0 pointer-events-none border-[1px] border-emerald-500/20 m-4 rounded-3xl">
        <div className="absolute top-1/2 left-0 w-8 h-[1px] bg-emerald-500/50"></div>
        <div className="absolute top-1/2 right-0 w-8 h-[1px] bg-emerald-500/50"></div>
        <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-emerald-500/50"></div>
        <div className="absolute bottom-0 left-1/2 w-[1px] h-8 bg-emerald-500/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/30 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-emerald-500/10 rounded-full"></div>
      </div>

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 pt-safe px-4 flex justify-between items-start z-30">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
        {nearbyFlights.length > 0 && !analysis && (
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-xs font-mono">
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
        <div className="absolute top-20 left-4 right-4 max-h-[40vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 z-40 animate-in slide-in-from-top-2">
          <div className="p-3 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95">
            <h3 className="font-bold text-sm">Nearby Aircraft ({nearbyFlights.length})</h3>
            <button onClick={() => setShowFlightList(false)} className="p-1 hover:bg-white/10 rounded-full">
              <X size={16} />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {nearbyFlights.slice(0, 10).map((flight, idx) => (
              <div key={flight.icao24} className="p-3 flex items-center gap-3 hover:bg-white/5">
                <div className={`p-2 rounded-full ${idx === 0 ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                  <Plane className={`${idx === 0 ? 'text-emerald-400' : 'text-slate-400'} rotate-45`} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{flight.callsign || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{flight.origin_country}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-blue-400">{formatAltitude(flight.baro_altitude)}</p>
                  <p className="text-slate-400">{flight.distance?.toFixed(1)} km</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Result Card */}
      {analysis && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm z-50">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
              <button 
                onClick={onClearAnalysis}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white active:scale-95 transition-transform"
              >
                <X size={20} />
              </button>
              <Plane size={48} className="text-white/40 absolute" />
              <h2 className="text-xl font-bold text-white z-10">Aircraft Identified</h2>
            </div>
            
            <div className="p-5 space-y-4">
              {analysis.isPlane ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Airline</p>
                      <p className="text-lg font-semibold text-emerald-400">{analysis.airline || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Type</p>
                      <p className="text-lg font-semibold">{analysis.aircraftType || 'Jet'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Visual ID</p>
                    <p className="text-sm italic text-slate-200">{analysis.liveryDescription}</p>
                  </div>

                  {analysis.interestingFact && (
                    <div className="flex gap-3 text-sm text-slate-300 border-t border-white/10 pt-4">
                      <Info size={24} className="text-blue-400 shrink-0" />
                      <p>{analysis.interestingFact}</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 text-right">
                    Match Confidence: {(analysis.confidence * 100).toFixed(0)}%
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400">No clear aircraft detected. Try pointing your camera directly at the flying plane and hold steady.</p>
                </div>
              )}
              
              <button 
                onClick={onClearAnalysis}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 py-3 rounded-xl font-bold transition-colors active:scale-[0.98]"
              >
                Return to View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar - Fixed at bottom with safe area support */}
      <div className="absolute bottom-0 left-0 right-0 pb-safe px-4 flex flex-col gap-4 items-center z-40">
        {/* Nearby Plane Peek */}
        {nearbyFlights.length > 0 && !analysis && (
          <div className="w-full max-w-xs bg-slate-900/80 backdrop-blur-lg rounded-2xl p-3 border border-white/10 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-emerald-500/20 p-2 rounded-full">
                    <Plane className="text-emerald-400 rotate-45" size={20} />
                  </div>
                  <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-pulse-ring"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-emerald-400/80 uppercase tracking-tighter font-black">Closest Active</p>
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-lg font-bold truncate">{nearbyFlights[0].callsign}</p>
                    <p className="text-xs text-slate-300 shrink-0">~{nearbyFlights[0].distance?.toFixed(1)} km</p>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* Capture Controls */}
        <div className="flex items-center justify-center gap-6 pb-2">
           <button 
             onClick={() => window.location.reload()}
             className="p-4 rounded-full bg-slate-900/80 border border-white/10 text-white hover:bg-slate-800 active:scale-95 transition-transform min-w-[56px] min-h-[56px] flex items-center justify-center"
             aria-label="Refresh"
           >
             <RefreshCw size={24} />
           </button>

           <button 
            disabled={isAnalyzing}
            onClick={handleCapture}
            className={`relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all min-w-[80px] min-h-[80px] ${isAnalyzing ? 'bg-slate-600 opacity-50' : 'bg-white hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]'}`}
            aria-label="Capture"
           >
             {isAnalyzing ? (
               <RefreshCw className="text-slate-900 animate-spin" size={32} />
             ) : (
               <Camera className="text-slate-900" size={32} />
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
