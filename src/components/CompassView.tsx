"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sunrise, Sunset } from "lucide-react";
import * as SunCalc from "suncalc";

export default function CompassView({ onClose }: { onClose: () => void }) {
  const [heading, setHeading] = useState(0);
  const [targetAzimuth, setTargetAzimuth] = useState(0);
  const [eventType, setEventType] = useState<"sunrise" | "sunset">("sunrise");
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [sensorStatus, setSensorStatus] = useState<"idle" | "requesting" | "active" | "denied">("idle");
  const [needleColor, setNeedleColor] = useState("rgb(255, 90, 95)");
  const [discoveryPhase, setDiscoveryPhase] = useState<"idle" | "twilight" | "message" | "done">("idle");
  const [twilightOpacity, setTwilightOpacity] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showAlternativeEvent, setShowAlternativeEvent] = useState(false);
  const alignmentTimer = useRef<NodeJS.Timeout | null>(null);

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
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn(err),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    if (!userLocation) return;
    const { lat, lng } = userLocation;
    const now = new Date();
    const times = SunCalc.getTimes(now, lat, lng);
    
    if (!times.sunrise || !times.sunset) return; // Segurança para latitudes extremas

    let defaultTime: Date;
    let defaultType: "sunrise" | "sunset";
    let altTime: Date;
    let altType: "sunrise" | "sunset";
    
    if (now > times.sunrise && now < times.sunset) {
      // De dia: default é Pôr do Sol
      defaultTime = times.sunset;
      defaultType = "sunset";
      // Alt é Nascer do Sol de amanhã
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      altTime = SunCalc.getTimes(tomorrow, lat, lng).sunrise || tomorrow;
      altType = "sunrise";
    } else {
      // De noite/madrugada: default é Nascer do Sol
      defaultType = "sunrise";
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      if (now > times.sunset) {
        // Já passou do por do sol hoje, nascer de amanhã
        defaultTime = SunCalc.getTimes(tomorrow, lat, lng).sunrise || tomorrow;
        // Alt é Pôr do Sol de amanhã
        altTime = SunCalc.getTimes(tomorrow, lat, lng).sunset || tomorrow;
        altType = "sunset";
      } else {
        // Madrugada, nascer de hoje
        defaultTime = times.sunrise;
        // Alt é Pôr do Sol de hoje
        altTime = times.sunset;
        altType = "sunset";
      }
    }
    
    const activeTime = showAlternativeEvent ? altTime : defaultTime;
    const activeType = showAlternativeEvent ? altType : defaultType;

    setTargetDate(activeTime);
    setEventType(activeType);

    const position = SunCalc.getPosition(activeTime, lat, lng);
    // Converter azimuth de radianos a partir do Sul para graus a partir do Norte
    let az = position.azimuth * 180 / Math.PI; 
    let azimuthDeg = (az + 180) % 360;
    if (azimuthDeg < 0) azimuthDeg += 360;
    
    // O usuário relatou que a direção Leste/Oeste está invertida no dispositivo.
    // Para corrigir esse espelhamento do giroscópio absoluto do Android ou do SunCalc, invertemos o eixo E/W:
    // ARREDONDAMENTO PARA EVITAR TREMOR DA AGULHA:
    azimuthDeg = Math.round((360 - azimuthDeg) % 360);
    
    setTargetAzimuth(azimuthDeg);
  }, [userLocation, showAlternativeEvent]);

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

    // Filtro Passa-Baixa
    let smoothedHeading = current + diff * 0.15; 
    
    lastHeading.current = smoothedHeading;
    setHeading(smoothedHeading);
  };

  // Atualizar cor dinâmica baseada na proximidade
  useEffect(() => {
    // Diferença angular de 0 (alinhado) a 180 (oposto)
    const diff = Math.abs(((heading - targetAzimuth + 540) % 360) - 180);
    const ratio = diff / 180;
    
    // Quente (Alinhado): rgb(255, 90, 95) - Coral
    // Frio (Oposto): rgb(59, 130, 246) - Azul
    const r = Math.round(255 - ratio * (255 - 59));
    const g = Math.round(90 - ratio * (90 - 130));
    const b = Math.round(95 - ratio * (95 - 246));
    
    setNeedleColor(`rgb(${r}, ${g}, ${b})`);

    // Controle de Opacidade do Fundo Crepuscular
    if (discoveryPhase === "done") {
      // 0 diff = 1 opacity. 35+ diff = 0 opacity.
      const op = Math.max(0, 1 - (diff / 35));
      setTwilightOpacity(op);
    } else if (discoveryPhase === "twilight" || discoveryPhase === "message") {
      setTwilightOpacity(1);
    } else {
      setTwilightOpacity(0);
    }

    // Disparar o "Aha Moment" se a mira ficar muito próxima (menos de 8 graus) e estabilizar
    if (diff < 8 && sensorStatus === "active" && discoveryPhase === "idle") {
      if (!alignmentTimer.current) {
        alignmentTimer.current = setTimeout(() => {
          setDiscoveryPhase("twilight");
          
          // Sequência de animação
          setTimeout(() => {
            setDiscoveryPhase("message"); // Fades out compass, fades in message
            
            setTimeout(() => {
              setDiscoveryPhase("done"); // Fades message out, compass back in
            }, 4000); // Mensagem dura 4 segundos na tela
            
          }, 2500); // Gradiente pulsa por 2.5s antes da mensagem
          
        }, 1500); // Exige manter a mira cravada por 1.5 segundos
      }
    } else if (diff > 15 || sensorStatus !== "active") {
      // HISTERESE: Se tremer para fora da zona de tolerância (>15 graus), cancela
      if (alignmentTimer.current && discoveryPhase === "idle") {
        clearTimeout(alignmentTimer.current);
        alignmentTimer.current = null;
      }
    }
  }, [heading, targetAzimuth, discoveryPhase, sensorStatus]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (!targetDate) return;
    const updateCountdown = () => {
      const diff = targetDate.getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeRemaining("Agora!");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown(); 
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isDarkTheme = twilightOpacity > 0.4;
  const hideCompass = discoveryPhase === "message";

  return (
    <div className="flex-1 w-full bg-white flex flex-col items-center justify-center relative overflow-hidden text-gray-900 z-10 transition-colors duration-1000">
      
      {/* Twilight Animation Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-linear"
        style={{
          background: 'linear-gradient(to top, #ff9a44, #fc6076, #3b82f6)',
          opacity: twilightOpacity
        }}
      >
         {/* Animated Sun Glow */}
         <div className={`absolute left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ffdd55] rounded-full blur-[60px] opacity-80 transition-all duration-300 ${twilightOpacity > 0 ? 'bottom-20 scale-150' : '-bottom-20 scale-50'}`}></div>
      </div>
      
      {sensorStatus !== "active" ? (
        <div className="z-30 text-center px-6">
          <h2 className="text-2xl font-bold mb-4">Ativar Bússola Solar</h2>
          <p className="text-gray-500 mb-8">Precisamos acessar sua bússola e GPS para te guiar até onde o Sol vai nascer ou se pôr.</p>
          <button 
            onClick={startSensors}
            className="bg-[#ff5a5f] text-white py-4 px-8 rounded-full font-bold text-lg shadow-[0_10px_15px_-3px_rgba(255,90,95,0.4)] active:scale-95 transition-transform"
          >
            Permitir Acesso
          </button>
        </div>
      ) : (
        <>
          {/* Organic Success Message (Centralizada, sem modal) */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 z-30 transition-all duration-[1500ms] pointer-events-none ${discoveryPhase === "message" ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <p className="text-white text-5xl font-extrabold mb-4 text-center leading-tight">Perfeito!</p>
            <p className="text-white/95 text-2xl font-medium text-center drop-shadow-md">É para lá que você deve apontar sua câmera!</p>
          </div>

          <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${hideCompass ? 'opacity-0' : 'opacity-100'}`}>
            {/* Toggle Alternative Event Button */}
            <div className="absolute top-6 right-6 z-40">
              <button
                onClick={() => {
                  setShowAlternativeEvent(!showAlternativeEvent);
                  setDiscoveryPhase("idle");
                  setTwilightOpacity(0);
                }}
                className={`px-4 py-2 rounded-full font-bold text-sm shadow-md transition-colors duration-300 ${isDarkTheme ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Próximo {eventType === "sunrise" ? "Pôr" : "Nascer"} do Sol
              </button>
            </div>

            {/* Decorative Radars */}
            <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-dashed border-gray-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
            <div className="absolute w-[150px] h-[150px] rounded-full border-2 border-dashed border-gray-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
            
            {/* Target Indicator */}
            <div className={`absolute top-16 font-bold text-xl flex flex-col items-center z-20 left-1/2 -translate-x-1/2 w-full transition-colors duration-[800ms] ${isDarkTheme ? 'text-white' : 'text-[#ff5a5f]'}`}>
              {eventType === "sunrise" ? <Sunrise size={32} className="mb-2" /> : <Sunset size={32} className="mb-2" />}
              <span>{eventType === "sunrise" ? "Nascer do Sol" : "Pôr do Sol"}</span>
            </div>

            {/* Compass World (Rotates via CSS based on real sensor) */}
            <div 
              className="absolute w-[300px] h-[300px] top-1/2 left-1/2 transition-transform duration-75 ease-linear pointer-events-none"
              style={{ transform: `translate(-50%, -50%) rotate(${-heading}deg)` }}
            >
              {/* Cardinal Indicators (Fixos na borda do círculo de 300px) */}
              <div className={`absolute top-2 left-1/2 -translate-x-1/2 font-bold text-lg transition-colors duration-[800ms] ${isDarkTheme ? 'text-white/80' : 'text-gray-400'}`}>N</div>
              <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-lg transition-colors duration-[800ms] ${isDarkTheme ? 'text-white/80' : 'text-gray-400'}`}>S</div>
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 font-bold text-lg transition-colors duration-[800ms] ${isDarkTheme ? 'text-white/80' : 'text-gray-400'}`}>L</div>
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg transition-colors duration-[800ms] ${isDarkTheme ? 'text-white/80' : 'text-gray-400'}`}>O</div>

              {/* The needle pointing to the Target Azimuth in the rotated div */}
              <div 
                className="absolute w-full h-full top-0 left-0 transition-transform duration-500 ease-in-out"
                style={{ transform: `rotate(${targetAzimuth}deg)` }}
              >
                {/* Haste da agulha com gradiente que respeita a cor */}
                <div 
                  className="absolute w-1 h-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-full transition-colors duration-200"
                  style={{ background: `linear-gradient(to top, transparent, ${needleColor})` }}
                ></div>
                
                {/* Ponto na ponta da agulha */}
                <div 
                  className="absolute w-5 h-5 rounded-full top-[12%] left-1/2 -translate-x-1/2 transition-colors duration-200"
                  style={{ 
                    backgroundColor: needleColor, 
                    boxShadow: `0 0 15px 3px ${needleColor}80` // 80 é hex pra 50% opacity aproximado
                  }}
                ></div>
              </div>
            </div>
            
            {/* User Center (Fixo na tela, acima do mundo que gira) */}
            <div className={`absolute w-6 h-6 border-4 border-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-md transition-colors duration-[800ms] ${isDarkTheme ? 'bg-white' : 'bg-gray-900'}`}></div>

            {/* Info */}
            <div className="absolute bottom-24 text-center w-full px-6 z-20">
              <h2 className={`text-6xl font-extrabold mb-1 tracking-tight transition-colors duration-[800ms] ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {targetDate ? targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}
              </h2>
              <p className={`font-bold mb-4 uppercase tracking-widest text-sm transition-colors duration-[800ms] ${isDarkTheme ? 'text-white/90' : 'text-[#ff5a5f]'}`}>
                {timeRemaining ? `Faltam ${timeRemaining.replace("h ", "h").replace("m ", "m").replace("s", "s")}` : "Calculando..."}
              </p>
              <p className={`text-sm max-w-[260px] mx-auto transition-colors duration-[800ms] ${isDarkTheme ? 'text-white/80' : 'text-gray-500'}`}>
                Gire o celular até alinhar o ponto laranja com o {eventType === "sunrise" ? "Nascer" : "Pôr"} do Sol.
              </p>
            </div>
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
