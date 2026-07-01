"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import CompassView from "@/components/CompassView";

// Import Map dynamically to avoid SSR errors with Leaflet
const MapEngine = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-gray-100">Carregando Mapa...</div>
});

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showCompass, setShowCompass] = useState(false);

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
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 text-xl pointer-events-auto active:bg-gray-50">
            ⚙️
          </button>
        </header>
      )}

      {/* Main View Area */}
      {showCompass ? (
        <CompassView onClose={() => setShowCompass(false)} />
      ) : (
        <MapEngine />
      )}

      {/* Bottom Controls Overlay (only visible on map) */}
      {!showCompass && (
        <div className="absolute bottom-6 w-full px-5 flex justify-between items-center z-[1000] pointer-events-none">
          <button 
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 text-xl pointer-events-auto active:bg-gray-50"
            onClick={() => alert("Centralizar no GPS (Mock)")}
          >
            🎯
          </button>
          
          <button 
            className="flex-1 mx-4 bg-[#ff5a5f] text-white py-3 px-6 rounded-full font-bold text-lg shadow-[0_10px_15px_-3px_rgba(255,90,95,0.4)] pointer-events-auto active:scale-95 transition-transform"
            onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                const newSpots = Array.from({ length: 50 }).map((_, i) => ({
                  user_id: session.user.id,
                  lat: -23.55052 + (Math.random() - 0.5) * 0.05,
                  lng: -46.633308 + (Math.random() - 0.5) * 0.05,
                  title: `Spot Real #${i + 1}`
                }));
                const { error } = await supabase.from('spots').insert(newSpots);
                if (error) {
                  alert("Erro ao inserir: " + error.message);
                } else {
                  alert('50 spots salvos no Supabase! Dê um F5 para ver os clusters carregando do banco de dados.');
                }
              }
            }}
          >
            📷 Novo Spot (Gerar Mocks)
          </button>

          <button 
            className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg border border-gray-800 text-xl pointer-events-auto active:bg-gray-800 transition-colors"
            onClick={() => setShowCompass(true)}
          >
            🧭
          </button>
        </div>
      )}
    </main>
  );
}
