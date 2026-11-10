"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// The signed-in user (or null), kept up to date when they sign in or out
export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    // keep the same object if it's the same person, so pages don't react twice
    const update = (next) => setUser((old) => (old?.id === next?.id ? old : next));
    supabase.auth.getSession().then(({ data }) => update(data.session?.user || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => update(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  return user;
}
