'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Send OTP (Simulated for Test Number)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`, // Hardcoded India Code for MVP
      });
      if (error) throw error;
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: "sms",
      });

      if (error) throw error;
      
      // SUCCESS: Router will handle the redirect based on role later
      router.push("/check-role"); 
      
    } catch (err: any) {
      setError("Invalid OTP. Try 123456 for test numbers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome to TapIn</h1>
        <p className="text-slate-500 text-sm mt-2">The AK-47 of Attendance</p>
      </div>

      {step === "PHONE" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99999 99999"
                className="block w-full rounded-r-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
                maxLength={10}
              />
            </div>
          </div>
          <button
            disabled={loading || phone.length < 10}
            className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Get OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="block w-full rounded-lg border border-slate-300 p-2.5 text-center text-2xl tracking-widest text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              maxLength={6}
            />
          </div>
          <button
            disabled={loading || otp.length < 6}
            className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm px-5 py-3 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <span className="flex items-center gap-2">Verify & Login <ArrowRight className="h-4 w-4"/></span>}
          </button>
          <button 
            type="button" 
            onClick={() => setStep("PHONE")}
            className="w-full text-slate-500 text-xs hover:underline mt-2"
          >
            Wrong number? Go back
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
          {error}
        </div>
      )}
    </div>
  );
}