import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useDeckStore } from "../store/useDeckStore";

type SyncPayload = {
  decks: ReturnType<typeof useDeckStore.getState>["decks"];
  flashcardProgress: ReturnType<
    typeof useDeckStore.getState
  >["flashcardProgress"];
  learnProgress: ReturnType<typeof useDeckStore.getState>["learnProgress"];
  updatedAt: number;
};

type SyncStatus = "idle" | "syncing" | "error" | "offline";

const SYNC_DEBOUNCE_MS = 1200;

export const useCloudSync = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const pushTimeout = useRef<number | null>(null);
  const lastPushedAt = useRef<number>(0);
  const isHydrating = useRef(false);

  const supabaseEnabled = Boolean(supabase);

  const buildPayload = useCallback((): SyncPayload => {
    const state = useDeckStore.getState();
    return {
      decks: state.decks,
      flashcardProgress: state.flashcardProgress,
      learnProgress: state.learnProgress,
      updatedAt: state.updatedAt,
    };
  }, []);

  const pullFromCloud = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      setStatus("syncing");
      const { data, error } = await supabase
        .from("user_state")
        .select("state, updated_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        setStatus("error");
        return;
      }

      const local = useDeckStore.getState();
      const remoteState = data?.state as SyncPayload | null;
      const remoteUpdatedAt = remoteState?.updatedAt ?? 0;

      if (remoteState && remoteUpdatedAt > local.updatedAt) {
        isHydrating.current = true;
        useDeckStore.getState().setFromCloud(remoteState);
        isHydrating.current = false;
        lastPushedAt.current = remoteUpdatedAt;
        setLastSyncedAt(remoteUpdatedAt);
        setStatus("idle");
        return;
      }

      await pushToCloud(userId, buildPayload());
    },
    [buildPayload]
  );

  const pushToCloud = useCallback(
    async (userId: string, payload: SyncPayload) => {
      if (!supabase) return;
      setStatus("syncing");
      const { error } = await supabase.from("user_state").upsert(
        {
          user_id: userId,
          state: payload,
          updated_at: new Date(payload.updatedAt).toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        setStatus("error");
        return;
      }
      lastPushedAt.current = payload.updatedAt;
      setLastSyncedAt(payload.updatedAt);
      setStatus("idle");
    },
    []
  );

  useEffect(() => {
    if (!supabase) {
      setStatus("offline");
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          void pullFromCloud(newSession.user.id);
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pullFromCloud, supabaseEnabled]);

  useEffect(() => {
    if (!supabase || !session?.user) return;

    const unsub = useDeckStore.subscribe((state) => {
      if (isHydrating.current) return;
      if (state.updatedAt <= lastPushedAt.current) return;
      if (pushTimeout.current) {
        window.clearTimeout(pushTimeout.current);
      }
      pushTimeout.current = window.setTimeout(() => {
        void pushToCloud(session.user.id, buildPayload());
      }, SYNC_DEBOUNCE_MS);
    });

    return () => {
      if (pushTimeout.current) {
        window.clearTimeout(pushTimeout.current);
      }
      unsub();
    };
  }, [buildPayload, pushToCloud, session?.user, supabaseEnabled]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) return { error: "Supabase not configured." };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const syncNow = useCallback(async () => {
    if (!supabase || !session?.user) return;
    await pushToCloud(session.user.id, buildPayload());
  }, [buildPayload, pushToCloud, session?.user, supabaseEnabled]);

  const statusLabel = useMemo(() => {
    if (!supabase) return "Sync disabled";
    if (status === "offline") return "Sync disabled";
    if (status === "syncing") return "Syncing";
    if (status === "error") return "Sync error";
    if (lastSyncedAt) {
      return `Synced ${new Date(lastSyncedAt).toLocaleTimeString()}`;
    }
    return "Ready to sync";
  }, [lastSyncedAt, status, supabaseEnabled]);

  return {
    supabaseEnabled,
    session,
    status,
    statusLabel,
    signInWithMagicLink,
    signOut,
    syncNow,
  };
};
