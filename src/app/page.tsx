'use client';

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkConnection() {
      try {
        // Simple query to check if we can talk to Supabase
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) throw error;
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Unknown error");
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-sm w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">TapIn v0</h1>
        
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-500">Connecting to Brain...</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg">
            <h2 className="font-bold text-lg">System Online 🟢</h2>
            <p className="text-sm mt-1">Supabase connection established.</p>
            <p className="text-xs text-slate-400 mt-4">Architecture: AK-47 Ready</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <h2 className="font-bold text-lg">Connection Failed 🔴</h2>
            <p className="text-sm mt-1 wrap-break-word">{errorMessage}</p>
            <p className="text-xs mt-4">Check .env.local or SQL Tables</p>
          </div>
        )}
      </div>
    </div>
  );
}