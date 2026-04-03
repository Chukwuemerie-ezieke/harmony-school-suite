import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

export default function MaintenancePage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ assetId: "", maintenanceType: "Repair", description: "", cost: "", performedBy: "", performedDate: "", nextDueDate: "" });

  const { data: logs = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/maintenance"] });
  const { data: assets = [] } = useQuery<any[]>({ queryKey: ["/api/assets"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/maintenance", { ...data, assetId: Number(data.assetId) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] }); setOpen(false); toast({ title: "Log added" }); },
  });

  const assetMap = new Map(assets.map((a: any) => [a.id, a.name]));

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Maintenance Log</h1><p className="text-sm text-muted-foreground">{logs.length} records</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Log Maintenance</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Maintenance</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={form.assetId} onValueChange={v => setForm({...form, assetId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                  <SelectContent>{assets.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.assetTag} - {a.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.maintenanceType} onValueChange={v => setForm({...form, maintenanceType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Repair">Repair</SelectItem><SelectItem value="Servicing">Servicing</SelectItem><SelectItem value="Replacement">Replacement</SelectItem><SelectItem value="Inspection">Inspection</SelectItem></SelectContent>
                </Select>
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Cost" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
                  <Input placeholder="Performed by" value={form.performedBy} onChange={e => setForm({...form, performedBy: e.target.value})} />
                  <Input type="date" value={form.performedDate} onChange={e => setForm({...form, performedDate: e.target.value})} />
                  <Input type="date" placeholder="Next due" value={form.nextDueDate} onChange={e => setForm({...form, nextDueDate: e.target.value})} />
                </div>
              </div>
              <Button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending} className="w-full mt-2">Save</Button>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Cost</TableHead><TableHead>By</TableHead><TableHead>Date</TableHead><TableHead>Next Due</TableHead></TableRow></TableHeader>
              <TableBody>
                {logs.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{assetMap.get(l.assetId) || l.assetId}</TableCell>
                    <TableCell><Badge variant="secondary">{l.maintenanceType}</Badge></TableCell>
                    <TableCell className="text-xs max-w-48 truncate">{l.description}</TableCell>
                    <TableCell>&#8358;{Number(l.cost || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{l.performedBy}</TableCell>
                    <TableCell className="text-xs">{l.performedDate}</TableCell>
                    <TableCell className="text-xs">{l.nextDueDate || "—"}</TableCell>
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
