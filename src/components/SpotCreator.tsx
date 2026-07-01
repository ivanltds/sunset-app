"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient";
import { processAndWatermarkImage } from "@/lib/watermark";

// Fix leaflet icon
const defaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para o marcador arrastável
function DraggableMarker({ pos, setPos }: { pos: [number, number], setPos: (pos: [number, number]) => void }) {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latlng = marker.getLatLng();
        setPos([latlng.lat, latlng.lng]);
      }
    },
  };
  return <Marker draggable eventHandlers={eventHandlers} position={pos} ref={markerRef} icon={defaultIcon} />;
}

interface SpotCreatorProps {
  initialPos: [number, number];
  onClose: () => void;
  onSuccess: () => void;
}

export default function SpotCreator({ initialPos, onClose, onSuccess }: SpotCreatorProps) {
  const [pos, setPos] = useState<[number, number]>(initialPos);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async () => {
    if (!file || !title || !pos) {
      setError("Preencha todos os campos e tire a foto!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Processar e colocar Marca d'Água
      const watermarkedBlob = await processAndWatermarkImage(file, "Sunset App");
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      // 2. Upload pro Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from("spots")
        .upload(filename, watermarkedBlob, { contentType: "image/jpeg" });

      if (storageError) throw storageError;

      // Pegar URL Pública
      const { data: publicUrlData } = supabase.storage.from("spots").getPublicUrl(filename);
      const imageUrl = publicUrlData.publicUrl;

      // 3. Pegar a sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Você não está autenticado (sessão fantasma não encontrada).");
      }

      // 4. Salvar no Banco com o ID real da sessão, solicitando o ID do Spot criado
      const { data: spotData, error: dbError } = await supabase
        .from("spots")
        .insert({
          title,
          lat: pos[0],
          lng: pos[1],
          user_id: session.user.id,
          image_url: imageUrl
        })
        .select("id")
        .single();

      if (dbError) {
         console.warn("Falha no Insert com user_id. Tentando sem user_id estrito ou reportando", dbError);
         throw dbError;
      }

      // 5. Salvar a foto também na tabela vinculada spot_photos para aparecer no feed!
      if (spotData) {
        const { error: photoError } = await supabase
          .from("spot_photos")
          .insert({
            spot_id: spotData.id,
            user_id: session.user.id,
            image_url: imageUrl
          });
        
        if (photoError) {
          console.error("Erro ao salvar foto vinculada em spot_photos:", photoError);
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error("Storage/DB Error:", err);
      const msg = err?.message || err?.error_description || (typeof err === "object" ? JSON.stringify(err) : "Erro ao salvar Spot.");
      setError(`Falha: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!pos) {
    return <div className="absolute inset-0 z-50 bg-white flex items-center justify-center">Obtendo GPS...</div>;
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/60 flex flex-col justify-end">
      <div className="bg-white rounded-t-[40px] p-6 shadow-2xl flex flex-col h-[85vh] overflow-y-auto">
        
        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Mapear este Local</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Imortalize a vista daqui para a comunidade.</p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}

        {/* Input Câmera Nativa */}
        {!preview ? (
          <label className="w-full h-48 shrink-0 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center mb-6">
            <Camera size={40} className="text-gray-400 mb-2" />
            <span className="text-gray-600 font-semibold">Tirar Foto</span>
            <span className="text-xs text-gray-400 mt-1">A câmera será aberta</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="w-full h-48 shrink-0 rounded-3xl overflow-hidden mb-6 relative border border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full text-xs">Trocar</button>
          </div>
        )}

        {/* Formulário */}
        <div className="mb-6 shrink-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dê um nome para este lugar</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Mirante do Sol Poente..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none focus:ring-2 focus:ring-[#ff5a5f] shadow-inner"
          />
        </div>

        {/* Ajuste Fino de GPS */}
        <div className="mb-6 flex-1 min-h-[200px] rounded-2xl overflow-hidden border border-gray-200 relative shrink-0">
          <div className="flex items-center text-sm font-semibold text-gray-500 mb-2 gap-2">
            <MapPin size={16} /> Arraste o pino para ajustar
          </div>
          <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <MapContainer center={pos} zoom={16} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <DraggableMarker pos={pos} setPos={setPos} />
            </MapContainer>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-4 mt-6 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!preview || !title.trim() || loading}
            className="flex-1 py-4 font-bold text-white bg-[#ff5a5f] rounded-xl hover:bg-[#e04a4f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(255,90,95,0.4)]"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Enterrar Spot"}
          </button>
        </div>

      </div>
    </div>
  );
}
