"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// @ts-ignore - react-leaflet-cluster doesnt have perfect types
import MarkerClusterGroup from "react-leaflet-cluster";

// Fix for default marker icons in Leaflet with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom User Marker Icon
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

import { LocateFixed, Camera, Compass } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import FeedView from "./FeedView";

// Component to recenter map on user location
function RecenterAutomatically({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14, { animate: true });
  }, [lat, lng, trigger, map]);
  return null;
}

// Component to detect map interactions and bounds changes
interface MapInteractionsProps {
  onMapClick: () => void;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}

function MapInteractions({ onMapClick, onBoundsChange }: MapInteractionsProps) {
  const map = useMapEvents({
    click() {
      onMapClick();
    },
    dragstart() {
      onMapClick();
    },
    moveend() {
      onBoundsChange(map.getBounds());
    },
    zoomend() {
      onBoundsChange(map.getBounds());
    }
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map]);

  return null;
}

interface MapComponentProps {
  userPos: [number, number];
  onOpenCreator?: () => void;
  onOpenCompass?: () => void;
}

export default function MapComponent({ userPos, onOpenCreator, onOpenCompass }: MapComponentProps) {
  const [spots, setSpots] = useState<any[]>([]);
  const [bookmarkedSpotIds, setBookmarkedSpotIds] = useState<Set<string>>(new Set());
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [heading, setHeading] = useState(0);
  
  // "full" (10% topo), "half" (50% topo), "collapsed" (85% topo)
  const [feedState, setFeedState] = useState<"full" | "half" | "collapsed">("half");
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Filtrar spots visíveis na viewport do mapa (memorizado)
  const visibleSpots = useMemo(() => {
    return spots.filter(spot => {
      if (!mapBounds) return true;
      return mapBounds.contains([spot.lat, spot.lng]);
    });
  }, [spots, mapBounds]);

  // Se houver spot selecionado por clique, mostramos apenas ele. Senão, os visíveis. (memorizado)
  const spotsForFeed = useMemo(() => {
    if (selectedSpotId) {
      return spots.filter(s => s.id === selectedSpotId);
    }
    return visibleSpots;
  }, [spots, selectedSpotId, visibleSpots]);

  // Rastrear orientação do dispositivo (Bússola) para a seta 3D
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading é nativo do Safari/iOS. alpha é o padrão, corrigido
      const headingVal = (e as any).webkitCompassHeading !== undefined
        ? (e as any).webkitCompassHeading
        : (e.alpha !== null ? 360 - e.alpha : 0);
      
      setHeading(headingVal);
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  // Fetch dos spots do Supabase
  useEffect(() => {
    const fetchSpots = async () => {
      const { data, error } = await supabase.from("spots").select("*");
      if (!error && data) {
        setSpots(data);
      }
    };

    fetchSpots();
  }, []);

  // Seta 3D rotativa com base na bússola do celular (SVG inline ultra-nítido e 100% transparente)
  const dynamicUserIcon = L.divIcon({
    className: "custom-user-pointer-leaflet-icon",
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.1s ease-out; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 6px 8px rgba(0,0,0,0.35));">
          <defs>
            <linearGradient id="sunset-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ff5a5f" />
              <stop offset="50%" stop-color="#ff7e5f" />
              <stop offset="100%" stop-color="#feb47b" />
            </linearGradient>
            <linearGradient id="border-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="white" stop-opacity="0.8" />
              <stop offset="100%" stop-color="black" stop-opacity="0.2" />
            </linearGradient>
          </defs>
          <!-- Extrusão 3D (Base escura deslocada) -->
          <path d="M50 5 L85 80 L50 68 L15 80 Z" fill="#b83b3f" />
          <!-- Face Principal -->
          <path d="M50 8 L82 76 L50 65 L18 76 Z" fill="url(#sunset-grad)" stroke="url(#border-glow)" stroke-width="1.5" />
          <!-- Vinco de Luz Central -->
          <path d="M50 8 L50 65" stroke="white" stroke-opacity="0.4" stroke-width="2" />
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={userPos} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* Light / High Contrast Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        <RecenterAutomatically lat={userPos[0]} lng={userPos[1]} trigger={recenterTrigger} />
        <MapInteractions 
          onMapClick={() => {
            setFeedState("collapsed");
            setSelectedSpotId(null); // Limpa seleção ao clicar no mapa
          }} 
          onBoundsChange={setMapBounds}
        />

        {/* User Marker usando a seta 3D rotacionável */}
        <Marker position={userPos} icon={dynamicUserIcon}>
          <Popup>Você está aqui!</Popup>
        </Marker>

        {/* Clustering Spots */}
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={50}
        >
          {spots.map((spot) => {
            const isSaved = bookmarkedSpotIds.has(spot.id);
            
            // Construir HTML customizado para o ícone do Spot
            const iconHtml = `
              <div style="position: relative; width: 48px; height: 48px; filter: drop-shadow(0px 8px 8px rgba(0,0,0,0.25)); transition: transform 0.2s; cursor: pointer;">
                <img src="/camera_3d.png" style="width: 100%; height: 100%; object-fit: contain;" alt="Camera" />
                ${isSaved ? `
                  <div style="position: absolute; top: -6px; right: -6px; width: 28px; height: 28px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.3));">
                    <img src="/star_3d.png" style="width: 100%; height: 100%; object-fit: contain;" alt="Saved" />
                  </div>
                ` : ''}
              </div>
            `;

            const icon = new L.DivIcon({
              html: iconHtml,
              className: 'custom-leaflet-div-icon',
              iconSize: [48, 48],
              iconAnchor: [24, 24],
              popupAnchor: [0, -24],
            });

            return (
              <Marker 
                key={spot.id} 
                position={[spot.lat, spot.lng]} 
                icon={icon} 
                zIndexOffset={1000}
                eventHandlers={{
                  click: (e) => {
                    // Previne que o clique limpe a seleção no clique do mapa
                    L.DomEvent.stopPropagation(e);
                    setSelectedSpotId(spot.id);
                    setFeedState("half"); // Abre o feed para focar nas fotos do Spot
                  }
                }}
              >
                <Popup>{spot.title}</Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
      
      {/* Bottom Controls Overlay (Posicionado de forma responsiva logo acima do topo do sheet do feed) */}
      <div 
        className={`absolute bottom-[6.5vh] left-1/2 -translate-x-1/2 w-[90%] max-w-md flex justify-between items-center z-[1000] transition-all duration-300 ${feedState === "collapsed" ? "opacity-100 pointer-events-none" : "opacity-0 pointer-events-none"}`}
      >
        <button 
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 text-gray-700 pointer-events-auto active:bg-gray-50 active:scale-95 transition-transform"
          onClick={() => {
            setRecenterTrigger(prev => prev + 1); // Recentraliza instantaneamente com a posição cacheada
          }}
          disabled={feedState !== "collapsed"}
        >
          <LocateFixed size={22} />
        </button>
        
        <button 
          className="flex-1 mx-4 bg-[#ff5a5f] text-white py-3 px-6 rounded-full font-bold text-lg shadow-[0_10px_15px_-3px_rgba(255,90,95,0.4)] pointer-events-auto active:scale-95 transition-transform flex items-center justify-center gap-2"
          onClick={() => {
            if (onOpenCreator && feedState === "collapsed") onOpenCreator();
          }}
          disabled={feedState !== "collapsed"}
        >
          <Camera size={22} /> Novo Spot
        </button>

        <button 
          className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg border border-gray-800 pointer-events-auto active:bg-gray-800 active:scale-95 transition-all"
          onClick={() => {
            if (onOpenCompass && feedState === "collapsed") onOpenCompass();
          }}
          disabled={feedState !== "collapsed"}
        >
          <Compass size={22} />
        </button>
      </div>

      {/* Feed Bottom Sheet */}
      <FeedView 
        spots={spotsForFeed} 
        userPos={userPos}
        feedState={feedState}
        setFeedState={setFeedState}
        onBookmarksLoaded={(ids) => setBookmarkedSpotIds(new Set(ids))}
        onBookmarkChange={(spotId, isBookmarked) => {
          setBookmarkedSpotIds(prev => {
            const next = new Set(prev);
            if (isBookmarked) next.add(spotId);
            else next.delete(spotId);
            return next;
          });
        }} 
      />
    </div>
  );
}
