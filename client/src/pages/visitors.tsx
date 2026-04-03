import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, LogOut as LogOutIcon } from "lucide-react";

export default function VisitorsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ visitorName: "", visitorPhone: "", purpose: "", personVisited: "" });

  const { data: visits = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/visits"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/visits", { ...data, checkIn: new Date().toISOString() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/visits"] }); setOpen(false); toast({ title: "Visitor checked in" }); },
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/visits/${id}`, { checkOut: new Date().toISOString() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/visits"] }); toast({ title: "Visitor checked out" }); },
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Visitors Log</h1><p className="text-sm text-muted-foreground">{visits.length} visitors recorded</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-check-in"><Plus className="w-4 h-4 mr-2" />Check In Visitor</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Check In Visitor</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Visitor Name" value={form.visitorName} onChange={e => setForm({...form, visitorName: e.target.value})} data-testid="input-visitor-name" />
                <Input placeholder="Phone Number" value={form.visitorPhone} onChange={e => setForm({...form, visitorPhone: e.target.value})} />
                <Input placeholder="Purpose of Visit" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} />
                <Input placeholder="Person Visited" value={form.personVisited} onChange={e => setForm({...form, personVisited: e.target.value})} />
              </div>
              <Button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending} className="w-full mt-2" data-testid="button-save-visitor">
                {addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Check In
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Visitor</TableHead><TableHead>Phone</TableHead><TableHead>Purpose</TableHead><TableHead>Person Visited</TableHead><TableHead>Check In</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {visits.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.visitorName}</TableCell>
                    <TableCell>{v.visitorPhone}</TableCell>
                    <TableCell>{v.purpose}</TableCell>
                    <TableCell>{v.personVisited}</TableCell>
                    <TableCell className="text-xs">{new Date(v.checkIn).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={v.checkOut ? "secondary" : "default"}>{v.checkOut ? "Left" : "On Premises"}</Badge></TableCell>
                    <TableCell>{!v.checkOut && <Button size="sm" variant="outline" onClick={() => checkoutMutation.mutate(v.id)}><LogOutIcon className="w-3 h-3 mr-1" />Out</Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
