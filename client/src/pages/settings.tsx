import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: school, isLoading } = useQuery<any>({ queryKey: ["/api/school"] });
  const [form, setForm] = useState({ name: "", address: "", state: "", lga: "", phone: "", email: "" });

  useEffect(() => {
    if (school) setForm({ name: school.name || "", address: school.address || "", state: school.state || "", lga: school.lga || "", phone: school.phone || "", email: school.email || "" });
  }, [school]);

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/school", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/school"] }); toast({ title: "School profile updated" }); },
  });

  if (isLoading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">School Profile</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-sm font-medium">School Name</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="col-span-2"><label className="text-sm font-medium">Address</label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div><label className="text-sm font-medium">State</label><Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
              <div><label className="text-sm font-medium">LGA</label><Input value={form.lga} onChange={e => setForm({...form, lga: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Email</label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            </div>
            <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
