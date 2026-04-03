import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Check } from "lucide-react";

const plans = [
  { name: "Free", price: "₦0", period: "/month", features: ["Up to 30 students", "3 teachers", "EduTrack basic", "Community support"], current: false },
  { name: "Basic", price: "₦15,000", period: "/term", features: ["Up to 200 students", "15 teachers", "All 5 modules", "Email support", "Data export"], current: false },
  { name: "Premium", price: "₦35,000", period: "/term", features: ["Up to 500 students", "50 teachers", "All modules + analytics", "Priority support", "API access", "Custom branding"], current: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited students", "Unlimited teachers", "All modules + analytics", "Dedicated support", "Custom integrations", "On-premise option", "SLA guarantee"], current: false },
];

export default function SubscriptionPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Current plan: <Badge variant="default" className="ml-1">{user?.school?.subscriptionPlan || "trial"}</Badge>
            <span className="ml-2">Status: <Badge variant="secondary" className="ml-1">{user?.school?.subscriptionStatus || "active"}</Badge></span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? "border-primary ring-1 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.current && <Badge>Current</Badge>}
                </div>
                <div className="mt-2"><span className="text-2xl font-bold">{plan.price}</span><span className="text-sm text-muted-foreground">{plan.period}</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary flex-shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button variant={plan.current ? "secondary" : "default"} className="w-full mt-4" disabled={plan.current}>
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
