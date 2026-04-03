import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Search, Loader2, Trash2 } from "lucide-react";

const condColors: Record<string, string> = { excellent: "default", good: "secondary", fair: "outline", poor: "destructive", condemned: "destructive" };

export default function AssetsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ assetTag: "", name: "", categoryId: "", location: "", condition: "good", purchasePrice: "", status: "active" });

  const { data: assets = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/assets"] });
  const { data: categories = [] } = useQuery<any[]>({ queryKey: ["/api/asset-categories"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/assets", { ...data, categoryId: data.categoryId ? Number(data.categoryId) : null }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/assets"] }); setOpen(false); toast({ title: "Asset registered" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/assets/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/assets"] }); toast({ title: "Asset deleted" }); },
  });

  const catMap = new Map(categories.map((c: any) => [c.id, c.name]));
  const filtered = assets.filter((a: any) => `${a.name} ${a.assetTag}`.toLowerCase().includes(search.toLowerCase()));

  const totalValue = assets.reduce((sum: number, a: any) => sum + (Number(a.purchasePrice) || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Asset Register</h1>
            <p className="text-sm text-muted-foreground">{assets.length} assets &middot; Total value: &#8358;{totalValue.toLocaleString()}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-asset"><Plus className="w-4 h-4 mr-2" />Register Asset</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register Asset</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Asset Tag" value={form.assetTag} onChange={e => setForm({...form, assetTag: e.target.value})} />
                <Input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Select value={form.categoryId} onValueChange={v => setForm({...form, categoryId: v})}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                <Select value={form.condition} onValueChange={v => setForm({...form, condition: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["excellent","good","fair","poor"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Purchase Price" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} />
              </div>
              <Button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending} className="w-full mt-2">Register</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Tag</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Location</TableHead><TableHead>Condition</TableHead><TableHead>Value</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.assetTag}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{catMap.get(a.categoryId) || "—"}</TableCell>
                    <TableCell className="text-xs">{a.location}</TableCell>
                    <TableCell><Badge variant={condColors[a.condition] as any}>{a.condition}</Badge></TableCell>
                    <TableCell>&#8358;{Number(a.purchasePrice || 0).toLocaleString()}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(a.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
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
