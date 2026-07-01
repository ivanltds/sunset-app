"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import CompassView from "@/components/CompassView";
import { Settings } from "lucide-react";

// Import Map dynamically to avoid SSR errors with Leaflet
const MapEngine = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-gray-100">Carregando Mapa...</div>
});

const SpotCreatorModal = dynamic(() => import("@/components/SpotCreator"), {
  ssr: false,
});

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showCompass, setShowCompass] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
    console.log(msg);
  };

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
            addLog("last_active atualizado com sucesso!");
          }
        } else {
          addLog("Nenhuma sessão encontrada. Iniciando login anônimo...");
          const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
          
          if (authError) throw authError;

          if (authData.user) {
            addLog(`Ghost Account criado com sucesso: ${authData.user.id.substring(0, 13)}...`);
            addLog("Tabela 'users' populada automaticamente via Trigger.");
          }
        }
      } catch (err: any) {
        console.error("Auth Error:", err);
        const errMsg = err?.message || err?.error_description || JSON.stringify(err);
        addLog(`Erro fatal: ${errMsg}`);
      }
    };

    login();
  }, []);

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
          onOpenCreator={() => setShowCreator(true)}
          onOpenCompass={() => setShowCompass(true)}
        />
      )}

      {/* Spot Creator Modal */}
      {showCreator && (
        <SpotCreatorModal 
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
