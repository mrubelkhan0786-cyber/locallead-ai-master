import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  location: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).optional().nullable(),
});

export type Lead = {
  place_id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  lat?: number;
  lng?: number;
  open_now?: boolean;
  photo?: string;
  maps_url: string;
  lead_score: number;
  ai_summary: string;
  services: string[];
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

function computeLeadScore(p: {
  website?: string;
  rating?: number;
  reviews?: number;
  phone?: string;
}) {
  let score = 50;
  if (!p.website) score += 30;
  if (p.rating !== undefined) {
    if (p.rating < 3.5) score += 10;
    if (p.rating < 3) score += 5;
  }
  if ((p.reviews ?? 0) > 30) score += 5;
  if ((p.reviews ?? 0) > 200) score += 5;
  if (p.phone) score += 3;
  return Math.min(100, Math.max(1, score));
}

function suggestServices(p: { website?: string; rating?: number; reviews?: number }) {
  const s: string[] = [];
  if (!p.website) s.push("Website development");
  if (!p.website) s.push("Local SEO setup");
  if (p.website) s.push("SEO audit & optimization");
  if ((p.rating ?? 5) < 4) s.push("Reputation management");
  if ((p.reviews ?? 0) < 20) s.push("Google reviews growth");
  s.push("Meta & Google Ads", "AI chatbot / automation");
  return s.slice(0, 5);
}

function aiSummary(p: { name: string; website?: string; rating?: number; reviews?: number }) {
  const parts: string[] = [];
  if (!p.website) parts.push("No website found — strong opportunity for web dev & SEO.");
  else parts.push("Has a website; could benefit from SEO/CRO improvements.");
  if ((p.rating ?? 5) < 4) parts.push("Below-average rating signals reputation work needed.");
  if ((p.reviews ?? 0) < 20) parts.push("Low review count — review-generation campaign recommended.");
  if ((p.reviews ?? 0) >= 100) parts.push("Established local presence; ads and automation can scale revenue.");
  return parts.join(" ");
}

export const searchPlaces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps connector is not configured");
    }

    // Enforce simple per-day limits based on plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, searches_today, last_search_date")
      .eq("id", userId)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    let searchesToday = profile?.searches_today ?? 0;
    if (profile?.last_search_date !== today) searchesToday = 0;

    const plan = profile?.plan ?? "free";
    const limit = plan === "ultra" ? Infinity : plan === "pro" ? 20 : 5;
    if (searchesToday >= limit) {
      throw new Error(`Daily search limit reached for ${plan} plan. Upgrade to continue.`);
    }

    const q = data.category ? `${data.category} in ${data.location}` : `local businesses in ${data.location}`;

    const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.googleMapsUri,places.regularOpeningHours,places.currentOpeningHours,places.primaryTypeDisplayName,places.types,places.photos",
      },
      body: JSON.stringify({ textQuery: q, maxResultCount: 20 }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Places search failed (${res.status}): ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as { places?: any[] };
    const places = json.places ?? [];

    const leads: Lead[] = places.map((pl) => {
      const name = pl.displayName?.text ?? "Unnamed business";
      const cat = pl.primaryTypeDisplayName?.text ?? (pl.types?.[0]?.replace(/_/g, " ") ?? "Local business");
      const website = pl.websiteUri as string | undefined;
      const phone = (pl.nationalPhoneNumber ?? pl.internationalPhoneNumber) as string | undefined;
      const rating = pl.rating as number | undefined;
      const reviews = pl.userRatingCount as number | undefined;
      const photoRef = pl.photos?.[0]?.name as string | undefined;
      const photo = photoRef
        ? `${GATEWAY}/places/v1/${photoRef}/media?maxWidthPx=400`
        : undefined;
      const lead: Lead = {
        place_id: pl.id,
        name,
        category: cat,
        address: pl.formattedAddress ?? "",
        phone,
        website,
        rating,
        reviews,
        lat: pl.location?.latitude,
        lng: pl.location?.longitude,
        open_now: pl.currentOpeningHours?.openNow,
        photo,
        maps_url: pl.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${pl.id}`,
        lead_score: computeLeadScore({ website, rating, reviews, phone }),
        ai_summary: aiSummary({ name, website, rating, reviews }),
        services: suggestServices({ website, rating, reviews }),
      };
      return lead;
    });

    // Update usage + history
    await supabase
      .from("profiles")
      .update({ searches_today: searchesToday + 1, last_search_date: today })
      .eq("id", userId);

    await supabase.from("search_history").insert({
      user_id: userId,
      location: data.location,
      category: data.category ?? null,
      result_count: leads.length,
    });

    return { leads, usage: { used: searchesToday + 1, limit: limit === Infinity ? null : limit, plan } };
  });
