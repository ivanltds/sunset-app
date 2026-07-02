"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sunrise } from "lucide-react";
import * as SunCalc from "suncalc";

export default function CompassView({ onClose }: { onClose: () => void }) {
  const [heading, setHeading] = useState(0);
  const [targetAzimuth, setTargetAzimuth] = useState(0);
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
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          const now = new Date();
          let targetTime = SunCalc.getTimes(now, lat, lng).sunrise;
          
          if (now.getTime() > targetTime.getTime()) {
            // Se já passou do nascer do sol hoje, calcula para amanhã
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            targetTime = SunCalc.getTimes(tomorrow, lat, lng).sunrise;
          }
          
          const position = SunCalc.getPosition(targetTime, lat, lng);
          // Converter azimuth de radianos a partir do Sul para graus a partir do Norte
          const azimuthDeg = (position.azimuth * 180 / Math.PI) + 180;
          setTargetAzimuth(azimuthDeg);
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
    <div className="flex-1 w-full bg-white flex flex-col items-center justify-center relative overflow-hidden text-gray-900 z-10">
      
      {sensorStatus !== "active" ? (
        <div className="z-30 text-center px-6">
          <h2 className="text-2xl font-bold mb-4">Ativar Bússola</h2>
          <p className="text-gray-500 mb-8">Precisamos acessar sua bússola e GPS para te guiar até onde o Sol vai nascer.</p>
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
          <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-dashed border-gray-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
          <div className="absolute w-[150px] h-[150px] rounded-full border-2 border-dashed border-gray-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
          
          {/* Target Indicator */}
          <div className="absolute top-20 text-[#ff5a5f] font-bold text-xl flex flex-col items-center z-20">
            <Sunrise size={32} className="mb-2" />
            <span>Nascer do Sol</span>
          </div>

          {/* User Center */}
          <div className="absolute w-6 h-6 border-4 border-white bg-[#ff5a5f] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_15px_3px_rgba(255,90,95,0.4)]"></div>

          {/* Compass Needle (Rotates via CSS based on real sensor) */}
          <div 
            className="absolute w-full h-full top-0 left-0 transition-transform duration-75 ease-linear pointer-events-none"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            {/* The needle pointing to the Target Azimuth in the rotated div */}
            <div 
              className="absolute w-full h-full top-0 left-0 transition-transform duration-500 ease-in-out"
              style={{ transform: `rotate(${targetAzimuth}deg)` }}
            >
              <div className="absolute w-1 h-[140px] bg-gradient-to-t from-transparent to-[#ff5a5f] top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"></div>
              <div className="absolute w-4 h-4 bg-[#ff5a5f] rounded-full top-[15%] left-1/2 -translate-x-1/2 shadow-[0_0_15px_3px_rgba(255,90,95,0.4)]"></div>
            </div>
          </div>

          {/* Info */}
          <div className="absolute bottom-32 text-center w-full px-6 z-20">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Siga o Sol</h2>
            <p className="text-gray-500">Gire o celular até alinhar o ponto laranja com o Nascer do Sol.</p>
          </div>
        </>
      )}

      {/* Botão Fechar */}
      <button 
        className="absolute top-6 right-6 w-12 h-12 bg-white border border-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xl shadow-lg active:bg-gray-100 transition-colors"
        onClick={onClose}
      >
        <X size={24} />
      </button>
    </div>
  );
}
