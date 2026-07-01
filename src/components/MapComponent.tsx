"use client";

import { useEffect, useState } from "react";
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

// Component to detect map interactions
function MapInteractions({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click() {
      onMapClick();
    },
    dragstart() {
      onMapClick();
    }
  });
  return null;
}

export default function MapComponent({ onOpenCreator, onOpenCompass }: { onOpenCreator?: () => void, onOpenCompass?: () => void }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [spots, setSpots] = useState<any[]>([]);
  const [bookmarkedSpotIds, setBookmarkedSpotIds] = useState<Set<string>>(new Set());
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  
  // "full" (10% topo), "half" (50% topo), "collapsed" (85% topo)
  const [feedState, setFeedState] = useState<"full" | "half" | "collapsed">("half");

  useEffect(() => {
    // Buscar localização real do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.error("Erro de GPS:", err);
          setUserPos([-23.55052, -46.633308]); // Fallback Sao Paulo
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setUserPos([-23.55052, -46.633308]); // Fallback Sao Paulo
    }

    // Fetch spots from Supabase
    const fetchSpots = async () => {
      const { data, error } = await supabase.from("spots").select("*");
      if (!error && data) {
        setSpots(data);
      }
    };

    fetchSpots();
  }, []);

  if (!userPos) return <div className="flex-1 flex items-center justify-center bg-gray-100">Obtendo GPS...</div>;

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
        <MapInteractions onMapClick={() => setFeedState("collapsed")} />

        {/* User Marker */}
        <Marker position={userPos} icon={userIcon}>
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
            
            // Construir HTML customizado para o ícone
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
              className: 'custom-leaflet-div-icon', // Classe vazia para resetar estilos default do leaflet
              iconSize: [48, 48],
              iconAnchor: [24, 24],
              popupAnchor: [0, -24],
            });

            return (
              <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={icon} zIndexOffset={1000}>
                <Popup>{spot.title}</Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
      
      {/* Bottom Controls Overlay (visible when feed is collapsed) */}
      <div 
        className={`absolute bottom-6 w-full px-5 flex justify-between items-center z-[1000] transition-opacity duration-300 ${feedState === "collapsed" ? "opacity-100 pointer-events-none" : "opacity-0 pointer-events-none"}`}
      >
        <button 
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 text-gray-700 pointer-events-auto active:bg-gray-50"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setUserPos([pos.coords.latitude, pos.coords.longitude]);
                  setRecenterTrigger(prev => prev + 1);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
              );
            }
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
          className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg border border-gray-800 pointer-events-auto active:bg-gray-800 transition-colors"
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
        spots={spots} 
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
