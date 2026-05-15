import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSent(true);
      toast({ title: "Check your email", description: "If that email exists, a reset link was sent." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Forgot password</CardTitle>
            <CardDescription>Enter the email tied to your account and we'll send a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground" data-testid="text-sent">If an account with that email exists, you'll receive a reset link within a few minutes. The link expires in 1 hour.</p>
                <Link href="/" className="text-primary hover:underline text-sm" data-testid="link-back-login">Back to sign in</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required data-testid="input-email" />
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-send-reset">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send reset link
                </Button>
                <div className="text-center text-xs">
                  <Link href="/" className="text-primary hover:underline" data-testid="link-back-login">Back to sign in</Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
