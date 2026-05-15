import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, loadDemo } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await loadDemo();
      toast({ title: "Demo loaded", description: "Logged in as admin" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(183,98%,22%)] flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" data-testid="text-title">Harmony School Suite</h1>
          <p className="text-sm text-muted-foreground">by Harmony Digital Consults Ltd</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required data-testid="input-username" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required data-testid="input-password" />
              </div>
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sign In
              </Button>
              <div className="flex justify-between text-xs">
                <Link href="/forgot-password" className="text-primary hover:underline" data-testid="link-forgot-password">Forgot password?</Link>
                <Link href="/signup" className="text-primary hover:underline" data-testid="link-signup">Create school account</Link>
              </div>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleDemo} disabled={demoLoading} data-testid="button-demo">
              {demoLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Load Demo Data & Login
            </Button>

            <div className="mt-4 p-3 rounded-md bg-muted text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Demo Credentials:</p>
              <p>Admin: admin / admin123</p>
              <p>Teacher: teacher / teacher123</p>
              <p>Parent: parent / parent123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
