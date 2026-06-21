import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const { data: history } = await supabase
      .from("search_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const today = new Date().toISOString().slice(0, 10);
    const searchesToday = profile?.last_search_date === today ? (profile?.searches_today ?? 0) : 0;
    const plan = profile?.plan ?? "free";
    const limit = plan === "ultra" ? null : plan === "pro" ? 20 : 5;

    return {
      profile,
      history: history ?? [],
      usage: { used: searchesToday, limit, plan },
    };
  });
