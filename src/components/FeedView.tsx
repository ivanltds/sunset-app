"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Plus, Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Helper para calcular distância usando a fórmula de Haversine
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Retorna em km
};

interface FeedViewProps {
  spots: any[];
  userPos: [number, number] | null;
  feedState: "full" | "half" | "collapsed";
  setFeedState: (state: "full" | "half" | "collapsed") => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onBookmarkChange?: (spotId: string, isBookmarked: boolean) => void;
  onBookmarksLoaded?: (bookmarkedIds: string[]) => void;
}

export default function FeedView({ 
  spots, 
  userPos, 
  feedState, 
  setFeedState, 
  onClose, 
  onRefresh, 
  onBookmarkChange, 
  onBookmarksLoaded 
}: FeedViewProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [prevSpotIds, setPrevSpotIds] = useState<string>("");

  const fetchIdRef = useRef(0);

  const fetchPhotos = async () => {
    // 1. Incrementar ID da chamada ativa
    fetchIdRef.current += 1;
    const currentFetchId = fetchIdRef.current;

    // 2. Verificar se a lista de spots está vazia
    if (!spots.length) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    // 3. Criar string de comparação de IDs para evitar requisições de rede redundantes
    const currentIds = spots.map(s => s.id).sort().join(",");
    if (currentIds === prevSpotIds) {
      // Se os IDs não mudaram, apenas recalculamos a ordenação se a localização do usuário mudou
      if (userPos && photos.length > 0) {
        const updated = photos.map(photo => {
          const lat = photo.spots?.lat ?? 0;
          const lng = photo.spots?.lng ?? 0;
          const distance = getDistance(userPos[0], userPos[1], lat, lng);
          return { ...photo, distance };
        }).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
        
        setPhotos(updated);
      }
      return;
    }

    setPrevSpotIds(currentIds);
    setLoading(true);

    const spotIds = spots.map(s => s.id);

    const { data: { session } } = await supabase.auth.getSession();
    if (currentFetchId !== fetchIdRef.current) return; // Aborta se outra chamada iniciou

    const uid = session?.user?.id || null;
    setUserId(uid);

    // Buscar fotos no Supabase
    const { data: photosData, error: photosError } = await supabase
      .from("spot_photos")
      .select("*, spots(title, lat, lng)")
      .in("spot_id", spotIds)
      .order("created_at", { ascending: false });

    if (currentFetchId !== fetchIdRef.current) return; // Aborta se obsoleta

    if (photosData) {
      let processedPhotos = [...photosData];
      
      // Calcular distância e ordenar se a posição do usuário estiver disponível
      if (userPos) {
        processedPhotos = processedPhotos.map(photo => {
          const lat = photo.spots?.lat ?? 0;
          const lng = photo.spots?.lng ?? 0;
          const distance = getDistance(userPos[0], userPos[1], lat, lng);
          return { ...photo, distance };
        });
        
        // Ordenar por proximidade ascendente
        processedPhotos.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      }
      
      setPhotos(processedPhotos);
      
      if (uid) {
        // Buscar likes e bookmarks do usuario atual
        const [likesRes, bookRes] = await Promise.all([
          supabase.from("spot_likes").select("spot_id").eq("user_id", uid).in("spot_id", spotIds),
          supabase.from("spot_bookmarks").select("spot_id").eq("user_id", uid).in("spot_id", spotIds)
        ]);
        
        if (currentFetchId !== fetchIdRef.current) return; // Aborta se obsoleta

        const likesMap: Record<string, boolean> = {};
        const bookMap: Record<string, boolean> = {};
        
        likesRes.data?.forEach(l => likesMap[l.spot_id] = true);
        bookRes.data?.forEach(b => bookMap[b.spot_id] = true);
        
        setLikes(likesMap);
        setBookmarks(bookMap);
        if (onBookmarksLoaded) onBookmarksLoaded(Object.keys(bookMap));
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, [spots, userPos]);

  const toggleLike = async (spotId: string) => {
    if (!userId) return;
    const isLiked = !!likes[spotId];
    
    // Otimista
    setLikes(prev => ({ ...prev, [spotId]: !isLiked }));
    
    if (isLiked) {
      await supabase.from("spot_likes").delete().match({ user_id: userId, spot_id: spotId });
    } else {
      await supabase.from("spot_likes").insert({ user_id: userId, spot_id: spotId });
    }
  };

  const toggleBookmark = async (spotId: string) => {
    if (!userId) return;
    const isBookmarked = !!bookmarks[spotId];
    
    // Otimista
    setBookmarks(prev => ({ ...prev, [spotId]: !isBookmarked }));
    if (onBookmarkChange) onBookmarkChange(spotId, !isBookmarked);
    
    if (isBookmarked) {
      await supabase.from("spot_bookmarks").delete().match({ user_id: userId, spot_id: spotId });
    } else {
      await supabase.from("spot_bookmarks").insert({ user_id: userId, spot_id: spotId });
    }
  };

  const yStops = {
    full: 0,
    half: typeof window !== "undefined" ? window.innerHeight * 0.45 : 400,
    collapsed: typeof window !== "undefined" ? window.innerHeight * 0.85 : 800
  };

  return (
    <motion.div 
      drag="y"
      dragConstraints={{ top: yStops.full, bottom: yStops.collapsed }}
      dragElastic={0.1}
      onDragEnd={(e, info) => {
        const velY = info.velocity.y;
        const offsetY = info.offset.y;
        
        // Simples lógica de snap baseada em velocidade e direção
        if (feedState === "full") {
          if (velY > 200 || offsetY > 100) setFeedState("half");
        } else if (feedState === "half") {
          if (velY > 200 || offsetY > 100) setFeedState("collapsed");
          else if (velY < -200 || offsetY < -100) setFeedState("full");
        } else if (feedState === "collapsed") {
          if (velY < -200 || offsetY < -100) setFeedState("half");
        }
      }}
      animate={{ y: yStops[feedState] }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-x-0 bottom-0 top-[10%] bg-white rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.15)] z-[2000] flex flex-col"
      style={{ touchAction: "none" }} // Necessário para o framer-motion drag no mobile
    >
      {/* Handlebar */}
      <div 
        className="w-full flex flex-col items-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing"
        onClick={() => {
          if (feedState === "collapsed") setFeedState("half");
          else if (feedState === "half") setFeedState("full");
          else setFeedState("collapsed");
        }}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>
        {feedState === "collapsed" && (
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Puxar Feed ({photos.length})</span>
        )}
      </div>

      <div className="px-6 py-2 flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-gray-900">Arredores</h2>
        <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
          {photos.length} Fotos
        </span>
      </div>

      {/* Grid Masonry (via CSS Columns do Tailwind) */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2 touch-pan-y" style={{ opacity: feedState === "collapsed" ? 0.3 : 1, transition: 'opacity 0.3s' }}>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Camera className="w-12 h-12 mb-2 opacity-50" />
            <p>Nenhuma foto nesta região ainda.</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 space-y-4">
            {photos.map((photo) => (
              <div key={photo.id} className="break-inside-avoid relative rounded-2xl overflow-hidden group">
                <img 
                  src={photo.image_url} 
                  alt="Spot Photo" 
                  className="w-full h-auto object-cover bg-gray-100 min-h-[150px] cursor-pointer hover:opacity-95 transition-opacity"
                  loading="lazy"
                  onClick={() => {
                    setActivePhotoUrl(photo.image_url);
                    setZoomScale(1);
                  }}
                />
                
                <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-end">
                  <div className="flex flex-col text-left truncate pr-2 select-none">
                    <span className="text-white text-xs font-bold truncate shadow-sm">
                      {photo.spots?.title || "Desconhecido"}
                    </span>
                    {photo.distance !== undefined && (
                      <span className="text-white/80 text-[10px] font-semibold shadow-sm mt-0.5">
                        {photo.distance < 1 
                          ? `${Math.round(photo.distance * 1000)}m de você` 
                          : `${photo.distance.toFixed(1)}km de você`}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => toggleLike(photo.spot_id)}
                      className={`w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm ${likes[photo.spot_id] ? 'bg-[#ff5a5f] text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                    >
                      <Heart size={14} className={likes[photo.spot_id] ? "fill-current" : ""} />
                    </button>
                    <button 
                      onClick={() => toggleBookmark(photo.spot_id)}
                      className={`w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm ${bookmarks[photo.spot_id] ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                    >
                      <Star size={14} className={bookmarks[photo.spot_id] ? "fill-current" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB para adicionar nova foto no feed */}
      <div className="absolute bottom-6 right-6 z-50">
        <button 
          onClick={() => setAddingPhoto(true)}
          className="bg-[#ff5a5f] w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-[0_10px_20px_-5px_rgba(255,90,95,0.4)] hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Tela de Adicionar Foto (Overlay sobre o Feed) */}
      <AnimatePresence>
        {addingPhoto && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 bg-white z-[3000] rounded-t-3xl flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Adicionar Foto</h3>
              <button onClick={() => setAddingPhoto(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">A qual Spot você quer adicionar esta foto?</p>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {spots.map(spot => (
                <div key={spot.id} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#ff5a5f] transition-colors cursor-pointer" onClick={() => {
                  setSelectedSpotId(spot.id);
                  // Disparar input de camera oculto aqui
                  document.getElementById('feed-camera-input')?.click();
                }}>
                  <span className="font-bold text-gray-800">{spot.title}</span>
                  <Camera size={18} className="text-gray-400" />
                </div>
              ))}
            </div>

            <input 
              id="feed-camera-input"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={async (e) => {
                if(e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  try {
                    // Importar processAndWatermarkImage dinamicamente ou estaticamente
                    const { processAndWatermarkImage } = await import("@/lib/watermark");
                    const watermarkedBlob = await processAndWatermarkImage(file, "Sunset App");
                    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

                    const { error: storageError } = await supabase.storage
                      .from("spots")
                      .upload(filename, watermarkedBlob, { contentType: "image/jpeg" });
                    
                    if (storageError) throw storageError;

                    const { data: publicUrlData } = supabase.storage.from("spots").getPublicUrl(filename);
                    
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("Não autenticado");

                    await supabase.from("spot_photos").insert({
                      spot_id: selectedSpotId,
                      user_id: session.user.id,
                      image_url: publicUrlData.publicUrl
                    });

                    setAddingPhoto(false);
                    fetchPhotos(); // Recarregar feed
                  } catch (err) {
                    console.error("Upload error:", err);
                    alert("Erro ao enviar a foto.");
                  }
                }
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal para visualização em Tela Cheia com Zoom */}
      <AnimatePresence>
        {activePhotoUrl && typeof window !== "undefined" && createPortal(
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[5000] flex flex-col items-center justify-center touch-none"
          >
            {/* Botão de Fechar */}
            <button 
              onClick={() => {
                setActivePhotoUrl(null);
                setZoomScale(1);
              }}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white rounded-full flex items-center justify-center z-[5001] backdrop-blur-md border border-white/20 cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* Container da Imagem com suporte a Drag & Zoom */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.5}
                animate={{ scale: zoomScale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <img 
                  src={activePhotoUrl} 
                  alt="Zoom View" 
                  className="max-w-[95vw] max-h-[85vh] object-contain select-none pointer-events-none rounded-lg shadow-2xl"
                />
              </motion.div>
            </div>

            {/* Controles Discretos de Zoom na base */}
            <div className="absolute bottom-10 flex items-center gap-4 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 z-[5001]">
              <button 
                onClick={() => setZoomScale(prev => Math.max(1, prev - 0.5))}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform font-bold text-lg select-none cursor-pointer"
              >
                -
              </button>
              <span className="text-white text-sm font-semibold select-none w-16 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button 
                onClick={() => setZoomScale(prev => Math.min(4, prev + 0.5))}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform font-bold text-lg select-none cursor-pointer"
              >
                +
              </button>
            </div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}
