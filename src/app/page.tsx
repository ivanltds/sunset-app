"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import CompassView from "@/components/CompassView";
import { Settings } from "lucide-react";

// Import Map dynamically to avoid SSR errors with Leaflet
const MapEngine = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => null // Removido texto cinza cru, agora controlado pelo splash screen
});

const SpotCreatorModal = dynamic(() => import("@/components/SpotCreator"), {
  ssr: false,
});

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showCompass, setShowCompass] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
    console.log(msg);
  };

  // 1. Controle Unificado e Rastreamento de GPS (watchPosition)
  useEffect(() => {
    if (!navigator.geolocation) {
      addLog("GPS não suportado. Usando fallback de São Paulo.");
      setUserPos([-23.55052, -46.633308]);
      return;
    }

    addLog("Buscando localização inicial...");
    
    // Captura inicial rápida
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        addLog("Localização inicial obtida!");
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        addLog(`Erro no GPS inicial: ${err.message}. Usando fallback.`);
        setUserPos((current) => current || [-23.55052, -46.633308]);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    // Watcher ativo para rastrear movimento contínuo
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        addLog("Localização atualizada via watcher.");
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn("Erro no watcher do GPS:", err);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      addLog("Watcher do GPS desligado para poupar bateria.");
    };
  }, []);

  // 2. Autenticação Anônima (Sessão Fantasma)
  useEffect(() => {
    const login = async () => {
      addLog("Verificando sessão ativa...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          addLog(`Sessão encontrada: ${session.user.id.substring(0, 13)}...`);
          const { error: updateError } = await supabase
            .from('users')
            .update({ last_active: new Date().toISOString() })
            .eq('id', session.user.id);

          if (updateError) {
            addLog(`Erro ao atualizar last_active: ${updateError.message}`);
          } else {
            addLog("last_active updated!");
          }
        } else {
          addLog("Nenhuma sessão encontrada. Iniciando login anônimo...");
          const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
          
          if (authError) throw authError;

          if (authData.user) {
            addLog(`Ghost Account criado com sucesso: ${authData.user.id.substring(0, 13)}...`);
          }
        }
      } catch (err: any) {
        console.error("Auth Error:", err);
        const errMsg = err?.message || err?.error_description || JSON.stringify(err);
        addLog(`Erro fatal de Auth: ${errMsg}`);
      }
    };

    login();
  }, []);

  // 3. Splash Screen Premium enquanto obtém o primeiro GPS
  if (!userPos) {
    return (
      <div className="fixed inset-0 z-[5000] flex flex-col items-center justify-center bg-gradient-to-tr from-[#ff5a5f] via-[#ff7e5f] to-[#feb47b] text-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Sol Abstrato em Glassmorphism */}
          <motion.div 
            animate={{ 
              scale: [1, 1.06, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl mb-6 relative overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/30 to-transparent"></div>
            <div className="w-10 h-10 bg-yellow-300 rounded-full shadow-[0_0_20px_rgba(253,224,71,0.8)]"></div>
          </motion.div>

          <h1 className="text-4xl font-black tracking-widest text-center drop-shadow-md">
            SUN<span className="text-yellow-300">SET</span>
          </h1>
          <p className="text-sm text-white/80 font-medium tracking-wide mt-2">Explorar spots de fotografia</p>
        </motion.div>

        {/* Loader de Status */}
        <div className="absolute bottom-16 flex flex-col items-center gap-3">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-xs font-semibold tracking-wider text-white/70 uppercase"
          >
            Buscando satélites GPS...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Header Overlay (only visible on map) */}
      {!showCompass && (
        <header className="absolute top-0 w-full p-5 flex justify-between items-center z-[1000] bg-gradient-to-b from-white/90 to-transparent pointer-events-none">
          <h1 className="font-extrabold text-2xl text-gray-900 pointer-events-auto">SUN<span className="text-[#ff5a5f]">SET</span></h1>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 pointer-events-auto active:bg-gray-50 text-gray-700">
            <Settings size={20} />
          </button>
        </header>
      )}

      {/* Main View Area */}
      {showCompass ? (
        <CompassView onClose={() => setShowCompass(false)} />
      ) : (
        <MapEngine 
          key={refreshKey} 
          userPos={userPos} // Injeta geolocalização unificada
          onOpenCreator={() => setShowCreator(true)}
          onOpenCompass={() => setShowCompass(true)}
        />
      )}

      {/* Spot Creator Modal */}
      {showCreator && (
        <SpotCreatorModal 
          initialPos={userPos} // Abre instantaneamente com a posição cacheada
          onClose={() => setShowCreator(false)} 
          onSuccess={() => {
            setShowCreator(false);
            setRefreshKey(k => k + 1); // Força o mapa a recarregar os spots do banco
          }} 
        />
      )}
    </main>
  );
}
