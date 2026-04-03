import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";

export default function SubjectsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", colorCode: "#3b82f6" });

  const { data: subjects = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/subjects"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/subjects", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }); setOpen(false); toast({ title: "Subject added" }); setForm({ name: "", code: "", colorCode: "#3b82f6" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/subjects/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }); toast({ title: "Subject deleted" }); },
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Subjects</h1><p className="text-sm text-muted-foreground">{subjects.length} subjects</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-subject"><Plus className="w-4 h-4 mr-2" />Add Subject</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Subject Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Input placeholder="Code (e.g. MTH)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                <div className="flex items-center gap-2"><label className="text-sm">Color:</label><input type="color" value={form.colorCode} onChange={e => setForm({...form, colorCode: e.target.value})} className="w-10 h-8 rounded border cursor-pointer" /></div>
              </div>
              <Button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending} className="w-full mt-2">
                {addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Color</TableHead><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {subjects.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell><div className="w-4 h-4 rounded" style={{ backgroundColor: s.colorCode || "#ccc" }} /></TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
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
