import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token: params.token, newPassword: password });
      toast({ title: "Password updated", description: "Sign in with your new password." });
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message || "Invalid or expired link", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Choose a new password</CardTitle>
            <CardDescription>Your reset link is valid for 1 hour.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 8 chars)" required data-testid="input-new-password" />
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" required data-testid="input-confirm-password" />
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-reset">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reset password
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
