import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AttendancePage() {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [filterClass, setFilterClass] = useState("all");
  const [marks, setMarks] = useState<Record<number, string>>({});

  const { data: students = [] } = useQuery<any[]>({ queryKey: ["/api/students"] });
  const { data: existing = [] } = useQuery<any[]>({ queryKey: ["/api/attendance", { date }], queryFn: async () => { const r = await apiRequest("GET", `/api/attendance?date=${date}`); return r.json(); } });

  const saveMutation = useMutation({
    mutationFn: (records: any) => apiRequest("POST", "/api/attendance", { records }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/attendance"] }); toast({ title: "Attendance saved" }); },
  });

  const filtered = students.filter((s: any) => filterClass === "all" || s.classLevel === filterClass);
  const existingMap = new Map(existing.map((a: any) => [a.studentId, a.status]));

  const handleMark = (studentId: number, status: string) => {
    setMarks(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAll = () => {
    const records = Object.entries(marks).map(([sid, status]) => ({ studentId: Number(sid), date, status }));
    if (records.length === 0) { toast({ title: "No changes", variant: "destructive" }); return; }
    saveMutation.mutate(records);
  };

  const getStatus = (sid: number) => marks[sid] || existingMap.get(sid) || "";

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Attendance</h1><p className="text-sm text-muted-foreground">Mark daily attendance</p></div>
          <Button onClick={saveAll} disabled={saveMutation.isPending} data-testid="button-save-attendance">
            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Attendance
          </Button>
        </div>
        <div className="flex gap-3">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44" data-testid="input-date" />
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Classes</SelectItem>{["JSS1","JSS2","JSS3","SS1","SS2","SS3"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => {
                  const status = getStatus(s.id);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell>{s.classLevel}</TableCell>
                      <TableCell>
                        {status && <Badge variant={status === "present" ? "default" : status === "absent" ? "destructive" : "secondary"}>{status}</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant={status === "present" ? "default" : "outline"} onClick={() => handleMark(s.id, "present")} className="h-7 px-2"><CheckCircle className="w-3 h-3" /></Button>
                          <Button size="sm" variant={status === "absent" ? "destructive" : "outline"} onClick={() => handleMark(s.id, "absent")} className="h-7 px-2"><XCircle className="w-3 h-3" /></Button>
                          <Button size="sm" variant={status === "late" ? "secondary" : "outline"} onClick={() => handleMark(s.id, "late")} className="h-7 px-2"><Clock className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
