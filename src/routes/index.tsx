import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Search,
  Sparkles,
  Globe,
  Star,
  TrendingUp,
  Filter,
  Shield,
  Zap,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocalLead AI — Find local businesses that need your services" },
      {
        name: "description",
        content:
          "AI-powered lead generation for freelancers, web developers, SEO and marketing agencies. Discover local businesses, score them by opportunity, and pitch the right services.",
      },
      { property: "og:title", content: "LocalLead AI — AI Lead Generation for Local Businesses" },
      { property: "og:description", content: "Find local businesses that need websites, SEO, ads and automation — scored by AI." },
    ],
  }),
  component: Landing,
});

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur bg-background/70">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
          <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center shadow-glow">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          LocalLead <span className="text-gradient">AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-glow pointer-events-none" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered local lead generation
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Find local businesses
              <br />
              that <span className="text-gradient">need you</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Search any city or ZIP, pick a category, and instantly discover businesses
              without websites, with low ratings, or weak online presence — scored 1–100
              by AI so you pitch the right service first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
                  Start finding leads free
                </Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline">See how it works</Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> 5 free searches / day</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> No credit card</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-brand opacity-20 blur-3xl rounded-full" aria-hidden />
            <img
              src={heroImg}
              alt="Glowing world map with lead pins marking local business opportunities"
              width={1600}
              height={1024}
              className="relative rounded-2xl border border-border shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold">Built for agencies & freelancers</h2>
            <p className="mt-3 text-muted-foreground">
              Stop cold-emailing in the dark. Find businesses with actual gaps you can fix.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="bg-card border-border p-6 hover:shadow-glow transition">
                <div className="h-10 w-10 rounded-lg bg-gradient-brand grid place-items-center mb-4 shadow-glow">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-24 border-t border-border/60 bg-gradient-surface">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-bold text-center">Three steps to your next client</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative p-6 rounded-2xl glass">
                <div className="text-5xl font-display font-bold text-gradient">0{i + 1}</div>
                <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold">Simple pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free. Upgrade when you start closing.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`p-7 border ${p.highlighted ? "border-primary shadow-glow bg-card" : "border-border bg-card"}`}
              >
                {p.highlighted && (
                  <div className="inline-block rounded-full bg-gradient-brand text-primary-foreground text-xs px-2.5 py-1 mb-3">
                    Most popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  {p.cta === "razorpay" ? (
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      <Button className={`w-full ${p.highlighted ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" : ""}`} variant={p.highlighted ? "default" : "outline"}>
                        {p.ctaLabel}
                      </Button>
                    </a>
                  ) : (
                    <Link to="/auth">
                      <Button className="w-full" variant="outline">{p.ctaLabel}</Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Payments via Razorpay. Plans activate after payment is verified.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-brand" />
            <span>© {new Date().getFullYear()} LocalLead AI</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: Search, title: "Hyperlocal search", desc: "Search any city, area, or ZIP across thousands of business categories — or leave blank for all." },
  { icon: Globe, title: "No-website detection", desc: "Instantly flag businesses without a website — your highest-converting outreach segment." },
  { icon: Sparkles, title: "AI lead analysis", desc: "Every business gets an AI summary plus a 1–100 score so you know who's worth pitching." },
  { icon: TrendingUp, title: "Service suggestions", desc: "Website, SEO, ads, reputation, automation — tailored to each business's gaps." },
  { icon: Star, title: "Rating & review insights", desc: "Surface low-rated or low-review businesses primed for reputation work." },
  { icon: Filter, title: "Smart filters", desc: "Filter by no-website, rating, reviews, category, distance and popularity." },
] as const;

const steps = [
  { title: "Pick a location & category", desc: "Search 'Salons in Mumbai' or just 'Bangalore' to scan everything nearby." },
  { title: "Get AI-scored leads", desc: "See address, phone, website status, rating, photo and a lead score in seconds." },
  { title: "Pitch the right service", desc: "Use the AI summary and service suggestions to send the perfect outreach." },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/forever",
    tagline: "For trying it out",
    features: ["5 searches per day", "Core lead details", "AI lead scoring", "Search history"],
    cta: "signup",
    ctaLabel: "Start free",
    link: "/auth",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    tagline: "For active freelancers",
    features: ["20 searches per day", "Full lead details", "CSV / Excel export", "Save favorite leads", "Faster search"],
    cta: "razorpay",
    ctaLabel: "Buy Pro Plan",
    link: "https://rzp.io/rzp/5Q6b8lD7",
    highlighted: true,
  },
  {
    name: "Ultra Pro",
    price: "₹999",
    period: "/month",
    tagline: "For agencies & teams",
    features: ["Unlimited searches", "Deep AI lead analysis", "Bulk export", "Priority support"],
    cta: "razorpay",
    ctaLabel: "Buy Ultra Pro",
    link: "https://rzp.io/rzp/E1hQ5Xrx",
    highlighted: false,
  },
] as const;
