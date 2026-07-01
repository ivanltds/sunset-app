"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const simulateLogin = async () => {
      setLogs((prev) => [...prev, "1. Verificando LocalStorage..."]);
      
      const storedId = localStorage.getItem("sunset_device_id");
      if (storedId) {
        setLogs((prev) => [...prev, "2. ID encontrado no dispositivo."]);
        setDeviceId(storedId);
        
        // Atualiza o last_active no backend silenciosamente
        await supabase
          .from("users")
          .update({ last_active: new Date().toISOString() })
          .eq("device_id", storedId);
          
        return;
      }

      setLogs((prev) => [...prev, "2. Nenhum ID encontrado."]);
      
      setLogs((prev) => [...prev, "3. Gerando Device UUID (Ghost Account)..."]);
      const newId = crypto.randomUUID();
      
      setLogs((prev) => [...prev, `4. ID gerado: ${newId.substring(0, 12)}...`]);
      setLogs((prev) => [...prev, "5. Salvando Ghost Account no Supabase..."]);
      
      const { error } = await supabase
        .from("users")
        .insert([{ device_id: newId }]);
        
      if (error) {
        setLogs((prev) => [...prev, `Erro fatal: ${error.message}`]);
        return;
      }
      
      localStorage.setItem("sunset_device_id", newId);
      setDeviceId(newId);
      setLogs((prev) => [...prev, "6. Sincronização concluída com sucesso!"]);
    };

    simulateLogin();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-background)]">
      <div className="text-center w-full max-w-md">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          SUN<span className="text-[var(--color-brand)]">SET</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mb-8 animate-pulse">
          Iniciando ambiente local (PWA) e gerando ID...
        </p>
        
        <div className="mt-10 p-6 bg-[var(--color-dark-card)] rounded-xl border border-gray-800 text-left shadow-sm">
          <h2 className="text-[var(--color-text-primary)] font-bold mb-4">Lazy Login Ativo:</h2>
          
          <div className="flex flex-col gap-2 font-mono text-xs text-[var(--color-text-secondary)] min-h-[140px]">
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
