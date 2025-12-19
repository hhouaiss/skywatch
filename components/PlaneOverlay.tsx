
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Plane, Info, X } from 'lucide-react';
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

  return (
    <div className="relative flex-1 bg-black overflow-hidden flex flex-col">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* AR-style Radar HUD */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-emerald-500/20 m-4 rounded-3xl">
        <div className="absolute top-1/2 left-0 w-8 h-[1px] bg-emerald-500/50"></div>
        <div className="absolute top-1/2 right-0 w-8 h-[1px] bg-emerald-500/50"></div>
        <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-emerald-500/50"></div>
        <div className="absolute bottom-0 left-1/2 w-[1px] h-8 bg-emerald-500/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/30 rounded-full"></div>
      </div>

      {/* Top Info Bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE RADAR ACTIVE
          </div>
          <div className="text-slate-400 mt-1 uppercase">
            Nearby: {nearbyFlights.length} Tracking
          </div>
        </div>
      </div>

      {/* Analysis Result Card */}
      {analysis && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm z-50">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
              <button 
                onClick={onClearAnalysis}
                className="absolute top-3 right-3 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white"
              >
                <X size={20} />
              </button>
              <Plane size={48} className="text-white/40 absolute" />
              <h2 className="text-xl font-bold text-white z-10">Aircraft Identified</h2>
            </div>
            
            <div className="p-6 space-y-4">
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
                <div className="text-center py-8">
                  <p className="text-slate-400">No clear aircraft detected. Try pointing your camera directly at the flying plane and hold steady.</p>
                </div>
              )}
              
              <button 
                onClick={onClearAnalysis}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-colors"
              >
                Return to View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="absolute bottom-8 left-0 right-0 px-6 flex flex-col gap-6 items-center">
        {/* Nearby Plane Peek */}
        {nearbyFlights.length > 0 && !analysis && (
          <div className="w-full max-w-xs bg-slate-900/60 backdrop-blur-lg rounded-2xl p-4 border border-white/10 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-full">
                  <Plane className="text-emerald-400 rotate-45" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-emerald-400/80 uppercase tracking-tighter font-black">Closest Active Transponder</p>
                  <div className="flex justify-between items-baseline">
                    <p className="text-lg font-bold">{nearbyFlights[0].callsign}</p>
                    <p className="text-xs text-slate-300">~{nearbyFlights[0].distance?.toFixed(1)} km</p>
                  </div>
                </div>
             </div>
          </div>
        )}

        <div className="flex items-center gap-8">
           <button 
             onClick={() => window.location.reload()}
             className="p-4 rounded-full bg-slate-900/60 border border-white/10 text-white hover:bg-slate-800"
           >
             <RefreshCw size={24} />
           </button>

           <button 
            disabled={isAnalyzing}
            onClick={handleCapture}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isAnalyzing ? 'bg-slate-600 opacity-50' : 'bg-white hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]'}`}
           >
             {isAnalyzing ? (
               <RefreshCw className="text-slate-900 animate-spin" size={32} />
             ) : (
               <Camera className="text-slate-900" size={32} />
             )}
           </button>

           <div className="w-14" /> {/* Spacer */}
        </div>
      </div>
    </div>
  );
};

export default PlaneOverlay;
