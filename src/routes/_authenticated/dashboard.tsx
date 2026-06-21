import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { searchPlaces, type Lead } from "@/lib/search-places.functions";
import { getMyProfile } from "@/lib/user-profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Globe,
  Phone,
  Star,
  ExternalLink,
  LogOut,
  Sparkles,
  Crown,
  History,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LocalLead AI" }] }),
  component: Dashboard,
});

const CATEGORIES = [
  "Any", "Salon", "Restaurant", "Gym", "Clinic", "Hotel", "Shop",
  "Real estate agency", "Cafe", "Dentist", "Law firm", "Auto repair",
  "Spa", "Bakery", "Boutique", "Pharmacy",
];

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchSearch = useServerFn(searchPlaces);

  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Any");
  const [results, setResults] = useState<Lead[]>([]);
  const [noWebsite, setNoWebsite] = useState(false);
  const [lowRating, setLowRating] = useState(false);
  const [minReviews, setMinReviews] = useState(0);

  const profileQ = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchProfile(),
  });

  const search = useMutation({
    mutationFn: (vars: { location: string; category?: string }) =>
      fetchSearch({ data: { location: vars.location, category: vars.category ?? null } }),
    onSuccess: (data) => {
      setResults(data.leads);
      qc.invalidateQueries({ queryKey: ["me"] });
      if (data.leads.length === 0) toast.message("No results — try a broader location.");
    },
    onError: (err: any) => toast.error(err?.message ?? "Search failed"),
  });

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const filtered = useMemo(() => {
    return results.filter((l) => {
      if (noWebsite && l.website) return false;
      if (lowRating && (l.rating ?? 5) >= 3.5) return false;
      if (minReviews > 0 && (l.reviews ?? 0) < minReviews) return false;
      return true;
    });
  }, [results, noWebsite, lowRating, minReviews]);

  const usage = profileQ.data?.usage;
  const plan = usage?.plan ?? "free";
  const used = usage?.used ?? 0;
  const limit = usage?.limit;
  const remaining = limit == null ? "Unlimited" : Math.max(0, limit - used);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onSignOut={handleSignOut} email={profileQ.data?.profile?.email ?? ""} />

      <main className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-5">
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</span>
              <Badge variant="outline" className="capitalize">{plan}</Badge>
            </div>
            <div className="text-2xl font-bold">{remaining}</div>
            <div className="text-xs text-muted-foreground">
              {limit == null ? "searches remaining" : `of ${limit} searches today`}
            </div>
            {plan === "free" && (
              <a href="https://rzp.io/rzp/5Q6b8lD7" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full mt-4 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
                  <Crown className="h-4 w-4 mr-1.5" /> Upgrade to Pro
                </Button>
              </a>
            )}
          </Card>

          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Smart filters
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="f-nw" className="text-sm">No website only</Label>
                <Switch id="f-nw" checked={noWebsite} onCheckedChange={setNoWebsite} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="f-lr" className="text-sm">Low rating (&lt; 3.5)</Label>
                <Switch id="f-lr" checked={lowRating} onCheckedChange={setLowRating} />
              </div>
              <div>
                <Label className="text-sm">Min reviews: {minReviews}</Label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={minReviews}
                  onChange={(e) => setMinReviews(Number(e.target.value))}
                  className="w-full mt-2 accent-[oklch(0.78_0.16_195)]"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Recent searches
            </h3>
            <div className="space-y-2 text-sm">
              {(profileQ.data?.history ?? []).slice(0, 6).map((h: any) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setLocation(h.location);
                    if (h.category) setCategory(h.category);
                  }}
                  className="w-full text-left p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                >
                  <div className="truncate">{h.location}</div>
                  <div className="text-xs opacity-70">
                    {h.category ?? "All"} · {h.result_count} results
                  </div>
                </button>
              ))}
              {(profileQ.data?.history ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No searches yet.</p>
              )}
            </div>
          </Card>
        </aside>

        <section>
          {/* Search bar */}
          <Card className="p-5 bg-card border-border mb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!location.trim()) return toast.error("Enter a location");
                search.mutate({
                  location: location.trim(),
                  category: category === "Any" ? undefined : category,
                });
              }}
              className="flex flex-col md:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City, area, or ZIP — e.g. Bandra, Mumbai"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="md:w-56 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                disabled={search.isPending}
                className="h-11 px-6 bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Search className="h-4 w-4 mr-1.5" />
                {search.isPending ? "Searching…" : "Find leads"}
              </Button>
            </form>
          </Card>

          {/* Results */}
          {search.isPending && <SkeletonGrid />}

          {!search.isPending && filtered.length === 0 && results.length === 0 && (
            <EmptyState />
          )}

          {!search.isPending && filtered.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {filtered.length} lead{filtered.length === 1 ? "" : "s"}
                  {results.length !== filtered.length && (
                    <span className="text-muted-foreground text-sm font-normal"> of {results.length}</span>
                  )}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((l) => <LeadCard key={l.place_id} lead={l} />)}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Header({ onSignOut, email }: { onSignOut: () => void; email: string }) {
  return (
    <header className="border-b border-border/60 backdrop-blur bg-background/70 sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold">
          <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center shadow-glow">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          LocalLead <span className="text-gradient">AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-muted-foreground">{email}</span>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-1.5" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

function scoreColor(score: number) {
  if (score >= 80) return "text-success border-success/50 bg-success/10";
  if (score >= 60) return "text-warning border-warning/50 bg-warning/10";
  return "text-muted-foreground border-border bg-secondary";
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card className="p-5 bg-card border-border hover:shadow-glow transition flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{lead.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">{lead.category}</p>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-semibold ${scoreColor(lead.lead_score)}`}>
          {lead.lead_score}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{lead.address}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {lead.rating !== undefined && (
          <Badge variant="outline" className="gap-1">
            <Star className="h-3 w-3 text-warning" /> {lead.rating.toFixed(1)}
            {lead.reviews !== undefined && <span className="text-muted-foreground">· {lead.reviews}</span>}
          </Badge>
        )}
        {lead.website ? (
          <Badge variant="outline" className="gap-1 text-success border-success/40">
            <Globe className="h-3 w-3" /> Has website
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-destructive border-destructive/40">
            <Globe className="h-3 w-3" /> No website
          </Badge>
        )}
        {lead.phone && (
          <Badge variant="outline" className="gap-1">
            <Phone className="h-3 w-3" /> {lead.phone}
          </Badge>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-secondary/50 p-3 border border-border/60">
        <div className="text-xs font-semibold flex items-center gap-1.5 mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI analysis
        </div>
        <p className="text-xs text-muted-foreground">{lead.ai_summary}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.services.map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-foreground">{s}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2 mt-auto pt-4">
        <a href={lead.maps_url} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <MapPin className="h-3.5 w-3.5 mr-1.5" /> Maps
          </Button>
        </a>
        {lead.website && (
          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Website
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-5 bg-card border-border">
          <div className="h-4 w-1/2 rounded bg-secondary animate-pulse" />
          <div className="mt-2 h-3 w-1/3 rounded bg-secondary animate-pulse" />
          <div className="mt-4 h-16 rounded bg-secondary animate-pulse" />
          <div className="mt-3 h-20 rounded bg-secondary animate-pulse" />
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 bg-card border-border text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow mb-4">
        <Search className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="text-xl font-semibold">Find your next client</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Enter a city, area, or ZIP above. Add a category like "Salon" or "Restaurant",
        or leave it on "Any" to discover everything nearby.
      </p>
    </Card>
  );
}
