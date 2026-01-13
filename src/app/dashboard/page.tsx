'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Users, QrCode, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [stats, setStats] = useState({ today: 0, active: 0 });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        // 1. Get Current User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.replace("/login");
            return;
        }

        // 2. Get Shop Details
        const { data: shopData, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        // LOGIC CHECK: If no shop found, send them to create one
        if (!shopData) {
          router.replace("/onboarding/create-shop");
          return;
        }

        // 3. If Shop exists, load stats
        setShop(shopData);

        // Get Today's Stats
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('attendance_logs')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shopData.id)
          .gte('scan_time', `${today}T00:00:00`);

        setStats({ 
          today: count || 0, 
          active: shopData.active_member_count 
        });
        
        // Stop loading only if we successfully loaded the dashboard
        setLoading(false);

      } catch (err) {
        console.error("Dashboard error:", err);
        // If the error was "Row not found" (no shop), ensuring we redirect
        router.replace("/onboarding/create-shop");
      }
    }

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600 h-8 w-8"/>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{shop?.name}</h1>
          <p className="text-sm text-slate-500">Code: {shop?.shop_code}</p>
        </div>
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
           {shop?.name?.[0] || "S"}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Utensils size={18} />
            <span className="text-xs font-medium uppercase">Served Today</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.today}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Users size={18} />
            <span className="text-xs font-medium uppercase">Active Members</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="bg-blue-600 rounded-xl p-6 text-white text-center shadow-lg shadow-blue-200 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-50 blur-xl"></div>
        
        <QrCode className="mx-auto mb-3 h-8 w-8 relative z-10" />
        <h3 className="font-bold text-lg relative z-10">Scan Customer</h3>
        <p className="text-blue-100 text-sm mb-4 relative z-10">Tap to open scanner</p>
        <button 
          onClick={() => router.push('/scan')}
          className="bg-white text-blue-700 px-6 py-3 rounded-lg font-bold text-sm w-full hover:bg-blue-50 transition-colors relative z-10"
        >
          Open Scanner
        </button>
      </div>
      
      {/* RECENT ACTIVITY */}
      <div className="mt-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Activity</h3>
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-sm">No meals served yet today.</p>
        </div>
      </div>
    </div>
  );
}