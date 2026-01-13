'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Store, User, Loader2 } from "lucide-react";

export default function CheckRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function checkUserRole() {
      try {
        // 1. Get the logged-in Auth User
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.replace("/login");
          return;
        }
        setCurrentUser(user);

        // 2. Check if they are an OWNER
        const { data: owner } = await supabase
          .from("owners")
          .select("id")
          .eq("id", user.id)
          .single();

        if (owner) {
          router.replace("/dashboard");
          return;
        }

        // 3. Check if they are a CUSTOMER
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("id", user.id)
          .single();

        if (customer) {
          router.replace("/scan");
          return;
        }

        // 4. If neither, show the "Choose Role" screen
        setNeedsOnboarding(true);
        setLoading(false);

      } catch (err) {
        console.error("Role check failed", err);
      }
    }

    checkUserRole();
  }, [router]);

  // Handle Role Selection (Writes to Database)
  const handleSelectRole = async (role: 'owner' | 'customer') => {
    setLoading(true);
    try {
      const table = role === 'owner' ? 'owners' : 'customers';
      
      // Strict "AK-47" Insert: Only ID and Phone. Details come later.
      const { error } = await supabase.from(table).insert({
        id: currentUser.id,
        phone: currentUser.phone || "", // Phone comes from Auth
      });

      if (error) throw error;

      // Redirect immediately
      if (role === 'owner') router.replace("/dashboard");
      else router.replace("/scan");

    } catch (err: any) {
      alert("Error creating account: " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Verifying Identity...</p>
      </div>
    );
  }

  // THE ONBOARDING SCREEN (Only shown to new users)
  if (needsOnboarding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Who are you?</h1>
            <p className="text-slate-500 mt-2">Select your account type to continue.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* OPTION 1: MESS OWNER */}
            <button
              onClick={() => handleSelectRole('owner')}
              className="group relative flex items-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Store size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-slate-900">Business Owner</h3>
                <p className="text-sm text-slate-500">I own a Mess, Gym, or Library.</p>
              </div>
            </button>

            {/* OPTION 2: STUDENT / CUSTOMER */}
            <button
              onClick={() => handleSelectRole('customer')}
              className="group relative flex items-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all text-left"
            >
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <User size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-slate-900">Student / User</h3>
                <p className="text-sm text-slate-500">I want to track my meals & attendance.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}