"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

import { supabase } from "@/lib/supabaseClient";

// Component to recenter map on user location
function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function MapComponent() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [spots, setSpots] = useState<any[]>([]);

  useEffect(() => {
    // Mock user location (Sao Paulo)
    setUserPos([-23.55052, -46.633308]);

    // Fetch spots from Supabase
    const fetchSpots = async () => {
      const { data, error } = await supabase.from("spots").select("*");
      if (!error && data) {
        setSpots(data);
      }
    };

    fetchSpots();
  }, []);

  if (!userPos) return <div className="flex-1 flex items-center justify-center bg-gray-100">Carregando Mapa...</div>;

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

        <RecenterAutomatically lat={userPos[0]} lng={userPos[1]} />

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
          {spots.map((spot) => (
            <Marker key={spot.id} position={[spot.lat, spot.lng]}>
              <Popup>{spot.title}</Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
