import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const { refetch } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    schoolName: "", schoolEmail: "", schoolPhone: "", state: "", lga: "",
    adminFullName: "", adminEmail: "", adminUsername: "", adminPassword: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.adminPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/signup", form);
      toast({ title: "School created", description: "You're now signed in as the school admin." });
      await refetch();
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(183,98%,22%)] flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" data-testid="text-title">Create your school account</h1>
          <p className="text-sm text-muted-foreground">Start with a free trial</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">School Sign Up</CardTitle>
            <CardDescription>Fill in your school details and create your first admin user.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">School</h3>
                <Input value={form.schoolName} onChange={set("schoolName")} placeholder="School name" required data-testid="input-school-name" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={form.state} onChange={set("state")} placeholder="State" data-testid="input-state" />
                  <Input value={form.lga} onChange={set("lga")} placeholder="LGA" data-testid="input-lga" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="email" value={form.schoolEmail} onChange={set("schoolEmail")} placeholder="School email (optional)" data-testid="input-school-email" />
                  <Input value={form.schoolPhone} onChange={set("schoolPhone")} placeholder="School phone (optional)" data-testid="input-school-phone" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">First Admin User</h3>
                <Input value={form.adminFullName} onChange={set("adminFullName")} placeholder="Full name" required data-testid="input-admin-fullname" />
                <Input type="email" value={form.adminEmail} onChange={set("adminEmail")} placeholder="Admin email (for password resets)" required data-testid="input-admin-email" />
                <Input value={form.adminUsername} onChange={set("adminUsername")} placeholder="Username (used to sign in)" required data-testid="input-admin-username" />
                <Input type="password" value={form.adminPassword} onChange={set("adminPassword")} placeholder="Password (min 8 characters)" required data-testid="input-admin-password" />
              </div>

              <Button type="submit" className="w-full" disabled={loading} data-testid="button-signup">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create school
              </Button>
              <div className="text-center text-xs">
                <Link href="/" className="text-primary hover:underline" data-testid="link-back-login">Back to sign in</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
