"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function CompassView({ onClose }: { onClose: () => void }) {
  const [heading, setHeading] = useState(0);
  const [distance, setDistance] = useState(120); // Placeholder distance
  const [sensorStatus, setSensorStatus] = useState<"idle" | "requesting" | "active" | "denied">("idle");

  const startSensors = async () => {
    setSensorStatus("requesting");
    
    // Request Gyroscope (iOS 13+ requires explicit permission)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setSensorStatus("active");
        } else {
          setSensorStatus("denied");
          alert("Permissão do giroscópio negada.");
        }
      } catch (error) {
        console.error(error);
        setSensorStatus("denied");
      }
    } else {
      // Non-iOS 13 devices
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      // Fallback if absolute is not supported
      window.addEventListener('deviceorientation', handleOrientation, true);
      setSensorStatus("active");
    }

    // Request GPS
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          // Just a mock distance update based on tiny GPS fluctuations
          setDistance(Math.floor(120 + (Math.random() * 5 - 2)));
        },
        (err) => console.warn(err),
        { enableHighAccuracy: true }
      );
    }
  };

  const lastHeading = useRef(0);

  const handleOrientation = (event: any) => {
    let alpha = event.alpha;
    let webkitCompassHeading = event.webkitCompassHeading;
    let rawHeading = 0;

    if (webkitCompassHeading !== undefined) {
      // iOS
      rawHeading = webkitCompassHeading;
    } else if (alpha !== null) {
      // Android (absolute orientation)
      rawHeading = 360 - alpha;
    }

    // Lógica para evitar a "pirueta" quando o ângulo passa de 359 pra 0
    let current = lastHeading.current;
    
    // Calcula o ângulo equivalente mais próximo (-180 a +180)
    let diff = rawHeading - (current % 360);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // Filtro Passa-Baixa (Suaviza o tremor absurdo dos sensores Android)
    // Movimenta o ponteiro em "degraus" macios de 15% em direção ao alvo real
    let smoothedHeading = current + diff * 0.15; 
    
    lastHeading.current = smoothedHeading;
    setHeading(smoothedHeading);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  return (
    <div className="flex-1 w-full bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden text-white z-10">
      
      {sensorStatus !== "active" ? (
        <div className="z-30 text-center px-6">
          <h2 className="text-2xl font-bold mb-4">Ativar Sensores</h2>
          <p className="text-gray-400 mb-8">Precisamos acessar sua bússola e GPS para te guiar até o Spot.</p>
          <button 
            onClick={startSensors}
            className="bg-[#ff5a5f] text-white py-4 px-8 rounded-full font-bold text-lg shadow-[0_10px_15px_-3px_rgba(255,90,95,0.4)] active:scale-95 transition-transform"
          >
            Permitir Acesso
          </button>
        </div>
      ) : (
        <>
          {/* Decorative Radars */}
          <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-dashed border-gray-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
          <div className="absolute w-[150px] h-[150px] rounded-full border-2 border-dashed border-gray-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
          
          {/* Norte Indicator */}
          <div className="absolute top-20 text-red-500 font-bold text-xl z-20">N</div>

          {/* User Center */}
          <div className="absolute w-6 h-6 border-4 border-gray-900 bg-blue-500 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_15px_3px_rgba(59,130,246,0.5)]"></div>

          {/* Compass Needle (Rotates via CSS based on real sensor) */}
          <div 
            className="absolute w-full h-full top-0 left-0 transition-transform duration-75 ease-linear pointer-events-none"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            {/* The needle pointing "North" in the rotated div */}
            <div className="absolute w-1 h-[140px] bg-gradient-to-t from-transparent to-[#ff5a5f] top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"></div>
            <div className="absolute w-4 h-4 bg-white rounded-full top-[15%] left-1/2 -translate-x-1/2 shadow-[0_0_15px_3px_rgba(255,255,255,0.8)]"></div>
          </div>

          {/* Distance Info */}
          <div className="absolute bottom-32 text-center w-full px-6 z-20">
            <h2 className="text-5xl font-extrabold text-white mb-2">{distance}m</h2>
            <p className="text-gray-400">Gire o celular até alinhar o ponto branco com o Norte.</p>
          </div>
        </>
      )}

      {/* Botão Fechar */}
      <button 
        className="absolute top-6 right-6 w-12 h-12 bg-gray-900 border border-gray-800 text-white rounded-full flex items-center justify-center text-xl shadow-lg active:bg-gray-800 transition-colors"
        onClick={onClose}
      >
        <X size={24} />
      </button>
    </div>
  );
}
