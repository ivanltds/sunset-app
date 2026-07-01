"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    const loginAnonymously = async () => {
      try {
        addLog("Verificando sessão ativa...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          addLog(`Sessão encontrada: ${session.user.id.slice(0, 13)}...`);
          setDeviceId(session.user.id);
          
          // Atualiza last_active
          const { error: updateError } = await supabase
            .from("users")
            .update({ last_active: new Date().toISOString() })
            .eq("id", session.user.id);
            
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
            setDeviceId(authData.user.id);
            addLog(`Ghost Account criado com sucesso: ${authData.user.id.slice(0, 13)}...`);
            addLog("Tabela 'users' populada automaticamente via Trigger.");
          }
        }
      } catch (err: any) {
        console.error("Auth Error:", err);
        const errMsg = err?.message || err?.error_description || JSON.stringify(err);
        addLog(`Erro fatal: ${errMsg}`);
      }
    };

    loginAnonymously();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-gray-900">
      <div className="text-center w-full max-w-md">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
          SUN<span className="text-[#ff5a5f]">SET</span>
        </h1>
        <p className="text-gray-500 text-sm mb-8 animate-pulse">
          Iniciando ambiente local (PWA) e gerando ID...
        </p>
        
        <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200 text-left shadow-sm">
          <h2 className="text-gray-900 font-bold mb-4">Lazy Login Ativo:</h2>
          
          <div className="flex flex-col gap-2 font-mono text-xs text-gray-600 min-h-[140px]">
            {logs.map((log, index) => (
              <p 
                key={index} 
                className={`${log.includes("Nenhum") ? "text-[var(--color-brand)]" : ""} ${log.includes("sucesso") || log.includes("encontrado no dispositivo") ? "text-green-500 font-bold" : ""}`}
              >
                {log}
              </p>
            ))}
          </div>

          <button 
            disabled={!deviceId}
            className="w-full mt-6 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
          >
            {deviceId ? "Entrar no App (Anônimo)" : "Aguarde..."}
          </button>
        </div>
      </div>
    </div>
  );
}
