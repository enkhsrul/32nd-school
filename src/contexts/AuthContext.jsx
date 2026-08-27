import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser) => {
    if (!currentUser || !supabase) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();
    setProfile(data || null);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
      if (mounted) setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        await loadProfile(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signup = (email, password, firstName, lastName) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName }
      }
    });

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{
      user, profile, loading, login, signup, logout, refreshProfile: () => loadProfile(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);