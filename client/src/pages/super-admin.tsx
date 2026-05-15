import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";

interface School {
  id: number;
  name: string;
  code: string;
  state: string | null;
  lga: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  maxStudents: number;
  createdAt: string;
}

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: schools, isLoading } = useQuery<School[]>({
    queryKey: ["/api/super-admin/schools"],
  });

  const updateSchool = useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<School> }) => {
      const res = await apiRequest("PATCH", `/api/super-admin/schools/${vars.id}`, vars.patch);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/schools"] });
      toast({ title: "School updated" });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-lg">Access denied</CardTitle>
            <CardDescription>This panel is only available to super administrators.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(183,98%,22%)] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-title">Super Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage all schools on Harmony School Suite</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schools</CardTitle>
            <CardDescription>{schools?.length ?? 0} total</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading schools...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools?.map(s => (
                      <TableRow key={s.id} data-testid={`row-school-${s.id}`}>
                        <TableCell className="font-medium" data-testid={`text-name-${s.id}`}>{s.name}</TableCell>
                        <TableCell className="font-mono text-xs">{s.code}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{[s.state, s.lga].filter(Boolean).join(", ") || "—"}</TableCell>
                        <TableCell><Badge variant="outline">{s.subscriptionPlan}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={s.subscriptionStatus === "active" || s.subscriptionStatus === "trialing" ? "default" : "destructive"} data-testid={`badge-status-${s.id}`}>
                            {s.subscriptionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {s.subscriptionStatus === "suspended" ? (
                            <Button size="sm" variant="outline" onClick={() => updateSchool.mutate({ id: s.id, patch: { subscriptionStatus: "active" } })} data-testid={`button-activate-${s.id}`}>Activate</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => updateSchool.mutate({ id: s.id, patch: { subscriptionStatus: "suspended" } })} data-testid={`button-suspend-${s.id}`}>Suspend</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
