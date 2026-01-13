'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Store, MapPin, Hash } from "lucide-react";

export default function CreateShopForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the Shop
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .insert({
          owner_id: userId,
          name: formData.name,
          shop_code: formData.code.toUpperCase(), // Force uppercase logic
          shop_status: 'open',
          active_member_count: 0
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // 2. Create a Default "Standard Plan" (So you can sell immediately)
      const { error: planError } = await supabase
        .from('shop_plans')
        .insert({
          shop_id: shop.id,
          name: 'Standard Monthly',
          price: 2500,
          validity_days: 30,
          daily_limit: 2,
          total_credits: 60,
          shop_plan_status: 'active'
        });

      if (planError) throw planError;

      // 3. Success! Go to Dashboard
      router.refresh(); 
      router.push('/dashboard');

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
          <Store size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Setup Your Business</h1>
        <p className="text-slate-500 text-sm mt-2">Create your digital space.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* SHOP NAME */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
          <div className="relative">
            <Store className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. Sharma Mess"
              className="pl-10 block w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        {/* SHOP CODE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Shop Code (Unique)</label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. PUNE-01"
              className="pl-10 block w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 uppercase focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Students will use this code to find you.</p>
        </div>

        {/* LOCATION */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">City / Area</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. Kothrud, Pune"
              className="pl-10 block w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Launch Shop 🚀"}
        </button>
      </form>
    </div>
  );
}