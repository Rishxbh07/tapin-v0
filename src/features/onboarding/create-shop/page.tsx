'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import CreateShopForm from "@/features/onboarding/CreateShopForm";
import { Loader2 } from "lucide-react";

export default function CreateShopPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user ID to pass to the form
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  if (!userId) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <CreateShopForm userId={userId} />
    </div>
  );
}