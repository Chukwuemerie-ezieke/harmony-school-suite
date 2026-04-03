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

export default function ClassesPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "", section: "A" });

  const { data: classes = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/classes"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/classes", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/classes"] }); setOpen(false); toast({ title: "Class added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/classes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/classes"] }); toast({ title: "Class deleted" }); },
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Classes</h1><p className="text-sm text-muted-foreground">{classes.length} classes</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-class"><Plus className="w-4 h-4 mr-2" />Add Class</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Class Name (e.g. JSS1A)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Input placeholder="Level (e.g. JSS1)" value={form.level} onChange={e => setForm({...form, level: e.target.value})} />
                <Input placeholder="Section" value={form.section} onChange={e => setForm({...form, section: e.target.value})} />
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
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Level</TableHead><TableHead>Section</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {classes.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.level}</TableCell>
                    <TableCell>{c.section}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
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
