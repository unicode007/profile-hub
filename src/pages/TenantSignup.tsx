import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, Building2, CreditCard, UserPlus, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

type Plan = {
  id: string;
  name: string;
  price_monthly: number;
  max_hotels: number;
  max_rooms_per_hotel: number;
  max_users_per_tenant: number;
  features: Record<string, boolean>;
};

const featureLabels: Record<string, string> = {
  housekeeping: "Housekeeping",
  restaurant_pos: "Restaurant POS",
  dynamic_pricing: "Dynamic Pricing",
  advanced_reports: "Advanced Reports",
  minibar: "Minibar Tracking",
  night_audit: "Night Audit",
  procurement: "Procurement",
};

const accountSchema = z.object({
  fullName: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  workspace: z.string().trim().min(2).max(60),
});

const hotelSchema = z.object({
  hotelName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

const STEPS = ["Account", "Plan", "Hotel"] as const;

export default function TenantSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [accountReady, setAccountReady] = useState(false); // user is authed

  // Plan
  const [planId, setPlanId] = useState<string | null>(null);

  // Hotel
  const [hotelName, setHotelName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("id,name,price_monthly,max_hotels,max_rooms_per_hotel,max_users_per_tenant,features")
        .order("price_monthly");
      if (!error && data) {
        setPlans(data as Plan[]);
        const growth = data.find((p: any) => p.name === "Growth");
        setPlanId((growth?.id as string) ?? (data[0]?.id as string));
      }
      setLoadingPlans(false);
    })();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setAccountReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setAccountReady(!!s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === planId), [plans, planId]);
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleAccountSubmit = async () => {
    const parsed = accountSchema.safeParse({ fullName, email, password, workspace });
    if (!parsed.success) {
      toast({ title: "Check your details", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/signup`,
          data: { full_name: fullName.trim() },
        },
      });
      if (error) throw error;
      if (!data.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) throw signInErr;
      }
      setAccountReady(true);
      setStep(1);
    } catch (e: any) {
      toast({ title: "Signup failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    const parsed = hotelSchema.safeParse({ hotelName, city, address, phone });
    if (!parsed.success) {
      toast({ title: "Check hotel details", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    if (!planId) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("setup_tenant_with_first_hotel", {
        _tenant_name: workspace.trim() || `${fullName}'s Workspace`,
        _tenant_slug: workspace.trim(),
        _contact_email: email.trim(),
        _plan_id: planId,
        _billing_cycle: "monthly",
        _hotel_name: hotelName.trim(),
        _hotel_city: city.trim(),
        _hotel_address: address.trim(),
        _hotel_phone: phone.trim(),
      });
      if (error) throw error;
      toast({ title: "Workspace ready 🎉", description: "Tenant, subscription, and first hotel created." });
      navigate("/");
    } catch (e: any) {
      const msg: string = e.message || "Something went wrong";
      toast({
        title: msg.includes("Plan limit") ? "Plan limit reached" : "Setup failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create your hotel workspace</h1>
          <p className="text-muted-foreground mt-2">Sign up, pick a plan, add your first hotel — under 2 minutes.</p>
        </header>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    i < step ? "bg-primary text-primary-foreground border-primary"
                      : i === step ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={i === step ? "font-medium" : "text-muted-foreground"}>{s}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Your account</CardTitle>
              <CardDescription>You'll be the workspace owner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accountReady ? (
                <div className="rounded-md border bg-muted/40 p-4 flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div className="text-sm">You're signed in. Continue to choose a plan.</div>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full name</Label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Asha Rao" />
                    </div>
                    <div>
                      <Label>Workspace name</Label>
                      <Input value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="Sunrise Hospitality" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hotel.com" />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-end">
                {accountReady ? (
                  <Button onClick={() => setStep(1)}>Choose plan</Button>
                ) : (
                  <Button onClick={handleAccountSubmit} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Choose a plan</CardTitle>
              <CardDescription>14-day free trial on every plan.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPlans ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading plans…</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    const active = planId === p.id;
                    const enabledFeatures = Object.entries(p.features || {}).filter(([, v]) => v).map(([k]) => k);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlanId(p.id)}
                        className={`text-left rounded-lg border p-4 transition-all ${
                          active ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold flex items-center gap-1">
                            {p.name === "Growth" && <Sparkles className="h-4 w-4 text-primary" />}
                            {p.name}
                          </div>
                          {active && <Badge>Selected</Badge>}
                        </div>
                        <div className="mt-2 text-2xl font-bold">₹{p.price_monthly.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <Separator className="my-3" />
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>{p.max_hotels >= 999 ? "Unlimited" : p.max_hotels} hotel{p.max_hotels === 1 ? "" : "s"}</li>
                          <li>{p.max_rooms_per_hotel >= 999 ? "Unlimited" : p.max_rooms_per_hotel} rooms / hotel</li>
                          <li>{p.max_users_per_tenant >= 999 ? "Unlimited" : p.max_users_per_tenant} team members</li>
                        </ul>
                        {enabledFeatures.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {enabledFeatures.map((f) => (
                              <Badge key={f} variant="secondary" className="text-xs">{featureLabels[f] ?? f}</Badge>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)} disabled={!planId}>Add first hotel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Your first hotel</CardTitle>
              <CardDescription>You can add more hotels later (within your plan limit).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPlan && (
                <div className="rounded-md border bg-muted/40 px-4 py-3 flex items-start gap-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">{selectedPlan.name} plan limits</div>
                    <div className="text-muted-foreground">
                      Up to {selectedPlan.max_hotels >= 999 ? "unlimited" : selectedPlan.max_hotels} hotel(s),{" "}
                      {selectedPlan.max_rooms_per_hotel >= 999 ? "unlimited" : selectedPlan.max_rooms_per_hotel} rooms each.
                      Limits are enforced at the database level.
                    </div>
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Hotel name *</Label>
                  <Input value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Sunrise Grand" />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Hyderabad" />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleFinish} disabled={submitting || !accountReady}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Finish setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to fair-use of the platform. Plan limits are enforced server-side.
        </p>
      </div>
    </main>
  );
}