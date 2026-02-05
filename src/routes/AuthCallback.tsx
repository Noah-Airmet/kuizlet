import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    const completeSignIn = async () => {
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        setMessage("Missing auth code. Please try again.");
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setMessage("Sign-in failed. Please try again.");
        return;
      }
      navigate("/", { replace: true });
    };

    void completeSignIn();
  }, [navigate]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center text-slate-600">
      <div className="rounded-2xl border border-slate-100 bg-white/90 px-6 py-8 shadow-sm backdrop-blur">
        <h1 className="text-xl font-semibold text-slate-900">Signing in</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
