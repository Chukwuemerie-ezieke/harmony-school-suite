import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";

export default function StudentsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ admissionNumber: "", firstName: "", lastName: "", gender: "Male", classLevel: "JSS1", section: "A", parentPhone: "", bloodGroup: "", genotype: "" });

  const { data: students = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/students"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/students", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/students"] }); setOpen(false); toast({ title: "Student added" }); },
  });

  const filtered = students.filter((s: any) => {
    const matchSearch = `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "all" || s.classLevel === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Students</h1>
            <p className="text-sm text-muted-foreground">{students.length} students enrolled</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-student"><Plus className="w-4 h-4 mr-2" />Add Student</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Admission No." value={form.admissionNumber} onChange={e => setForm({...form, admissionNumber: e.target.value})} data-testid="input-admission" />
                <Input placeholder="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} data-testid="input-firstname" />
                <Input placeholder="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} data-testid="input-lastname" />
                <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
                <Select value={form.classLevel} onValueChange={v => setForm({...form, classLevel: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["JSS1","JSS2","JSS3","SS1","SS2","SS3"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Parent Phone" value={form.parentPhone} onChange={e => setForm({...form, parentPhone: e.target.value})} />
                <Input placeholder="Blood Group" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} />
                <Input placeholder="Genotype" value={form.genotype} onChange={e => setForm({...form, genotype: e.target.value})} />
              </div>
              <Button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending} className="w-full mt-2" data-testid="button-save-student">
                {addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Student
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="input-search" /></div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Classes</SelectItem>{["JSS1","JSS2","JSS3","SS1","SS2","SS3"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Adm. No.</TableHead><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Gender</TableHead><TableHead>Blood</TableHead><TableHead>Status</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.admissionNumber}</TableCell>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell>{s.classLevel}{s.section}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>{s.bloodGroup} {s.genotype && `(${s.genotype})`}</TableCell>
                    <TableCell><Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
